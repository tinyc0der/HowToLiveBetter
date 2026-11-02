// Shared helpers for the Vietnamese edition: reading upstream (zh) sections from git,
// splitting a section file into header / entry / footer units, and parsing entry fields.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const UPSTREAM_REPO = 'https://github.com/eternity4719/HowToLiveBetter';
export const SOURCE_JSON = resolve(ROOT, 'translation/source.json');

export const ZH_LABELS = { cost: '成本', human: '说人话', gain: '收益', grade: '证据等级', src: '来源', note: '备注' };
export const VI_LABELS = { cost: 'Chi phí', human: 'Nói dễ hiểu', gain: 'Lợi ích', grade: 'Mức chứng cứ', src: 'Nguồn', note: 'Ghi chú' };
export const FIELD_KEYS = Object.keys(VI_LABELS);
export const STUB_NOTE = '- Ghi chú: TODO — chưa tìm được quy định Việt Nam tương đương có nguồn chính thức.';
export const TAG_RE = /^<!--\s*成本标签:\s*(.*?)\s*-->$/;
export const MODE_RE = /^<!--\s*vi:\s*([TLS])\s*-->$/;

export const git = (...args) => execFileSync('git', ['-c', 'core.quotePath=false', ...args], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20 });
export const nn = n => String(n).padStart(2, '0');
export const readJson = (p, fallback) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : fallback);
export const writeJson = (p, v) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, JSON.stringify(v, null, 2) + '\n'); };
export const lf = s => s.replace(/\r\n/g, '\n');

// Upstream path of section NN at a given ref, e.g. book/01-不要早死.md
export function zhPath(ref, NN) {
  const files = git('ls-tree', '--name-only', ref, 'book/').split('\n').filter(Boolean);
  const hit = files.find(f => f.startsWith(`book/${NN}-`) && f.endsWith('.md'));
  if (!hit) throw new Error(`no book/${NN}-*.md at ${ref}`);
  return hit;
}
export const zhSection = (ref, NN) => lf(git('show', `${ref}:${zhPath(ref, NN)}`));
export const zhSectionNumbers = ref =>
  git('ls-tree', '--name-only', ref, 'book/').split('\n').map(f => /^book\/(\d\d)-.*\.md$/.exec(f)?.[1]).filter(Boolean);

// Split a section file into { header, entries: [{ n, title, raw }], footer }.
// header = everything before the first "### N." line; footer = from the first "## " line after the entries.
export function splitSection(md) {
  const lines = lf(md).split('\n');
  const header = [], entries = [], footer = [];
  let cur = null, inFooter = false;
  for (const line of lines) {
    let m;
    if (!inFooter && (m = /^### (\d+)\. (.+)$/.exec(line))) {
      cur = { n: Number(m[1]), title: m[2].trim(), lines: [line] };
      entries.push(cur);
    } else if (cur && /^## /.test(line)) {
      inFooter = true; cur = null; footer.push(line);
    } else if (inFooter) footer.push(line);
    else if (cur) cur.lines.push(line);
    else header.push(line);
  }
  const trim = ls => ls.join('\n').replace(/\s+$/, '');
  return {
    header: trim(header),
    entries: entries.map(e => ({ n: e.n, title: e.title, raw: trim(e.lines) })),
    footer: trim(footer),
  };
}

export const joinSection = ({ header, entries, footer }) =>
  [header, ...entries.map(e => e.raw), footer].filter(s => s && s.trim()).join('\n\n') + '\n';

// Entry hash ignores the entry's own number, so a pure renumber is detectable.
export const hashText = s => createHash('sha1').update(s).digest('hex').slice(0, 12);
export const entryHash = raw => hashText(raw.replace(/^### \d+\./, '### .'));

// Parse an entry's lines into fields. labels = ZH_LABELS or VI_LABELS.
export function parseEntry(raw, labels) {
  const lines = raw.split('\n');
  const out = { heading: lines[0], tag: null, mode: null, fields: {}, dup: [], stray: [] };
  const byLabel = Object.fromEntries(Object.entries(labels).map(([k, v]) => [v, k]));
  const sep = labels === ZH_LABELS ? '：' : ':';
  const fieldRe = new RegExp(`^- (${Object.values(labels).join('|')})${sep}\\s?(.*)$`);
  for (const line of lines.slice(1)) {
    if (line === '') continue;
    if (TAG_RE.test(line)) { out.tag = line; continue; }
    const mm = MODE_RE.exec(line);
    if (mm) { out.mode = mm[1]; continue; }
    const fm = fieldRe.exec(line);
    if (fm) {
      const key = byLabel[fm[1]];
      if (key in out.fields) out.dup.push(key);
      out.fields[key] = fm[2];
    } else out.stray.push(line);
  }
  return out;
}

export const urlsOf = s => [...(s ?? '').matchAll(/https?:\/\/[^\s<>)\]）」，。；]+/g)].map(m => m[0].replace(/[.,;:]+$/, ''));
export const numbersOf = s => [...(s ?? '').matchAll(/\d+(?:\.\d+)?/g)].map(m => m[0]);
export const HAN_RE = /\p{Script=Han}/u;

export function slugify(title) {
  return title
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    .split('-').slice(0, 8).join('-');
}

// Upstream GitHub link to a section file (percent-encoded so no Han characters appear in vi text).
export const upstreamSectionUrl = path => `${UPSTREAM_REPO}/blob/main/${encodeURI(path)}`;

export const listDir = p => (existsSync(p) ? readdirSync(p) : []);
export const chunkOrder = (a, b) => (parseInt(a) || 0) - (parseInt(b) || 0);
