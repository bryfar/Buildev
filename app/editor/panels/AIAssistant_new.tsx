'use client';

import React from "react"
import { useAppStore } from '@/lib/store';
import { Send, Loader } from 'lucide-react';
import { useState } from 'react';
import { generateComponentWithAI, componentTemplates } from '@/lib/aiService';

const AITemplates = [
  { icon: '🎯', label: 'Hero Section', prompt: 'Create a modern hero section with a headline, description, and CTA button' },
  { icon: '📱', label: 'Card Component', prompt: 'Create a reusable card component with image, title, and description' },
  { icon: '📊', label: 'Dashboard', prompt: 'Create a dashboard layout with stats cards and a chart' },
  { icon: '🔐', label: 'Login Form', prompt: 'Create a login form with email, password, and submit button' },
  { icon: '🛍️', label: 'Product Grid', prompt: 'Create a product grid with 3 columns and product cards' },
  { icon: '📋', label: 'Pricing Table', prompt: 'Create a pricing table with 3 tiers and features' },
];

export default function AIAssistant() {
  const { addElement, selectedElementId, currentPage } = useAppStore();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{ type: 'user' | 'assistant'; text: string }[]>([
    {
      type: 'assistant',
      text: '✨ Hey! I can generate UI components for you. Try a template below or describe what you want to create.',
    },
  ]);

  const handleGenerate = async (inputPrompt: string) => {
    if (!inputPrompt.trim()) return;

    setMessages((prev) => [...prev, { type: 'user', text: inputPrompt }]);
    setIsLoading(true);

    try {
      const component = await generateComponentWithAI(inputPrompt);

      addElement({
        name: component.name,
        type: component.type,
        x: component.x,
        y: component.y,
        width: component.width,
        height: component.height,
        backgroundColor: component.backgroundColor,
        opacity: 1,
        textContent: component.textContent,
        fontSize: component.fontSize,
        fontFamily: component.fontFamily,
        fontWeight: component.fontWeight,
        textColor: component.textColor,
      });

      setMessages((prev) => [
        ...prev,
        { type: 'assistant', text: `✅ Created "${component.name}" on your canvas! Adjust it in the properties panel.` },
      ]);
      setPrompt('');
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { type: 'assistant', text: '❌ Failed to generate component. Try again with a different description.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerate(prompt);
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 min-h-0">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`px-3 py-2 rounded-lg text-xs max-w-[85%] ${
                msg.type === 'user'
                  ? 'bg-[#0D99FF] text-white'
                  : 'bg-[#0f0f0f] border border-[#2a2a2a] text-[#ddd]'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] text-[#ddd] text-xs flex items-center gap-2">
              <Loader size={12} className="animate-spin" />
              Generating...
            </div>
          </div>
        )}
      </div>

      {messages.length < 2 && (
        <div className="mb-3">
          <p className="text-[9px] text-[#666] mb-2">Quick templates:</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {AITemplates.slice(0, 4).map((template) => (
              <button
                key={template.label}
                onClick={() => handleGenerate(template.prompt)}
                disabled={isLoading}
                className="p-2 rounded text-[9px] font-medium bg-[#0f0f0f] border border-[#2a2a2a] hover:border-[#0D99FF] text-white transition-colors disabled:opacity-50"
              >
                <span className="text-base">{template.icon}</span>
                <p>{template.label}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Describe what you want..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
          className="flex-1 px-3 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded text-xs text-white placeholder-[#666] focus:border-[#0D99FF] focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="px-2 py-2 bg-[#0D99FF] hover:bg-[#0a7acc] text-white rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
