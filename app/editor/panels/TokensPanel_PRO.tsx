'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Plus, Trash2, Edit2, X, Copy } from 'lucide-react';

type TokenCategory = 'colors' | 'typography' | 'spacing' | 'radius' | 'shadows' | 'opacity';

export default function TokensPanelPRO() {
  const { currentProject, createToken, updateToken } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<TokenCategory>('colors');
  const [showNewTokenDialog, setShowNewTokenDialog] = useState(false);
  const [editingToken, setEditingToken] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newToken, setNewToken] = useState({
    name: '',
    value: '#000000',
    description: '',
    fontSize: 16,
    fontFamily: 'Outfit',
    fontWeight: 400,
    lineHeight: 1.5,
  });

  const designSystem = currentProject?.designSystem;

  const getCategoryTokens = () => {
    const maps: Record<TokenCategory, keyof typeof designSystem> = {
      colors: 'colors',
      typography: 'typography',
      spacing: 'spacing',
      radius: 'borderRadius',
      shadows: 'shadows',
      opacity: 'opacity',
    };
    const tokenData = designSystem ? designSystem[maps[activeCategory]] || [] : [];
    return Array.isArray(tokenData) ? tokenData : [];
  };

  const tokens = getCategoryTokens().filter((t: any) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateToken = () => {
    if (newToken.name.trim()) {
      createToken({
        ...newToken,
        category: activeCategory,
      });
      setNewToken({
        name: '',
        value: '#000000',
        description: '',
        fontSize: 16,
        fontFamily: 'Outfit',
        fontWeight: 400,
        lineHeight: 1.5,
      });
      setShowNewTokenDialog(false);
    }
  };

  const handleUpdateToken = (token: any) => {
    if (editingToken?.id === token.id) {
      updateToken(token.id, editingToken);
      setEditingToken(null);
    }
  };

  const handleDeleteToken = (tokenId: string) => {
    // Delete would need to be implemented in store
    // For now, update with empty value
  };

  const handleDuplicateToken = (token: any) => {
    createToken({
      ...token,
      name: `${token.name} Copy`,
      id: undefined,
    });
  };

  const categoryConfig: Record<TokenCategory, { label: string; icon: string }> = {
    colors: { label: 'Colors', icon: '🎨' },
    typography: { label: 'Typography', icon: '✏️' },
    spacing: { label: 'Spacing', icon: '📐' },
    radius: { label: 'Radius', icon: '⌬' },
    shadows: { label: 'Shadows', icon: '✨' },
    opacity: { label: 'Opacity', icon: '👁' },
  };

  return (
    <div className="p-4 h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-[#999] uppercase">Design Tokens</h3>
        <button
          onClick={() => setShowNewTokenDialog(true)}
          className="p-1 rounded hover:bg-[#2a2a2a] text-[#0D99FF] transition-colors"
          title="Create new token"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search tokens..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#2a2a2a] rounded text-xs text-white placeholder-[#666] focus:border-[#0D99FF] focus:outline-none"
      />

      {/* Category Tabs */}
      <div className="flex gap-1 bg-[#0f0f0f] rounded p-1 overflow-x-auto">
        {(Object.entries(categoryConfig) as [TokenCategory, typeof categoryConfig[TokenCategory]][]).map(
          ([category, { label, icon }]) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex items-center gap-1 px-3 py-1 rounded text-xs whitespace-nowrap transition-colors ${activeCategory === category
                ? 'bg-[#0D99FF] text-white'
                : 'text-[#999] hover:text-white hover:bg-[#1e1e1e]'
                }`}
            >
              <span>{icon}</span>
              {label}
            </button>
          )
        )}
      </div>

      {/* New Token Dialog */}
      {showNewTokenDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg p-4 max-w-md w-full mx-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-white">Create Token</h4>
              <button
                onClick={() => setShowNewTokenDialog(false)}
                className="text-[#999] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-xs text-[#999]">Name *</label>
                <input
                  type="text"
                  placeholder="e.g., primary-color"
                  value={newToken.name}
                  onChange={(e) =>
                    setNewToken({ ...newToken, name: e.target.value })
                  }
                  className="w-full px-2 py-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-white focus:border-[#0D99FF] focus:outline-none"
                />
              </div>

              {activeCategory === 'colors' && (
                <div className="space-y-2">
                  <label className="text-xs text-[#999]">Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={newToken.value}
                      onChange={(e) =>
                        setNewToken({ ...newToken, value: e.target.value })
                      }
                      className="w-12 h-8 cursor-pointer rounded border border-[#2a2a2a]"
                    />
                    <input
                      type="text"
                      placeholder="#000000"
                      value={newToken.value}
                      onChange={(e) =>
                        setNewToken({ ...newToken, value: e.target.value })
                      }
                      className="flex-1 px-2 py-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-white font-mono focus:border-[#0D99FF] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {activeCategory === 'typography' && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs text-[#999]">Font Family</label>
                    <select
                      value={newToken.fontFamily}
                      onChange={(e) =>
                        setNewToken({
                          ...newToken,
                          fontFamily: e.target.value,
                        })
                      }
                      className="w-full px-2 py-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-white focus:border-[#0D99FF] focus:outline-none"
                    >
                      <option>Outfit</option>
                      <option>Roboto</option>
                      <option>Open Sans</option>
                      <option>Poppins</option>
                      <option>Ubuntu</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <label className="text-xs text-[#999]">Size (px)</label>
                      <input
                        type="number"
                        value={newToken.fontSize}
                        onChange={(e) =>
                          setNewToken({
                            ...newToken,
                            fontSize: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-2 py-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-white focus:border-[#0D99FF] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-[#999]">Weight</label>
                      <select
                        value={newToken.fontWeight}
                        onChange={(e) =>
                          setNewToken({
                            ...newToken,
                            fontWeight: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-2 py-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-white focus:border-[#0D99FF] focus:outline-none"
                      >
                        <option value={400}>Regular</option>
                        <option value={500}>Medium</option>
                        <option value={600}>Semibold</option>
                        <option value={700}>Bold</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-[#999]">Line Height</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newToken.lineHeight}
                      onChange={(e) =>
                        setNewToken({
                          ...newToken,
                          lineHeight: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-2 py-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-white focus:border-[#0D99FF] focus:outline-none"
                    />
                  </div>
                </>
              )}

              {activeCategory === 'spacing' && (
                <div className="space-y-2">
                  <label className="text-xs text-[#999]">Value</label>
                  <input
                    type="text"
                    placeholder="e.g., 8px, 1rem"
                    value={newToken.value}
                    onChange={(e) =>
                      setNewToken({ ...newToken, value: e.target.value })
                    }
                    className="w-full px-2 py-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-white focus:border-[#0D99FF] focus:outline-none"
                  />
                </div>
              )}

              {activeCategory === 'radius' && (
                <div className="space-y-2">
                  <label className="text-xs text-[#999]">Border Radius</label>
                  <input
                    type="text"
                    placeholder="e.g., 8px"
                    value={newToken.value}
                    onChange={(e) =>
                      setNewToken({ ...newToken, value: e.target.value })
                    }
                    className="w-full px-2 py-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-white focus:border-[#0D99FF] focus:outline-none"
                  />
                </div>
              )}

              {activeCategory === 'shadows' && (
                <div className="space-y-2">
                  <label className="text-xs text-[#999]">Shadow</label>
                  <input
                    type="text"
                    placeholder="e.g., 0 4px 6px rgba(0,0,0,0.1)"
                    value={newToken.value}
                    onChange={(e) =>
                      setNewToken({ ...newToken, value: e.target.value })
                    }
                    className="w-full px-2 py-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-white focus:border-[#0D99FF] focus:outline-none"
                  />
                </div>
              )}

              {activeCategory === 'opacity' && (
                <div className="space-y-2">
                  <label className="text-xs text-[#999]">Opacity</label>
                  <input
                    type="text"
                    placeholder="e.g., 50%"
                    value={newToken.value}
                    onChange={(e) =>
                      setNewToken({ ...newToken, value: e.target.value })
                    }
                    className="w-full px-2 py-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-white focus:border-[#0D99FF] focus:outline-none"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs text-[#999]">Description</label>
                <textarea
                  placeholder="Describe this token..."
                  value={newToken.description}
                  onChange={(e) =>
                    setNewToken({ ...newToken, description: e.target.value })
                  }
                  className="w-full px-2 py-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-white focus:border-[#0D99FF] focus:outline-none resize-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-2 border-t border-[#2a2a2a] pt-4">
              <button
                onClick={handleCreateToken}
                className="flex-1 px-3 py-2 bg-[#0D99FF] text-white rounded text-xs font-medium hover:bg-[#0a7acc] transition-colors"
              >
                Create Token
              </button>
              <button
                onClick={() => setShowNewTokenDialog(false)}
                className="flex-1 px-3 py-2 bg-[#2a2a2a] text-white rounded text-xs font-medium hover:bg-[#333] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tokens List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {tokens.length === 0 ? (
          <div className="text-xs text-[#666] py-8 text-center flex flex-col items-center justify-center h-full gap-2">
            <div>📭 No {activeCategory} tokens yet</div>
            <button
              onClick={() => setShowNewTokenDialog(true)}
              className="text-[#0D99FF] hover:underline text-xs"
            >
              Create one now
            </button>
          </div>
        ) : (
          tokens.map((token: any) => (
            <div
              key={token.id}
              className="p-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded hover:border-[#0D99FF] transition-colors group"
            >
              <div className="flex items-start gap-3">
                {/* Token Preview */}
                {activeCategory === 'colors' && (
                  <div
                    className="w-8 h-8 rounded border border-[#2a2a2a] flex-shrink-0"
                    style={{ backgroundColor: token.value }}
                    title={token.value}
                  />
                )}
                {activeCategory === 'typography' && (
                  <div className="w-8 h-8 flex items-center justify-center bg-[#0f0f0f] rounded border border-[#2a2a2a] flex-shrink-0">
                    <span style={{ fontSize: '10px', fontWeight: token.fontWeight }}>Aa</span>
                  </div>
                )}
                {activeCategory === 'shadows' && (
                  <div
                    className="w-8 h-8 rounded border border-[#2a2a2a] bg-white flex-shrink-0"
                    style={{ boxShadow: token.value }}
                  />
                )}
                {(activeCategory === 'spacing' || activeCategory === 'radius' || activeCategory === 'opacity') && (
                  <div className="w-8 h-8 flex items-center justify-center bg-[#0D99FF]/20 rounded border border-[#0D99FF]/50 flex-shrink-0 text-[10px] font-mono text-[#0D99FF] flex-shrink-0">
                    {token.value}
                  </div>
                )}

                {/* Token Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium text-white truncate">
                    ${token.name}
                  </h4>
                  <p className="text-[9px] text-[#666] font-mono truncate">
                    {token.value}
                  </p>
                  {token.description && (
                    <p className="text-[9px] text-[#666] mt-1">{token.description}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => handleDuplicateToken(token)}
                    className="p-1 text-[#999] hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
                    title="Duplicate"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={() => setEditingToken(token)}
                    className="p-1 text-[#999] hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => handleDeleteToken(token.id)}
                    className="p-1 text-[#999] hover:text-red-400 hover:bg-[#2a2a2a] rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Footer */}
      <div className="border-t border-[#2a2a2a] pt-3 text-[9px] text-[#666] space-y-2">
        <p>
          <strong>Design Tokens</strong> provide consistency across your design system.
        </p>
        <p>
          Use these values in components via <code className="bg-[#0f0f0f] px-1 py-0.5 rounded">$token-name</code>.
        </p>
      </div>
    </div>
  );
}
