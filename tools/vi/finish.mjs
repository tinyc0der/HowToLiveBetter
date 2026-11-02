// Finish one or more sections after their chunks are written, verified and given a header:
//   node tools/vi/finish.mjs NN [NN ...]
// 1. assemble work/vi/NN -> book/NN-slug.md (+ translation/source.json)
// 2. translation/log/NN.md     <- work/log/NN-*.md (writers' logs, with appended fix notes)
//    translation/verify/NN.md  <- work/verify/NN-*.md (independent verification reports)
// 3. README "## Đang có" list   <- every book/NN-*.md title, in order
// 4. check.mjs over all of book/
// Commit and push are left to the caller.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT, nn, listDir } from './lib.mjs';

const sections = process.argv.slice(2).map(nn);
if (!sections.length) { console.error('usage: finish.mjs NN [NN ...]'); process.exit(2); }
const run = (...args) => execFileSync('node', args, { cwd: ROOT, stdio: 'inherit' });
const numericChunk = f => Number((/^(\d+)/.exec(f) ?? [])[1] ?? 1e9);

for (const NN of sections) {
  run('tools/vi/assemble.mjs', NN);
  const collect = (dir, prefix) => listDir(resolve(ROOT, dir))
    .filter(f => f.startsWith(`${NN}-`) && f.endsWith('.md'))
    .sort((a, b) => numericChunk(a.slice(3)) - numericChunk(b.slice(3)))
    .map(f => `\n<!-- ${prefix} ${f} -->\n\n` + readFileSync(resolve(ROOT, dir, f), 'utf8').trim() + '\n');
  mkdirSync(resolve(ROOT, 'translation/log'), { recursive: true });
  mkdirSync(resolve(ROOT, 'translation/verify'), { recursive: true });
  const logs = collect('work/log', 'chunk');
  if (logs.length) writeFileSync(resolve(ROOT, `translation/log/${NN}.md`),
    `# Localization log: section ${Number(NN)}\n\nPer-entry research log written by the localizing agents, followed by notes on fixes applied after verification. Quotes from Vietnamese sources are verbatim. Paths under \`work/\` refer to scratch downloads that are not kept in the repo.\n` + logs.join(''));
  const ver = collect('work/verify', 'report');
  if (ver.length) writeFileSync(resolve(ROOT, `translation/verify/${NN}.md`),
    `# Independent verification: section ${Number(NN)}\n\nReviewers checked every entry against its sources (Vietnamese official texts for localized entries, the Chinese original for translated ones) and fixed what they confirmed. They did not read the writers' logs.\n` + ver.join(''));
  console.log(`${NN}: ${logs.length} log chunk(s), ${ver.length} verification report(s)`);
}

// README list of published sections
const books = listDir(resolve(ROOT, 'book')).filter(f => /^\d\d-.*\.md$/.test(f)).sort();
const items = books.map(f => {
  const t = /^# (\d+)\. (.+)$/m.exec(readFileSync(resolve(ROOT, 'book', f), 'utf8'));
  return `- [${t[1]}. ${t[2]}](book/${f})`;
});
const readmePath = resolve(ROOT, 'README.md');
let readme = readFileSync(readmePath, 'utf8');
const block = `## Đang có\n\nĐã có ${books.length}/34 phần:\n\n${items.join('\n')}\n\nSố thứ tự phần và mục giữ đúng như bản gốc tiếng Trung, nên "phần X mục Y" ở bản này và bản gốc chỉ cùng một mục.\n\n`;
readme = readme.replace(/## Đang có\n[\s\S]*?(?=## )/, block);
writeFileSync(readmePath, readme);
console.log(`README: ${books.length} section(s) listed`);

try { run('tools/vi/check.mjs'); } catch { process.exit(1); }
