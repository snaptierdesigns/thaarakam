const net = require('net');

function checkPort(host, port) {
  return new Promise((resolve) => {
    console.log(`Checking connection to ${host}:${port}...`);
    const socket = new net.Socket();
    let status = false;

    socket.setTimeout(4000);

    socket.on('connect', () => {
      console.log(`Connected to ${host}:${port}! Port is OPEN.`);
      status = true;
      socket.destroy();
    });

    socket.on('timeout', () => {
      console.log(`Connection to ${host}:${port} timed out.`);
      socket.destroy();
    });

    socket.on('error', (err) => {
      console.log(`Connection to ${host}:${port} failed: ${err.message}`);
      socket.destroy();
    });

    socket.on('close', () => {
      resolve(status);
    });

    socket.connect(port, host);
  });
}

async function testPorts() {
  // Check the global pooler hostnames
  const hosts = [
    'aws-0-ap-south-1.pooler.supabase.com', // Mumbai
    'aws-0-us-east-1.pooler.supabase.com',  // N. Virginia
    'aws-0-eu-central-1.pooler.supabase.com', // Frankfurt
    'aws-0-us-west-1.pooler.supabase.com'   // N. California
  ];

  for (const host of hosts) {
    await checkPort(host, 6543);
    await checkPort(host, 5432);
  }
}

testPorts();
