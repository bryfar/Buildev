'use client';

import React, { useCallback } from 'react';
import { useReverseUI } from './lib/reverse-ui-context';
import { useAppStore } from '@/lib/store';
import { UploadCloud, CheckCircle, Loader2, X, Plus } from 'lucide-react';

interface ReverseUiViewProps {
    onComplete?: () => void;
}

export default function ReverseUiView({ onComplete }: ReverseUiViewProps) {
    const { state, startScan, resetScan } = useReverseUI();
    const { importElements } = useAppStore();

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                startScan(file);
            }
        }
    }, [startScan]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    if (state.scannedImage) {
        return (
            <div className="flex flex-col h-full w-full bg-[#0a0a0a] relative">
                <div className="absolute top-4 right-4 z-50">
                    <button onClick={resetScan} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="relative max-w-4xl w-full aspect-video bg-[#1e1e1e] rounded-xl overflow-hidden border border-[#333] shadow-2xl">
                        {/* Original Image */}
                        <img
                            src={state.scannedImage}
                            alt="Scanned UI"
                            className="w-full h-full object-contain opacity-50"
                        />

                        {/* Scanning Overlay */}
                        {state.isScanning && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                                <h3 className="text-xl font-medium text-white mb-2">Analyzing UI Structure...</h3>
                                <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-300 ease-out"
                                        style={{ width: `${state.scanProgress}%` }}
                                    />
                                </div>
                                <p className="text-sm text-gray-400 mt-2">{state.scanProgress}% Complete</p>
                            </div>
                        )}

                        {!state.isScanning && state.scanResult && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/50 backdrop-blur-sm">
                                <div className="pointer-events-auto bg-[#1e1e1e] border border-[#333] p-6 rounded-xl shadow-2xl flex flex-col items-center gap-4 max-w-sm text-center">
                                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                                        <CheckCircle className="text-green-500 w-8 h-8" />
                                    </div>
                                    <div>
                                        <h4 className="text-white text-lg font-semibold">Analysis Complete</h4>
                                        <p className="text-[#999] text-sm mt-1">
                                            Successfully identified {Array.isArray(state.scanResult) ? state.scanResult.length : 1} elements.
                                        </p>
                                    </div>
                                    <div className="flex gap-3 w-full mt-2">
                                        <button
                                            onClick={resetScan}
                                            className="flex-1 px-4 py-2 bg-[#2a2a2a] hover:bg-[#333] text-white rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Try Again
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (state.scanResult) {
                                                    importElements(state.scanResult);
                                                    onComplete?.();
                                                }
                                            }}
                                            className="flex-1 px-4 py-2 bg-[#0D99FF] hover:bg-[#0088EE] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Plus size={16} />
                                            Add to Canvas
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex flex-col h-full w-full items-center justify-center bg-[#0a0a0a] border-2 border-dashed border-[#333] m-4 rounded-xl hover:border-[#444] transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            <div className="bg-[#1e1e1e] p-6 rounded-full mb-6 shadow-xl shadow-black/50">
                <UploadCloud size={48} className="text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Reverse UI Engineering</h2>
            <p className="text-gray-400 text-center max-w-md mb-8">
                Drag and drop a screenshot here to instantly convert it into <br />
                <span className="text-blue-400 font-medium">Editable Vectors & Tailwind Code</span>
            </p>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20">
                Choose Screenshot
            </button>
        </div>
    );
}
