'use client';

import { useAppStore } from '@/lib/store';
import TopNavBar from './TopNavBar';
import LeftSidebar from './LeftSidebar';
import Canvas from './Canvas';
import RightSidebar from './RightSidebar';
import CodePreview from './CodePreview';
import { useState } from 'react';

type ViewMode = 'design' | 'prototype' | 'code' | 'preview';

export default function EditorView() {
  const { currentProject } = useAppStore();
  const [viewMode, setViewMode] = useState<ViewMode>('design');

  if (!currentProject) {
    return <div>No project loaded</div>;
  }

  return (
    <div className="h-screen bg-[#0f0f0f] flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <TopNavBar viewMode={viewMode} setViewMode={setViewMode} />

      {/* Main Editor Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        {viewMode === 'design' && <LeftSidebar />}

        {/* Canvas Area */}
        {viewMode === 'design' && <Canvas />}
        {viewMode === 'code' && <CodePreview />}
        {viewMode === 'prototype' && (
          <div className="flex-1 flex items-center justify-center text-[#999]">
            <p>Prototype mode coming soon</p>
          </div>
        )}
        {viewMode === 'preview' && (
          <div className="flex-1 flex items-center justify-center text-[#999]">
            <p>Preview mode coming soon</p>
          </div>
        )}

        {/* Right Sidebar */}
        {viewMode === 'design' && <RightSidebar />}
      </div>
    </div>
  );
}
