'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Lock, Unlock } from 'lucide-react';

export default function ConstraintsPanelPRO() {
  const { selectedElementId, currentPage, applyConstraint, enableAutoLayout } = useAppStore();
  const [constraintMode, setConstraintMode] = useState<'constraints' | 'autolayout'>('constraints');

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

  return (
    <div className="p-4 space-y-4 max-h-full overflow-y-auto">
      {/* Header */}
      <div>
        <h3 className="text-xs font-semibold text-[#999] uppercase mb-3">Constraints & Layout</h3>
        <p className="text-[9px] text-[#666] mb-3">
          {selectedElement ? `Editing: ${selectedElement.name}` : 'Select an element to configure'}
        </p>
      </div>

      {!selectedElement && (
        <div className="p-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-[#666] text-center py-8">
          No element selected
        </div>
      )}

      {selectedElement && (
        <>
          {/* Tab Selection */}
          <div className="flex gap-1 border-b border-[#2a2a2a]">
            <button
              onClick={() => setConstraintMode('constraints')}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                constraintMode === 'constraints'
                  ? 'border-[#0D99FF] text-[#0D99FF]'
                  : 'border-transparent text-[#999] hover:text-white'
              }`}
            >
              Constraints
            </button>
            <button
              onClick={() => setConstraintMode('autolayout')}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                constraintMode === 'autolayout'
                  ? 'border-[#0D99FF] text-[#0D99FF]'
                  : 'border-transparent text-[#999] hover:text-white'
              }`}
            >
              Auto Layout
            </button>
          </div>

          {/* Constraints Mode */}
          {constraintMode === 'constraints' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-medium text-white mb-2">Pinning</h4>
                <p className="text-[9px] text-[#666] mb-3">
                  Fix element position relative to parent edges
                </p>

                {/* Horizontal Constraints */}
                <div className="mb-4">
                  <label className="text-[9px] text-[#999] block mb-2">Horizontal Fix</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'left', label: '← Left' },
                      { value: 'center', label: '↔ Center' },
                      { value: 'right', label: 'Right →' },
                      { value: 'stretch', label: '⟷ Stretch', span: true },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          applyConstraint(selectedElementId, {
                            ...selectedElement.constraints,
                            horizontalFix: option.value,
                          })
                        }
                        className={`px-2 py-1 rounded text-[9px] transition-colors ${
                          selectedElement.constraints?.horizontalFix === option.value
                            ? 'bg-[#0D99FF] text-white'
                            : 'bg-[#1e1e1e] text-[#999] hover:text-white hover:bg-[#2a2a2a]'
                        } ${option.span ? 'col-span-3' : ''}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vertical Constraints */}
                <div>
                  <label className="text-[9px] text-[#999] block mb-2">Vertical Fix</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'top', label: '↑ Top' },
                      { value: 'center', label: '↕ Center' },
                      { value: 'bottom', label: 'Bottom ↓' },
                      { value: 'stretch', label: '⟰ Stretch', span: true },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          applyConstraint(selectedElementId, {
                            ...selectedElement.constraints,
                            verticalFix: option.value,
                          })
                        }
                        className={`px-2 py-1 rounded text-[9px] transition-colors ${
                          selectedElement.constraints?.verticalFix === option.value
                            ? 'bg-[#0D99FF] text-white'
                            : 'bg-[#1e1e1e] text-[#999] hover:text-white hover:bg-[#2a2a2a]'
                        } ${option.span ? 'col-span-3' : ''}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Distance from edges */}
              <div className="border-t border-[#2a2a2a] pt-4">
                <h4 className="text-xs font-medium text-white mb-3">Distance from Edges</h4>
                <div className="space-y-2">
                  {[
                    { key: 'left', label: 'Left (px)' },
                    { key: 'right', label: 'Right (px)' },
                    { key: 'top', label: 'Top (px)' },
                    { key: 'bottom', label: 'Bottom (px)' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="text-[9px] text-[#999] block mb-1">{field.label}</label>
                      <input
                        type="number"
                        value={selectedElement.constraints?.[field.key as keyof any] || ''}
                        onChange={(e) =>
                          applyConstraint(selectedElementId, {
                            ...selectedElement.constraints,
                            [field.key]: e.target.value ? parseInt(e.target.value) : 'auto',
                          })
                        }
                        placeholder="auto"
                        className="w-full px-2 py-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-white focus:border-[#0D99FF] focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Auto Layout Mode */}
          {constraintMode === 'autolayout' && (
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-xs text-white mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedElement.autoLayout?.enabled || false}
                    onChange={(e) =>
                      enableAutoLayout(selectedElementId, {
                        ...selectedElement.autoLayout,
                        enabled: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border border-[#2a2a2a] cursor-pointer"
                  />
                  Enable Auto Layout
                </label>
              </div>

              {selectedElement.autoLayout?.enabled && (
                <>
                  {/* Layout Direction */}
                  <div>
                    <label className="text-[9px] text-[#999] block mb-2">Direction</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'horizontal', label: '→ Horizontal' },
                        { value: 'vertical', label: '↓ Vertical' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() =>
                            enableAutoLayout(selectedElementId, {
                              ...selectedElement.autoLayout,
                              mode: option.value,
                            })
                          }
                          className={`px-2 py-1 rounded text-[9px] transition-colors ${
                            selectedElement.autoLayout?.mode === option.value
                              ? 'bg-[#0D99FF] text-white'
                              : 'bg-[#1e1e1e] text-[#999] hover:text-white hover:bg-[#2a2a2a]'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gap */}
                  <div>
                    <label className="text-[9px] text-[#999] block mb-1">Gap (px)</label>
                    <input
                      type="number"
                      value={selectedElement.autoLayout?.gap || 0}
                      onChange={(e) =>
                        enableAutoLayout(selectedElementId, {
                          ...selectedElement.autoLayout,
                          gap: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-2 py-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-white focus:border-[#0D99FF] focus:outline-none"
                    />
                  </div>

                  {/* Padding */}
                  <div>
                    <label className="text-[9px] text-[#999] block mb-2">Padding (px)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'top', label: 'Top' },
                        { key: 'right', label: 'Right' },
                        { key: 'bottom', label: 'Bottom' },
                        { key: 'left', label: 'Left' },
                      ].map((field) => (
                        <input
                          key={field.key}
                          type="number"
                          placeholder={field.label}
                          value={selectedElement.autoLayout?.padding?.[field.key as keyof any] || 0}
                          onChange={(e) =>
                            enableAutoLayout(selectedElementId, {
                              ...selectedElement.autoLayout,
                              padding: {
                                ...selectedElement.autoLayout?.padding,
                                [field.key]: parseInt(e.target.value) || 0,
                              },
                            })
                          }
                          className="px-2 py-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-white focus:border-[#0D99FF] focus:outline-none"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Alignment */}
                  <div>
                    <label className="text-[9px] text-[#999] block mb-2">Item Alignment</label>
                    <select
                      value={selectedElement.autoLayout?.alignItems || 'flex-start'}
                      onChange={(e) =>
                        enableAutoLayout(selectedElementId, {
                          ...selectedElement.autoLayout,
                          alignItems: e.target.value,
                        })
                      }
                      className="w-full px-2 py-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-white focus:border-[#0D99FF] focus:outline-none"
                    >
                      <option value="flex-start">Start</option>
                      <option value="center">Center</option>
                      <option value="flex-end">End</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Info */}
          <div className="border-t border-[#2a2a2a] pt-4 text-[9px] text-[#666] space-y-2">
            <p>
              <strong>Constraints</strong> pin elements to edges. Responsive scaling respects constraints.
            </p>
            <p>
              <strong>Auto Layout</strong> arranges children with flexbox. Ideal for responsive grids.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
