# Vietnamese edition: conventions

This repo is a **localized Vietnamese edition** of 高性价比人生指南
([eternity4719/HowToLiveBetter](https://github.com/eternity4719/HowToLiveBetter), CC BY 4.0).
Health evidence is translated. Laws, hotlines, institutions, entitlements and prices are replaced with
Vietnamese ones, researched from official Vietnamese sources. The Chinese original is the reference for
evidence; Vietnamese official texts are the reference for Vietnamese law.

- Upstream snapshot per section: `translation/source.json` (sha + hash of every zh unit).
- Per-entry research log: `translation/log/NN.md`.
- Verified Vietnamese basics shared by all sections: `translation/vn-baseline.md`. **Read it before writing any entry and reuse its wording; do not re-research or contradict it.** If you find it wrong, say so in your report instead of silently diverging.

## 1. Entry modes

Every entry keeps its upstream number. Under the cost-tag line add one hidden line: `<!-- vi: T -->`, `<!-- vi: L -->` or `<!-- vi: S -->`.

| Mode | When | What to do |
| --- | --- | --- |
| **T** translate | The evidence and the action carry over to Vietnam unchanged (most health, safety, time entries). | Translate faithfully. Keep every number, the grade letter, the cost-tag line byte for byte, and every URL. Swap only contact points (hotlines, which agency to call) for Vietnamese ones, each with a Vietnamese official source added to `Nguồn`. Facts about China used as evidence stay, labeled "ở Trung Quốc". Prices in `Chi phí` become rough VND estimates marked "ước tính". |
| **L** localize | What the reader should do, what it costs, what they are entitled to, or what legal consequence follows depends on national law or schemes. | Rewrite against Vietnamese law/schemes. Remove the Chinese legal content entirely (do not mix). Keep universal evidence (journal sources) if it still applies. Recompute the cost tag, benefit level, lens and grade (sections 4–5). State the check date: "tính đến ngày 2/11/2026" (or the date you read the source). |
| **S** stub | No Vietnamese counterpart with an official source could be found and verified. | Exactly four lines: heading, cost-tag line copied unchanged, `<!-- vi: S -->`, and `- Ghi chú: TODO — chưa tìm được quy định Việt Nam tương đương có nguồn chính thức. Bản gốc (áp dụng tại Trung Quốc): phần N mục M, <upstream link>.` The upstream link must be percent-encoded (no Chinese characters), e.g. `https://github.com/eternity4719/HowToLiveBetter/blob/main/book/08-%E5%88%AB%E6%8A%8A%E8%87%AA%E5%B7%B1%E6%90%AD%E8%BF%9B%E5%8E%BB.md`. |

Choosing between L and S: **an unverified Vietnamese claim is worse than a stub.** If you cannot open the official text and quote the sentence that supports the claim, write S (or drop that claim from an L entry).

## 2. Entry format

```
### N. <Tiêu đề: một câu khuyên, bắt đầu bằng động từ, nói rõ tình huống và đối tượng>
<!-- 成本标签: 钱=0|少|多 时间=少|中|多 毅力=否|些|是 收益=大|中|小 口径=死亡率|金钱|时间|自由 [人群=…] -->
<!-- vi: T|L|S -->
- Chi phí: …
- Nói dễ hiểu: …
- Lợi ích: …
- Mức chứng cứ: A|B|C …
- Nguồn: …
- Ghi chú: …
```

- Each field is **one line**. No sub-bullets, no line breaks inside a field.
- The cost-tag comment keeps its Chinese keys and values (machine data, invisible on GitHub). Keys and values must come from the set above. `人群=` values: 怀孕, 婴幼儿, 孩子, 老人, 35岁, 60岁, 女性 (`,` = or, `+` = and); omit when the entry applies to everyone.
- Title: one sentence of advice, starting with a verb, naming the situation and who it is for (it is shown alone in search and cross-references). Not a reply to a question ("Thực ra…", "Nhiều người nghĩ…").
- `Ghi chú` that records a dispute **starts with "Tranh cãi"** (zh 争议).
- At most one link in `Ghi chú`; citations go to `Nguồn`.

## 3. Writing Vietnamese

- Plain Vietnamese an adult without professional training understands in one reading. Address the reader as "bạn". Calm tone, no lecturing, **no exclamation marks**.
- One sentence says one thing. Aim for ≤ 35 words; never more than 45 (`check.mjs` enforces). Give every sentence a clear subject (bạn, bác sĩ, công an, tòa án, công ty).
- Explain a technical term once, briefly, in parentheses: "OR 0.58 (tỷ số chênh)". Keep the term itself.
- No AI filler: no "Điều đáng chú ý là", "Về bản chất", no closing moral sentence, no "mục này chỉ nói…" self-reference. Keep negations, scope, conditions and hedges: they are content.
- **Nói dễ hiểu**: 2–4 sentences, ≤ 90 words. Turn the statistics of `Lợi ích` into everyday words (proportions, absolute differences, direction). It must not contain HR/RR/OR/CI/RCT, and **must not add any number, symptom, fact or interpretation that is not in `Lợi ích`**. It must stand alone: no "điều đó là đúng" about a claim the reader has not seen.
- **Lợi ích** (T entries): every number, interval, population and year stays exactly as in the zh text. HR/RR/OR keep their values and are explained correctly; never turn an odds ratio or hazard ratio into "gấp X lần khả năng" over the follow-up period.

### Numbers

- Copy statistics as written: decimal point `.`, no thousands separators (`0.58`, `248099`).
- 万 → "vạn" only when copying a Chinese figure (e.g. "3 vạn nhân dân tệ"); 亿 → "trăm triệu".
- VND: digits plus a unit word, no separators: "500 nghìn đồng", "2 triệu đồng", "1,5 tỷ đồng" is **not** allowed (use "1.5 tỷ đồng"). Large exact amounts: "khoảng 113 triệu đồng (chính xác 113040000 đồng)".
- Law articles: "Điều 155 Bộ luật Hình sự" in prose; full document number and title in `Nguồn`.

### Cross-references

- Other section: `phần X mục Y (từ khóa)`; same section: `mục Y của phần này (từ khóa)`. The keyword in parentheses is taken from the target entry's Vietnamese title.
- Numbering matches upstream, so translate the zh numbers as they are. If the target is outside the sections done so far, translate the zh target title for the keyword and list the reference in your log as "provisional anchor".
- Links to files that are not in this repo (核实记录, docs, skills) become absolute upstream links, percent-encoded.

### Fixed terms

| zh | vi |
| --- | --- |
| 成本 / 说人话 / 收益 / 证据等级 / 来源 / 备注 | Chi phí / Nói dễ hiểu / Lợi ích / Mức chứng cứ / Nguồn / Ghi chú |
| 回总目录 | ← Mục lục |
| 第 N 节第 M 条 | phần N mục M |
| 争议 | Tranh cãi |
| 总死亡率 | tỷ lệ tử vong do mọi nguyên nhân |
| 荟萃分析 | phân tích gộp (gộp nhiều nghiên cứu lại tính chung) |
| 随机对照试验 (RCT) | thử nghiệm ngẫu nhiên có đối chứng |
| 队列研究 / 观察性研究 | nghiên cứu theo dõi (chỉ ghi nhận, không chia nhóm can thiệp) |
| HR / RR / OR / 95% CI | HR (tỷ số nguy cơ) / RR (nguy cơ tương đối) / OR (tỷ số chênh) / 95% CI (khoảng tin cậy) |
| 元 (人民币) | nhân dân tệ (when copying a Chinese amount) |
| 世界卫生组织 (WHO) | Tổ chức Y tế Thế giới (WHO) |
| 美国疾控中心 (CDC) | Trung tâm Kiểm soát và Phòng ngừa Dịch bệnh Hoa Kỳ (CDC) |

Add Vietnamese institution and law names from `translation/vn-baseline.md`; keep them identical across entries.

## 4. Vietnamese sources

Same strictness as the upstream citation rules.

- **Allowed in `Nguồn`:** original official texts and journals.
  - vbpl.vn (national legal database, Bộ Tư pháp), congbao.chinhphu.vn, chinhphu.vn / datafiles, quochoi.vn
  - ministry and agency sites on `.gov.vn` (moh.gov.vn, bocongan.gov.vn, baohiemxahoi.gov.vn, gso.gov.vn, …)
  - anle.toaan.gov.vn (precedents), congbobanan.toaan.gov.vn (judgments), vksndtc.gov.vn
  - WHO, UNICEF; journals via DOI or PubMed
- **Banned anywhere:** thuvienphapluat.vn, luatvietnam.vn and other reposts or law-firm blogs, social media, aggregators (baomoi), Wikipedia, forums. You may use them to find a document, then cite the official copy.
- **First-hand news reports** (bylined, original reporting by a licensed Vietnamese outlet or major foreign media) only when all five hold: (1) first-hand, not reposted; (2) used only to show "this kind of thing happens", never for numbers, legal interpretation or the grade; (3) original URL followed by a web.archive.org snapshot made the same day; (4) `Ghi chú` says "vụ này chỉ có báo chí đưa tin, không có bản án hay thông báo chính thức"; (5) people not convicted by a court are not named in full.
- **In force on the check date.** Vietnam changed a lot in 2024–2025 (new Luật BHXH 2024, BHYT amendments, Luật Đất đai 2024, Luật Trật tự an toàn giao thông đường bộ 2024, the 2025 criminal code amendment, ministry mergers in 2025, 34 provinces and two-level local government from 1/7/2025). Confirm each document's validity status (hiệu lực) on vbpl.vn or the issuing body's site. Do not cite a superseded text as current.
- **No numbers, article numbers or document numbers from memory.** Every one must be read in the source. If you cannot verify one, leave it out or write "chưa xác minh" and log it.

## 5. Grades, benefit levels, cost tags (L entries recompute these)

- **Mức chứng cứ**: A = quantified evidence from meta-analyses, large cohorts or RCTs, or for law/scheme entries an official text with the specific numbers verified in the original; B = research support that is hard to quantify or small, or an official text whose numbers are set locally; C = experience or consensus without direct literature.
- **收益 (benefit level)**, read mechanically from `Lợi ích`:
  - 死亡率: relative reduction ≥ 20% 大, 10–20% 中, < 10% or surrogate endpoints only 小
  - 金钱: ≥ 20 triệu đồng 大, 1–20 triệu đồng 中, < 1 triệu đồng 小
  - 自由: avoids criminal liability 大, avoids detention or administrative penalty 中, avoids a civil dispute 小
  - 时间: hours per day 大, hours per week 中, one-off 小
- **Cost tag 钱**: 0 = free or saves money; 少 = under about 2 triệu đồng once, or under about 200 nghìn đồng a month; 多 = more than that, or a significant long-term cost. **时间**: 少 = minutes, 中 = hours once or hours per week, 多 = daily. **毅力**: 否 = do once, 些 = change one habit, 是 = long fight against inertia.
- Lenses are never compared with each other.

## 6. Entries where "the law is on your side"

If an L entry says the reader can demand, claim, or will win, it must also state the process cost: whether a lawsuit is needed, how long it takes (standard sentence in `vn-baseline.md`), and who pays the lawyer. When citing a rule to reassure the reader, say which risk it covers (the verdict is not the same as being dragged into a case; civil is not administrative or criminal).

## 7. Beneficiary tiers

Unchanged from upstream: (1) you, (2) spouse and direct relatives, (3) friends, colleagues, other relatives, (4) strangers. For tier 4 always write the risks too (being extorted, dragged into a case, retaliation). Note in `Ghi chú` which tier the entry mainly serves.

## 8. Log format (`translation/log/NN.md`)

One block per entry:

```
## mục N — <vi title>
- Mode: T|L|S — why
- Changed vs zh: what was swapped, removed or recomputed (tag, grade, level)
- VN sources read: <URL> — "<exact quoted sentence>" — read on <date>
- Open: unverified points, provisional anchors, questions for review
```

## 9. Tools

```
node tools/vi/extract.mjs <ref> NN [--per 10] [--only-stale]   # zh chunks -> work/zh/NN/
node tools/vi/check.mjs --chunk work/vi/NN/k.md                 # check one translated chunk
node tools/vi/assemble.mjs NN [--update]                        # work/vi/NN -> book/NN-slug.md + source.json
node tools/vi/check.mjs                                         # check all of book/
git fetch upstream && node tools/vi/stale.mjs                   # what changed upstream since translation
```

## Attribution

Original work: 高性价比人生指南 by eternity4719 and contributors, CC BY 4.0,
<https://github.com/eternity4719/HowToLiveBetter>. This edition translates and adapts it (Vietnamese
legal and administrative content replaces the Chinese content); changes are recorded per entry in
`translation/log/`. Text: CC BY 4.0 ([LICENSE](LICENSE)). Code: MIT ([LICENSE-CODE](LICENSE-CODE)).
