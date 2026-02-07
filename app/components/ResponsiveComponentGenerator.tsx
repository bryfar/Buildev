/**
 * Example Component - Mobile-First Responsive Design
 * 
 * This example shows how to use the mobile-first responsive system
 * to generate components with automatic tablet and desktop variants
 */

'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import {
  generateComponentWithResponsiveVariants,
  generateComponentWithAI,
  generateResponsiveDesigns,
} from '@/lib/aiService';
import {
  createSiteElementFromComponent,
  isValidResponsiveDesign,
} from '@/lib/responsiveUtils';

export function ResponsiveComponentGenerator() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const { addElement, setActiveBreakpoint, initializeMobileFirstBreakpoints } = useAppStore();

  const handleGenerateWithResponsive = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      // Initialize mobile-first breakpoints
      initializeMobileFirstBreakpoints();
      
      // Generate component with automatic responsive variants
      const result = await generateComponentWithResponsiveVariants(prompt);
      
      // Validate and store result
      if (result.responsive && isValidResponsiveDesign(result.responsive)) {
        // Create SiteElement with responsive variants
        const element = createSiteElementFromComponent(
          result.mobile,
          result.responsive
        );
        
        // Add to canvas
        addElement(element);
        
        // Store for UI display
        setGeneratedData({
          mobile: result.mobile,
          responsive: result.responsive,
          success: true,
        });
        
        // Switch to mobile view
        setActiveBreakpoint('mobile');
      } else {
        // Fallback: create element with just mobile design
        const element = createSiteElementFromComponent(result.mobile);
        addElement(element);
        setGeneratedData({
          mobile: result.mobile,
          warning: 'Responsive variants not available',
        });
      }
    } catch (error) {
      console.error('Generation error:', error);
      setGeneratedData({ error: 'Failed to generate component' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      // Quick generate - just mobile
      const component = await generateComponentWithAI(prompt);
      const element = createSiteElementFromComponent(component);
      addElement(element);
      setGeneratedData({ mobile: component });
      setActiveBreakpoint('mobile');
    } catch (error) {
      console.error('Generation error:', error);
      setGeneratedData({ error: 'Failed to generate component' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-slate-700">
      <h2 className="text-2xl font-bold text-white mb-4">
        Mobile-First Component Generator
      </h2>
      
      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the component you want to create (e.g., 'A hero section with title, subtitle, and two buttons')..."
          className="w-full h-24 p-3 bg-slate-700 text-white placeholder-slate-400 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
        />
        
        <div className="flex gap-3">
          <button
            onClick={handleGenerateWithResponsive}
            disabled={loading || !prompt.trim()}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded transition-colors"
          >
            {loading ? 'Generating...' : 'Generate with Responsive (AI)'}
          </button>
          
          <button
            onClick={handleQuickGenerate}
            disabled={loading || !prompt.trim()}
            className="flex-1 px-4 py-3 bg-slate-600 hover:bg-slate-700 disabled:bg-gray-600 text-white font-semibold rounded transition-colors"
          >
            {loading ? 'Generating...' : 'Generate Mobile Only'}
          </button>
        </div>

        {generatedData && (
          <div className="mt-6 p-4 bg-slate-700 rounded border border-slate-600">
            {generatedData.success ? (
              <div>
                <h3 className="text-lg font-semibold text-green-400 mb-2">
                  ✓ Component Generated Successfully
                </h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <p><strong>Mobile:</strong> {generatedData.mobile.width}x{generatedData.mobile.height}px</p>
                  {generatedData.responsive && (
                    <>
                      <p>
                        <strong>Tablet:</strong> {generatedData.responsive.tablet.width}x{generatedData.responsive.tablet.height}px
                      </p>
                      <p>
                        <strong>Desktop:</strong> {generatedData.responsive.desktop.width}x{generatedData.responsive.desktop.height}px
                      </p>
                    </>
                  )}
                </div>
              </div>
            ) : generatedData.error ? (
              <p className="text-red-400">Error: {generatedData.error}</p>
            ) : (
              <p className="text-yellow-400">{generatedData.warning || 'Component created'}</p>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-slate-700/50 rounded border border-slate-600 text-sm text-slate-300">
        <p className="font-semibold text-slate-200 mb-2">📱 Mobile-First Approach:</p>
        <ul className="space-y-1 text-xs">
          <li>• <strong>Mobile (375px)</strong> is the primary design</li>
          <li>• <strong>Tablet (768px)</strong> and <strong>Desktop (1024px)</strong> are auto-generated</li>
          <li>• Use "Generate with Responsive (AI)" for automatic variants</li>
          <li>• Gemini API adapts typography, spacing, and layout</li>
        </ul>
      </div>
    </div>
  );
}
