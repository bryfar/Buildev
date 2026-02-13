'use client';

import React, { useState, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { Plus, Download, Trash2, Edit2, X, Copy, ZoomIn } from 'lucide-react';

type Asset = {
  id: string;
  name: string;
  src: string;
  category: 'image' | 'icon' | 'pattern' | 'component';
  tags: string[];
  createdAt: Date;
};

export default function AssetsManagerPRO() {
  const { addElement } = useAppStore();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activeCategory, setActiveCategory] = useState<Asset['category']>('image');
  const [showNewAssetDialog, setShowNewAssetDialog] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [newAsset, setNewAsset] = useState({
    name: '',
    category: 'image' as const,
    tags: '',
  });

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = String(e.target?.result || '');
        const asset: Asset = {
          id: Math.random().toString(36).slice(2, 9),
          name: file.name.replace(/\.[^/.]+$/, ''),
          src,
          category: activeCategory,
          tags: [],
          createdAt: new Date(),
        };
        setAssets(prev => [asset, ...prev]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleCreateAsset = () => {
    if (newAsset.name.trim()) {
      setShowNewAssetDialog(false);
      setNewAsset({ name: '', category: 'image', tags: '' });
    }
  };

  const handleUpdateAsset = (updatedAsset: Asset) => {
    setAssets(prev =>
      prev.map(a => a.id === updatedAsset.id ? updatedAsset : a)
    );
    setEditingAsset(null);
  };

  const handleDeleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    if (previewAsset?.id === id) setPreviewAsset(null);
  };

  const handleDuplicateAsset = (asset: Asset) => {
    const duplicated: Asset = {
      ...asset,
      id: Math.random().toString(36).slice(2, 9),
      name: `${asset.name} Copy`,
      createdAt: new Date(),
    };
    setAssets(prev => [duplicated, ...prev]);
  };

  const handleInsertToCanvas = (asset: Asset) => {
    const sizes: Record<Asset['category'], [number, number]> = {
      image: [320, 180],
      icon: [64, 64],
      pattern: [200, 200],
      component: [300, 200],
    };
    const [w, h] = sizes[asset.category];
    
    addElement({
      name: asset.name,
      type: 'image',
      x: 20,
      y: 20,
      width: w,
      height: h,
      backgroundColor: 'transparent',
      opacity: 1,
      responsive: {},
      src: asset.src,
    } as any);
  };

  const filteredAssets = assets.filter(a =>
    a.category === activeCategory &&
    (a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const categories: Array<{ value: Asset['category']; label: string; icon: string }> = [
    { value: 'image', label: 'Images', icon: '🖼' },
    { value: 'icon', label: 'Icons', icon: '⚡' },
    { value: 'pattern', label: 'Patterns', icon: '🎨' },
    { value: 'component', label: 'Components', icon: '🧩' },
  ];

  return (
    <div className="p-4 h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-[#999] uppercase">Asset Library</h3>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button
          onClick={handleUploadClick}
          className="px-2 py-1 bg-[#0D99FF] text-white text-xs rounded flex items-center gap-2 hover:bg-[#0a7acc] transition-colors"
        >
          <Plus size={14} /> Upload
        </button>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search assets..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#2a2a2a] rounded text-xs text-white placeholder-[#666] focus:border-[#0D99FF] focus:outline-none"
      />

      {/* Category Tabs */}
      <div className="flex gap-1 bg-[#0f0f0f] rounded p-1 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`flex items-center gap-1 px-3 py-1 rounded text-xs whitespace-nowrap transition-colors ${
              activeCategory === cat.value
                ? 'bg-[#0D99FF] text-white'
                : 'text-[#999] hover:text-white hover:bg-[#1e1e1e]'
            }`}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Assets Grid */}
      <div className="flex-1 overflow-y-auto">
        {filteredAssets.length === 0 ? (
          <div className="p-6 text-center text-[12px] text-[#666] flex flex-col items-center justify-center h-full gap-2">
            <div>📭 No {activeCategory} assets yet</div>
            <button
              onClick={handleUploadClick}
              className="text-[#0D99FF] hover:underline text-xs"
            >
              Upload to get started
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="group bg-[#1e1e1e] rounded border border-[#2a2a2a] hover:border-[#0D99FF] overflow-hidden transition-colors"
              >
                {/* Preview */}
                <div className="w-full h-32 bg-[#0f0f0f] flex items-center justify-center relative overflow-hidden">
                  <img
                    src={asset.src}
                    alt={asset.name}
                    className="max-w-full max-h-full object-contain"
                  />
                  <button
                    onClick={() => setPreviewAsset(asset)}
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ZoomIn size={12} className="text-white" />
                  </button>
                </div>

                {/* Info & Actions */}
                <div className="p-2 space-y-2">
                  <div>
                    <p className="text-xs text-white font-medium truncate">{asset.name}</p>
                    <p className="text-[10px] text-[#666]">
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleInsertToCanvas(asset)}
                      className="flex-1 text-[10px] px-2 py-1 bg-[#0D99FF] text-white rounded hover:bg-[#0a7acc] transition-colors"
                    >
                      Insert
                    </button>
                    <button
                      onClick={() => handleDuplicateAsset(asset)}
                      className="p-1 text-[#999] hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
                      title="Duplicate"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={() => setEditingAsset(asset)}
                      className="p-1 text-[#999] hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="p-1 text-[#999] hover:text-red-400 hover:bg-[#2a2a2a] rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#1e1e1e] rounded-lg border border-[#2a2a2a] max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
              <h4 className="text-sm font-medium text-white">{previewAsset.name}</h4>
              <button
                onClick={() => setPreviewAsset(null)}
                className="text-[#999] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-[#0f0f0f]">
              <img
                src={previewAsset.src}
                alt={previewAsset.name}
                className="max-w-full max-h-[60vh] object-contain"
              />
            </div>
            <div className="p-4 flex gap-2 border-t border-[#2a2a2a]">
              <button
                onClick={() => {
                  handleInsertToCanvas(previewAsset);
                  setPreviewAsset(null);
                }}
                className="flex-1 px-3 py-2 bg-[#0D99FF] text-white rounded text-xs font-medium hover:bg-[#0a7acc] transition-colors"
              >
                Insert to Canvas
              </button>
              <a
                href={previewAsset.src}
                download={previewAsset.name}
                className="px-3 py-2 bg-[#2a2a2a] text-white rounded text-xs font-medium hover:bg-[#333] transition-colors flex items-center gap-2"
              >
                <Download size={14} /> Download
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {editingAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg p-4 max-w-md w-full mx-4 space-y-4">
            <h4 className="text-sm font-medium text-white">Edit Asset</h4>

            <div className="space-y-2">
              <label className="text-xs text-[#999]">Name</label>
              <input
                type="text"
                value={editingAsset.name}
                onChange={(e) =>
                  setEditingAsset({ ...editingAsset, name: e.target.value })
                }
                className="w-full px-2 py-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-white focus:border-[#0D99FF] focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#999]">Tags (comma separated)</label>
              <input
                type="text"
                value={editingAsset.tags.join(', ')}
                onChange={(e) =>
                  setEditingAsset({
                    ...editingAsset,
                    tags: e.target.value.split(',').map(t => t.trim()),
                  })
                }
                className="w-full px-2 py-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-white focus:border-[#0D99FF] focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  handleUpdateAsset(editingAsset)
                }
                className="flex-1 px-3 py-2 bg-[#0D99FF] text-white rounded text-xs font-medium hover:bg-[#0a7acc] transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setEditingAsset(null)}
                className="flex-1 px-3 py-2 bg-[#2a2a2a] text-white rounded text-xs font-medium hover:bg-[#333] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
