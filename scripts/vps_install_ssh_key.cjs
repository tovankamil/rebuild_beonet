const { Client } = require('../frontend/node_modules/ssh2');
const fs = require('fs');
const path = require('path');

const pubKey = fs.readFileSync(path.join(process.env.USERPROFILE, '.ssh', 'id_ed25519.pub'), 'utf8').trim();

const conn = new Client();

conn.on('ready', () => {
  const cmd = `
    mkdir -p ~/.ssh && chmod 700 ~/.ssh
    if ! grep -q "${pubKey}" ~/.ssh/authorized_keys 2>/dev/null; then
      echo "${pubKey}" >> ~/.ssh/authorized_keys
      chmod 600 ~/.ssh/authorized_keys
      echo "SSH Key successfully added to authorized_keys!"
    else
      echo "SSH Key already present in authorized_keys."
    fi
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Exec error:', err);
      conn.end();
      return;
    }

    stream.on('close', () => {
      conn.end();
    }).on('data', d => process.stdout.write(d.toString()));
  });
}).connect({
  host: '103.172.205.41',
  port: 22,
  username: 'tovan',
  password: 'T0v4n.kamil',
});

