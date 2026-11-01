#!/usr/bin/env python3
"""三方合併同步：base=初始 commit，ours=all-in-one 現況，theirs=原專案現況。
用法：sync3.py <game> [--write]   （不動原專案，只讀）"""
import os, sys, subprocess, filecmp, tempfile, re, json
ROOT = os.path.expanduser('~/mnt/AI Agent')
AIO = os.path.join(ROOT, 'all-in-one')
BASE = '5c89174'
EXCL_DIR = {'node_modules', '.git', 'dist', 'screenshots', 'shots', '.vite', 'coverage'}
EXCL_FILE = re.compile(r'(\.key|\.pem|\.log)$|^\.env$|^\.env\.[^e]|package-lock\.json$|\.tsbuildinfo$')

def walk(top):
    out = {}
    for d, ds, fs in os.walk(top):
        ds[:] = [x for x in ds if x not in EXCL_DIR]
        for f in fs:
            if EXCL_FILE.search(f):
                continue
            p = os.path.join(d, f)
            out[os.path.relpath(p, top).replace(os.sep, '/')] = p
    return out

def same(a, b):
    sa, sb = os.stat(a), os.stat(b)
    if sa.st_size != sb.st_size:
        return False
    if int(sa.st_mtime) == int(sb.st_mtime):   # 複製時保留了修改時間：大小與時間都相同視為沒動（掛載碟讀內容很慢）
        return True
    return filecmp.cmp(a, b, shallow=False)

def main():
    g = sys.argv[1]
    write = '--write' in sys.argv
    theirs_dir = os.path.join(ROOT, g)
    ours_dir = os.path.join(AIO, 'games', g)
    theirs = walk(theirs_dir)
    ours = walk(ours_dir)
    diff = [r for r in theirs if r in ours and not same(theirs[r], ours[r])]
    new = [r for r in theirs if r not in ours]
    gone = [r for r in ours if r not in theirs]
    cands = diff
    # 取 base 版本（只取有差異的檔）
    p = subprocess.Popen(['git', 'cat-file', '--batch'], cwd=AIO, stdin=subprocess.PIPE, stdout=subprocess.PIPE)
    def base_of(rel):
        p.stdin.write(('%s:games/%s/%s\n' % (BASE, g, rel)).encode()); p.stdin.flush()
        head = p.stdout.readline().decode().split()
        if len(head) < 3:
            return None
        n = int(head[2]); data = p.stdout.read(n); p.stdout.read(1)
        return data
    res = {'copied': [], 'merged': [], 'conflict': [], 'kept': [], 'new': [], 'gone': gone}
    for rel in cands:
        b = base_of(rel)
        t = open(theirs[rel], 'rb').read()
        o = open(ours[rel], 'rb').read()
        if b is None:
            res['conflict'].append(rel + '（初始版本不存在）'); continue
        if t == b:
            res['kept'].append(rel); continue          # 原專案沒動，差異是整合改的
        if o == b:
            res['copied'].append(rel)                  # 整合沒動，直接採用原專案新版
            if write: open(ours[rel], 'wb').write(t)
            continue
        # 兩邊都改過：三方合併
        try:
            tb = [x.decode('utf-8') for x in (b, o, t)]
        except UnicodeDecodeError:
            res['conflict'].append(rel + '（二進位）'); continue
        with tempfile.TemporaryDirectory() as td:
            fb, fo, ft = (os.path.join(td, n) for n in ('b', 'o', 't'))
            for f, c in zip((fb, fo, ft), (b, o, t)):
                open(f, 'wb').write(c)
            r = subprocess.run(['git', 'merge-file', '-p', fo, fb, ft], capture_output=True)
            if r.returncode == 0:
                res['merged'].append(rel)
                if write: open(ours[rel], 'wb').write(r.stdout)
            else:
                res['conflict'].append(rel + '（%d 處衝突）' % r.returncode)
    for rel in new:
        if re.search(r'socket\.io|(^|/)lib/ws\.js$', rel):   # 整合時刻意移除或改走共用版的檔案，不要加回來
            continue
        res['new'].append(rel)
        if write:
            dst = os.path.join(ours_dir, rel)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            open(dst, 'wb').write(open(theirs[rel], 'rb').read())
    p.stdin.close(); p.wait()
    print(json.dumps({k: v for k, v in res.items()}, ensure_ascii=False, indent=1))

main()
