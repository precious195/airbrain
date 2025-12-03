import { NextRequest, NextResponse } from 'next/server';
import { ActionGenerator } from '@/lib/scanner/action-generator';

export async function POST(request: NextRequest) {
    try {
        const { features } = await request.json();

        const generator = new ActionGenerator();
        const actions = generator.generateActions(features);

        // In production, save actions to Firebase

        return NextResponse.json({ actions, count: actions.length });
    } catch (error) {
        console.error('Action generator API error:', error);
        return NextResponse.json(
            { error: 'Failed to generate actions' },
            { status: 500 }
        );
    }
}
