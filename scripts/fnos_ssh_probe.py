import os
import paramiko

host = os.environ.get("FNOS_HOST", "192.168.110.238")
port = int(os.environ.get("FNOS_PORT", "22"))
user = os.environ.get("FNOS_USER", "corban")
pw = os.environ.get("FNOS_PASS", "")

cmds = [
    "id",
    "uname -a",
    "cat /etc/os-release 2>/dev/null | head -6",
    "echo '--- fnpack ---'; command -v fnpack 2>/dev/null || echo NO_FNPCK",
    "echo '--- docker ---'; command -v docker 2>/dev/null || echo NO_DOCKER",
    "echo '--- node ---'; command -v node npm 2>/dev/null || echo NO_NODE",
    "echo '--- home ---'; ls -la ~",
    "echo '--- pwd tree ---'; ls -la /vol* 2>/dev/null | head -20 || echo 'no /vol*'",
]

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
print(f"[*] connecting {user}@{host}:{port} ...")
ssh.connect(host, port=port, username=user, password=pw, timeout=20)
print("[*] connected OK\n")

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
