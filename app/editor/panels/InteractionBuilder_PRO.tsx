'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Plus, Trash2, Link2, Eye } from 'lucide-react';

export default function InteractionBuilderPRO() {
  const { selectedElementId, currentPage, addInteraction } = useAppStore();
  const [showNewInteractionDialog, setShowNewInteractionDialog] = useState(false);
  const [newInteraction, setNewInteraction] = useState<{
    trigger: 'click' | 'hover' | 'focus' | 'load';
    action: 'navigate' | 'toggle-state' | 'show-element' | 'hide-element' | 'animate';
    target: string;
    duration: number;
  }>({
    trigger: 'click' as const,
    action: 'navigate' as const,
    target: '',
    duration: 300,
  });

  // Find selected element
  const findElement = (elements: any[]): any => {
    for (const el of elements) {
      if (el.id === selectedElementId) return el;
      if (el.children) {
        const found = findElement(el.children);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedElement = selectedElementId && currentPage ? findElement(currentPage.elements) : null;

  const handleAddInteraction = () => {
    if (selectedElementId && newInteraction.target.trim()) {
      addInteraction(selectedElementId, {
        trigger: newInteraction.trigger,
        action: newInteraction.action,
        target: newInteraction.target,
        animationProps: { duration: newInteraction.duration },
      });
      setNewInteraction({ trigger: 'click', action: 'navigate', target: '', duration: 300 });
      setShowNewInteractionDialog(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-[#999] uppercase mb-1">Interactions</h3>
          <p className="text-[9px] text-[#666]">
            {selectedElement ? `Editing: ${selectedElement.name}` : 'Select an element'}
          </p>
        </div>
        <button
          onClick={() => setShowNewInteractionDialog(!showNewInteractionDialog)}
          disabled={!selectedElementId}
          className={`p-1 rounded transition-colors ${
            selectedElementId
              ? 'hover:bg-[#2a2a2a] text-[#0D99FF]'
              : 'text-[#666] cursor-not-allowed'
          }`}
        >
          <Plus size={16} />
        </button>
      </div>

      {!selectedElement && (
        <div className="p-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-[#666] text-center py-8">
          No element selected
        </div>
      )}

      {selectedElement && (
        <>
          {/* New Interaction Dialog */}
          {showNewInteractionDialog && (
            <div className="p-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded space-y-2">
              <div>
                <label className="text-[9px] text-[#999] block mb-1">Trigger</label>
                <select
                  value={newInteraction.trigger}
                  onChange={(e) =>
                    setNewInteraction({ ...newInteraction, trigger: e.target.value as any })
                  }
                  className="w-full px-2 py-1 bg-[#1e1e1e] border border-[#2a2a2a] rounded text-xs text-white focus:border-[#0D99FF] focus:outline-none"
                >
                  <option value="click">Click</option>
                  <option value="hover">Hover</option>
                  <option value="focus">Focus</option>
                  <option value="load">Load</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] text-[#999] block mb-1">Action</label>
                <select
                  value={newInteraction.action}
                  onChange={(e) =>
                    setNewInteraction({ ...newInteraction, action: e.target.value as any })
                  }
                  className="w-full px-2 py-1 bg-[#1e1e1e] border border-[#2a2a2a] rounded text-xs text-white focus:border-[#0D99FF] focus:outline-none"
                >
                  <option value="navigate">Navigate</option>
                  <option value="toggle-state">Toggle State</option>
                  <option value="show-element">Show Element</option>
                  <option value="hide-element">Hide Element</option>
                  <option value="animate">Animate</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] text-[#999] block mb-1">Target (URL or ID)</label>
                <input
                  type="text"
                  placeholder="e.g., /page or element-id"
                  value={newInteraction.target}
                  onChange={(e) => setNewInteraction({ ...newInteraction, target: e.target.value })}
                  className="w-full px-2 py-1 bg-[#1e1e1e] border border-[#2a2a2a] rounded text-xs text-white focus:border-[#0D99FF] focus:outline-none"
                />
              </div>

              {newInteraction.action === 'animate' && (
                <div>
                  <label className="text-[9px] text-[#999] block mb-1">Duration (ms)</label>
                  <input
                    type="number"
                    value={newInteraction.duration}
                    onChange={(e) =>
                      setNewInteraction({ ...newInteraction, duration: parseInt(e.target.value) })
                    }
                    className="w-full px-2 py-1 bg-[#1e1e1e] border border-[#2a2a2a] rounded text-xs text-white focus:border-[#0D99FF] focus:outline-none"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleAddInteraction}
                  className="flex-1 px-2 py-1 bg-[#0D99FF] hover:bg-[#0a7acc] text-white rounded text-xs font-medium transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowNewInteractionDialog(false);
                    setNewInteraction({
                      trigger: 'click',
                      action: 'navigate',
                      target: '',
                      duration: 300,
                    });
                  }}
                  className="flex-1 px-2 py-1 bg-[#2a2a2a] hover:bg-[#333] text-[#ddd] rounded text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Interactions List */}
          <div className="space-y-2">
            {!selectedElement.interactions || selectedElement.interactions.length === 0 ? (
              <div className="text-xs text-[#666] text-center py-4">
                No interactions. Click + to add one.
              </div>
            ) : (
              selectedElement.interactions.map((interaction: any) => (
                <div
                  key={interaction.id}
                  className="p-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded hover:border-[#0D99FF]/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <h5 className="text-xs font-medium text-white">
                        <span className="text-[#0D99FF]">{interaction.trigger}</span>
                        {' → '}
                        <span className="text-[#00D084]">{interaction.action}</span>
                      </h5>
                      <p className="text-[9px] text-[#666] mt-0.5">
                        Target: <code className="bg-[#1e1e1e] px-1 py-0.5 rounded">{interaction.target}</code>
                      </p>
                    </div>
                    <button className="text-xs text-red-400 hover:text-red-300">×</button>
                  </div>

                  {interaction.animationProps?.duration && (
                    <p className="text-[9px] text-[#666]">
                      Duration: {interaction.animationProps.duration}ms
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Info */}
          <div className="border-t border-[#2a2a2a] pt-4 text-[9px] text-[#666] space-y-2">
            <p>
              <strong>Interactions</strong> define what happens when users interact with elements.
            </p>
            <p>
              Test interactions in <strong>Preview Mode</strong> (eye icon in TopNav).
            </p>
          </div>
        </>
      )}
    </div>
  );
}
