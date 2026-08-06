import os
import paramiko

HOST = "192.168.110.6"
PORT = 22
USER = "corban"
PW = os.environ.get("FNOS_PASS", "")
LOCAL = r"M:\new\fnos"
REMOTE_BASE = "/tmp/quickdial-build/fnos"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, port=PORT, username=USER, password=PW, timeout=20)
sftp = ssh.open_sftp()


def upload_dir(local, remote):
    try:
        sftp.stat(remote)
    except IOError:
        sftp.mkdir(remote)
    for name in sorted(os.listdir(local)):
        l = os.path.join(local, name)
        r = remote + "/" + name
        if os.path.isdir(l):
            upload_dir(l, r)
        else:
            sftp.put(l, r)
            print("put", r)


# 先清理远端构建目录：否则历史构建的 assets/index-*.js 会残留并被一起打进 fpk
print("[*] cleaning remote /tmp/quickdial-build ...")
_in, _out, _err = ssh.exec_command("rm -rf /tmp/quickdial-build && echo CLEANED")
print("   ", _out.read().decode(errors="replace").strip())

print("[*] uploading", LOCAL, "->", REMOTE_BASE)
try:
    sftp.stat("/tmp/quickdial-build")
except IOError:
    sftp.mkdir("/tmp/quickdial-build")
upload_dir(LOCAL, REMOTE_BASE)
print("[*] upload done")

# 编译型二进制（app/server）经 sftp 上传后会丢掉 +x，需在 fnpack build 前补回执行权限
print("[*] chmod +x app/server ...")
_in, _out, _err = ssh.exec_command("chmod 755 %s/app/server && echo CHMOD_DONE" % REMOTE_BASE)
print("   ", _out.read().decode(errors="replace").strip())

sin, sout, serr = ssh.exec_command("find %s | sort" % REMOTE_BASE)
print("\n[remote tree]")
print(sout.read().decode(errors="replace").rstrip("\n"))

cmd = ("export HOME=/tmp/corbanhome; mkdir -p $HOME; "
       "cd /tmp/quickdial-build && fnpack build -d fnos 2>&1; "
       "echo '--- RESULT ---'; find /tmp/quickdial-build -name '*.fpk'")
sin, sout, serr = ssh.exec_command(cmd)
print("\n[build output]")
print(sout.read().decode(errors="replace").rstrip("\n"))
err = serr.read().decode(errors="replace").strip()
if err:
    print("[err]", err)

sftp.close()
ssh.close()
print("\n[*] done")
