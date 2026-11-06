const { Client } = require('../frontend/node_modules/ssh2');

const conn = new Client();

conn.on('ready', () => {
  const cmd = `
    echo "=== 1. UNTAINT CONTROL-PLANE NODE ==="
    kubectl taint nodes kubernetesmaster node-role.kubernetes.io/control-plane:NoSchedule- 2>&1 || true

    echo "=== 2. FORCE CLEAN STUCK TERMINATING PODS ==="
    kubectl delete pod nginx-7854ff8877-86th6 --grace-period=0 --force -n default 2>&1 || true
    kubectl delete pod mysql-master-0 --grace-period=0 --force -n staging 2>&1 || true

    echo "=== 3. CHECK PENDING NGINX POD ==="
    kubectl get pods -A
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

