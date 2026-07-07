import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('fileToUpload') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Ensure the filename has a valid image extension, otherwise uploaders reject
    let fileName = file.name || 'image.jpg';
    if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) {
      fileName = 'image.jpg';
    }

    // Convert file to buffer for stable, environment-independent binary serialization
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`Attempting image upload (${fileName}) to Catbox...`);
    try {
      // Construct Catbox multipart form body manually
      const catBoundary = '----WebKitFormBoundaryCat' + Math.random().toString(36).substring(2);
      const catHeader = 
        `--${catBoundary}\r\n` +
        `Content-Disposition: form-data; name="reqtype"\r\n\r\n` +
        `fileupload\r\n` +
        `--${catBoundary}\r\n` +
        `Content-Disposition: form-data; name="fileToUpload"; filename="${fileName}"\r\n` +
        `Content-Type: ${file.type || 'image/jpeg'}\r\n\r\n`;
      const catFooter = `\r\n--${catBoundary}--\r\n`;

      const catBody = Buffer.concat([
        Buffer.from(catHeader, 'utf-8'),
        buffer,
        Buffer.from(catFooter, 'utf-8')
      ]);

      const catResponse = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: catBody,
        headers: {
          'Content-Type': `multipart/form-data; boundary=${catBoundary}`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
      });

      if (catResponse.ok) {
        const imageUrl = await catResponse.text();
        if (imageUrl && imageUrl.startsWith('http')) {
          console.log('Catbox upload successful:', imageUrl.trim());
          return NextResponse.json({ url: imageUrl.trim() });
        }
      }
      
      console.warn(`Catbox upload failed with status: ${catResponse.status}. Triggering PixelDrain fallback...`);
    } catch (catErr) {
      console.error('Catbox upload exception, triggering PixelDrain fallback:', catErr);
    }

    // FALLBACK: Upload to PixelDrain
    console.log(`Attempting fallback image upload (${fileName}) to PixelDrain...`);
    try {
      // Construct PixelDrain multipart form body manually
      const pdBoundary = '----WebKitFormBoundaryPD' + Math.random().toString(36).substring(2);
      const pdHeader = 
        `--${pdBoundary}\r\n` +
        `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
        `Content-Type: ${file.type || 'image/jpeg'}\r\n\r\n`;
      const pdFooter = `\r\n--${pdBoundary}--\r\n`;

      const pdBody = Buffer.concat([
        Buffer.from(pdHeader, 'utf-8'),
        buffer,
        Buffer.from(pdFooter, 'utf-8')
      ]);

      const pdResponse = await fetch('https://pixeldrain.com/api/file', {
        method: 'POST',
        body: pdBody,
        headers: {
          'Content-Type': `multipart/form-data; boundary=${pdBoundary}`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
      });

      if (pdResponse.ok) {
        const pdJson = await pdResponse.json();
        if (pdJson.success && pdJson.id) {
          const fileUrl = `https://pixeldrain.com/api/file/${pdJson.id}`;
          console.log('PixelDrain fallback upload successful:', fileUrl);
          return NextResponse.json({ url: fileUrl });
        }
      }
      
      console.error(`PixelDrain upload failed with status: ${pdResponse.status}`);
      return NextResponse.json({ error: `Upload servers failed (Catbox/PixelDrain)` }, { status: 500 });
    } catch (pdErr: any) {
      console.error('PixelDrain upload exception:', pdErr);
      return NextResponse.json({ error: pdErr?.message || 'Failed to upload to fallback server' }, { status: 500 });
    }
  } catch (err: any) {
    console.error('Upload route error:', err);
    return NextResponse.json({ error: err?.message || 'Server upload failure' }, { status: 500 });
  }
}
