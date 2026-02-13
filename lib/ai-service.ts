import { SiteElement } from './types';
import { getAIProvider } from './ai/factory';

export async function refineElement(element: SiteElement, prompt: string): Promise<SiteElement> {
    try {
        const provider = getAIProvider('code');
        console.log(`🚀 Sending refinement request to provider: ${provider.id}`);

        if (provider.id === 'mock') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Mock: return element with modified background color to show it worked
            return { ...element, backgroundColor: '#3b82f6' };
        }

        const context = JSON.stringify(element, null, 2);
        const newCode = await provider.generateCode(prompt, context);

        // Clean JSON
        const cleanJson = newCode.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);

    } catch (error) {
        console.error('❌ AI Refinement Failed:', error);
        throw error;
    }
}


// Mock response simulating a "Music Player Card" UI
const MOCK_AI_RESPONSE: SiteElement[] = [
    {
        id: 'imported-card',
        name: 'Music Card',
        type: 'frame',
        x: 0,
        y: 0,
        width: 320,
        height: 400,
        backgroundColor: '#18181b', // zinc-900
        opacity: 1,
        responsive: {},
        children: [
            {
                id: 'album-art',
                name: 'Album Art',
                type: 'rectangle', // Placeholder for image
                x: 20,
                y: 20,
                width: 280,
                height: 280,
                backgroundColor: '#27272a', // zinc-800
                opacity: 1,
                responsive: {},
            },
            {
                id: 'song-title',
                name: 'Song Title',
                type: 'text',
                x: 20,
                y: 310,
                width: 280,
                height: 30,
                backgroundColor: 'transparent',
                opacity: 1,
                fontSize: 18,
                fontWeight: 700,
                textColor: '#ffffff',
                textContent: 'Midnight City',
                responsive: {},
            },
            {
                id: 'artist-name',
                name: 'Artist Display',
                type: 'text',
                x: 20,
                y: 340,
                width: 280,
                height: 24,
                backgroundColor: 'transparent',
                opacity: 1,
                fontSize: 14,
                textColor: '#a1a1aa', // zinc-400
                textContent: 'M83',
                responsive: {},
            },
            {
                id: 'play-btn',
                name: 'Play Button',
                type: 'circle',
                x: 260,
                y: 320,
                width: 48,
                height: 48,
                backgroundColor: '#22c55e', // green-500
                opacity: 1,
                responsive: {},
            }
        ]
    }
];

export async function analyzeScreenshot(imageBase64: string): Promise<SiteElement[]> {
    try {
        const provider = getAIProvider('vision');
        console.log(`🚀 Sending analysis request to provider: ${provider.id}`);

        if (provider.id === 'mock') {
            console.warn('⚠️ No API Key found (Google/Groq). Using MOCK response.');
            await new Promise(resolve => setTimeout(resolve, 1500));
            return MOCK_AI_RESPONSE;
        }

        return await provider.analyzeImage(imageBase64);

    } catch (error) {
        console.error('❌ AI Analysis Failed:', error);
        console.warn('⚠️ Falling back to MOCK response due to error.');
        return MOCK_AI_RESPONSE;
    }
}

