# usage: python3 -I vbrel.py <id> [<id>...] -> compact relationship diagram (lược đồ)
# BySource 10 = amended by; BySource 12 = replaced by; ByType 10 = amends; ByType 12 = replaces
import sys, json, subprocess
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
for did in sys.argv[1:]:
    out=subprocess.run(['curl','-sL','-A',UA,'-X','POST',f'https://vbpl.vn/van-ban/chi-tiet/{did}?tabs=luoc-do','-H','Accept: text/x-component','-H','Content-Type: text/plain;charset=UTF-8','-H','Next-Action: 4a3423ce75290ef83a022333ee187acf4d38d3fb','--data-binary',json.dumps([did])],capture_output=True).stdout.decode('utf-8','replace')
    print('#####',did)
    for line in out.split('\n'):
        if line.startswith('1:'):
            d=json.loads(line[2:])
            for grp in d:
                for k,v in (d[grp] or {}).items():
                    if k in ('3','4','8','9'): continue
                    print(' ',grp.replace('documentNames',''),k,len(v))
                    for x in v[:15]:
                        if 'HĐND' in x['name'] or 'UBND' in x['name']: continue
                        print('     ',x['id'],x['name'][:130].replace('\n',' '))
