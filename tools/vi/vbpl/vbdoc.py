# usage: python3 -I vbdoc.py <id> <outdir>   -> writes <id>.json, <id>.txt, prints metadata
import sys, json, subprocess, re, html, os
did=sys.argv[1]; od=sys.argv[2]
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
raw=subprocess.run(['curl','-sL','-A',UA,f'https://vbpl-bientap-gateway.moj.gov.vn/api/qtdc/public/doc/{did}'],capture_output=True).stdout
open(os.path.join(od,f'{did}.json'),'wb').write(raw)
d=json.loads(raw)['data']
c=(d.get('documentContent') or {}).get('content') or ''
t=re.sub(r'(?is)<(script|style).*?</\1>','',c)
t=re.sub(r'(?i)<br\s*/?>','\n',t)
t=re.sub(r'(?i)</(p|div|tr|li|h\d|td)>','\n',t)
t=re.sub(r'<[^>]+>','',t)
t=html.unescape(t)
t=re.sub(r'[ \t ]+',' ',t)
t='\n'.join(l.strip() for l in t.split('\n') if l.strip())
open(os.path.join(od,f'{did}.txt'),'w',encoding='utf-8').write(t)
st=(d.get('effStatus') or {}).get('name')
print(did,'|',d.get('docNum'),'|',d.get('title'),'| issued',(d.get('issueDate') or '')[:10],'| effFrom',(d.get('effFrom') or '')[:10],'| effTo',(d.get('effTo') or '')[:10],'|',st,'| textlen',len(t))
print('keys:',[k for k in d.keys()])
