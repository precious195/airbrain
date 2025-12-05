// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Parse the session cookie to get user info
 */
function parseSession(sessionCookie: string | undefined): { userId?: string; companyId?: string; industry?: string; role?: string } | null {
    if (!sessionCookie) return null;

    try {
        // Handle old format (just 'authenticated')
        if (sessionCookie === 'authenticated' || sessionCookie === 'true') {
            return {};
        }

        // New format: base64 encoded JSON
        const decoded = Buffer.from(sessionCookie, 'base64').toString('utf-8');
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

/**
 * Middleware for authentication and industry-based access control
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for public routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/webhooks') ||
        pathname === '/' ||
        pathname === '/demo' ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/signup') ||
        pathname.startsWith('/public') ||
        pathname === '/unauthorized'
    ) {
        return NextResponse.next();
    }

    // Get session cookie
    const sessionCookie = request.cookies.get('session')?.value;
    const session = parseSession(sessionCookie);

    // Dashboard routes - check authentication
    if ((pathname.startsWith('/portals') || pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) && pathname !== '/admin/login') {
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Admin routes - check role
        if (pathname.startsWith('/admin')) {
            // Check if user has platform_admin role
            // Note: We need to ensure the session cookie includes the role
            // For now, we'll assume the session object has a 'role' property if it's an admin
            if (session.role !== 'platform_admin') {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }
        }

        // Extract industry from URL: /portals/{industry}/...
        if (pathname.startsWith('/portals')) {
            const pathParts = pathname.split('/');
            const urlIndustry = pathParts[2]; // e.g., 'mobile', 'banking', etc.

            // If session has industry info, validate it matches the URL
            if (session.industry && urlIndustry && session.industry !== urlIndustry) {
                // User is trying to access a different industry portal
                const redirectUrl = new URL('/unauthorized', request.url);
                redirectUrl.searchParams.set('attempted', urlIndustry);
                redirectUrl.searchParams.set('allowed', session.industry);
                return NextResponse.redirect(redirectUrl);
            }
        }
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
