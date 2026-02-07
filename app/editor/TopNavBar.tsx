'use client';

import { useAppStore } from '@/lib/store';
import { ArrowLeft, RotateCcw, RotateCw, Play, Share2 } from 'lucide-react';

type ViewMode = 'design' | 'code' | 'preview';

interface TopNavBarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export default function TopNavBar({ viewMode, setViewMode }: TopNavBarProps) {
  const { currentProject } = useAppStore();

  const handleBack = () => {
    // Close project - in a real app, this would reset state
    window.location.reload();
  };

  return (
    <div className="h-16 bg-[#1e1e1e] border-b border-[#2a2a2a] flex items-center px-6 gap-6">
      {/* Left: Logo, Back, Undo/Redo, Project Name */}
      <div className="flex items-center gap-4">
        <img
          src="/union.svg"
          alt="Logo"
          className="h-10 w-auto"
        />
        <button
          onClick={handleBack}
          className="text-[#999] hover:text-white transition-colors p-2 hover:bg-[#2a2a2a] rounded"
          title="Back to Dashboard"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex gap-1">
          <button className="text-[#999] hover:text-white transition-colors p-2 hover:bg-[#2a2a2a] rounded">
            <RotateCcw size={20} />
          </button>
          <button className="text-[#999] hover:text-white transition-colors p-2 hover:bg-[#2a2a2a] rounded">
            <RotateCw size={20} />
          </button>
        </div>

        <div className="ml-4 border-l border-[#2a2a2a] pl-4">
          <h2 className="font-semibold text-white text-lg">{currentProject?.name}</h2>
          <p className="text-xs text-[#666]">{currentProject?.pages[0]?.name}</p>
        </div>
      </div>

      {/* Center: Work Mode Switcher */}
      <div className="flex-1 flex justify-center">
        <div className="flex gap-1 bg-[#0f0f0f] rounded-lg p-1">
          {(['design', 'code', 'preview'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 text-sm font-medium rounded transition-colors capitalize ${
                viewMode === mode
                  ? 'text-white bg-[#0D99FF]'
                  : 'text-[#999] hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Play, Share */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] text-white hover:bg-[#333] rounded transition-colors">
          <Play size={16} />
          Play
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#0D99FF] hover:bg-[#0a7acc] text-white rounded transition-colors">
          <Share2 size={16} />
          Share
        </button>
      </div>
    </div>
  );
}
