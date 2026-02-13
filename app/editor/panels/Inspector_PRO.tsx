'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Copy, Download } from 'lucide-react';
import { generateCode, generateReactComponent, generateElementCSS } from '@/lib/codeGenerator';

export default function InspectorPanelPRO() {
  const { currentProject, currentPage, selectedElementId, activeBreakpoint } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [codeType, setCodeType] = useState<'jsx' | 'html' | 'tailwind' | 'css'>('jsx');

  if (!currentProject || !currentPage || !selectedElementId) {
    return (
      <div className="p-4 text-xs text-[#666]">
        Select an element to inspect
      </div>
    );
  }

  const element = currentPage.elements.find((el) => el.id === selectedElementId);
  if (!element) return null;

  // Generate code based on type
  let code = '';
  let language = 'javascript';

  switch (codeType) {
    case 'jsx':
      code = generateReactComponent(element);
      language = 'jsx';
      break;
    case 'html':
      code = `<div id="${element.id}" style="${generateElementCSS(element, activeBreakpoint)}">\n  ${element.textContent || 'Content'}\n</div>`;
      language = 'html';
      break;
    case 'tailwind':
      // Extract Tailwind classes from React component
      const tailwindMatch = generateReactComponent(element).match(/className="([^\"]+)"/);
      code = `className="${tailwindMatch ? tailwindMatch[1] : ''}"`;
      language = 'javascript';
      break;
    case 'css':
      code = `#${element.id} {\n  ${generateElementCSS(element, activeBreakpoint).split(';').join(';\n  ')}\n}`;
      language = 'css';
      break;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    a.href = URL.createObjectURL(file);
    a.download = `component.${codeType === 'jsx' ? 'jsx' : codeType === 'html' ? 'html' : 'css'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-[#2a2a2a]">
        <h3 className="text-xs font-semibold text-[#999] uppercase mb-3">Inspector</h3>
        
        {/* Code Type Tabs */}
        <div className="flex gap-1 flex-wrap">
          {(['jsx', 'html', 'tailwind', 'css'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setCodeType(type)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                codeType === type
                  ? 'bg-[#0D99FF] text-white'
                  : 'bg-[#2a2a2a] text-[#999] hover:bg-[#333]'
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Code Display */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs text-[#ddd]">
        <pre className="bg-[#1e1e1e] p-3 rounded border border-[#2a2a2a] whitespace-pre-wrap break-words">
          {code}
        </pre>
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-[#2a2a2a] flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#0D99FF] hover:bg-[#0a7acc] text-white text-xs rounded transition-colors"
        >
          <Copy size={14} />
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#2a2a2a] hover:bg-[#333] text-[#ddd] text-xs rounded transition-colors"
        >
          <Download size={14} />
          Download
        </button>
      </div>

      {/* Element Info */}
      <div className="p-3 border-t border-[#2a2a2a] text-xs text-[#666] max-h-48 overflow-y-auto">
        <p className="font-semibold mb-2">Element Info</p>
        <code className="bg-[#1e1e1e] p-2 rounded block text-[9px] overflow-x-auto">
          {JSON.stringify(
            {
              id: element.id,
              type: element.type,
              name: element.name,
              breakpoint: activeBreakpoint,
              properties: {
                x: element.x,
                y: element.y,
                width: element.width,
                height: element.height,
                backgroundColor: element.backgroundColor,
              },
            },
            null,
            2
          )}
        </code>
      </div>
    </div>
  );
}
