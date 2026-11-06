const { Client } = require('../frontend/node_modules/ssh2');

const conn = new Client();

conn.on('ready', () => {
  const cmd = `
    echo "=== KUBECONFIG TEST WITH ADMIN.CONF ==="
    echo "T0v4n.kamil" | sudo -S kubectl --kubeconfig=/etc/kubernetes/admin.conf get nodes -o wide
    echo "=== PODS IN ALL NAMESPACES ==="
    echo "T0v4n.kamil" | sudo -S kubectl --kubeconfig=/etc/kubernetes/admin.conf get pods -A
    echo "=== USER KUBECONFIG CHECK ==="
    ls -la ~/.kube 2>&1 || echo "No ~/.kube dir"
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

