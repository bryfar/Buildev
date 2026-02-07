'use client';

import { useAppStore } from '@/lib/store';
import { generateCode, generateReactComponent, generateElementHTML } from '@/lib/codeGenerator';
import { Copy, Download } from 'lucide-react';
import { useState } from 'react';
import FileTree from './FileTree';
import { SiteElement } from '@/lib/types';

function findElementById(elements: SiteElement[], id: string): SiteElement | null {
  for (const element of elements) {
    if (element.id === id) return element;
    if (element.children) {
      const found = findElementById(element.children, id);
      if (found) return found;
    }
  }
  return null;
}

function generateComponentCode(
  element: SiteElement,
  projectName: string,
  techStack: string
): string {
  if (techStack === 'react' || techStack === 'nextjs') {
    // Generate React component
    const componentName = element.name.replace(/\s+/g, '');
    return `'use client';

import React from 'react';

export default function ${componentName}() {
  return (
    <div>
      {/* Component: ${element.name} */}
      ${generateReactComponentCode(element)}
    </div>
  );
}
`;
  } else {
    // Generate HTML
    return generateElementHTML(element);
  }
}

function generateReactComponentCode(element: SiteElement): string {
  const style = {
    position: element.type === 'frame' ? 'relative' : 'absolute',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    backgroundColor: element.backgroundColor,
    opacity: element.opacity,
  };

  const styleStr = Object.entries(style)
    .filter(([, v]) => v !== undefined && v !== 'transparent')
    .map(([k, v]) => `${k}: ${typeof v === 'string' ? `'${v}'` : v}`)
    .join(', ');

  const hasChildren = element.children && element.children.length > 0;

  switch (element.type) {
    case 'text':
      return `<div style={{${styleStr}}}>${element.textContent || element.name}</div>`;
    case 'image':
      return `<img style={{${styleStr}}} src="placeholder.jpg" alt="${element.name}" />`;
    default:
      if (hasChildren) {
        const childrenCode = element.children!
          .map((child) => generateReactComponentCode(child))
          .join('\n      ');
        return `<div style={{${styleStr}}}>\n      ${childrenCode}\n    </div>`;
      }
      return `<div style={{${styleStr}}} />`;
  }
}

export default function CodePreview() {
  const { currentProject, currentPage, selectElement, selectedElementId } = useAppStore();
  const [copied, setCopied] = useState(false);

  if (!currentProject || !currentPage) return null;

  // Get the full code and component-specific code
  const { code: fullCode } = generateCode(
    currentPage,
    currentProject.name,
    currentProject.techStack
  );

  // Get component-specific code if an element is selected
  const selectedElement = selectedElementId
    ? findElementById(currentPage.elements, selectedElementId)
    : null;

  const displayCode = selectedElement
    ? generateComponentCode(selectedElement, currentProject.name, currentProject.techStack)
    : fullCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const fileName = selectedElement
      ? selectedElement.name.replace(/\s+/g, '-')
      : currentProject.name.replace(/\s+/g, '-');
    const file = new Blob([displayCode], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${fileName}.${
      currentProject.techStack === 'html' ? 'html' : 'jsx'
    }`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSelectComponent = (elementId: string, componentName: string) => {
    selectElement(elementId);
  };

  return (
    <div className="w-full h-full bg-[#0f0f0f] flex flex-col overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Component Tree */}
        <div className="w-64 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col overflow-hidden">
          <FileTree onSelectComponent={handleSelectComponent} />
        </div>

        {/* Right Panel - Code Preview */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="h-12 border-b border-[#2a2a2a] bg-[#1e1e1e] flex items-center justify-between px-4">
            <h3 className="text-sm font-semibold text-white">
              {selectedElement ? `${selectedElement.name} - Code` : 'Generated Code'}
            </h3>
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
            <pre className="whitespace-pre-wrap break-words">{displayCode}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
