'use client';

import { useAppStore } from '@/lib/store';
import { Plus } from 'lucide-react';

/**
 * Demo component that initializes a sample project if none exists
 */
export function InitializeDemo() {
  const { projects, createProject } = useAppStore();

  if (projects.length === 0) {
    // Auto-create a demo project on first load
    setTimeout(() => {
      if (projects.length === 0) {
        createProject('Welcome to AetherSite');
      }
    }, 100);
  }

  return null;
}

export function EmptyState() {
  return (
    <div className="text-center py-16">
      <h2 className="text-2xl font-bold text-white mb-2">Start Building</h2>
      <p className="text-[#999] mb-8 max-w-xs mx-auto">
        Create a new project to start designing responsive web interfaces with
        AI-powered components.
      </p>
      <button className="inline-flex items-center gap-2 bg-[#0D99FF] hover:bg-[#0a7acc] text-white px-6 py-3 rounded-lg font-medium transition-colors">
        <Plus size={20} />
        Create Project
      </button>
    </div>
  );
}
