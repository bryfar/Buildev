'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Download } from 'lucide-react';

function serializeElement(el: any): string {
  if (!el) return '';
  if (el.type === 'text') {
    return `<div style="position:absolute;left:${el.x}px;top:${el.y}px;width:${el.width}px;height:${el.height}px;color:${el.textColor || '#000'};font-size:${el.fontSize || 16}px;">${el.textContent || ''}</div>`;
  }
  if (el.type === 'image') {
    return `<img src="${el.src}" style="position:absolute;left:${el.x}px;top:${el.y}px;width:${el.width}px;height:${el.height}px;object-fit:cover;" alt="${el.name || ''}"/>`;
  }
  // frame/rectangle
  return `<div style="position:absolute;left:${el.x}px;top:${el.y}px;width:${el.width}px;height:${el.height}px;background:${el.backgroundColor || 'transparent'};">${(el.children || []).map((c: any) => serializeElement(c)).join('')}</div>`;
}

export default function ExportPanelPRO() {
  const { currentPage } = useAppStore();

  const generateHTML = () => {
    const page = currentPage;
    if (!page) return '';
    const body = (page.elements || []).map((el: any) => serializeElement(el)).join('\n');
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${page.name}</title><style>body{margin:0;font-family:Outfit, sans-serif;position:relative;} </style></head><body>${body}</body></html>`;
  };

  const download = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportHTML = () => {
    const html = generateHTML();
    download(`${currentPage?.name || 'page'}.html`, html);
  };

  const handleExportReact = () => {
    const html = generateHTML();
    // Lightweight: wrap HTML in React component string
    const reactCode = `import React from 'react';\nexport default function ExportedPage(){return (<div dangerouslySetInnerHTML={{__html: ${JSON.stringify(html)} }} />)}`;
    download(`${currentPage?.name || 'page'}.jsx`, reactCode);
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <h3 className="text-xs font-semibold text-[#999] uppercase mb-3">Advanced Export</h3>
      <p className="text-[10px] text-[#666] mb-3">Export the current page as static HTML or a simple React component.</p>
      <div className="flex flex-col gap-2">
        <button onClick={handleExportHTML} className="flex items-center gap-2 px-3 py-2 bg-[#0D99FF] text-white rounded text-sm"><Download size={14} /> Export HTML</button>
        <button onClick={handleExportReact} className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] text-white rounded text-sm">Export React (JSX)</button>
      </div>
    </div>
  );
}
