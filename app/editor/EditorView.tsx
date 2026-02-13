'use client';

import { useAppStore } from '@/lib/store';
import TopNavBar from './TopNavBar';
import LeftSidebar from './LeftSidebar';
import Canvas from './Canvas';
import RightSidebar from './RightSidebar';
import CodePreview from './CodePreview';
import PreviewMode from './PreviewMode';
import { useState } from 'react';

type ViewMode = 'design' | 'code' | 'preview';

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
        {/* Left Sidebar - Only in design mode */}
        {viewMode === 'design' && <LeftSidebar />}

        {/* Canvas Area */}
        {viewMode === 'design' && <Canvas />}
        {viewMode === 'code' && <CodePreview />}
        {viewMode === 'preview' && <PreviewMode />}

        {/* Right Sidebar - Only in design mode */}
        {viewMode === 'design' && <RightSidebar />}
      </div>
    </div>
  );
}
