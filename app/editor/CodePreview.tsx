'use client';

import { useAppStore } from '@/lib/store';
import { generateCode } from '@/lib/codeGenerator';
import { Copy, Download } from 'lucide-react';
import { useState } from 'react';

export default function CodePreview() {
  const { currentProject, currentPage } = useAppStore();
  const [copied, setCopied] = useState(false);

  if (!currentProject || !currentPage) return null;

  const { code } = generateCode(
    currentPage,
    currentProject.name,
    currentProject.techStack
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${currentProject.name.replace(/\s+/g, '-')}.${
      currentProject.techStack === 'html' ? 'html' : 'jsx'
    }`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="w-full h-full bg-[#0f0f0f] flex flex-col">
      {/* Header */}
      <div className="h-12 border-b border-[#2a2a2a] bg-[#1e1e1e] flex items-center justify-between px-4">
        <h3 className="text-sm font-semibold text-white">Generated Code</h3>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#2a2a2a] hover:bg-[#333] text-white rounded transition-colors"
          >
            <Copy size={14} />
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#0D99FF] hover:bg-[#0a7acc] text-white rounded transition-colors"
          >
            <Download size={14} />
            Download
          </button>
        </div>
      </div>

      {/* Code */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm text-[#ddd]">
        <pre className="whitespace-pre-wrap break-words">{code}</pre>
      </div>
    </div>
  );
}
