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

    // Maintenance Mode HTML Response matching main site design system
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
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #ffffff;
      color: #111111;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      -webkit-font-smoothing: antialiased;
    }
    .announcement-bar {
      background-color: #111111;
      color: #ffffff;
      text-align: center;
      padding: 0.5rem 1rem;
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.15em;
    }
    .navbar {
      border-bottom: 1px solid #ececec;
      background-color: rgba(255, 255, 255, 0.95);
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo {
      font-size: 1.25rem;
      font-weight: 300;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #111111;
      text-decoration: none;
    }
    .main-content {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 1.5rem;
      text-align: center;
    }
    .card {
      max-width: 520px;
      width: 100%;
      background: #ffffff;
      border: 1px solid #ececec;
      border-radius: 1.5rem;
      padding: 3rem 2.5rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .badge {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #666666;
      margin-bottom: 0.75rem;
    }
    h1 {
      font-size: 1.85rem;
      font-weight: 300;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #111111;
      margin-bottom: 0.75rem;
    }
    .divider {
      height: 1px;
      width: 3rem;
      background-color: rgba(17, 17, 17, 0.6);
      margin-bottom: 1.5rem;
    }
    .message {
      font-size: 0.95rem;
      color: #666666;
      line-height: 1.6;
      margin-bottom: 2.25rem;
      font-weight: 400;
    }
    .btn-group {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
    }
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      border-radius: 0.75rem;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .btn-primary {
      background-color: #111111;
      color: #ffffff;
      border: 1px solid #111111;
    }
    .btn-primary:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    .btn-secondary {
      background-color: #ffffff;
      color: #111111;
      border: 1px solid #111111;
    }
    .btn-secondary:hover {
      background-color: #f8fafc;
      transform: translateY(-1px);
    }
    .footer {
      border-top: 1px solid #ececec;
      padding: 2rem 1.5rem;
      text-align: center;
      background-color: #ffffff;
    }
    .footer-quote {
      font-size: 0.75rem;
      font-style: italic;
      font-weight: 600;
      color: #666666;
      margin-bottom: 0.75rem;
    }
    .admin-link {
      font-size: 0.7rem;
      color: #999999;
      text-decoration: none;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .admin-link:hover { color: #111111; }
  </style>
</head>
<body>
  <div>
    <div class="announcement-bar">
      ✨ Prepaid Orders Only • Cash On Delivery (COD) is not available ✨
    </div>
    <header class="navbar">
      <a href="/" class="logo">Thaarakam</a>
    </header>
  </div>

  <main class="main-content">
    <div class="card">
      <span class="badge">Maintenance Mode</span>
      <h1>We'll be back soon</h1>
      <div class="divider"></div>
      <p class="message">Till then order through our dms</p>
      
      <div class="btn-group">
        <a href="https://www.instagram.com/thaarakam_by_nithara/" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
          Order via Instagram DMs →
        </a>
        <a href="https://wa.me/917907572719" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
          Order via WhatsApp DMs →
        </a>
      </div>
    </div>
  </main>

  <footer class="footer">
    <p class="footer-quote">Thaarakam is more than jewelry. It's our dream, our effort, and our promise to you.</p>
    <a href="/admin/login/" class="admin-link">Admin Access</a>
  </footer>
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
