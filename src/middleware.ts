import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Aggressive SEO crawlers, AI scrapers, and bot agents to reject at the Edge
const BLOCKED_BOT_REGEX = /ahrefsbot|semrushbot|dotbot|mj12bot|petalbot|bytespider|amazonbot|gptbot|claudebot|cohere-ai|yandex|megaindex|blexbot|rogerbot/i;

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';

  // Instantly block bots at the Edge before they trigger page rendering or database load
  if (BLOCKED_BOT_REGEX.test(userAgent)) {
    return new NextResponse('Access Denied', { status: 403 });
  }

  const { pathname } = request.nextUrl;

  // Protect all /admin routes, except the login page itself
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminSession = request.cookies.get('thaarakam_admin_session_v2')?.value;

    // If session cookie is missing or not authenticated, redirect to login
    if (!adminSession || adminSession !== 'auth_v2_98472') {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match all paths except Next.js internals, static files, and public assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|robots.txt|sitemap.xml).*)'],
};
