#!/usr/bin/env python3
"""飞牛 FPK 打包部署 — 192.168.110.60:5666"""
import paramiko
import os
import sys

HOST = '192.168.110.61'
PORT = 22
USER = 'corban'
PASS = '7832518ycx'
LOCAL = r'\\澄曜工作室\m\new\fnos'
REMOTE = '/vol1/1000/fnos'
SKIP_FILES = {'quick-dial-fnos-v1.0.8.zip'}

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f'[1/4] Connecting to {HOST}:{PORT}...')
    ssh.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)
    sftp = ssh.open_sftp()
    print('  ✓ connected')

    # Clean remote
    print('[2/4] Cleaning remote directory...')
    s, o, e = ssh.exec_command(f'rm -rf {REMOTE} && mkdir -p {REMOTE}')
    if o.channel.recv_exit_status() != 0:
        print(f'  ✗ clean failed: {e.read().decode()}')
        sys.exit(1)
    print('  ✓ cleaned')

    # Recursive upload
    print('[3/4] Uploading fnos/ → remote...')
    uploaded = 0

    def up(local_dir, remote_dir):
        global uploaded
        for item in os.listdir(local_dir):
            if item in SKIP_FILES:
                continue
            lp = os.path.join(local_dir, item)
            rp = f'{remote_dir}/{item}'.replace('\\', '/')
            if os.path.isfile(lp):
                sftp.put(lp, rp)
                uploaded += 1
                if uploaded % 10 == 0:
                    print(f'  ... {uploaded} files')
            elif os.path.isdir(lp):
                try:
                    sftp.mkdir(rp)
                except:
                    pass
                up(lp, rp)

    up(LOCAL, REMOTE)
    print(f'  ✓ {uploaded} files uploaded')

    # Build
    print('[4/4] Building FPK...')
    s, o, e = ssh.exec_command(f'rm -f /vol1/1000/*.fpk && cd {REMOTE} && fnpack build 2>&1')
    exit_code = o.channel.recv_exit_status()
    output = o.read().decode().strip()
    err = e.read().decode().strip()
    if output:
        print(f'  stdout:\n{output}')
    if err:
        print(f'  stderr:\n{err}')

    if exit_code != 0:
        print(f'  ✗ build failed (exit {exit_code})')
        sys.exit(1)

    # Find & copy fpk
    s, o, e = ssh.exec_command(f'ls {REMOTE}/*.fpk /vol1/1000/*.fpk 2>/dev/null')
    fpk_path = o.read().decode().strip()
    if fpk_path:
        dst = '/vol1/1000/quick-dial_v1.0.8_fnos.fpk'
        s, o, e = ssh.exec_command(f'cp {fpk_path.split(chr(10))[0]} {dst} && ls -lh {dst}')
        print(f'  ✓ FPK: {o.read().decode().strip()}')
    else:
        print('  ⚠ no .fpk found')

    sftp.close()
    print('\n✓ Done.')

except Exception as ex:
    print(f'\n✗ Error: {ex}')
    sys.exit(1)
finally:
    ssh.close()
