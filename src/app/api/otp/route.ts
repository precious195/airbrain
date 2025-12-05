/**
 * OTP API Endpoints
 * 
 * Handles OTP submission and status checking from the admin UI.
 */

import { NextRequest } from 'next/server';
import { otpHandler } from '@/lib/agents/otp-handler';

/**
 * GET: Get pending OTP requests for a company
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const companyId = searchParams.get('companyId');
        const requestId = searchParams.get('requestId');

        if (requestId) {
            // Get specific request
            const otpRequest = otpHandler.getRequest(requestId);
            if (!otpRequest) {
                return Response.json({ error: 'OTP request not found' }, { status: 404 });
            }
            return Response.json({ request: otpRequest });
        }

        if (!companyId) {
            return Response.json({ error: 'companyId is required' }, { status: 400 });
        }

        const pendingRequests = otpHandler.getPendingRequests(companyId);
        return Response.json({ requests: pendingRequests });

    } catch (error: any) {
        console.error('OTP GET error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST: Submit OTP value or cancel request
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { requestId, otpValue, action } = body;

        if (!requestId) {
            return Response.json({ error: 'requestId is required' }, { status: 400 });
        }

        if (action === 'cancel') {
            const cancelled = otpHandler.cancelOTP(requestId);
            if (!cancelled) {
                return Response.json({ error: 'Failed to cancel OTP request' }, { status: 400 });
            }
            return Response.json({ success: true, message: 'OTP request cancelled' });
        }

        if (!otpValue) {
            return Response.json({ error: 'otpValue is required' }, { status: 400 });
        }

        const submitted = otpHandler.submitOTP(requestId, otpValue);
        if (!submitted) {
            return Response.json({ error: 'Failed to submit OTP' }, { status: 400 });
        }

        return Response.json({
            success: true,
            message: 'OTP submitted successfully'
        });

    } catch (error: any) {
        console.error('OTP POST error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
