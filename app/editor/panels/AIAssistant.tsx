'use client';

import React from "react"

import { useAppStore } from '@/lib/store';
import { Send, Loader } from 'lucide-react';
import { useState } from 'react';
import { generateComponentWithAI, componentTemplates } from '@/lib/aiService';

export default function AIAssistant() {
  const { addElement } = useAppStore();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{ type: 'user' | 'assistant'; text: string }[]>([
    {
      type: 'assistant',
      text: 'Hi! I can generate UI components for you. Describe what you want to create, and I\'ll add it to your canvas.',
    },
  ]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { type: 'user', text: prompt }]);
    setIsLoading(true);

    try {
      // Generate component with AI
      const component = await generateComponentWithAI(prompt);

      // Add to canvas
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
        {
          type: 'assistant',
          text: `Created "${component.name}" component! I've added it to your canvas.`,
        },
      ]);
    } catch (error) {
      console.error('Error generating component:', error);
      setMessages((prev) => [
        ...prev,
        {
          type: 'assistant',
          text: 'Sorry, I had trouble generating that component. Try being more specific!',
        },
      ]);
    } finally {
      setPrompt('');
      setIsLoading(false);
    }
  };

  const handleTemplateClick = (templateKey: keyof typeof componentTemplates) => {
    const template = componentTemplates[templateKey];
    addElement({
      ...template,
      opacity: 1,
    });
    setMessages((prev) => [
      ...prev,
      {
        type: 'assistant',
        text: `Added ${template.name} to your canvas!`,
      },
    ]);
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <h3 className="text-xs font-semibold text-[#999] uppercase mb-3">AI Assistant</h3>

      {/* Chat Area */}
      <div className="flex-1 mb-4 bg-[#0f0f0f] rounded-lg p-3 overflow-y-auto space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`text-xs ${
              msg.type === 'user'
                ? 'text-right text-[#0D99FF]'
                : 'text-left text-[#ddd]'
            }`}
          >
            <div
              className={`inline-block max-w-xs px-3 py-2 rounded ${
                msg.type === 'user'
                  ? 'bg-[#0D99FF] text-white'
                  : 'bg-[#2a2a2a] text-[#ddd]'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-[#999]">
            <Loader size={14} className="animate-spin" />
            <span className="text-xs">Generating...</span>
          </div>
        )}
      </div>

      {/* Templates */}
      <div className="mb-4 space-y-2">
        <p className="text-xs text-[#666] font-medium">Quick Templates:</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(componentTemplates).map(([key, template]) => (
            <button
              key={key}
              onClick={() => handleTemplateClick(key as keyof typeof componentTemplates)}
              className="px-2 py-1.5 text-xs bg-[#2a2a2a] hover:bg-[#333] text-[#ddd] rounded transition-colors truncate"
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleGenerate} className="flex gap-2">
        <input
          type="text"
          placeholder="Create a pricing card..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
          className="flex-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-2 text-sm text-white placeholder-[#666] focus:outline-none focus:border-[#0D99FF] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-[#0D99FF] hover:bg-[#0a7acc] disabled:opacity-50 text-white px-3 py-2 rounded transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
