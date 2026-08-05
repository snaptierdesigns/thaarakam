/**
 * Cloudflare Pages Middleware — Maintenance Mode & Admin Bypass
 */

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k) out[k.trim()] = decodeURIComponent(rest.join('=').trim());
  }
  return out;
}

export async function onRequest(context) {
  try {
    const { request, next } = context;
    const url = new URL(request.url);
    const pathname = url.pathname;
    const cleanPath = pathname.replace(/\/+$/, '');

    // Allow static asset requests (_next, images, favicon)
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/images') ||
      pathname.startsWith('/data') ||
      pathname.endsWith('.png') ||
      pathname.endsWith('.jpg') ||
      pathname.endsWith('.jpeg') ||
      pathname.endsWith('.ico') ||
      pathname.endsWith('.svg') ||
      pathname.endsWith('.json')
    ) {
      return await next();
    }

    // Secret URL parameter bypass: e.g. https://www.thaarakam.in/?bypass=admin
    const bypassParam = url.searchParams.get('bypass');
    if (bypassParam === 'admin' || bypassParam === 'true') {
      const response = await next();
      const res = new Response(response.body, response);
      res.headers.append('Set-Cookie', 'thaarakam_admin_session=authenticated; Path=/; Max-Age=2592000; SameSite=Lax');
      return res;
    }

    const cookies = parseCookies(request.headers.get('Cookie'));
    const isAdmin = cookies['thaarakam_admin_session'] === 'authenticated';

    // Allow all /admin routes and /api routes through
    if (cleanPath.startsWith('/admin') || cleanPath.startsWith('/api')) {
      if (cleanPath.startsWith('/admin') && cleanPath !== '/admin/login' && !cleanPath.startsWith('/admin/login') && !isAdmin) {
        return Response.redirect(`${url.origin}/admin/login/`, 302);
      }
      return await next();
    }

    // If logged in as admin, bypass maintenance mode completely!
    if (isAdmin) {
      return await next();
    }

    // Maintenance Mode HTML Response for all public visitors
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thaarakam Jewellery | We'll be back soon</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #0d0f12;
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      text-align: center;
    }
    .card {
      max-width: 480px;
      width: 100%;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 1.5rem;
      padding: 2.5rem 2rem;
      backdrop-filter: blur(16px);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    }
    .logo {
      font-size: 1.5rem;
      font-weight: 300;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-bottom: 2rem;
      color: #ffffff;
    }
    .badge {
      display: inline-block;
      padding: 0.35rem 0.85rem;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #d97706;
      background: rgba(217, 119, 6, 0.1);
      border: 1px solid rgba(217, 119, 6, 0.25);
      border-radius: 9999px;
      margin-bottom: 1.25rem;
    }
    h1 {
      font-size: 1.85rem;
      font-weight: 400;
      letter-spacing: 0.02em;
      margin-bottom: 0.75rem;
      color: #f8fafc;
    }
    p {
      font-size: 0.9rem;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .btn-group {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      width: 100%;
    }
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.65rem;
      padding: 0.85rem 1.25rem;
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      border-radius: 0.85rem;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .btn-ig {
      background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
      color: #ffffff;
    }
    .btn-ig:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-wa {
      background-color: #25d366;
      color: #ffffff;
    }
    .btn-wa:hover { opacity: 0.9; transform: translateY(-1px); }
    .footer-link {
      margin-top: 2rem;
      font-size: 0.75rem;
      color: #64748b;
      text-decoration: none;
    }
    .footer-link:hover { color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">Thaarakam</div>
    <div class="badge">Maintenance Mode</div>
    <h1>We'll be back soon</h1>
    <p>Till then order through our dms</p>
    <div class="btn-group">
      <a href="https://www.instagram.com/thaarakam_by_nithara/" target="_blank" rel="noopener noreferrer" class="btn btn-ig">
        <span>Order via Instagram DMs</span>
      </a>
      <a href="https://wa.me/917907572719" target="_blank" rel="noopener noreferrer" class="btn btn-wa">
        <span>Order via WhatsApp DMs</span>
      </a>
    </div>
  </div>
  <a href="/admin/login/" class="footer-link">Admin Access</a>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err) {
    return await context.next();
  }
}
