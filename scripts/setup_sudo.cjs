const { Client } = require('../frontend/node_modules/ssh2');

function setupSudo(ip) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => {
      console.log(`Setting up passwordless sudo on ${ip}...`);
      conn.exec('echo "T0v4n.kamil" | sudo -S bash -c "echo \\"tovan ALL=(ALL) NOPASSWD:ALL\\" > /etc/sudoers.d/tovan && chmod 440 /etc/sudoers.d/tovan"', (err, stream) => {
        if (err) return reject(err);
        stream.on('close', (code) => {
          conn.end();
          resolve(code);
        }).on('data', d => console.log(`[${ip}]`, d.toString()))
          .stderr.on('data', d => console.error(`[${ip} err]`, d.toString()));
      });
    }).on('error', reject).connect({
      host: ip,
      port: 22,
      username: 'tovan',
      password: 'T0v4n.kamil',
    });
  });
}

async function run() {
  await setupSudo('103.172.205.41');
  console.log('Master sudo ready!');
  await setupSudo('103.187.147.187');
  console.log('Worker sudo ready!');
}

run().catch(console.error);
