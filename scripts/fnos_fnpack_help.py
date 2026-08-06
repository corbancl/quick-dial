import os
import paramiko

host = "192.168.110.238"
port = 22
user = "corban"
pw = os.environ.get("FNOS_PASS", "")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, port=port, username=user, password=pw, timeout=20)

cmds = [
    "fnpack --help 2>&1 | head -50",
    "fnpack build --help 2>&1 | head -50",
    "echo 'HOME='$HOME'; pwd'",
    "ls -ld /tmp && touch /tmp/.wtest && echo WROTE_TMP && rm -f /tmp/.wtest",
    "ls -la / | head -40",
    "which tar gzip; tar --version | head -1",
]

for c in cmds:
    print("\n$ " + c)
    stdin, stdout, stderr = ssh.exec_command(c)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    if out:
        print(out.rstrip("\n"))
    if err.strip():
        print("[err]", err.rstrip("\n"))

ssh.close()
print("\n[*] done")
