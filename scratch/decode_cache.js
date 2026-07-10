const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const cacheDir = 'c:\\Users\\nonam\\OneDrive\\Desktop\\thaarakam\\.next\\cache\\fetch-cache';

function decodeCacheFile(fileName) {
  const filePath = path.join(cacheDir, fileName);
  try {
    const rawContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse the outer Next.js cache envelope
    const parsedEnvelope = JSON.parse(rawContent);
    
    if (!parsedEnvelope.data || !parsedEnvelope.data.body) {
      console.log(`File ${fileName} does not contain a body.`);
      return;
    }

    const base64Body = parsedEnvelope.data.body;
    const isGzipped = parsedEnvelope.data.headers && parsedEnvelope.data.headers['content-encoding'] === 'gzip';
    const requestUrl = parsedEnvelope.data.url;
    
    console.log(`\nDecoding ${fileName}...`);
    console.log(`- Request URL: ${requestUrl}`);
    console.log(`- Content Gzipped: ${isGzipped}`);

    // Decode base64 to binary buffer
    const decodedBuffer = Buffer.from(base64Body, 'base64');
    
    let resultText = '';
    if (isGzipped) {
      try {
        // Try standard Gzip
        const decompressed = zlib.gunzipSync(decodedBuffer);
        resultText = decompressed.toString('utf8');
      } catch (gzipErr) {
        try {
          // Try Deflate (zlib)
          const decompressed = zlib.inflateSync(decodedBuffer);
          resultText = decompressed.toString('utf8');
        } catch (inflateErr) {
          try {
            // Try generic Unzip
            const decompressed = zlib.unzipSync(decodedBuffer);
            resultText = decompressed.toString('utf8');
          } catch (unzipErr) {
            console.warn(`All decompression failed, trying raw string decoding...`);
            resultText = decodedBuffer.toString('utf8');
          }
        }
      }
    } else {
      resultText = decodedBuffer.toString('utf8');
    }

    // Parse the actual database records JSON
    const dataRecords = JSON.parse(resultText);
    console.log(`- SUCCESS! Decoded payload is JSON.`);
    
    let safeName = 'unknown';
    if (requestUrl.includes('/products')) {
      safeName = 'products';
      console.log(`- Extracted ${dataRecords.length} products!`);
      const backupPath = 'c:\\Users\\nonam\\OneDrive\\Desktop\\thaarakam\\scratch\\recovered_products.json';
      fs.writeFileSync(backupPath, JSON.stringify(dataRecords, null, 2));
      console.log(`- SAVED products database to: ${backupPath}`);
    } else if (requestUrl.includes('/settings')) {
      safeName = 'settings';
      console.log(`- Extracted settings successfully!`);
      const backupPath = 'c:\\Users\\nonam\\OneDrive\\Desktop\\thaarakam\\scratch\\recovered_settings.json';
      fs.writeFileSync(backupPath, JSON.stringify(dataRecords, null, 2));
      console.log(`- SAVED settings database to: ${backupPath}`);
    } else {
      console.log(`- Extracted other data: ${resultText.substring(0, 300)}...`);
      const backupPath = `c:\\Users\\nonam\\OneDrive\\Desktop\\thaarakam\\scratch\\recovered_data_${fileName.substring(0, 8)}.json`;
      fs.writeFileSync(backupPath, JSON.stringify(dataRecords, null, 2));
    }

  } catch (err) {
    console.error(`Failed to decode file ${fileName}:`, err.message);
  }
}

function runDecoder() {
  const files = fs.readdirSync(cacheDir);
  console.log(`Found ${files.length} cache files in next.js fetch-cache.`);
  
  files.forEach(file => {
    // Only process the files that are likely to contain our large queries
    const fullPath = path.join(cacheDir, file);
    const stats = fs.statSync(fullPath);
    if (stats.isFile() && stats.size > 1000) {
      decodeCacheFile(file);
    }
  });
}

runDecoder();
