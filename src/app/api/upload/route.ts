import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { fileData, fileName: rawFileName, fileType } = await request.json();
    
    if (!fileData) {
      return NextResponse.json({ error: 'No file data provided' }, { status: 400 });
    }

    // Ensure the filename has a valid image extension, otherwise uploaders reject
    let fileName = rawFileName || 'image.jpg';
    if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) {
      fileName = 'image.jpg';
    }

    // Decode Base64 string to a binary buffer
    const buffer = Buffer.from(fileData, 'base64');
    
    // Construct standard Web Blob on the server
    const blobObject = new Blob([buffer], { type: fileType || 'image/jpeg' });

    console.log(`Processing upload for ${fileName} (${buffer.length} bytes)...`);

    console.log(`Attempting image upload (${fileName}) to Catbox...`);
    try {
      // Build standard FormData object - fetch will automatically set the correct headers and boundaries
      const catboxForm = new FormData();
      catboxForm.append('reqtype', 'fileupload');
      catboxForm.append('fileToUpload', blobObject, fileName);

      const catResponse = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: catboxForm,
        headers: {
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
      // Build standard FormData object for PixelDrain
      const pdForm = new FormData();
      pdForm.append('file', blobObject, fileName);

      const pdResponse = await fetch('https://pixeldrain.com/api/file', {
        method: 'POST',
        body: pdForm,
        headers: {
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
