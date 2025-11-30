// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for authentication and rate limiting
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for public routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/webhooks') ||
        pathname === '/' ||
        pathname === '/demo' ||
        pathname.startsWith('/public')
    ) {
        return NextResponse.next();
    }

    // Dashboard routes - check authentication
    if (pathname.startsWith('/dashboard')) {
        // TODO: Add Firebase authentication check
        // For now, allow all requests
        return NextResponse.next();
    }

    // API routes - add rate limiting headers
    if (pathname.startsWith('/api/')) {
        const response = NextResponse.next();

        // Add security headers
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-XSS-Protection', '1; mode=block');

        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
