const { Client } = require('../frontend/node_modules/ssh2');

const conn = new Client();

console.log('Connecting to 103.172.205.41 as tovan...');

conn.on('ready', () => {
  console.log('>>> SSH CONNECTION SUCCESSFUL! <<<');
  
  // Run diagnostic commands
  const cmd = `
    echo "=== HOST & OS ==="
    cat /etc/os-release | grep -E "PRETTY_NAME|VERSION="
    uname -a
    echo "=== HARDWARE SPECS ==="
    echo "CPU Cores: $(nproc)"
    free -m
    echo "=== DISK SPACE ==="
    df -h /
    echo "=== SUDO TEST ==="
    echo "T0v4n.kamil" | sudo -S whoami
    echo "=== EXISTING CONTAINER / K8S ==="
    which docker containerd k3s kubectl 2>/dev/null || echo "None found"
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Exec error:', err);
      conn.end();
      return;
    }

    stream.on('close', (code, signal) => {
      console.log(`\nCommand finished with exit code: ${code}`);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data.toString());
    }).stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });
  });
}).on('error', (err) => {
  console.error('SSH Connection Error:', err.message);
}).connect({
  host: '103.172.205.41',
  port: 22,
  username: 'tovan',
  password: 'T0v4n.kamil',
  readyTimeout: 20000,
});

