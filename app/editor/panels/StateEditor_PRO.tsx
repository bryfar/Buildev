'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Plus, Trash2, Copy } from 'lucide-react';

export default function StateEditorPRO() {
  const { selectedElementId, currentPage, addState } = useAppStore();
  const [newStateName, setNewStateName] = useState('');
  const [showNewStateDialog, setShowNewStateDialog] = useState(false);

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

  const predefinedStates = [
    { name: 'hover', label: '🖱️ Hover', color: '#0D99FF' },
    { name: 'active', label: '👆 Active', color: '#00D084' },
    { name: 'disabled', label: '🚫 Disabled', color: '#FF4B4B' },
    { name: 'focus', label: '👁️ Focus', color: '#FFD700' },
  ];

  const handleAddPredefinedState = (stateName: string) => {
    if (selectedElementId) {
      addState(selectedElementId, stateName, {
        opacity: stateName === 'disabled' ? 0.5 : undefined,
        backgroundColor: stateName === 'hover' ? '#0D99FF20' : undefined,
      });
    }
  };

  return (
    <div className="p-4 space-y-4 max-h-full overflow-y-auto">
      {/* Header */}
      <div>
        <h3 className="text-xs font-semibold text-[#999] uppercase mb-1">Element States</h3>
        <p className="text-[9px] text-[#666]">
          {selectedElement ? `Editing: ${selectedElement.name}` : 'Select an element'}
        </p>
      </div>

      {!selectedElement && (
        <div className="p-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-[#666] text-center py-8">
          No element selected
        </div>
      )}

      {selectedElement && (
        <>
          {/* Predefined States */}
          <div>
            <h4 className="text-xs font-medium text-white mb-2">Quick Add</h4>
            <div className="grid grid-cols-2 gap-2">
              {predefinedStates.map((state) => (
                <button
                  key={state.name}
                  onClick={() => handleAddPredefinedState(state.name)}
                  disabled={selectedElement.states?.[state.name] !== undefined}
                  className={`px-2 py-2 rounded text-xs font-medium transition-colors ${
                    selectedElement.states?.[state.name] !== undefined
                      ? 'bg-[#2a2a2a] text-[#666] cursor-not-allowed'
                      : 'bg-[#0f0f0f] border border-[#2a2a2a] text-white hover:border-[#0D99FF] hover:text-[#0D99FF]'
                  }`}
                >
                  <span className="mr-1">{state.label.split(' ')[0]}</span>
                  {state.label.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          {/* Current States */}
          <div className="border-t border-[#2a2a2a] pt-4">
            <h4 className="text-xs font-medium text-white mb-3">States</h4>
            {!selectedElement.states || Object.keys(selectedElement.states).length === 0 ? (
              <div className="text-xs text-[#666] text-center py-4">
                No states defined. Add one above.
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(selectedElement.states).map(([stateName, stateStyle]: any) => (
                  <div key={stateName} className="p-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-xs font-medium text-white capitalize">
                        {stateName}
                      </h5>
                      <button className="text-xs text-red-400 hover:text-red-300">×</button>
                    </div>

                    {/* State Properties */}
                    <div className="space-y-1 text-[9px]">
                      {stateStyle.backgroundColor && (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border border-[#2a2a2a]"
                            style={{ backgroundColor: stateStyle.backgroundColor }}
                          />
                          <span className="text-[#666]">
                            BG: <code className="text-[#0D99FF]">{stateStyle.backgroundColor}</code>
                          </span>
                        </div>
                      )}
                      {stateStyle.opacity !== undefined && (
                        <div className="text-[#666]">
                          Opacity: <code className="text-[#0D99FF]">{stateStyle.opacity}</code>
                        </div>
                      )}
                      {stateStyle.textColor && (
                        <div className="text-[#666]">
                          Text: <code className="text-[#0D99FF]">{stateStyle.textColor}</code>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="border-t border-[#2a2a2a] pt-4 text-[9px] text-[#666] space-y-2">
            <p>
              <strong>States</strong> define how elements look in different interactions.
            </p>
            <p>
              Preview states on canvas: <code className="bg-[#0f0f0f] px-1 py-0.5 rounded">Shift+H</code> for hover
            </p>
          </div>
        </>
      )}
    </div>
  );
}
