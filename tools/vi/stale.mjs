// What changed upstream since the translation in book/ was made?
//
//   node tools/vi/stale.mjs [ref=upstream/main]      (run `git fetch upstream` first)
//
// Compares translation/source.json (hashes of the zh units each vi section was made from)
// with upstream at <ref>. Per section it lists:
//   changed T entries  -> retranslate (extract.mjs <ref> NN --only-stale, then assemble --update)
//   changed L/S entries -> review only: the Chinese law/scheme changed, the Vietnamese content may not need to
//   added / removed / renumbered entries, changed header or footer
// Renumbering shifts cross-references ("phần X mục Y") in the vi text, so check those by hand.
import { fileURLToPath } from 'node:url';
import { SOURCE_JSON, git, readJson, zhPath, zhSection, zhSectionNumbers, splitSection, entryHash, hashText } from './lib.mjs';

export function staleUnits(prev, meta) {
  if (!prev) return null;
  const newHashes = new Set(meta.entries.map(e => e.hash));
  const prevByN = new Map(prev.entries.map(e => [e.n, e]));
  const prevByHash = new Map(prev.entries.map(e => [e.hash, e]));
  const added = [], changed = [], renumbered = [];
  const claimed = new Set();
  for (const e of meta.entries) {
    const same = prevByN.get(e.n);
    if (same && same.hash === e.hash) { claimed.add(same.n); continue; }
    const moved = prevByHash.get(e.hash);
    if (moved) { renumbered.push({ from: moved.n, to: e.n, title: e.title, mode: moved.mode }); claimed.add(moved.n); continue; }
    if (same && !newHashes.has(same.hash)) { changed.push({ n: e.n, title: e.title, mode: same.mode }); claimed.add(same.n); continue; }
    added.push({ n: e.n, title: e.title });
  }
  const removed = prev.entries.filter(e => !claimed.has(e.n) && !newHashes.has(e.hash)).map(e => ({ n: e.n, title: e.title, mode: e.mode }));
  const headerChanged = prev.header !== meta.header;
  const footerChanged = (prev.footer ?? null) !== (meta.footer ?? null);
  const count = added.length + changed.length + removed.length + renumbered.length + headerChanged + footerChanged;
  return { added, changed, removed, renumbered, headerChanged, footerChanged, count };
}

export function metaAt(sha, NN) {
  const sec = splitSection(zhSection(sha, NN));
  return {
    sha, path: zhPath(sha, NN),
    header: hashText(sec.header),
    footer: sec.footer ? hashText(sec.footer) : null,
    entries: sec.entries.map(e => ({ n: e.n, title: e.title, hash: entryHash(e.raw) })),
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const ref = process.argv[2] ?? 'upstream/main';
  const sha = git('rev-parse', ref).trim();
  const source = readJson(SOURCE_JSON, { sections: {} });
  let total = 0;
  const untranslated = [];
  for (const NN of zhSectionNumbers(sha)) {
    const prev = source.sections[NN];
    if (!prev) { untranslated.push(NN); continue; }
    const s = staleUnits(prev, metaAt(sha, NN));
    total += s.count;
    if (!s.count) continue;
    console.log(`\n§${NN} (translated from ${prev.sha.slice(0, 7)})`);
    if (s.headerChanged) console.log('  header changed');
    if (s.footerChanged) console.log('  footer changed');
    for (const e of s.changed) console.log(`  changed   ${e.n}. ${e.title}  [${e.mode ?? '?'}] ${e.mode === 'T' ? '-> retranslate' : '-> review only'}`);
    for (const e of s.added) console.log(`  added     ${e.n}. ${e.title}`);
    for (const e of s.removed) console.log(`  removed   ${e.n}. ${e.title}  [${e.mode ?? '?'}]`);
    for (const e of s.renumbered) console.log(`  renumber  ${e.from} -> ${e.to}. ${e.title}  (fix cross-references)`);
  }
  console.log(`\nupstream ${sha.slice(0, 7)}: ${total} stale unit(s) in translated sections; untranslated sections: ${untranslated.join(' ') || 'none'}`);
}
