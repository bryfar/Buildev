'use client';

import { useAppStore } from '@/lib/store';
import { ChevronRight, ChevronDown, Box, Type, Image, Circle, Square, Folder, File } from 'lucide-react';
import { useState } from 'react';
import { SiteElement } from '@/lib/types';

interface TreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder' | 'component';
  elementId?: string;
  children?: TreeNode[];
  elementType?: string;
}

interface FileTreeProps {
  onSelectComponent?: (elementId: string, componentName: string) => void;
}

interface TreeItemProps {
  node: TreeNode;
  level: number;
  onSelectComponent: (elementId: string, componentName: string) => void;
  selectedId?: string;
  selectedElementId?: string | null;
}

function getElementIcon(type: string) {
  switch (type) {
    case 'text':
      return <Type size={14} />;
    case 'image':
      return <Image size={14} />;
    case 'circle':
      return <Circle size={14} />;
    case 'rectangle':
      return <Square size={14} />;
    case 'frame':
      return <Box size={14} />;
    default:
      return <Box size={14} />;
  }
}

function TreeItem({ node, level, onSelectComponent, selectedId, selectedElementId }: TreeItemProps) {
  const [isOpen, setIsOpen] = useState(level < 2); // Expand first 2 levels by default
  const hasChildren = node.children && node.children.length > 0;
  const isComponent = node.type === 'component';
  const isSelected = selectedElementId === node.elementId;

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
    if (isComponent && node.elementId) {
      onSelectComponent(node.elementId, node.name);
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer select-none transition-colors ${
          isSelected
            ? 'bg-[#0D99FF] text-white'
            : 'text-[#ccc] hover:bg-[#2a2a2a]'
        }`}
        style={{ paddingLeft: `${level * 16}px` }}
      >
        {/* Expand/Collapse */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="flex-shrink-0 p-0.5 hover:bg-white/10 rounded"
          >
            {isOpen ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>
        ) : (
          <div className="w-4" />
        )}

        {/* Icon */}
        <div className="flex-shrink-0">
          {isComponent ? (
            getElementIcon(node.elementType || 'frame')
          ) : node.type === 'folder' ? (
            <Folder size={14} className="text-[#FFB84D]" />
          ) : (
            <File size={14} className="text-[#0D99FF]" />
          )}
        </div>

        {/* Name */}
        <span className="text-sm truncate">{node.name}</span>
      </div>

      {/* Children */}
      {hasChildren && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              level={level + 1}
              onSelectComponent={onSelectComponent}
              selectedElementId={selectedElementId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Convertir elementos a nodos del árbol
function elementsToTreeNodes(elements: SiteElement[]): TreeNode[] {
  return elements.map((element) => {
    const hasChildren = element.children && element.children.length > 0;

    return {
      id: element.id,
      name: element.name,
      type: 'component',
      elementId: element.id,
      elementType: element.type,
      children: hasChildren ? elementsToTreeNodes(element.children!) : undefined,
    };
  });
}

export default function FileTree({ onSelectComponent = () => {} }: FileTreeProps) {
  const { currentProject, currentPage, selectedElementId } = useAppStore();

  if (!currentProject || !currentPage) {
    return (
      <div className="h-full bg-[#1a1a1a] border-r border-[#2a2a2a] flex items-center justify-center">
        <p className="text-xs text-[#666]">No project loaded</p>
      </div>
    );
  }

  const treeNodes: TreeNode[] = [
    {
      id: 'root-src',
      name: 'src',
      type: 'folder',
      children: [
        {
          id: 'root-components',
          name: 'components',
          type: 'folder',
          children: elementsToTreeNodes(currentPage.elements),
        },
        {
          id: 'root-pages',
          name: 'pages',
          type: 'folder',
          children: [
            {
              id: currentPage.id,
              name: `${currentPage.name}.tsx`,
              type: 'file',
            },
          ],
        },
        {
          id: 'root-styles',
          name: 'styles',
          type: 'folder',
          children: [
            { id: 'styles-global', name: 'globals.css', type: 'file' },
            { id: 'styles-module', name: 'module.css', type: 'file' },
          ],
        },
      ],
    },
    {
      id: 'root-package',
      name: 'package.json',
      type: 'file',
    },
    {
      id: 'root-config',
      name: `${currentProject.techStack}.config.ts`,
      type: 'file',
    },
  ];

  return (
    <div className="h-full bg-[#1a1a1a] border-r border-[#2a2a2a] overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="h-10 border-b border-[#2a2a2a] flex items-center px-4 sticky top-0 bg-[#0f0f0f]">
        <h3 className="text-xs font-semibold text-[#999] uppercase tracking-wider">
          Components
        </h3>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto pt-2">
        {treeNodes.map((node) => (
          <TreeItem
            key={node.id}
            node={node}
            level={0}
            onSelectComponent={onSelectComponent}
            selectedElementId={selectedElementId}
          />
        ))}
      </div>
    </div>
  );
}
