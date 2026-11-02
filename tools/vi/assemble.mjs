// Build book/NN-<slug>.md from the translated chunks in work/vi/NN/, then record in
// translation/source.json which zh version (work/zh/NN/meta.json) the file was made from.
//
//   node tools/vi/assemble.mjs [NN ...]            full build: 0-header.md + 1.md … k.md (+ z-footer.md)
//   node tools/vi/assemble.mjs [NN ...] --update   splice u*.md (and 0-header.md / z-footer.md if present)
//                                                  into the existing book file; unchanged entries that
//                                                  upstream renumbered are renumbered here too
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT, SOURCE_JSON, nn, readJson, writeJson, splitSection, joinSection, slugify, listDir, chunkOrder, MODE_RE, lf } from './lib.mjs';

const args = process.argv.slice(2);
const update = args.includes('--update');
const wanted = args.filter(a => a !== '--update').map(nn);
const sections = wanted.length ? wanted : listDir(resolve(ROOT, 'work/vi')).filter(d => /^\d\d$/.test(d));
const source = readJson(SOURCE_JSON, { upstream: 'https://github.com/eternity4719/HowToLiveBetter', sections: {} });
let failed = false;

const read = p => lf(readFileSync(p, 'utf8')).replace(/\s+$/, '');
const bookFileOf = NN => listDir(resolve(ROOT, 'book')).find(f => f.startsWith(`${NN}-`) && f.endsWith('.md'));

for (const NN of sections) {
  const viDir = resolve(ROOT, 'work/vi', NN), zhDir = resolve(ROOT, 'work/zh', NN);
  const meta = readJson(resolve(zhDir, 'meta.json'), null);
  if (!meta) { console.error(`${NN}: work/zh/${NN}/meta.json missing (run extract.mjs first)`); failed = true; continue; }
  const files = listDir(viDir);
  const chunkRe = update ? /^u\d+\.md$/ : /^\d+\.md$/;
  const chunks = files.filter(f => chunkRe.test(f) && f !== '0-header.md').sort((a, b) => chunkOrder(a.replace('u', ''), b.replace('u', '')));
  const fresh = splitSection(chunks.map(f => read(resolve(viDir, f))).join('\n\n'));
  const headerFile = resolve(viDir, '0-header.md'), footerFile = resolve(viDir, 'z-footer.md');

  let header, footer, entries;
  if (!update) {
    if (!existsSync(headerFile)) { console.error(`${NN}: work/vi/${NN}/0-header.md missing`); failed = true; continue; }
    header = read(headerFile);
    footer = existsSync(footerFile) ? read(footerFile) : '';
    entries = fresh.entries;
  } else {
    const old = bookFileOf(NN);
    const prev = source.sections[NN];
    if (!old || !prev) { console.error(`${NN}: --update needs an existing book file and source.json entry`); failed = true; continue; }
    const cur = splitSection(readFileSync(resolve(ROOT, 'book', old), 'utf8'));
    header = existsSync(headerFile) ? read(headerFile) : cur.header;
    footer = existsSync(footerFile) ? read(footerFile) : cur.footer;
    const freshByN = new Map(fresh.entries.map(e => [e.n, e]));
    const curByN = new Map(cur.entries.map(e => [e.n, e]));
    const prevByHash = new Map(prev.entries.map(e => [e.hash, e.n]));
    entries = meta.entries.map(z => {
      if (freshByN.has(z.n)) return freshByN.get(z.n);
      const oldN = prevByHash.get(z.hash);
      const kept = oldN != null && curByN.get(oldN);
      if (!kept) { console.error(`${NN}: entry ${z.n} (${z.title}) changed upstream but has no new translation`); failed = true; return null; }
      return oldN === z.n ? kept : { ...kept, n: z.n, raw: kept.raw.replace(/^### \d+\./, `### ${z.n}.`) };
    }).filter(Boolean);
  }

  const got = entries.map(e => e.n).join(','), want = meta.entries.map(e => e.n).join(',');
  if (got !== want) { console.error(`${NN}: entry numbers ${got} != upstream ${want}`); failed = true; continue; }
  const title = /^# \d+\. (.+)$/m.exec(header)?.[1];
  if (!title) { console.error(`${NN}: header has no "# N. Title" line`); failed = true; continue; }
  if (!slugify(title)) { console.error(`${NN}: title "${title}" gives an empty file slug (is the header translated?)`); failed = true; continue; }
  const name = `${NN}-${slugify(title)}.md`;
  const old = bookFileOf(NN);
  if (old && old !== name) unlinkSync(resolve(ROOT, 'book', old));
  writeFileSync(resolve(ROOT, 'book', name), joinSection({ header, entries, footer }));

  const modeOf = raw => raw.split('\n').map(l => MODE_RE.exec(l)?.[1]).find(Boolean) ?? null;
  source.sections[NN] = { ...meta, file: `book/${name}`, entries: meta.entries.map((z, i) => ({ ...z, mode: modeOf(entries[i].raw) })) };
  const modes = entries.map(e => modeOf(e.raw));
  console.log(`${NN}: book/${name}  ${entries.length} entries  T ${modes.filter(m => m === 'T').length} · L ${modes.filter(m => m === 'L').length} · S ${modes.filter(m => m === 'S').length}`);
}

writeJson(SOURCE_JSON, { upstream: source.upstream ?? 'https://github.com/eternity4719/HowToLiveBetter', sections: Object.fromEntries(Object.entries(source.sections).sort()) });
process.exit(failed ? 1 : 0);
