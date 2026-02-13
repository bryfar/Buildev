'use server';

import { refineElement } from '@/lib/ai-service';
import { SiteElement } from '@/lib/types';

export async function refineElementAction(element: SiteElement, prompt: string) {
    try {
        const result = await refineElement(element, prompt);
        return { success: true, element: result };
    } catch (error) {
        console.error("Refine Action Error:", error);
        return { success: false, error: 'Failed to refine element' };
    }
}
