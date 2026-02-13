'use client';

import { useAppStore } from '@/lib/store';
import { generateCode, generateElementHTML } from '@/lib/codeGenerator';
import {
  Copy, Download, Files, Search, GitBranch, Settings,
  X, ChevronRight, Terminal, Zap, MoreHorizontal,
  Play, Command, Maximize2, SplitSquareHorizontal,
  MessageSquare, Sparkles
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import FileTree from './FileTree';
import { SiteElement } from '@/lib/types';

// Utility to find element
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

// Code Generation Helpers (Keep existing logic)
function generateComponentCode(element: SiteElement, projectName: string, techStack: string): string {
  if (techStack === 'react' || techStack === 'nextjs') {
    const componentName = element.name.replace(/\s+/g, '');
    return `'use client';

import React from 'react';

export default function ${componentName}() {
  return (
    <div className="relative">
      {/* Component: ${element.name} */}
      ${generateReactComponentCode(element)}
    </div>
  );
}
`;
  } else {
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
      return `<div style={{${styleStr}}} className="text-white">${element.textContent || element.name}</div>`;
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
  const [activeSidebar, setActiveSidebar] = useState<'explorer' | 'search' | 'git' | 'ai'>('explorer');
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [terminalTabs, setTerminalTabs] = useState(['Terminal', 'Output', 'Problems', 'Debug Console']);
  const [activeTerminalTab, setActiveTerminalTab] = useState('Terminal');

  if (!currentProject || !currentPage) return null;

  // Code Generation
  const { code: fullCode } = generateCode(currentPage, currentProject.name, currentProject.techStack);
  const selectedElement = selectedElementId ? findElementById(currentPage.elements, selectedElementId) : null;
  const displayCode = selectedElement
    ? generateComponentCode(selectedElement, currentProject.name, currentProject.techStack)
    : fullCode;

  // Formatting code lines for line numbers
  const codeLines = displayCode.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentFileName = selectedElement ? `${selectedElement.name.replace(/\s+/g, '')}.tsx` : `${currentPage.name}.tsx`;

  return (
    <div className="w-full h-full bg-[#1e1e1e] flex flex-col overflow-hidden text-[#cccccc] font-sans selection:bg-[#264f78]">

      {/* 1. Main Workspace Area */}
      <div className="flex flex-1 overflow-hidden">

        {/* Activity Bar */}
        <div className="w-12 bg-[#333333] flex flex-col items-center py-2 gap-4 border-r border-[#2a2a2a] z-20">
          <ActivityIcon icon={<Files />} active={activeSidebar === 'explorer'} onClick={() => setActiveSidebar('explorer')} />
          <ActivityIcon icon={<Search />} active={activeSidebar === 'search'} onClick={() => setActiveSidebar('search')} />
          <ActivityIcon icon={<GitBranch />} active={activeSidebar === 'git'} onClick={() => setActiveSidebar('git')} />
          <div className="flex-1" />
          <ActivityIcon icon={<Sparkles className="text-purple-400" />} active={activeSidebar === 'ai'} onClick={() => setActiveSidebar('ai')} />
          <ActivityIcon icon={<Settings />} onClick={() => { }} />
        </div>

        {/* Sidebar (Explorer/AI/etc) */}
        {activeSidebar === 'explorer' && (
          <div className="w-64 bg-[#252526] border-r border-[#2a2a2a] flex flex-col">
            <div className="h-9 px-4 flex items-center text-xs font-semibold tracking-wide uppercase text-[#bbbbbb]">Explorer</div>
            <div className="flex-1 overflow-y-auto">
              <div className="px-0">
                <FileTree onSelectComponent={(id) => selectElement(id)} />
              </div>
            </div>
          </div>
        )}

        {activeSidebar === 'ai' && (
          <div className="w-80 bg-[#252526] border-r border-[#2a2a2a] flex flex-col">
            <div className="h-9 px-4 flex items-center justify-between text-xs font-semibold tracking-wide uppercase text-purple-400 bg-[#2d2d2d]">
              <span>Buildev AI</span>
              <Sparkles size={14} />
            </div>
            <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
              <div className="bg-[#333] p-3 rounded text-sm text-gray-300">
                How can I help you optimize this component?
              </div>
              <div className="flex-1" />
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask AI..."
                  className="w-full bg-[#3c3c3c] border border-[#555] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
                <Zap className="absolute right-2 top-2 text-purple-400" size={16} />
              </div>
            </div>
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] relative min-w-0">

          {/* Tabs */}
          <div className="flex bg-[#252526] overflow-x-auto no-scrollbar">
            <TabItem name={currentFileName} active icon="react" />
            <TabItem name="globals.css" icon="css" />
            <TabItem name="tailwind.config.ts" icon="ts" />
          </div>

          {/* Breadcrumbs / Toolbar */}
          <div className="h-8 bg-[#1e1e1e] border-b border-[#2a2a2a] flex items-center px-4 justify-between">
            <div className="flex items-center gap-1 text-xs text-[#999]">
              <span>src</span>
              <ChevronRight size={12} />
              <span>components</span>
              <ChevronRight size={12} />
              <span className="text-white">{currentFileName}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleCopy} className="p-1 hover:bg-[#333] rounded text-gray-400 hover:text-white transition-colors" title="Copy Code">
                <Copy size={14} />
              </button>
              <button className="p-1 hover:bg-[#333] rounded text-gray-400 hover:text-white transition-colors" title="Generate Preview">
                <Play size={14} />
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 overflow-hidden relative flex">
            {/* Line Numbers */}
            <div className="w-12 bg-[#1e1e1e] border-r border-[#2a2a2a]/0 flex flex-col items-end pr-3 pt-4 text-[#858585] font-mono text-sm select-none">
              {codeLines.map((_, i) => (
                <div key={i} className="leading-6">{i + 1}</div>
              ))}
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto pt-4 pl-4 font-mono text-sm leading-6 custom-scrollbar">
              <pre className="whitespace-pre-wrap">{displayCode}</pre>
            </div>
          </div>

          {/* Terminal Panel */}
          {isTerminalOpen && (
            <div className="h-48 bg-[#1e1e1e] border-t border-[#2a2a2a] flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-[#2a2a2a]">
                <div className="flex gap-6">
                  {terminalTabs.map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTerminalTab(tab)}
                      className={`text-xs uppercase tracking-wide font-medium pb-1 border-b-2 ${activeTerminalTab === tab ? 'text-white border-white' : 'text-[#888] border-transparent hover:text-[#ccc]'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 text-[#ccc]">
                  <button onClick={() => setIsTerminalOpen(false)}><X size={14} /></button>
                </div>
              </div>
              <div className="flex-1 p-3 font-mono text-xs text-[#cccccc] overflow-y-auto">
                <div className="flex gap-2">
                  <span className="text-green-500">➜</span>
                  <span className="text-cyan-400">~/buildev-project</span>
                  <span className="text-yellow-400">git:(main)</span>
                  <span>npm run dev</span>
                </div>
                <div className="mt-1 text-[#aaaaaa]">
                  <p>ready - started server on 0.0.0.0:3001, url: http://localhost:3001</p>
                  <p>info  - Loaded env from .env.local</p>
                  <p className="text-green-400">event - compiled client and server successfully in 1241 ms (156 modules)</p>
                  <p>wait  - compiling...</p>
                  <p>event - compiled client and server successfully in 302 ms (156 modules)</p>
                </div>
                <div className="flex gap-2 mt-2">
                  <span className="text-green-500">➜</span>
                  <span className="text-cyan-400">~/buildev-project</span>
                  <span className="text-yellow-400">git:(main)</span>
                  <span className="animate-pulse">_</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-[#007acc] flex items-center justify-between px-3 text-xs text-white select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1"><GitBranch size={12} /> main*</div>
          <div className="flex items-center gap-1"><Terminal size={12} /> 0 errors, 0 warnings</div>
        </div>
        <div className="flex items-center gap-4">
          <div>Ln {codeLines.length}, Col 1</div>
          <div>UTF-8</div>
          <div>TypeScript React</div>
          <div className="flex items-center gap-1"><Zap size={10} /> Prettier</div>
        </div>
      </div>

    </div>
  );
}

// Subcomponents
function ActivityIcon({ icon, active, onClick }: { icon: React.ReactNode, active?: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`p-3 relative group ${active ? 'text-white' : 'text-[#858585] hover:text-white'}`}
    >
      {active && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white" />}
      {icon}
    </button>
  );
}

function TabItem({ name, active, icon }: { name: string, active?: boolean, icon: 'react' | 'ts' | 'css' }) {
  const getIconColor = () => {
    switch (icon) {
      case 'react': return 'text-cyan-400';
      case 'ts': return 'text-blue-400';
      case 'css': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={`
      flex items-center gap-2 px-3 py-2 min-w-[120px] max-w-[200px] border-r border-[#2a2a2a] cursor-pointer text-xs select-none
      ${active ? 'bg-[#1e1e1e] text-white border-t-2 border-t-[#0D99FF]' : 'bg-[#2d2d2d] text-[#969696] hover:bg-[#2a2a2a]'}
    `}>
      <span className={getIconColor()}>
        {icon === 'react' && <span className="font-bold">⚛</span>}
        {icon === 'ts' && <span className="font-bold">TS</span>}
        {icon === 'css' && <span className="font-bold">#</span>}
      </span>
      <span className="truncate flex-1">{name}</span>
      <button className={`hover:bg-[#444] rounded p-0.5 ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <X size={12} />
      </button>
    </div>
  );
}
