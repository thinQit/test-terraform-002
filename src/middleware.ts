import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

export const runtime = 'nodejs';

const PUBLIC_PATHS = ['/api/health', '/api/auth/login', '/api/auth/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = getTokenFromHeader(request.headers.get('authorization'));
  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = verifyToken(token);
    const requestHeaders = new Headers(request.headers);
    if (payload.sub) requestHeaders.set('x-user-id', String(payload.sub));
    if (payload.role) requestHeaders.set('x-user-role', String(payload.role));

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/:path*']
};
