'use client';

import React from "react"

import { useAppStore } from '@/lib/store';
import { Plus, Clock, Trash2 } from 'lucide-react';
import { useState } from 'react';
import EditorView from './editor/EditorView';

export default function Dashboard() {
  const { projects, currentProject, createProject, deleteProject, openProject } = useAppStore();
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);

  if (currentProject) {
    return <EditorView />;
  }

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      createProject(newProjectName);
      setNewProjectName('');
      setShowNewForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <header className="border-b border-[#2a2a2a] bg-[#1e1e1e] px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex">
            <img
          src="/logo.svg"
          alt="Logo"
          className="h-10 w-auto"
        />
          </div>
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 bg-[#0D99FF] hover:bg-[#0a7acc] text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            New Project
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        {/* New Project Form */}
        {showNewForm && (
          <div className="mb-12 p-8 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="flex gap-3">
              <input
                type="text"
                placeholder="Project name..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="flex-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white placeholder-[#666] focus:outline-none focus:border-[#0D99FF]"
                autoFocus
              />
              <button
                type="submit"
                className="bg-[#0D99FF] hover:bg-[#0a7acc] text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="bg-[#2a2a2a] hover:bg-[#333] text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Projects Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-8">
            {projects.length === 0 ? 'No Projects Yet' : 'Recent Projects'}
          </h2>
          
          {projects.length === 0 ? (
            <div className="text-center py-16 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg">
              <p className="text-[#999] mb-6">Start by creating your first project</p>
              <button
                onClick={() => setShowNewForm(true)}
                className="inline-flex items-center gap-2 bg-[#0D99FF] hover:bg-[#0a7acc] text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Plus size={20} />
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg overflow-hidden hover:border-[#0D99FF] transition-colors group cursor-pointer"
                  onClick={() => openProject(project.id)}
                >
                  {/* Thumbnail */}
                  <div className="w-full h-40 bg-[#0f0f0f] flex items-center justify-center border-b border-[#2a2a2a] group-hover:bg-[#2a2a2a] transition-colors">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-[#0D99FF] mb-2">
                        {project.pages.length}
                      </div>
                      <p className="text-sm text-[#999]">
                        {project.pages.length === 1 ? 'page' : 'pages'}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 truncate">{project.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-[#999] mb-4">
                      <Clock size={16} />
                      <span>
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openProject(project.id);
                        }}
                        className="flex-1 bg-[#0D99FF] hover:bg-[#0a7acc] text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                      >
                        Open
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProject(project.id);
                        }}
                        className="bg-[#2a2a2a] hover:bg-red-900/30 text-[#999] hover:text-red-400 px-3 py-2 rounded text-sm transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
