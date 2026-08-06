import os
import paramiko

HOST = "192.168.110.6"
PORT = 22
USER = "corban"
PW = os.environ.get("FNOS_PASS", "")
REMOTE = "/tmp/quickdial-build/quick-dial.fpk"

# 版本号必须动态取自 package.json —— 曾硬编码导致产物文件名版本滞后
import json
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with open(os.path.join(_ROOT, "package.json"), encoding="utf-8") as _f:
    VERSION = json.load(_f)["version"]
LOCAL = os.path.join(_ROOT, "packages", "quick-dial_v%s_fnos.fpk" % VERSION)

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, port=PORT, username=USER, password=PW, timeout=20)
sftp = ssh.open_sftp()

st = sftp.stat(REMOTE)
print("[*] remote size:", st.st_size, "mtime:", st.st_mtime)
print("[*] downloading ->", LOCAL)
sftp.get(REMOTE, LOCAL)
sftp.close()
ssh.close()
print("[*] saved local size:", os.path.getsize(LOCAL))
