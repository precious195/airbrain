import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { idToken } = await request.json();

        // For development/prototype, we'll trust the client-side auth
        // and just set a session cookie. The AuthProvider in the client
        // handles the actual Firebase auth verification.

        // In production, you would verify the token with Firebase Admin SDK
        // const decodedToken = await adminAuth.verifyIdToken(idToken);

        if (!idToken) {
            return NextResponse.json({ error: 'No token provided' }, { status: 400 });
        }

        const expiresIn = 60 * 60 * 24 * 5; // 5 days in seconds

        // Set the session cookie (Next.js 16: cookies() is now async)
        const cookieStore = await cookies();
        cookieStore.set('session', 'authenticated', {
            maxAge: expiresIn,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'lax',
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Login API error:', error);
        return NextResponse.json({ error: 'Failed to set session' }, { status: 500 });
    }
}
