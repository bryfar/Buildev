'use client';

import { useAppStore } from '@/lib/store';

export default function ConfigPanel() {
  const { currentProject, updateProjectSettings } = useAppStore();

  if (!currentProject) return null;

  return (
    <div className="p-4 space-y-6">
      {/* Project Name */}
      <div>
        <label className="block text-xs font-semibold text-[#999] uppercase mb-2">
          Project Name
        </label>
        <input
          type="text"
          value={currentProject.name}
          onChange={(e) => updateProjectSettings({ name: e.target.value })}
          className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0D99FF] transition-colors"
        />
      </div>

      {/* Tech Stack */}
      <div>
        <label className="block text-xs font-semibold text-[#999] uppercase mb-2">
          Tech Stack
        </label>
        <select 
          value={currentProject.techStack}
          onChange={(e) => updateProjectSettings({ techStack: e.target.value as any })}
          className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0D99FF] transition-colors cursor-pointer"
        >
          <option value="nextjs">Next.js</option>
          <option value="react">React</option>
          <option value="vue">Vue</option>
          <option value="svelte">Svelte</option>
          <option value="html">HTML/CSS</option>
        </select>
        <div className="mt-2 p-2 bg-[#0D99FF]/10 border border-[#0D99FF]/30 rounded">
          <p className="text-xs text-[#0D99FF] flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Code in the "Code" tab will be generated based on this stack
          </p>
        </div>
      </div>

      {/* Animation Engine */}
      <div>
        <label className="block text-xs font-semibold text-[#999] uppercase mb-2">
          Animation Engine
        </label>
        <select 
          value={currentProject.animationEngine}
          onChange={(e) => updateProjectSettings({ animationEngine: e.target.value as any })}
          className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0D99FF] transition-colors cursor-pointer"
        >
          <option value="framer-motion">Framer Motion</option>
          <option value="gsap">GSAP</option>
          <option value="css">CSS Animations</option>
          <option value="anime">Anime.js</option>
        </select>
      </div>

      {/* Grid Settings */}
      <div>
        <label className="block text-xs font-semibold text-[#999] uppercase mb-2">
          Canvas Grid
        </label>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            defaultChecked
            className="w-4 h-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded cursor-pointer"
          />
          <span className="text-sm text-white">Show grid on canvas</span>
        </div>
      </div>

      {/* Export Settings */}
      <div className="pt-4 border-t border-[#2a2a2a]">
        <h3 className="text-xs font-semibold text-[#999] uppercase mb-3">Export Settings</h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded cursor-pointer"
            />
            <span className="text-sm text-white">Include CSS modules</span>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded cursor-pointer"
            />
            <span className="text-sm text-white">TypeScript</span>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-4 h-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded cursor-pointer"
            />
            <span className="text-sm text-white">Tailwind CSS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
