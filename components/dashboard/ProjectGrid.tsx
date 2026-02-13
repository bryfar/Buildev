'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import {
    Plus, Search, LayoutGrid, Clock, MoreVertical,
    Settings, LogOut, FileCode, Monitor, Smartphone,
    CreditCard, Home, Book, Layers, Command
} from 'lucide-react';
import Image from 'next/image';

// Logo component
const Logo = () => (
    <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-12 h-12 flex items-center justify-center">
            <img src="/isotype.svg" alt="Logo" className="w-full h-full" />
        </div>
    </div>
);

export default function ProjectGrid() {
    const { projects, openProject, createProject, deleteProject, initializeStore } = useAppStore();
    const [newProjectName, setNewProjectName] = useState('');
    const [showNewForm, setShowNewForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    React.useEffect(() => {
        initializeStore();
    }, [initializeStore]);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newProjectName.trim()) {
            createProject(newProjectName);
            setNewProjectName('');
            setShowNewForm(false);
        }
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r border-[#1a1a1a] flex flex-col p-4 bg-[#0a0a0a]">
                <Logo />

                <div className="space-y-6 flex-1">
                    <div>
                        <div className="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Platform</div>
                        <nav className="space-y-1">
                            <NavItem icon={<Home size={18} />} label="Home" active />
                            <NavItem icon={<Book size={18} />} label="Library" />
                            <NavItem icon={<LayoutGrid size={18} />} label="Projects" />
                            <NavItem icon={<Layers size={18} />} label="Design Systems" />
                        </nav>
                    </div>

                    <div>
                        <div className="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent</div>
                        <div className="space-y-1">
                            {projects.slice(0, 5).map(p => (
                                <button key={p.id} onClick={() => openProject(p.id)} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors text-left truncate">
                                    <div className="w-2 h-2 rounded-full bg-blue-500/50" />
                                    {p.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-auto border-t border-[#1a1a1a] pt-4 px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-orange-500" />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">Personal</div>
                            <div className="text-xs text-gray-500">Free Plan</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative">
                <div className="max-w-5xl mx-auto px-8 py-12">

                    {/* Hero Section */}
                    <div className="flex flex-col items-center justify-center min-h-[40vh] mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium mb-6 border border-blue-500/20">
                            <span className="bg-blue-500 text-white text-[10px] px-1 rounded">NEW</span>
                            Introducing Auto-Layout 2.0
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                            What do you want to create?
                        </h1>

                        {/* Standard Create Button */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowNewForm(true)}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
                            >
                                <Plus size={20} />
                                New Project
                            </button>
                            <button
                                className="px-6 py-3 bg-[#24292e] hover:bg-[#2f363d] border border-white/10 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                                onClick={() => alert("Connecting to GitHub...\n(Mock: Repository created successfully!)")}
                            >
                                <svg height="20" viewBox="0 0 16 16" version="1.1" width="20" aria-hidden="true" fill="currentColor"><path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
                                Export to GitHub
                            </button>
                            <button className="px-6 py-3 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] text-white rounded-lg font-medium transition-all flex items-center gap-2">
                                <Monitor size={20} />
                                Import from Figma
                            </button>
                        </div>
                    </div>

                    {/* Projects Section */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-full pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500/50 w-64"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* New Project Card */}
                            <button
                                onClick={() => setShowNewForm(true)}
                                className="group relative h-48 rounded-xl border border-dashed border-[#333] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex flex-col items-center justify-center gap-3"
                            >
                                <div className="w-12 h-12 rounded-full bg-[#1a1a1a] group-hover:bg-blue-500/20 flex items-center justify-center transition-colors">
                                    <Plus size={24} className="text-gray-400 group-hover:text-blue-400" />
                                </div>
                                <span className="text-sm text-gray-400 group-hover:text-blue-400 font-medium">Create New Project</span>
                            </button>

                            {filteredProjects.map(project => (
                                <div
                                    key={project.id}
                                    onClick={() => openProject(project.id)}
                                    className="group bg-[#0a0a0a] border border-[#2a2a2a] hover:border-[#444] rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:shadow-blue-900/10"
                                >
                                    <div className="h-32 bg-[#111] relative overflow-hidden group-hover:bg-[#151515] transition-colors border-b border-[#2a2a2a]">
                                        {/* Preview Placeholder - In future, actual screenshot */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                                            <LayoutGrid size={48} className="text-[#333]" />
                                        </div>
                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                                                className="p-1.5 bg-black/50 hover:bg-red-500/20 hover:text-red-400 text-gray-400 rounded-md backdrop-blur-sm"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-medium text-white mb-1 group-hover:text-blue-400 transition-colors">{project.name}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Clock size={12} />
                                            <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{project.pages.length} pages</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Modal for New Project */}
                {showNewForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-[#111] border border-[#333] rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                            <button
                                onClick={() => setShowNewForm(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-white"
                            >
                                ✕
                            </button>
                            <h2 className="text-xl font-bold mb-4">Name your project</h2>
                            <form onSubmit={handleCreate}>
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="e.g. Portfolio 2024"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-6"
                                />
                                <div className="flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowNewForm(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Create Project
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function NavItem({ icon, label, active }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            {icon}
            {label}
        </button>
    );
}

function PromptAction({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] text-xs font-medium text-gray-300 transition-colors"
        >
            {icon}
            {label}
        </button>
    );
}

import { Trash2 } from 'lucide-react';
