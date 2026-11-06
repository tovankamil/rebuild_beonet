const { Client } = require('../frontend/node_modules/ssh2');
const fs = require('fs');
const path = require('path');

const pubKey = fs.readFileSync(path.join(process.env.USERPROFILE, '.ssh', 'id_ed25519.pub'), 'utf8').trim();

const conn = new Client();

console.log('Connecting to Worker 103.187.147.187 as tovan...');

conn.on('ready', () => {
  console.log('>>> WORKER SSH CONNECTION SUCCESSFUL! <<<');

  const cmd = `
    echo "=== 1. INSTALL SSH PUBLIC KEY ==="
    mkdir -p ~/.ssh && chmod 700 ~/.ssh
    if ! grep -q "${pubKey}" ~/.ssh/authorized_keys 2>/dev/null; then
      echo "${pubKey}" >> ~/.ssh/authorized_keys
      chmod 600 ~/.ssh/authorized_keys
      echo "SSH Key successfully added to worker authorized_keys!"
    else
      echo "SSH Key already present in worker authorized_keys."
    fi

    echo "=== 2. WORKER HOST & OS ==="
    cat /etc/os-release | grep -E "PRETTY_NAME|VERSION="
    uname -a
    hostname -f
    ip a | grep -E "inet "

    echo "=== 3. HARDWARE SPECS ==="
    echo "CPU Cores: $(nproc)"
    free -m
    df -h /

    echo "=== 4. KUBELET & CONTAINERD STATUS ==="
    systemctl is-active containerd kubelet 2>&1 || true
    echo "T0v4n.kamil" | sudo -S systemctl status kubelet --no-pager -n 15 2>&1 || true
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Exec error:', err);
      conn.end();
      return;
    }

    stream.on('close', (code) => {
      console.log(`\nWorker command finished with exit code: ${code}`);
      conn.end();
    }).on('data', d => process.stdout.write(d.toString()))
      .stderr.on('data', d => process.stderr.write(d.toString()));
  });
}).on('error', (err) => {
  console.error('Worker SSH Connection Error:', err.message);
}).connect({
  host: '103.187.147.187',
  port: 22,
  username: 'tovan',
  password: 'T0v4n.kamil',
  readyTimeout: 20000,
});
