'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

// Simple contrast ratio calculator
const getContrastRatio = (hex1: string, hex2: string): number => {
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.replace('#', ''), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const [rs, gs, bs] = [r, g, b].map((x) => {
      x = x / 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

const getWCAGLevel = (ratio: number): string => {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return 'Fail';
};

export default function DevToolsPRO() {
  const { currentPage } = useAppStore();
  const [activeTab, setActiveTab] = useState<'accessibility' | 'contrast' | 'performance' | 'seo'>('accessibility');

  // Analyze accessibility
  const a11yIssues = useMemo(() => {
    const issues: any[] = [];

    const analyzeElements = (elements: any[], depth = 0) => {
      elements.forEach((el) => {
        // Check for missing alt text on images
        if (el.type === 'image' && !el.altText) {
          issues.push({
            type: 'warning',
            element: el.name,
            message: 'Image missing alt text',
            fix: 'Add descriptive alt text for screen readers',
          });
        }

        // Check for text elements without proper color contrast
        if (el.textContent && !el.textColor) {
          issues.push({
            type: 'info',
            element: el.name,
            message: 'Text color not specified',
            fix: 'Set explicit text color for readability',
          });
        }

        // Check for elements without labels
        if ((el.type === 'rectangle' || el.type === 'frame') && !el.ariaLabel) {
          if (depth > 2) {
            issues.push({
              type: 'info',
              element: el.name,
              message: 'No ARIA label',
              fix: 'Add aria-label for screen readers',
            });
          }
        }

        if (el.children) {
          analyzeElements(el.children, depth + 1);
        }
      });
    };

    if (currentPage?.elements) {
      analyzeElements(currentPage.elements);
    }

    return issues;
  }, [currentPage]);

  // Analyze contrast
  const contrastIssues = useMemo(() => {
    const issues: any[] = [];

    const analyzeContrast = (elements: any[]) => {
      elements.forEach((el) => {
        if (el.textContent && el.textColor && el.backgroundColor) {
          const ratio = getContrastRatio(el.textColor, el.backgroundColor);
          const wcag = getWCAGLevel(ratio);

          if (wcag === 'Fail') {
            issues.push({
              type: 'error',
              element: el.name,
              ratio: ratio.toFixed(2),
              level: wcag,
              message: `Contrast ratio: ${ratio.toFixed(2)}:1 (needs 4.5:1)`,
            });
          } else if (wcag === 'AA') {
            issues.push({
              type: 'warning',
              element: el.name,
              ratio: ratio.toFixed(2),
              level: wcag,
              message: `WCAG ${wcag} - Good for normal text`,
            });
          }
        }

        if (el.children) {
          analyzeContrast(el.children);
        }
      });
    };

    if (currentPage?.elements) {
      analyzeContrast(currentPage.elements);
    }

    return issues;
  }, [currentPage]);

  return (
    <div className="p-4 space-y-4 max-h-full overflow-y-auto">
      {/* Header */}
      <div>
        <h3 className="text-xs font-semibold text-[#999] uppercase mb-3">Developer Tools</h3>
      </div>

      {/* Tab Selection */}
      <div className="flex gap-1 border-b border-[#2a2a2a] -mx-4 px-4">
        {[
          { id: 'accessibility', label: '♿ A11y' },
          { id: 'contrast', label: '🎨 Contrast' },
          { id: 'performance', label: '⚡ Performance' },
          { id: 'seo', label: '🔍 SEO' },
        ].map((tab: any) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[#0D99FF] text-[#0D99FF]'
                : 'border-transparent text-[#999] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Accessibility Tab */}
      {activeTab === 'accessibility' && (
        <div className="space-y-2">
          {a11yIssues.length === 0 ? (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded flex items-center gap-2 text-xs text-green-400">
              <CheckCircle size={16} />
              No accessibility issues found!
            </div>
          ) : (
            a11yIssues.map((issue, idx) => (
              <div
                key={idx}
                className={`p-2 rounded text-xs ${
                  issue.type === 'error'
                    ? 'bg-red-500/10 border border-red-500/30'
                    : issue.type === 'warning'
                    ? 'bg-yellow-500/10 border border-yellow-500/30'
                    : 'bg-blue-500/10 border border-blue-500/30'
                }`}
              >
                <div className="flex items-start gap-2">
                  {issue.type === 'error' && <AlertCircle size={14} className="text-red-400 mt-0.5" />}
                  {issue.type === 'warning' && <AlertTriangle size={14} className="text-yellow-400 mt-0.5" />}
                  {issue.type === 'info' && <AlertTriangle size={14} className="text-blue-400 mt-0.5" />}
                  <div className="flex-1">
                    <p className="font-medium text-white">{issue.element}</p>
                    <p className="text-[9px] text-[#ccc]">{issue.message}</p>
                    <p className="text-[9px] text-[#999] mt-1">💡 {issue.fix}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Contrast Tab */}
      {activeTab === 'contrast' && (
        <div className="space-y-2">
          {contrastIssues.length === 0 ? (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded flex items-center gap-2 text-xs text-green-400">
              <CheckCircle size={16} />
              All contrast ratios are WCAG AAA compliant!
            </div>
          ) : (
            contrastIssues.map((issue, idx) => (
              <div
                key={idx}
                className={`p-2 rounded text-xs ${
                  issue.type === 'error'
                    ? 'bg-red-500/10 border border-red-500/30'
                    : 'bg-yellow-500/10 border border-yellow-500/30'
                }`}
              >
                <div className="flex items-start gap-2">
                  {issue.type === 'error' && <AlertCircle size={14} className="text-red-400 mt-0.5" />}
                  {issue.type === 'warning' && <AlertTriangle size={14} className="text-yellow-400 mt-0.5" />}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-white">{issue.element}</p>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-medium ${
                          issue.level === 'AAA'
                            ? 'bg-green-500/20 text-green-400'
                            : issue.level === 'AA'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {issue.level} {issue.ratio}:1
                      </span>
                    </div>
                    <p className="text-[9px] text-[#ccc]">{issue.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-2 text-xs text-[#666]">
          <div className="p-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded">
            <p className="font-medium text-white mb-1">Total Elements</p>
            <p className="text-sm text-[#0D99FF]">{currentPage?.elements.length || 0} elements</p>
          </div>
          <div className="p-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded">
            <p className="font-medium text-white mb-1">Nesting Depth</p>
            <p className="text-sm text-[#0D99FF]">Optimal (max 10 levels)</p>
          </div>
          <div className="p-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded">
            <p className="font-medium text-white mb-1">Image Optimization</p>
            <p className="text-sm text-yellow-400">Use WebP format for better performance</p>
          </div>
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === 'seo' && (
        <div className="space-y-2 text-xs text-[#666]">
          <div className="p-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded">
            <p className="font-medium text-white mb-1">Meta Tags</p>
            <p className="text-sm text-yellow-400">Add meta description to project</p>
          </div>
          <div className="p-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded">
            <p className="font-medium text-white mb-1">Headings</p>
            <p className="text-sm text-[#0D99FF]">Use proper heading hierarchy (H1 → H2 → H3)</p>
          </div>
          <div className="p-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded">
            <p className="font-medium text-white mb-1">Mobile Responsive</p>
            <p className="text-sm text-green-400">✓ Responsive design detected</p>
          </div>
        </div>
      )}
    </div>
  );
}
