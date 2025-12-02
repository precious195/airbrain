// src/app/api/webhooks/whatsapp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '@/lib/whatsapp/whatsapp-service';
import { processIndustryMessage, getCompanyByPhone, getCompanyWhatsAppConfig } from '@/lib/whatsapp/industry-processor';

/**
 * POST /api/webhooks/whatsapp - Handle incoming WhatsApp messages from Meta Business API
 * Supports multiple industries with their own WhatsApp Business accounts
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate webhook payload
        if (!body.entry || !body.entry[0]?.changes) {
            return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
        }

        const change = body.entry[0].changes[0];
        const value = change.value;

        // Skip if not a message event
        if (!value.messages || value.messages.length === 0) {
            return new NextResponse('OK', { status: 200 });
        }

        // Extract message details
        const message = value.messages[0];
        const businessPhoneId = value.metadata.phone_number_id;
        const customerPhone = message.from;
        const messageId = message.id;
        const messageType = message.type;

        // Only handle text messages for now
        if (messageType !== 'text') {
            return new NextResponse('OK', { status: 200 });
        }

        const messageText = message.text.body;

        // Get customer name if available
        const customerName = value.contacts?.[0]?.profile?.name;

        // 1. Identify Company and Industry from phone number
        const companyInfo = await getCompanyByPhone(businessPhoneId);

        if (!companyInfo) {
            console.error('Company not found for phone:', businessPhoneId);
            return NextResponse.json({ error: 'Company not configured' }, { status: 404 });
        }

        const { companyId, industry } = companyInfo;

        // 2. Get company WhatsApp configuration
        const config = await getCompanyWhatsAppConfig(companyId);

        if (!config || !config.enabled) {
            console.error('WhatsApp not enabled for company:', companyId);
            return new NextResponse('OK', { status: 200 });
        }

        // 3. Mark message as read
        await whatsappService.markAsRead(
            {
                phoneNumberId: businessPhoneId,
                accessToken: config.accessToken,
                businessAccountId: config.businessAccountId
            },
            messageId
        );

        // 4. Process message through industry-specific AI
        const response = await processIndustryMessage({
            industry,
            companyId,
            customerPhone,
            customerName,
            messageText,
            messageId,
            config
        });

        // 5. Send AI response back via WhatsApp
        if (response.shouldRespond) {
            await whatsappService.sendMessage(
                {
                    phoneNumberId: businessPhoneId,
                    accessToken: config.accessToken,
                    businessAccountId: config.businessAccountId
                },
                customerPhone,
                response.text
            );
        }

        return new NextResponse('OK', { status: 200 });
    } catch (error) {
        console.error('WhatsApp webhook error:', error);
        return NextResponse.json(
            { error: 'Failed to process message' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/webhooks/whatsapp - Webhook verification for Meta
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    // Verify the webhook
    if (mode === 'subscribe' && token) {
        // TODO: Verify token against configured verify tokens
        // For now, accept all subscription requests
        console.log('WhatsApp webhook verified');
        return new NextResponse(challenge, { status: 200 });
    }

    return new NextResponse('Forbidden', { status: 403 });
}
