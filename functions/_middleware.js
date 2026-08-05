/**
 * Cloudflare Pages Middleware — Site Live & Admin Auth Check
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

    const cookies = parseCookies(request.headers.get('Cookie'));
    const isAdmin = cookies['thaarakam_admin_session'] === 'authenticated';

    // Protect admin panel routes
    if (cleanPath.startsWith('/admin') && cleanPath !== '/admin/login' && !cleanPath.startsWith('/admin/login') && !isAdmin) {
      return Response.redirect(`${url.origin}/admin/login/`, 302);
    }

    return await next();
  } catch (err) {
    return await context.next();
  }
}
