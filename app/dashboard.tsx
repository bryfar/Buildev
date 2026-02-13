'use client';

import React from "react";
import ProjectGrid from "@/components/dashboard/ProjectGrid";
import { useAppStore } from '@/lib/store';
import EditorView from './editor/EditorView'; // Keep this import if it's used conditionally, but ProjectGrid manages project opening? 
// No, EditorView is rendered here if currentProject exists.

export default function Dashboard() {
  const { currentProject } = useAppStore();

  if (currentProject) {
    return <EditorView />;
  }

  return <ProjectGrid />;
}
