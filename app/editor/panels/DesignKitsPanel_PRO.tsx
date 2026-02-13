'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Layout, Type, CreditCard, MousePointerClick, Image as ImageIcon, Box } from 'lucide-react';
import { SiteElement } from '@/lib/types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const UI_KITS = [
    {
        category: 'Layout',
        icon: Layout,
        items: [
            {
                name: 'Hero Section',
                description: 'Centered hero with title, text, and CTA.',
                getElement: (): SiteElement => ({
                    id: generateId(),
                    name: 'Hero Section',
                    type: 'frame',
                    x: 0,
                    y: 0,
                    width: 1440,
                    height: 600,
                    backgroundColor: '#ffffff',
                    opacity: 1,
                    autoLayout: { enabled: true, mode: 'vertical', gap: 24, padding: { top: 80, right: 20, bottom: 80, left: 20 }, alignItems: 'center', justifyContent: 'center' },
                    responsive: {},
                    children: [
                        {
                            id: generateId(),
                            name: 'Badge',
                            type: 'text',
                            x: 0, y: 0, width: 200, height: 24,
                            opacity: 1,
                            textContent: 'New Feature',
                            fontSize: 14,
                            fontWeight: 600,
                            textColor: '#4F46E5',
                            backgroundColor: '#EEF2FF',
                            borderRadius: 100,
                            responsive: {},
                            autoLayout: { enabled: false, mode: 'horizontal', gap: 0, padding: { top: 4, right: 12, bottom: 4, left: 12 }, alignItems: 'center', justifyContent: 'center' }
                        },
                        {
                            id: generateId(),
                            name: 'Heading',
                            type: 'text',
                            x: 0, y: 0, width: 800, height: 60,
                            opacity: 1,
                            textContent: 'Build faster with AI',
                            fontSize: 48,
                            fontWeight: 800,
                            textColor: '#111827',
                            textAlign: 'center',
                            responsive: {}
                        },
                        {
                            id: generateId(),
                            name: 'Subtext',
                            type: 'text',
                            x: 0, y: 0, width: 600, height: 48,
                            opacity: 1,
                            textContent: 'Create stunning interfaces in minutes using our advanced visual builder and code export tools.',
                            fontSize: 18,
                            fontWeight: 400,
                            textColor: '#6B7280',
                            textAlign: 'center',
                            responsive: {}
                        },
                        {
                            id: generateId(),
                            name: 'CTA Button',
                            type: 'frame',
                            x: 0, y: 0, width: 160, height: 48,
                            opacity: 1,
                            backgroundColor: '#4F46E5',
                            borderRadius: 8,
                            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)',
                            autoLayout: { enabled: true, mode: 'horizontal', gap: 8, padding: { top: 0, right: 0, bottom: 0, left: 0 }, alignItems: 'center', justifyContent: 'center' },
                            responsive: {},
                            children: [
                                {
                                    id: generateId(),
                                    name: 'Button Text',
                                    type: 'text',
                                    x: 0, y: 0, width: 100, height: 24,
                                    opacity: 1,
                                    textContent: 'Get Started',
                                    fontSize: 16,
                                    fontWeight: 600,
                                    textColor: '#ffffff',
                                    textAlign: 'center',
                                    responsive: {}
                                }
                            ]
                        }
                    ]
                })
            },
            {
                name: 'Feature Grid',
                description: '3-column grid of features.',
                getElement: (): SiteElement => ({
                    id: generateId(),
                    name: 'Feature Grid',
                    type: 'frame',
                    x: 0, y: 0, width: 1200, height: 400,
                    backgroundColor: 'transparent',
                    opacity: 1,
                    autoLayout: { enabled: true, mode: 'horizontal', gap: 32, padding: { top: 40, right: 40, bottom: 40, left: 40 }, alignItems: 'stretch', justifyContent: 'center' },
                    responsive: {},
                    children: [1, 2, 3].map(i => ({
                        id: generateId(),
                        name: `Feature Card ${i}`,
                        type: 'frame',
                        x: 0, y: 0, width: 350, height: 300,
                        backgroundColor: '#F9FAFB',
                        borderRadius: 12,
                        opacity: 1,
                        autoLayout: { enabled: true, mode: 'vertical', gap: 16, padding: { top: 24, right: 24, bottom: 24, left: 24 }, alignItems: 'flex-start', justifyContent: 'flex-start' },
                        responsive: {},
                        children: [
                            {
                                id: generateId(),
                                name: 'Icon',
                                type: 'frame',
                                x: 0, y: 0, width: 48, height: 48,
                                backgroundColor: '#DBEAFE',
                                borderRadius: 8,
                                opacity: 1,
                                responsive: {}
                            },
                            {
                                id: generateId(),
                                name: 'Title',
                                type: 'text',
                                x: 0, y: 0, width: 200, height: 24,
                                textContent: 'Feature Title',
                                fontSize: 20,
                                fontWeight: 600,
                                textColor: '#1F2937',
                                opacity: 1,
                                responsive: {}
                            },
                            {
                                id: generateId(),
                                name: 'Description',
                                type: 'text',
                                x: 0, y: 0, width: 280, height: 60,
                                textContent: 'Detailed description of the feature goes here. Explain the value proposition.',
                                fontSize: 14,
                                fontWeight: 400,
                                textColor: '#6B7280',
                                opacity: 1,
                                responsive: {}
                            }
                        ]
                    }))
                })
            }
        ]
    },
    {
        category: 'Elements',
        icon: Box,
        items: [
            {
                name: 'Primary Button',
                description: 'Standard call-to-action button.',
                getElement: (): SiteElement => ({
                    id: generateId(),
                    name: 'Primary Button',
                    type: 'frame',
                    x: 0, y: 0, width: 140, height: 44,
                    backgroundColor: '#2563EB',
                    borderRadius: 6,
                    opacity: 1,
                    autoLayout: { enabled: true, mode: 'horizontal', gap: 8, padding: { top: 0, right: 20, bottom: 0, left: 20 }, alignItems: 'center', justifyContent: 'center' },
                    responsive: {},
                    children: [
                        {
                            id: generateId(),
                            name: 'Label',
                            type: 'text',
                            x: 0, y: 0, width: 80, height: 20,
                            textContent: 'Button',
                            fontSize: 14,
                            fontWeight: 500,
                            textColor: '#ffffff',
                            opacity: 1,
                            responsive: {}
                        }
                    ]
                })
            },
            {
                name: 'Input Field',
                description: 'Text input with label.',
                getElement: (): SiteElement => ({
                    id: generateId(),
                    name: 'Input Group',
                    type: 'frame',
                    x: 0, y: 0, width: 320, height: 72,
                    backgroundColor: 'transparent',
                    opacity: 1,
                    autoLayout: { enabled: true, mode: 'vertical', gap: 6, padding: { top: 0, right: 0, bottom: 0, left: 0 }, alignItems: 'flex-start', justifyContent: 'flex-start' },
                    responsive: {},
                    children: [
                        {
                            id: generateId(),
                            name: 'Label',
                            type: 'text',
                            x: 0, y: 0, width: 200, height: 20,
                            textContent: 'Email Address',
                            fontSize: 14,
                            fontWeight: 500,
                            textColor: '#374151',
                            opacity: 1,
                            responsive: {}
                        },
                        {
                            id: generateId(),
                            name: 'Input Box',
                            type: 'frame',
                            x: 0, y: 0, width: 320, height: 40,
                            backgroundColor: '#ffffff',
                            borderRadius: 6,
                            opacity: 1,
                            responsive: {}, // Simulate border with box shadow in simpler model, or use border if added
                            boxShadow: 'inset 0 0 0 1px #D1D5DB'
                        }
                    ]
                })
            }
        ]
    }
];

export default function DesignKitsPanelPRO() {
    const { importElements } = useAppStore();

    const handleDragStart = (e: React.DragEvent, item: any) => {
        e.dataTransfer.setData('application/json', JSON.stringify(item.getElement()));
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleClick = (item: any) => {
        // Add to center of screen (conceptually)
        // For now, we use importElements which expects an array
        const element = item.getElement();
        // Offset slightly if basic positioning
        element.x = 100;
        element.y = 100;
        importElements([element]);
    };

    return (
        <div className="w-full h-full bg-[#0f0f0f] border-l border-[#2a2a2a] flex flex-col">
            <div className="p-4 border-b border-[#2a2a2a]">
                <h3 className="font-semibold text-white">Design Kits</h3>
                <p className="text-xs text-[#666]">Drag and drop components</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {UI_KITS.map((kit) => (
                    <div key={kit.category}>
                        <div className="flex items-center gap-2 mb-3 text-[#999]">
                            <kit.icon size={14} />
                            <h4 className="text-xs font-semibold uppercase">{kit.category}</h4>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {kit.items.map((item) => (
                                <div
                                    key={item.name}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, item)}
                                    onClick={() => handleClick(item)}
                                    className="group relative bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg p-3 hover:border-[#0D99FF] hover:bg-[#252525] transition-all cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-1">
                                        <span className="text-sm font-medium text-[#ddd] group-hover:text-white">{item.name}</span>
                                        <PlusIcon className="opacity-0 group-hover:opacity-100 text-[#0D99FF] transition-opacity" size={16} />
                                    </div>
                                    <p className="text-xs text-[#666] line-clamp-2">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PlusIcon({ className, size }: { className?: string; size: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    );
}
