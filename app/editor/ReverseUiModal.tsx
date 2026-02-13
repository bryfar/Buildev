'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Wand2, Loader2, Image as ImageIcon } from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface ReverseUiModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ReverseUiModal({ isOpen, onClose }: ReverseUiModalProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { importElements } = useAppStore();

    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (!isOpen) return;

            const items = e.clipboardData?.items;
            if (!items) return;

            for (const item of items) {
                if (item.type.indexOf('image') !== -1) {
                    const blob = item.getAsFile();
                    if (blob) {
                        handleFile(blob);
                    }
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file.');
            return;
        }

        setError(null);
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleProcess = async () => {
        if (!preview) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/reverse-ui', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: preview }),
            });

            if (!response.ok) {
                throw new Error('Failed to process image');
            }

            const data = await response.json();

            if (data.elements) {
                importElements(data.elements);
                onClose();
                setPreview(null);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to analyze image. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#333]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                            <Wand2 size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Reverse UI Engineering</h3>
                            <p className="text-xs text-[#999]">Screenshot to Editable Canvas</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-[#666] hover:text-white rounded-full hover:bg-[#333] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {!preview ? (
                        <div
                            className={`
                border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center transition-colors
                ${isDragOver ? 'border-[#0D99FF] bg-[#0D99FF]/10' : 'border-[#333] hover:border-[#666] bg-[#0f0f0f]'}
              `}
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={onDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                            />

                            <div className="w-16 h-16 bg-[#1e1e1e] rounded-full flex items-center justify-center mb-4 text-[#666]">
                                <Upload size={32} />
                            </div>
                            <h4 className="text-white font-medium mb-2">Click or Paste Screenshot</h4>
                            <p className="text-sm text-[#666] max-w-xs">
                                Drag & drop an image, paste from clipboard (Ctrl+V), or click to upload.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative rounded-lg overflow-hidden border border-[#333] bg-[#0a0a0a] aspect-video flex items-center justify-center">
                                <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain" />
                                <button
                                    onClick={() => setPreview(null)}
                                    className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-red-500/80 transition-colors backdrop-blur-sm"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            <div className="bg-[#2a2a2a] rounded-lg p-3 text-sm text-[#ccc] flex gap-3 items-start">
                                <ImageIcon size={16} className="mt-0.5 text-[#0D99FF]" />
                                <p>
                                    Our AI will analyze this image and reconstruct the layout, text, and styles as editable elements on your canvas.
                                </p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[#333] bg-[#0f0f0f] flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-[#ccc] hover:text-white hover:bg-[#2a2a2a] rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleProcess}
                        disabled={!preview || isLoading}
                        className={`
              px-6 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2 transition-all
              ${!preview || isLoading
                                ? 'bg-[#333] text-[#666] cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]'
                            }
            `}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Analyzing Magic...
                            </>
                        ) : (
                            <>
                                <Wand2 size={16} />
                                Generate Canvas
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
