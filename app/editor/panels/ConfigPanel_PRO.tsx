'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Save, RotateCcw } from 'lucide-react';

export default function ConfigPanelPRO() {
  const { currentProject, projects, updateProject } = useAppStore();
  const [saved, setSaved] = useState(false);

  if (!currentProject) {
    return (
      <div className="p-4 text-xs text-[#666]">
        No project loaded
      </div>
    );
  }

  const [formData, setFormData] = useState({
    name: currentProject.name,
    description: currentProject.description || '',
    techStack: currentProject.techStack || 'nextjs',
    primaryColor: '#0D99FF',
    defaultFont: 'Outfit',
  });

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    if (updateProject && currentProject.id) {
      updateProject(currentProject.id, {
        name: formData.name,
        description: formData.description,
        techStack: formData.techStack,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleReset = () => {
    setFormData({
      name: currentProject.name,
      description: currentProject.description || '',
      techStack: currentProject.techStack || 'nextjs',
      primaryColor: '#0D99FF',
      defaultFont: 'Outfit',
    });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Project Info */}
      <div>
        <h4 className="text-xs font-semibold text-[#999] uppercase mb-3">Project Settings</h4>

        {/* Project Name */}
        <div className="mb-3">
          <label className="text-xs text-[#999] block mb-1">Project Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-white focus:border-[#0D99FF] focus:outline-none"
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="text-xs text-[#999] block mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-white focus:border-[#0D99FF] focus:outline-none resize-none"
            rows={3}
          />
        </div>
      </div>

      {/* Tech Stack */}
      <div className="border-t border-[#2a2a2a] pt-4">
        <h4 className="text-xs font-semibold text-[#999] uppercase mb-3">Tech Stack</h4>

        <label className="text-xs text-[#999] block mb-2">Framework</label>
        <select
          value={formData.techStack}
          onChange={(e) => handleChange('techStack', e.target.value)}
          className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-white focus:border-[#0D99FF] focus:outline-none mb-3"
        >
          <option value="html">HTML + CSS</option>
          <option value="react">React (SPA)</option>
          <option value="nextjs">Next.js (Full-Stack)</option>
          <option value="vue">Vue.js</option>
          <option value="svelte">Svelte</option>
        </select>

        {/* Stack Info */}
        <div className="p-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-[#666]">
          {formData.techStack === 'html' && 'Pure HTML/CSS output. Best for static sites.'}
          {formData.techStack === 'react' && 'React SPA with Vite. Client-side rendering.'}
          {formData.techStack === 'nextjs' && 'Next.js full-stack. SSR, SSG, API routes.'}
          {formData.techStack === 'vue' && 'Vue.js with Vite. Progressive enhancement.'}
          {formData.techStack === 'svelte' && 'Svelte framework. Compiler-based approach.'}
        </div>
      </div>

      {/* Design Defaults */}
      <div className="border-t border-[#2a2a2a] pt-4">
        <h4 className="text-xs font-semibold text-[#999] uppercase mb-3">Design Defaults</h4>

        {/* Primary Color */}
        <div className="mb-3">
          <label className="text-xs text-[#999] block mb-1">Primary Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={formData.primaryColor}
              onChange={(e) => handleChange('primaryColor', e.target.value)}
              className="w-12 h-10 cursor-pointer rounded border border-[#2a2a2a]"
            />
            <input
              type="text"
              value={formData.primaryColor}
              onChange={(e) => handleChange('primaryColor', e.target.value)}
              className="flex-1 px-3 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-white font-mono focus:border-[#0D99FF] focus:outline-none"
            />
          </div>
        </div>

        {/* Default Font */}
        <div>
          <label className="text-xs text-[#999] block mb-2">Default Font</label>
          <select
            value={formData.defaultFont}
            onChange={(e) => handleChange('defaultFont', e.target.value)}
            className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-white focus:border-[#0D99FF] focus:outline-none"
          >
            <option value="Outfit">Outfit</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Courier">Courier</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
          </select>
        </div>
      </div>

      {/* Breakpoints Info */}
      <div className="border-t border-[#2a2a2a] pt-4">
        <h4 className="text-xs font-semibold text-[#999] uppercase mb-3">Breakpoints</h4>
        <div className="space-y-1 text-xs text-[#666]">
          <div className="flex justify-between">
            <span>Mobile</span>
            <span className="text-[#999]">375px</span>
          </div>
          <div className="flex justify-between">
            <span>Tablet</span>
            <span className="text-[#999]">768px</span>
          </div>
          <div className="flex justify-between">
            <span>Desktop</span>
            <span className="text-[#999]">1440px</span>
          </div>
        </div>
      </div>

      {/* Export & Reset */}
      <div className="border-t border-[#2a2a2a] pt-4 flex gap-2">
        <button
          onClick={handleSave}
          className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded text-xs font-medium transition-colors ${saved
            ? 'bg-green-500/20 text-green-400'
            : 'bg-[#0D99FF] hover:bg-[#0a7acc] text-white'
            }`}
        >
          <Save size={14} />
          {saved ? 'Saved!' : 'Save'}
        </button>
        <button
          onClick={handleReset}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#2a2a2a] hover:bg-[#333] text-[#ddd] rounded text-xs font-medium transition-colors"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      {/* Project ID */}
      <div className="border-t border-[#2a2a2a] pt-4 text-xs text-[#666]">
        <p className="mb-1">Project ID</p>
        <code className="block bg-[#0f0f0f] p-2 rounded border border-[#2a2a2a] text-[9px] break-all font-mono">
          {currentProject.id}
        </code>
      </div>
    </div>
  );
}
