'use client';

import { useAppStore } from '@/lib/store';
import { Plus } from 'lucide-react';

export default function AssetsPanel() {
  const { currentProject } = useAppStore();

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-[#999] uppercase mb-3">Tech Stack</h3>
        <select className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-2 text-sm text-white">
          <option>Next.js</option>
          <option>React</option>
          <option>Vue</option>
          <option>Svelte</option>
          <option>HTML/CSS</option>
        </select>
      </div>

      <div className="mb-4">
        <h3 className="text-xs font-semibold text-[#999] uppercase mb-3">Animation Engine</h3>
        <select className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-2 text-sm text-white">
          <option>Framer Motion</option>
          <option>GSAP</option>
          <option>CSS</option>
          <option>Anime.js</option>
        </select>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-[#999] uppercase mb-3">Color Palette</h3>
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded bg-[#0D99FF] cursor-pointer" />
            <div className="w-8 h-8 rounded bg-[#0f0f0f] border border-[#2a2a2a] cursor-pointer" />
            <div className="w-8 h-8 rounded bg-[#1e1e1e] border border-[#2a2a2a] cursor-pointer" />
            <button className="w-8 h-8 rounded border border-dashed border-[#2a2a2a] text-[#666] hover:text-white hover:border-[#0D99FF]">
              <Plus size={16} className="mx-auto" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
