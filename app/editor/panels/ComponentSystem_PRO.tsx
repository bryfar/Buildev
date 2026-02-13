'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Copy, Trash2, Plus, Eye, EyeOff } from 'lucide-react';

export default function ComponentSystemPRO() {
  const { reusableComponents, selectedElementId, currentPage, saveAsComponent, createInstance, deleteComponent } = useAppStore();
  const [showNewComponentDialog, setShowNewComponentDialog] = useState(false);
  const [newComponentName, setNewComponentName] = useState('');

  const handleSaveAsComponent = () => {
    if (selectedElementId && newComponentName.trim()) {
      saveAsComponent(selectedElementId, newComponentName);
      setNewComponentName('');
      setShowNewComponentDialog(false);
    }
  };

  const handleCreateInstance = (componentId: string) => {
    createInstance(componentId);
  };

  return (
    <div className="p-4 space-y-4 max-h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-[#999] uppercase">Components</h3>
        <button
          onClick={() => setShowNewComponentDialog(!showNewComponentDialog)}
          disabled={!selectedElementId}
          className={`p-1 rounded transition-colors ${
            selectedElementId
              ? 'hover:bg-[#2a2a2a] text-[#0D99FF]'
              : 'text-[#666] cursor-not-allowed'
          }`}
          title="Save selected element as component"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Save as Component Dialog */}
      {showNewComponentDialog && (
        <div className="p-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded space-y-2">
          <input
            type="text"
            placeholder="Component name..."
            value={newComponentName}
            onChange={(e) => setNewComponentName(e.target.value)}
            className="w-full px-2 py-1 bg-[#1e1e1e] border border-[#2a2a2a] rounded text-xs text-white focus:border-[#0D99FF] focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleSaveAsComponent()}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveAsComponent}
              className="flex-1 px-2 py-1 bg-[#0D99FF] hover:bg-[#0a7acc] text-white rounded text-xs font-medium transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => {
                setShowNewComponentDialog(false);
                setNewComponentName('');
              }}
              className="flex-1 px-2 py-1 bg-[#2a2a2a] hover:bg-[#333] text-[#ddd] rounded text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Components List */}
      <div className="space-y-2">
        {reusableComponents.length === 0 ? (
          <div className="text-xs text-[#666] py-4 text-center">
            No components yet. Select an element and click + to create.
          </div>
        ) : (
          reusableComponents.map((component) => (
            <div
              key={component.id}
              className="p-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded hover:border-[#0D99FF]/50 transition-colors"
            >
              {/* Component Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-xs font-medium text-white truncate">
                    {component.name}
                  </h4>
                  <p className="text-[9px] text-[#666]">
                    {component.element.type} · {component.element.children?.length || 0} children
                  </p>
                </div>
              </div>

              {/* Component Actions */}
              <div className="flex gap-1">
                <button
                  onClick={() => handleCreateInstance(component.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-[#0D99FF]/20 hover:bg-[#0D99FF]/30 text-[#0D99FF] rounded text-xs transition-colors"
                  title="Create instance"
                >
                  <Copy size={12} />
                  Instance
                </button>
                <button
                  onClick={() => deleteComponent(component.id)}
                  className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs transition-colors"
                  title="Delete component"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Component Info */}
              <div className="mt-2 p-2 bg-[#1e1e1e] rounded text-[9px] text-[#666] space-y-1">
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span className="text-[#999]">
                    {Math.round(component.element.width)}×{Math.round(component.element.height)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Position:</span>
                  <span className="text-[#999]">
                    {Math.round(component.element.x)}, {Math.round(component.element.y)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info */}
      <div className="border-t border-[#2a2a2a] pt-4 text-[9px] text-[#666] space-y-2">
        <p>
          <strong>Components</strong> are reusable design elements. Create instances to use them multiple times.
        </p>
        <p>
          Changes to the master component will sync to all instances (coming soon).
        </p>
      </div>
    </div>
  );
}
