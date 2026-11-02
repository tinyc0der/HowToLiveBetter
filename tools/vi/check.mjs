// Check Vietnamese sections against their zh source.
//
//   node tools/vi/check.mjs                      every book/NN-*.md (zh = the sha recorded in source.json)
//   node tools/vi/check.mjs --chunk work/vi/08/2.md [...]   a translated chunk vs work/zh/08/2.md
//
// Errors exit 1. Warnings are printed (chunk mode) or written to work/check-report.md (book mode).
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, relative, basename } from 'node:path';
import {
  ROOT, SOURCE_JSON, readJson, lf, listDir, zhSection, splitSection, parseEntry,
  ZH_LABELS, VI_LABELS, TAG_RE, STUB_NOTE, urlsOf, numbersOf, HAN_RE,
} from './lib.mjs';

const OFFICIAL = /(^|\.)(gov\.vn|chinhphu\.vn|quochoi\.vn|vbpl\.vn|who\.int|unicef\.org)$/;
const SCHOLARLY = /(^|\.)(doi\.org|ncbi\.nlm\.nih\.gov|europepmc\.org|cochranelibrary\.com)$/;
const BANNED = /(^|\.)(thuvienphapluat\.vn|luatvietnam\.vn|facebook\.com|fb\.com|tiktok\.com|zalo\.me|baomoi\.com|wikipedia\.org|youtube\.com|youtu\.be|voz\.vn|tinhte\.vn|webtretho\.com|blogspot\.com|wordpress\.com|medium\.com|zhihu\.com|weixin\.qq\.com|sohu\.com|163\.com|baijiahao\.baidu\.com)$/;
const TAG_VALUES = { 钱: ['0', '少', '多'], 时间: ['少', '中', '多'], 毅力: ['否', '些', '是'], 收益: ['大', '中', '小'], 口径: ['死亡率', '金钱', '时间', '自由'] };
const WHO = ['怀孕', '婴幼儿', '孩子', '老人', '35岁', '60岁', '女性'];
const host = u => { try { return new URL(u).hostname.toLowerCase(); } catch { return ''; } };

const errors = [], warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

const stripLinks = s => s.replace(/\]\([^)]*\)/g, ']').replace(/https?:\/\/\S+/g, 'URL');
const sentences = s => stripLinks(s).split(/(?<=[.!?…])\s+/).map(x => x.trim()).filter(x => /\p{L}/u.test(x));
const words = s => s.split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length;

function checkTag(where, tag) {
  const m = TAG_RE.exec(tag ?? '');
  if (!m) return err(where, 'cost-tag line missing');
  const kv = Object.fromEntries(m[1].split(/\s+/).map(p => p.split('=')));
  for (const [k, vals] of Object.entries(TAG_VALUES)) if (!vals.includes(kv[k])) err(where, `cost tag ${k}=${kv[k]} not one of ${vals.join('|')}`);
  if (kv['人群'] && kv['人群'].split(/[,+]/).some(v => !WHO.includes(v))) err(where, `cost tag 人群=${kv['人群']} has an unknown value`);
}

function checkLinks(where, text, fileDir) {
  for (const m of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    const t = m[1];
    if (/^(https?:|mailto:|#)/.test(t)) continue;
    if (!existsSync(resolve(fileDir, t.split('#')[0]))) err(where, `broken relative link ${t}`);
  }
}

function checkProse(where, label, text) {
  if (HAN_RE.test(text)) err(where, `${label}: Chinese characters left`);
  if (/!(?!\[)/.test(stripLinks(text))) err(where, `${label}: exclamation mark`);
  for (const s of sentences(text)) {
    const w = words(s);
    if (w > 45) err(where, `${label}: sentence of ${w} words (max 45): "${s.slice(0, 80)}…"`);
    else if (w > 35) warn(where, `${label}: sentence of ${w} words (aim ≤ 35): "${s.slice(0, 60)}…"`);
  }
}

function checkEntry(where, v, z, fileDir) {
  const zp = parseEntry(z.raw, ZH_LABELS);
  const vp = parseEntry(v.raw, VI_LABELS);
  if (HAN_RE.test(v.title)) err(where, 'title: Chinese characters left');
  if (!vp.mode) return err(where, 'mode line <!-- vi: T|L|S --> missing');
  for (const s of vp.stray) err(where, `stray line (each field must be one "- Label: …" line): "${s.slice(0, 60)}"`);
  for (const d of vp.dup) err(where, `field ${VI_LABELS[d]} appears twice`);
  const all = v.raw;
  for (const u of urlsOf(all)) if (BANNED.test(host(u))) err(where, `banned source ${host(u)}`);
  checkLinks(where, all, fileDir);

  if (vp.mode === 'S') {
    if (vp.tag !== zp.tag) err(where, 'stub: cost tag must be copied unchanged');
    const keys = Object.keys(vp.fields);
    if (keys.length !== 1 || keys[0] !== 'note' || !all.includes(STUB_NOTE)) err(where, `stub must have exactly one line starting "${STUB_NOTE.slice(0, 40)}…"`);
    if (HAN_RE.test(vp.fields.note ?? '')) err(where, 'stub: Chinese characters left (percent-encode upstream links)');
    return;
  }

  const required = vp.mode === 'T' ? Object.keys(zp.fields) : ['cost', 'human', 'gain', 'grade', 'src'];
  for (const k of required) if (!vp.fields[k]?.trim()) err(where, `field "${VI_LABELS[k]}" missing or empty`);
  checkTag(where, vp.tag);
  const grade = /^\s*([ABC])/.exec(vp.fields.grade ?? '')?.[1];
  if (!grade) err(where, 'Mức chứng cứ must start with A, B or C');

  for (const [k, text] of Object.entries(vp.fields)) if (k !== 'src') checkProse(where, VI_LABELS[k], text);

  const human = vp.fields.human ?? '';
  const hs = sentences(human);
  if (human && (hs.length < 2 || hs.length > 4)) err(where, `Nói dễ hiểu has ${hs.length} sentences (2–4)`);
  if (words(stripLinks(human)) > 90) err(where, `Nói dễ hiểu has ${words(stripLinks(human))} words (max 90)`);
  if (/\b(HR|RR|OR|CI|RCT|aOR|SMD)\b/.test(human)) err(where, 'Nói dễ hiểu uses HR/RR/OR/CI/RCT');
  const gainNums = new Set(numbersOf(vp.fields.gain));
  for (const n of numbersOf(human)) if (!gainNums.has(n)) warn(where, `Nói dễ hiểu number ${n} not found in Lợi ích`);
  if ((vp.fields.note?.match(/https?:\/\//g) ?? []).length > 1) warn(where, 'Ghi chú has more than one link (move citations to Nguồn)');

  const viUrls = new Set(urlsOf(all));
  if (vp.mode === 'T') {
    if (vp.tag !== zp.tag) err(where, 'T entry: cost tag must be copied unchanged (switch to L if it was recomputed)');
    const zg = /^\s*([ABC])/.exec(zp.fields.grade ?? '')?.[1];
    if (grade && zg && grade !== zg) err(where, `T entry: grade ${grade} != zh ${zg}`);
    for (const u of urlsOf(z.raw)) if (!viUrls.has(u)) err(where, `T entry: zh URL missing: ${u}`);
    if (/^争议/.test(zp.fields.note ?? '') && !/^Tranh cãi/.test(vp.fields.note ?? '')) err(where, 'T entry: zh note starts with 争议, vi Ghi chú must start with "Tranh cãi"');
    for (const k of ['gain', 'human', 'note']) {
      const have = new Set(numbersOf(vp.fields[k]));
      const miss = [...new Set(numbersOf(zp.fields[k]))].filter(n => !have.has(n));
      if (miss.length) warn(where, `${VI_LABELS[k]}: zh numbers not in vi: ${miss.join(', ')}`);
    }
  } else {
    const srcUrls = urlsOf(vp.fields.src);
    if (!srcUrls.some(u => OFFICIAL.test(host(u)) || SCHOLARLY.test(host(u)))) err(where, 'L entry: Nguồn needs at least one official (gov.vn, chinhphu.vn, quochoi.vn, vbpl.vn, WHO, UNICEF) or DOI/PubMed URL');
    if (!/tính đến/i.test(all)) err(where, 'L entry: state the date the law/scheme was checked ("tính đến …")');
    if (HAN_RE.test(vp.fields.src ?? '')) warn(where, 'L entry: Chinese text in Nguồn (should be Vietnamese sources)');
  }
  for (const u of viUrls) {
    const h = host(u);
    if (!OFFICIAL.test(h) && !SCHOLARLY.test(h) && !urlsOf(z.raw).includes(u) && h !== 'web.archive.org' && h !== 'github.com')
      warn(where, `new non-official URL (check it is an original source): ${u}`);
  }
}

function checkHeader(where, vHeader, zHeader, sectionNo, fileDir, entryNs) {
  const lines = vHeader.split('\n');
  if (lines[0] !== '[← Mục lục](../README.md)') err(where, 'first line must be "[← Mục lục](../README.md)"');
  const t = /^# (\d+)\. (.+)$/m.exec(vHeader);
  if (!t || Number(t[1]) !== sectionNo) err(where, `needs "# ${sectionNo}. Title"`);
  if (HAN_RE.test(vHeader)) err(where, 'Chinese characters left in section header');
  checkLinks(where, vHeader, fileDir);
  if (zHeader.includes('本节条目按主题分成下面几块')) {
    for (const n of entryNs) {
      const c = (vHeader.match(new RegExp(`mục ${n}\\)`, 'g')) ?? []).length;
      if (c !== 1) err(where, `nav block: "(mục ${n})" appears ${c} times (each entry exactly once)`);
    }
  }
}

function compareEntries(where, vEntries, zEntries, fileDir) {
  const got = vEntries.map(e => e.n).join(','), want = zEntries.map(e => e.n).join(',');
  if (got !== want) return err(where, `entry numbers [${got}] != zh [${want}]`);
  vEntries.forEach((v, i) => checkEntry(`${where} #${v.n}`, v, zEntries[i], fileDir));
}

const args = process.argv.slice(2);
let mode = 'book';
if (args[0] === '--chunk') { mode = 'chunk'; args.shift(); }

if (mode === 'chunk') {
  for (const p of args) {
    const vp = resolve(p), zp = vp.replace(`${'/work/vi/'}`, '/work/zh/');
    const where = relative(ROOT, vp);
    if (!existsSync(zp)) { err(where, `no zh counterpart ${relative(ROOT, zp)}`); continue; }
    const v = lf(readFileSync(vp, 'utf8')), z = lf(readFileSync(zp, 'utf8'));
    const NN = basename(dirname(vp));
    const bookDir = resolve(ROOT, 'book');
    if (basename(vp) === '0-header.md') {
      const meta = readJson(resolve(dirname(zp), 'meta.json'), { entries: [] });
      checkHeader(where, v.trim(), z, Number(NN), bookDir, meta.entries.map(e => e.n));
    } else if (basename(vp) === 'z-footer.md') {
      if (HAN_RE.test(v)) err(where, 'Chinese characters left in footer');
    } else compareEntries(where, splitSection(v).entries, splitSection(z).entries, bookDir);
  }
} else {
  const source = readJson(SOURCE_JSON, { sections: {} });
  const files = listDir(resolve(ROOT, 'book')).filter(f => /^\d\d-.*\.md$/.test(f)).sort();
  if (!files.length) err('book/', 'no section files');
  for (const f of files) {
    const NN = f.slice(0, 2), sec = source.sections[NN];
    if (!sec) { err(`book/${f}`, 'not recorded in translation/source.json (run assemble.mjs)'); continue; }
    const v = splitSection(readFileSync(resolve(ROOT, 'book', f), 'utf8'));
    const z = splitSection(zhSection(sec.sha, NN));
    const where = `book/${f}`, dir = resolve(ROOT, 'book');
    checkHeader(`${where} header`, v.header, z.header, Number(NN), dir, z.entries.map(e => e.n));
    if (v.footer && HAN_RE.test(v.footer)) err(`${where} footer`, 'Chinese characters left');
    compareEntries(where, v.entries, z.entries, dir);
  }
  for (const f of ['README.md', 'TRANSLATION.md']) if (existsSync(resolve(ROOT, f))) checkLinks(f, readFileSync(resolve(ROOT, f), 'utf8'), ROOT);
  mkdirSync(resolve(ROOT, 'work'), { recursive: true });
  writeFileSync(resolve(ROOT, 'work/check-report.md'), `# check report\n\n${errors.length} error(s), ${warnings.length} warning(s)\n\n## Errors\n\n${errors.map(e => `- ${e}`).join('\n')}\n\n## Warnings\n\n${warnings.map(w => `- ${w}`).join('\n')}\n`);
}

for (const e of errors) console.log(`ERROR  ${e}`);
if (mode === 'chunk') for (const w of warnings) console.log(`warn   ${w}`);
console.log(`${errors.length} error(s), ${warnings.length} warning(s)${mode === 'book' ? ' — details in work/check-report.md' : ''}`);
process.exit(errors.length ? 1 : 0);
