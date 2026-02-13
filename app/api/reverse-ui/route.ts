import { NextResponse } from 'next/server';
import { analyzeScreenshot } from '@/lib/ai-service';

export async function POST(request: Request) {
    try {
        const { image } = await request.json();

        if (!image) {
            return NextResponse.json(
                { error: 'Image data is required' },
                { status: 400 }
            );
        }

        const elements = await analyzeScreenshot(image);

        return NextResponse.json({ elements });
    } catch (error) {
        console.error('Error processing screenshot:', error);
        return NextResponse.json(
            { error: 'Failed to process screenshot' },
            { status: 500 }
        );
    }
}
