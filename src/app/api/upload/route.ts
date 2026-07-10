import { NextResponse } from 'next/server';

// Image upload API route handler supporting ImgBB and Telegra.ph fallbacks (Database Migrated to bzqbsdkbkfufuixndarb)
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

    // METHOD 1: ImgBB (Owner API option, if key is present in environment variables)
    const imgbbKey = process.env.IMGBB_API_KEY;
    if (imgbbKey) {
      console.log('ImgBB API key detected. Attempting upload to ImgBB...');
      try {
        const bodyParams = new URLSearchParams();
        bodyParams.append('image', fileData); // ImgBB accepts base64 strings directly

        const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
          method: 'POST',
          body: bodyParams,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        });

        if (imgbbResponse.ok) {
          const imgbbJson = await imgbbResponse.json();
          if (imgbbJson.success && imgbbJson.data && imgbbJson.data.url) {
            console.log('ImgBB upload successful:', imgbbJson.data.url);
            return NextResponse.json({ url: imgbbJson.data.url });
          }
        }
        console.warn(`ImgBB upload failed with status: ${imgbbResponse.status}. Trying fallbacks...`);
      } catch (imgbbErr) {
        console.error('ImgBB upload exception:', imgbbErr);
      }
    }

    // METHOD 2: Telegra.ph (Telegram CDN, keyless and extremely stable on Vercel US/EU nodes)
    console.log(`Attempting image upload (${fileName}) to Telegra.ph...`);
    try {
      const tgForm = new FormData();
      tgForm.append('file', blobObject, fileName);

      const tgResponse = await fetch('https://telegra.ph/upload', {
        method: 'POST',
        body: tgForm,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
      });

      if (tgResponse.ok) {
        const tgJson = await tgResponse.json();
        if (Array.isArray(tgJson) && tgJson[0] && tgJson[0].src) {
          const fileUrl = 'https://telegra.ph' + tgJson[0].src;
          console.log('Telegra.ph upload successful:', fileUrl);
          return NextResponse.json({ url: fileUrl });
        }
      }
      console.warn(`Telegra.ph upload failed with status: ${tgResponse.status}. Trying Catbox...`);
    } catch (tgErr) {
      console.error('Telegra.ph upload exception, trying Catbox:', tgErr);
    }

    // METHOD 3: Catbox (Safety net fallback)
    console.log(`Attempting image upload (${fileName}) to Catbox...`);
    try {
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
      console.error(`Catbox upload failed with status: ${catResponse.status}`);
    } catch (catErr) {
      console.error('Catbox upload exception:', catErr);
    }

    return NextResponse.json({ error: 'All upload methods failed. Please try a smaller image or configure IMGBB_API_KEY.' }, { status: 500 });
  } catch (err: any) {
    console.error('Upload route error:', err);
    return NextResponse.json({ error: err?.message || 'Server upload failure' }, { status: 500 });
  }
}
