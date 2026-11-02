# vbpl.vn helpers

vbpl.vn (national legal database) was rebuilt in 2025–2026; old `ItemID=` links are dead.
Cite documents as `https://vbpl.vn/van-ban/chi-tiet/<id>`.

```
python3 -I tools/vi/vbpl/vbsearch.py "<keyword or số hiệu>" [pageSize] [all|title|docNum]   # find id, status, effective dates
python3 -I tools/vi/vbpl/vbdoc.py <id> <outdir>                                             # full text -> <outdir>/<id>.txt
python3 -I tools/vi/vbpl/vbrel.py <id> [<id> ...]                                            # amended by / replaced by
```

vbpl's validity flags and relationship data are sometimes stale (see translation/vn-baseline.md §0):
confirm in-force status from the amending documents' "Căn cứ" lines when it matters.

Attachments and original PDFs of a vbpl document can be downloaded from
`https://vbpl-bientap-gateway.moj.gov.vn/api/qtdc/public/doc/minio/buckets/vbpl/<id>/<fileName>/download`
(file names are listed in the JSON that `vbdoc.py` saves). Annexes of Bộ Y tế circulars are sometimes published
separately on datafiles.chinhphu.vn as `<số>-byt-kem.pdf`.
