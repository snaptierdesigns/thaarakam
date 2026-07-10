const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Target the exact 128-product cache file
const targetFile = 'c:\\Users\\nonam\\OneDrive\\Desktop\\thaarakam\\.next\\cache\\fetch-cache\\b8a5e15d0ca9a0e5c0fc9a857787500a43932438b51b60d4b2d9b55e23461848';
const backupPath = 'c:\\Users\\nonam\\OneDrive\\Desktop\\thaarakam\\scratch\\recovered_products.json';

try {
  console.log('Decoding the 128-product cache file...');
  const rawContent = fs.readFileSync(targetFile, 'utf8');
  const parsedEnvelope = JSON.parse(rawContent);

  const base64Body = parsedEnvelope.data.body;
  const decodedBuffer = Buffer.from(base64Body, 'base64');
  
  let resultText = '';
  try {
    const decompressed = zlib.gunzipSync(decodedBuffer);
    resultText = decompressed.toString('utf8');
  } catch (err) {
    try {
      const decompressed = zlib.inflateSync(decodedBuffer);
      resultText = decompressed.toString('utf8');
    } catch (err2) {
      resultText = decodedBuffer.toString('utf8');
    }
  }

  const products = JSON.parse(resultText);
  console.log(`Success! Extracted ${products.length} products!`);
  
  fs.writeFileSync(backupPath, JSON.stringify(products, null, 2));
  console.log(`Saved products database to: ${backupPath}`);
} catch (err) {
  console.error('Failed to extract products:', err.message);
}
