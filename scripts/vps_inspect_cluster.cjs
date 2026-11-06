const { Client } = require('../frontend/node_modules/ssh2');

const conn = new Client();

conn.on('ready', () => {
  const cmd = `
    echo "=== SYNC KUBECONFIG TO USER TOVAN ==="
    echo "T0v4n.kamil" | sudo -S cp /etc/kubernetes/admin.conf /home/tovan/.kube/config
    echo "T0v4n.kamil" | sudo -S chown tovan:tovan /home/tovan/.kube/config
    
    echo "=== TEST KUBECTL DIRECTLY AS TOVAN ==="
    kubectl get nodes
    
    echo "=== MASTER TAINTS ==="
    kubectl describe node kubernetesmaster | grep -i taints
    
    echo "=== WORKER STATUS / PING ==="
    ping -c 2 10.38.191.152 || echo "Worker node 10.38.191.152 unreachable"

    echo "=== TERMINATING PODS CLEANUP ==="
    kubectl get pods -A | grep -E "Terminating|Pending" || true
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

