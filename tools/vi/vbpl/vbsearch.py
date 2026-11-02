# usage: python3 -I vbsearch.py "<keyword>" [pageSize] [optionDoc: all|title|docNum]
import sys, json, subprocess, urllib.parse
kw=sys.argv[1]; ps=int(sys.argv[2]) if len(sys.argv)>2 else 10
opt=sys.argv[3] if len(sys.argv)>3 else 'all'
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
body=[{"pageNumber":int(sys.argv[4]) if len(sys.argv)>4 else 1,"pageSize":ps,"keyword":kw,"agencyLevel":"TRUNG_UONG","optionDoc":opt,"matchMode":"all_words"}]
tree='%5B%22%22%2C%7B%22children%22%3A%5B%5B%22locale%22%2C%22vi%22%2C%22d%22%5D%2C%7B%22children%22%3A%5B%22van-ban%22%2C%7B%22children%22%3A%5B%5B%22category%22%2C%22trung-uong%22%2C%22d%22%5D%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D'
out=subprocess.run(['curl','-sL','-A',UA,'-X','POST','https://vbpl.vn/van-ban/trung-uong',
  '-H','Accept: text/x-component','-H','Content-Type: text/plain;charset=UTF-8',
  '-H','Next-Action: c529d164f28418e5898a834422629e64c6816af1','-H','Next-Router-State-Tree: '+tree,
  '--data-binary',json.dumps(body,ensure_ascii=False)],capture_output=True).stdout.decode('utf-8','replace')
for line in out.split('\n'):
    if line.startswith('1:'):
        d=json.loads(line[2:])
        print('total',d.get('total'))
        for it in d.get('items',[]):
            st=(it.get('effStatus') or {}).get('name')
            print(it['id'],'|',it.get('docNum'),'|',it.get('title')[:110],'|',(it.get('issueDate') or '')[:10],'| eff',(it.get('effFrom') or '')[:10],'| to',(it.get('effTo') or '')[:10],'|',st,'|',it.get('document_url'))
        break
else:
    print(out[:500])
