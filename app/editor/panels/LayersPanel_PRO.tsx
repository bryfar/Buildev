'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { ChevronDown, ChevronRight, Eye, EyeOff, Lock, Unlock, Copy, Trash2 } from 'lucide-react';
import { SiteElement } from '@/lib/types';

interface LayerItemProps {
  element: SiteElement;
  level: number;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: (id: string, multiSelect?: boolean) => void;
  onToggleExpand: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}

function LayerItem({
  element,
  level,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onToggleLock,
  onRename,
}: LayerItemProps) {
  const hasChildren = element.children && element.children.length > 0;
  const [isRenaming, setIsRenaming] = useState(false);
  const [editName, setEditName] = useState(element.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRenameSubmit = () => {
    if (editName.trim() && editName !== element.name) {
      onRename(element.id, editName.trim());
    } else {
      setEditName(element.name);
    }
    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameSubmit();
    if (e.key === 'Escape') {
      setEditName(element.name);
      setIsRenaming(false);
    }
  };

  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation();
          onSelect(element.id, e.ctrlKey || e.metaKey);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setIsRenaming(true);
        }}
        style={{ paddingLeft: `${level * 16}px` }}
        className={` 
          flex items-center gap-2 px-2 py-1.5 text-xs cursor-pointer
          ${isSelected ? 'bg-[#0D99FF] text-white' : 'text-[#ddd] hover:bg-[#2a2a2a]'}
          transition-colors border-l-2 
          ${isSelected ? 'border-[#0D99FF]' : 'border-transparent'}
        `}
      >
        {/* Expand/Collapse */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(element.id);
            }}
            className="p-0.5 hover:bg-[#1e1e1e] rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-5" />}

        {/* Element icon */}
        <div className="w-4 h-4 bg-[#0D99FF] rounded opacity-50" />

        {/* Name / Rename Input */}
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-[#1e1e1e] text-white border border-[#0D99FF] rounded px-1 py-0.5 outline-none min-w-0"
          />
        ) : (
          <span className="flex-1 truncate select-none">{element.name}</span>
        )}

        {/* Visibility Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility(element.id);
          }}
          className="p-0.5 hover:bg-[#1e1e1e] rounded transition-colors opacity-60 hover:opacity-100"
        >
          {element.isVisible !== false ? (
            <Eye size={12} />
          ) : (
            <EyeOff size={12} />
          )}
        </button>

        {/* Lock Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock(element.id);
          }}
          className="p-0.5 hover:bg-[#1e1e1e] rounded transition-colors opacity-60 hover:opacity-100"
        >
          {(element as any).locked ? (
            <Lock size={12} />
          ) : (
            <Unlock size={12} />
          )}
        </button>

        {/* Duplicate */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(element.id);
          }}
          className="p-0.5 hover:bg-[#1e1e1e] rounded transition-colors opacity-60 hover:opacity-100"
          title="Duplicate"
        >
          <Copy size={12} />
        </button>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(element.id);
          }}
          className="p-0.5 hover:bg-red-500/20 rounded transition-colors opacity-60 hover:opacity-100"
          title="Delete"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <LayersList
          elements={element.children}
          level={level + 1}
          onSelect={onSelect}
          onToggleExpand={onToggleExpand}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onToggleVisibility={onToggleVisibility}
          onToggleLock={onToggleLock}
          onRename={onRename}
        />
      )}
    </>
  );
}

interface LayersListProps {
  elements: SiteElement[];
  level: number;
  onSelect: (id: string, multiSelect?: boolean) => void;
  onToggleExpand: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}

function LayersList({
  elements,
  level,
  onSelect,
  onToggleExpand,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onToggleLock,
  onRename,
}: LayersListProps) {
  const { selectedElementId } = useAppStore();

  return (
    <>
      {elements.map((element) => (
        <LayerItem
          key={element.id}
          element={element}
          level={level}
          isSelected={selectedElementId === element.id}
          isExpanded={true}
          onSelect={onSelect}
          onToggleExpand={onToggleExpand}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onToggleVisibility={onToggleVisibility}
          onToggleLock={onToggleLock}
          onRename={onRename}
        />
      ))}
    </>
  );
}

export default function LayersPanelPRO() {
  const {
    currentPage,
    selectedElementId,
    selectElement,
    deleteElement,
    updateElement,
    addElement,
  } = useAppStore();

  if (!currentPage) {
    return (
      <div className="w-full h-full bg-[#0f0f0f] border-l border-[#2a2a2a] p-4 flex items-center justify-center">
        <p className="text-xs text-[#666]">No page loaded</p>
      </div>
    );
  }

  const handleDuplicate = (elementId: string) => {
    const element = currentPage.elements.find((el) => el.id === elementId);
    if (element) {
      const newElement = {
        ...element,
        x: element.x + 20,
        y: element.y + 20,
        name: `${element.name} copy`,
      };
      addElement(newElement);
    }
  };

  const handleToggleVisibility = (elementId: string) => {
    const element = currentPage.elements.find((el) => el.id === elementId);
    if (element) {
      updateElement(elementId, { isVisible: element.isVisible === false ? true : false });
    }
  };

  const handleToggleLock = (elementId: string) => {
    const element = currentPage.elements.find((el) => el.id === elementId);
    if (element) {
      updateElement(elementId, { ...(element as any), locked: !(element as any).locked });
    }
  };

  const handleRename = (elementId: string, newName: string) => {
    updateElement(elementId, { name: newName });
  };

  return (
    <div className="w-full h-full bg-[#0f0f0f] border-l border-[#2a2a2a] overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="sticky top-0 p-3 border-b border-[#2a2a2a] bg-[#1e1e1e]">
        <h3 className="text-xs font-semibold text-[#999] uppercase">Layers</h3>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto">
        {currentPage.elements.length === 0 ? (
          <div className="p-4 text-xs text-[#666]">No elements on this page</div>
        ) : (
          <LayersList
            elements={currentPage.elements}
            level={0}
            onSelect={(id, multiSelect) => selectElement(id)}
            onToggleExpand={() => { }}
            onDelete={deleteElement}
            onDuplicate={handleDuplicate}
            onToggleVisibility={handleToggleVisibility}
            onToggleLock={handleToggleLock}
            onRename={handleRename}
          />
        )}
      </div>
    </div>
  );
}
