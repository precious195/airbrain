import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { userId, companyId, selectedIndustry, idToken } = await request.json();

        if (!userId || !companyId || !selectedIndustry) {
            return NextResponse.json({
                valid: false,
                error: 'Missing required fields'
            }, { status: 400 });
        }

        // Fetch company data from Firebase to verify industry
        const firebaseUrl = `https://airbrain-d787e-default-rtdb.firebaseio.com/companies/${companyId}.json`;
        const response = await fetch(firebaseUrl);

        if (!response.ok) {
            return NextResponse.json({
                valid: false,
                error: 'Failed to fetch company data'
            }, { status: 500 });
        }

        const company = await response.json();

        if (!company) {
            return NextResponse.json({
                valid: false,
                error: 'Company not found'
            }, { status: 404 });
        }

        const companyIndustry = company.industry;
        const isValid = companyIndustry === selectedIndustry;

        if (isValid) {
            // Set session cookie with industry information
            const expiresIn = 60 * 60 * 24 * 5; // 5 days in seconds

            // Create a session value that includes user info
            const sessionData = JSON.stringify({
                userId,
                companyId,
                industry: selectedIndustry,
                timestamp: Date.now()
            });

            // Encode the session data
            const encodedSession = Buffer.from(sessionData).toString('base64');

            // Next.js 16: cookies() is now async
            const cookieStore = await cookies();
            cookieStore.set('session', encodedSession, {
                maxAge: expiresIn,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/',
                sameSite: 'lax',
            });

            return NextResponse.json({
                valid: true,
                industry: selectedIndustry,
                companyName: company.name
            });
        } else {
            return NextResponse.json({
                valid: false,
                error: `Your company is registered for ${companyIndustry} portal`,
                correctIndustry: companyIndustry,
                companyName: company.name
            });
        }
    } catch (error) {
        console.error('Industry validation error:', error);
        return NextResponse.json({
            valid: false,
            error: 'Validation failed'
        }, { status: 500 });
    }
}
