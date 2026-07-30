/**
 * Cloudflare Pages Middleware — Admin Route Protection
 * Since the site is statically exported (output: 'export'), Next.js middleware
 * does NOT run. This Cloudflare Pages Function enforces admin auth at the edge.
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

    // Strip trailing slash for comparison
    const cleanPath = pathname.replace(/\/+$/, '');

    // Allow /admin/login through unconditionally
    if (
      cleanPath === '/admin/login' ||
      cleanPath === '/admin/login/index.html' ||
      pathname.startsWith('/admin/login')
    ) {
      return await next();
    }

    // Protect all /admin/* routes
    if (cleanPath === '/admin' || cleanPath.startsWith('/admin/')) {
      const cookies = parseCookies(request.headers.get('Cookie'));
      const session = cookies['thaarakam_admin_session'];

      if (session !== 'authenticated') {
        // Redirect to login with trailing slash to match trailingSlash: true in next.config
        return Response.redirect(`${url.origin}/admin/login/`, 302);
      }
    }

    return await next();
  } catch (err) {
    // Safety net — never show an error page, just pass through
    return await context.next();
  }
}
