'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Copy, Trash2, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { SiteElement } from '@/lib/types';

export default function PropertiesPanelPRO() {
  const { currentPage, selectedElementId, updateElement, deleteElement, activeBreakpoint } = useAppStore();
  const [activeTab, setActiveTab] = useState<'style' | 'settings'>('style');

  if (!selectedElementId || !currentPage) {
    return (
      <div className="w-full h-full bg-[#0f0f0f] border-l border-[#2a2a2a] p-4 flex items-center justify-center">
        <p className="text-xs text-[#666]">Select an element to edit</p>
      </div>
    );
  }

  // Recursive find function
  const findElementRecursive = (elements: SiteElement[], id: string): SiteElement | undefined => {
    for (const el of elements) {
      if (el.id === id) return el;
      if (el.children) {
        const found = findElementRecursive(el.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const element = findElementRecursive(currentPage.elements, selectedElementId);
  if (!element) return null;

  // Get responsive values or base values
  const responsive = element.responsive?.[activeBreakpoint];
  const x = typeof responsive?.x === 'number' ? responsive.x : element.x;
  const y = typeof responsive?.y === 'number' ? responsive.y : element.y;
  const width = typeof responsive?.width === 'number' ? responsive.width : element.width;
  const height = typeof responsive?.height === 'number' ? responsive.height : element.height;

  const handleUpdate = (key: string, value: any) => {
    const updates: Partial<SiteElement> = {};
    if (activeBreakpoint === 'mobile') {
      (updates as any)[key] = value;
    } else {
      updates.responsive = {
        ...element.responsive,
        [activeBreakpoint]: {
          ...(element.responsive?.[activeBreakpoint] || {}),
          [key]: value,
        },
      };
    }
    updateElement(selectedElementId, updates);
  };

  return (
    <div className="w-full h-full bg-[#0f0f0f] border-l border-[#2a2a2a] overflow-y-auto flex flex-col">
      {/* Header & Tabs */}
      <div className="border-b border-[#2a2a2a] bg-[#1a1a1a]">
        <div className="p-3 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white truncate max-w-[120px]">{element.name}</h3>
          <div className="flex gap-1">
            <button className="p-1 hover:text-white text-gray-400"><Lock size={12} /></button>
            <button className="p-1 hover:text-white text-gray-400"><Eye size={12} /></button>
            <button onClick={() => deleteElement(selectedElementId)} className="p-1 hover:text-red-400 text-gray-400"><Trash2 size={12} /></button>
          </div>
        </div>
        <div className="flex px-1 gap-1">
          <button
            onClick={() => setActiveTab('style')}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'style' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            Style
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'settings' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            Settings
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'style' && (
          <div className="divide-y divide-[#2a2a2a]">
            {/* Layout Section */}
            <div className="p-4">
              <SectionHeader title="Layout" />
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <PropInput label="X" value={x} onChange={(v) => handleUpdate('x', parseInt(v))} type="number" />
                  <PropInput label="Y" value={y} onChange={(v) => handleUpdate('y', parseInt(v))} type="number" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <PropInput label="W" value={width} onChange={(v) => handleUpdate('width', parseInt(v))} type="number" />
                  <PropInput label="H" value={height} onChange={(v) => handleUpdate('height', parseInt(v))} type="number" />
                </div>
              </div>
            </div>

            {/* Typography Section */}
            {element.type === 'text' && (
              <div className="p-4">
                <SectionHeader title="Typography" />
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <PropInput label="Sz" value={element.fontSize || 14} onChange={(v) => updateElement(selectedElementId, { fontSize: parseInt(v) })} type="number" />
                    <div className="bg-[#1e1e1e] rounded flex items-center border border-[#2a2a2a] px-1">
                      <span className="text-[10px] text-gray-500 w-4">Wt</span>
                      <select
                        className="bg-transparent text-xs text-white border-none focus:ring-0 w-full p-1"
                        value={element.fontWeight || 400}
                        onChange={(e) => updateElement(selectedElementId, { fontWeight: parseInt(e.target.value) })}
                      >
                        <option value="400">400</option>
                        <option value="700">700</option>
                        <option value="900">900</option>
                      </select>
                    </div>
                  </div>
                  <PropColor label="Color" value={element.textColor || '#ffffff'} onChange={(v) => updateElement(selectedElementId, { textColor: v })} />

                  <div className="flex bg-[#1e1e1e] rounded p-1 border border-[#2a2a2a]">
                    {['left', 'center', 'right', 'justify'].map((align) => (
                      <button
                        key={align}
                        onClick={() => updateElement(selectedElementId, { textAlign: align as any })}
                        className={`flex-1 py-1 flex justify-center rounded hover:bg-white/5 ${element.textAlign === align ? 'bg-[#333] text-blue-400' : 'text-gray-500'}`}
                      >
                        <div className={`w-3 h-0.5 bg-current my-0.5 ${align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : ''}`} />
                        <div className={`w-2 h-0.5 bg-current my-0.5 ${align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : ''}`} />
                        <div className={`w-3 h-0.5 bg-current my-0.5 ${align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Effects Section */}
            <div className="p-4">
              <SectionHeader title="Effects" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Opacity</span>
                  <input
                    type="range" min="0" max="1" step="0.01"
                    value={element.opacity || 1}
                    onChange={(e) => updateElement(selectedElementId, { opacity: parseFloat(e.target.value) })}
                    className="w-24 h-1 bg-[#333] rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs text-white w-8 text-right">{Math.round((element.opacity || 1) * 100)}%</span>
                </div>
                <PropColor label="Fill" value={element.backgroundColor || '#e5e5e5'} onChange={(v) => updateElement(selectedElementId, { backgroundColor: v })} />
                <PropInput label="Radius" value={element.borderRadius || 0} onChange={(v) => updateElement(selectedElementId, { borderRadius: parseInt(v) })} type="number" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-4">
            <SectionHeader title="Metadata" />
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">ID</label>
                <div className="text-xs font-mono text-gray-400 bg-[#1e1e1e] p-2 rounded select-all border border-[#2a2a2a]">{element.id}</div>
              </div>
              <PropTextarea label="Content" value={element.textContent || ''} onChange={(v) => updateElement(selectedElementId, { textContent: v })} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Subcomponents
function SectionHeader({ title }: { title: string }) {
  return <h4 className="text-[10px] font-bold text-[#666] uppercase tracking-wider mb-3">{title}</h4>;
}

function PropInput({ label, value, onChange, type = 'text' }: { label: string, value: string | number, onChange: (val: string) => void, type?: string }) {
  return (
    <div className="bg-[#1e1e1e] rounded flex items-center border border-[#2a2a2a] group hover:border-[#444] transition-colors overflow-hidden">
      <span className="text-[10px] text-gray-500 w-6 pl-2 cursor-ew-resize select-none">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-xs text-white border-none focus:ring-0 w-full p-1.5 focus:bg-[#252525] outline-none"
      />
    </div>
  );
}

function PropColor({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) {
  return (
    <div className="bg-[#1e1e1e] rounded flex items-center border border-[#2a2a2a] p-1 gap-2">
      <div className="w-4 h-4 rounded-sm border border-[#333] overflow-hidden relative">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute -top-2 -left-2 w-8 h-8 cursor-pointer" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-xs text-white border-none focus:ring-0 flex-1 outline-none font-mono uppercase"
      />
    </div>
  );
}

function PropTextarea({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) {
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded text-xs text-white p-2 min-h-[60px] focus:border-blue-500 focus:outline-none resize-y"
      />
    </div>
  );
}
