// Split upstream (zh) sections into translation chunks under work/zh/NN/.
//
//   node tools/vi/extract.mjs <ref> [NN ...] [--per 12] [--only-stale]
//
// Writes, per section:
//   work/zh/NN/0-header.md   back link, "# N." title, intro, nav block
//   work/zh/NN/1.md … k.md   ~12 entries each (chunk boundaries fall between entries)
//   work/zh/NN/z-footer.md   only if the section has a trailing "## " block
//   work/zh/NN/meta.json     ref sha, upstream path, hashes of every unit at that sha
// --only-stale writes only the units that changed since translation/source.json
// (new or changed entries go to u1.md, u2.md …; the header only if it changed).
// source.json itself is updated by assemble.mjs once the translation is in book/.
import { rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT, SOURCE_JSON, git, nn, readJson, writeJson, zhPath, zhSection, zhSectionNumbers, splitSection, entryHash, hashText } from './lib.mjs';
import { staleUnits } from './stale.mjs';

const args = process.argv.slice(2);
const flag = name => { const i = args.indexOf(name); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const onlyStale = args.includes('--only-stale');
if (onlyStale) args.splice(args.indexOf('--only-stale'), 1);
const per = Number(flag('--per') ?? 12);
const ref = args.shift();
if (!ref) { console.error('usage: extract.mjs <ref> [NN ...] [--per 12] [--only-stale]'); process.exit(2); }
const sha = git('rev-parse', ref).trim();
const sections = args.length ? args.map(nn) : zhSectionNumbers(sha);
const source = readJson(SOURCE_JSON, { sections: {} });

for (const NN of sections) {
  const path = zhPath(sha, NN);
  const sec = splitSection(zhSection(sha, NN));
  const dir = resolve(ROOT, 'work/zh', NN);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const meta = {
    sha, path,
    header: hashText(sec.header),
    footer: sec.footer ? hashText(sec.footer) : null,
    entries: sec.entries.map(e => ({ n: e.n, title: e.title, hash: entryHash(e.raw) })),
  };
  writeJson(resolve(dir, 'meta.json'), meta);

  let units = sec.entries, writeHeader = true, writeFooter = !!sec.footer, prefix = '';
  if (onlyStale) {
    const s = staleUnits(source.sections[NN], meta);
    if (!s) { console.log(`${NN}: not translated yet, extracting everything`); }
    else {
      const want = new Set([...s.added, ...s.changed].map(e => e.n));
      units = sec.entries.filter(e => want.has(e.n));
      writeHeader = s.headerChanged;
      writeFooter = s.footerChanged;
      prefix = 'u';
    }
  }
  if (writeHeader) writeFileSync(resolve(dir, '0-header.md'), sec.header + '\n');
  if (writeFooter) writeFileSync(resolve(dir, 'z-footer.md'), sec.footer + '\n');
  const k = Math.ceil(units.length / per);
  for (let i = 0; i < k; i++) {
    const a = Math.floor((i * units.length) / k), b = Math.floor(((i + 1) * units.length) / k);
    const part = units.slice(a, b);
    writeFileSync(resolve(dir, `${prefix}${i + 1}.md`), part.map(e => e.raw).join('\n\n') + '\n');
    console.log(`${NN}/${prefix}${i + 1}.md  entries ${part[0].n}–${part.at(-1).n}`);
  }
  console.log(`${NN}: ${sec.entries.length} entries at ${sha.slice(0, 7)}${writeHeader ? ', header' : ''}${writeFooter ? ', footer' : ''}`);
}
