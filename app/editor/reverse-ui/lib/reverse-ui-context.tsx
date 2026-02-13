'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type ReverseUIState = {
    isScanning: boolean;
    scanProgress: number; // 0-100
    scannedImage: string | null;
    scanResult: any | null; // Placeholder for AST
};

type ReverseUIContextType = {
    state: ReverseUIState;
    startScan: (imageFile: File) => Promise<void>;
    resetScan: () => void;
};

const ReverseUIContext = createContext<ReverseUIContextType | undefined>(undefined);

export function ReverseUIProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<ReverseUIState>({
        isScanning: false,
        scanProgress: 0,
        scannedImage: null,
        scanResult: null,
    });

    const startScan = async (imageFile: File) => {
        const imageUrl = URL.createObjectURL(imageFile);

        // Convert to Base64
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);

        reader.onload = async () => {
            const base64 = reader.result as string;

            setState(prev => ({ ...prev, isScanning: true, scanProgress: 10, scannedImage: imageUrl }));

            try {
                setState(prev => ({ ...prev, scanProgress: 20 }));

                const response = await fetch('/api/reverse-ui', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: base64 }), // Send Base64
                });

                if (!response.ok) throw new Error('Failed to analyze image');

                const data = await response.json();

                if (data.elements) {
                    setState(prev => ({
                        ...prev,
                        scanProgress: 100,
                        isScanning: false,
                        scanResult: data.elements
                    }));
                } else {
                    throw new Error('No elements found');
                }
            } catch (error) {
                console.error("Scan failed", error);
                setState(prev => ({ ...prev, isScanning: false, scanProgress: 0 }));
            }
        };
    };

    const resetScan = () => {
        setState({
            isScanning: false,
            scanProgress: 0,
            scannedImage: null,
            scanResult: null,
        });
    };

    return (
        <ReverseUIContext.Provider value={{ state, startScan, resetScan }}>
            {children}
        </ReverseUIContext.Provider>
    );
}

export function useReverseUI() {
    const context = useContext(ReverseUIContext);
    if (context === undefined) {
        throw new Error('useReverseUI must be used within a ReverseUIProvider');
    }
    return context;
}
