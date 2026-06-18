#!/usr/bin/env python3
import paramiko
import os

HOST = '192.168.110.61'
PORT = 22
USER = 'corban'
PASS = '7832518ycx'
LOCAL = r'\\玛卡巴卡的老年\m\new\fnos'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(HOST, port=PORT, username=USER, password=PASS, timeout=10)
    sftp = ssh.open_sftp()
    print('connected')

    # Upload key files
    for f in ['app/Dockerfile', 'app/server.js', 'app/docker/docker-compose.yaml']:
        sftp.put(f'{LOCAL}/{f}', f'/vol1/1000/fnos/{f}')
        print(f'  {f}')

    # Upload ui
    def up(local_dir, remote_dir):
        for item in os.listdir(local_dir):
            lp = os.path.join(local_dir, item)
            rp = f'{remote_dir}/{item}'.replace('\\', '/')
            if os.path.isfile(lp):
                sftp.put(lp, rp)
            elif os.path.isdir(lp):
                try: sftp.mkdir(rp)
                except: pass
                up(lp, rp)
    up(f'{LOCAL}/app/ui', '/vol1/1000/fnos/app/ui')
    print('  ui/ done')

    # Remove nginx.conf
    sftp.close()
    s, o, e = ssh.exec_command('rm -f /vol1/1000/fnos/app/nginx.conf')
    o.channel.recv_exit_status()

    # Build
    s, o, e = ssh.exec_command('rm -f /vol1/1000/*.fpk /vol1/1000/fnos/*.fpk && cd /vol1/1000/fnos && fnpack build 2>&1')
    o.channel.recv_exit_status()
    out = o.read().decode()
    print(out)

    # Find fpk
    s, o, e = ssh.exec_command('ls /vol1/1000/fnos/*.fpk 2>/dev/null')
    fpk = o.read().decode().strip()
    if fpk:
        s, o, e = ssh.exec_command(f'cp /vol1/1000/fnos/quick-dial.fpk /vol1/1000/quick-dial_v1.0.6_fnos.fpk && ls -lh /vol1/1000/quick-dial_v1.0.6_fnos.fpk')
        print(o.read().decode())
    else:
        print('no fpk')

except Exception as ex:
    print(f'err: {ex}')
finally:
    ssh.close()
