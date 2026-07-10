const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\nonam\\OneDrive\\Desktop\\thaarakam\\.next\\cache\\fetch-cache\\b8a5e15d0ca9a0e5c0fc9a857787500a43932438b51b60d4b2d9b55e23461848';

try {
  const buf = fs.readFileSync(filePath);
  console.log(`File size: ${buf.length} bytes`);
  
  // Print first 500 bytes as hex and text representation
  console.log('\n--- First 500 Bytes (Hex) ---');
  console.log(buf.slice(0, 500).toString('hex'));

  console.log('\n--- First 500 Bytes (ASCII Text) ---');
  console.log(buf.slice(0, 500).toString('ascii').replace(/[^\x20-\x7E]/g, '.'));

  // Also print the end of the file in case the response body is there
  console.log('\n--- Last 500 Bytes (ASCII Text) ---');
  console.log(buf.slice(buf.length - 500).toString('ascii').replace(/[^\x20-\x7E]/g, '.'));
} catch (err) {
  console.error(err);
}
