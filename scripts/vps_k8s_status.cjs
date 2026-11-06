const { Client } = require('../frontend/node_modules/ssh2');

const conn = new Client();

conn.on('ready', () => {
  const cmd = `
    echo "=== KUBECTL CLUSTER INFO ==="
    echo "T0v4n.kamil" | sudo -S kubectl get nodes -o wide 2>&1
    echo "=== KUBELET SERVICE STATUS ==="
    systemctl is-active kubelet 2>&1 || true
    echo "=== KUBEADM / K8S RUNNING PROCESSES ==="
    ps aux | grep -E "kube|k3s|containerd" | grep -v grep | head -n 15
    echo "=== DOCKER STATUS ==="
    docker ps 2>&1 || true
    echo "=== LISTENING PORTS ==="
    ss -tulpn | grep -E "6443|2379|10250|80|443" || true
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Exec error:', err);
      conn.end();
      return;
    }

    stream.on('close', () => {
      conn.end();
    }).on('data', (d) => process.stdout.write(d.toString()))
      .stderr.on('data', (d) => process.stderr.write(d.toString()));
  });
}).connect({
  host: '103.172.205.41',
  port: 22,
  username: 'tovan',
  password: 'T0v4n.kamil',
  readyTimeout: 20000,
});

