import { NextRequest, NextResponse } from 'next/server';
import { SystemScanner } from '@/lib/scanner/system-scanner';

export async function POST(request: NextRequest) {
    try {
        const config = await request.json();

        const scanner = new SystemScanner();
        const result = await scanner.scan(config);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Scanner API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Scan failed' },
            { status: 500 }
        );
    }
}
