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
    <div className="flex flex-col h-full bg-[#1e1e1e] border-l border-[#2a2a2a]">
      <div className="p-3 border-b border-[#2a2a2a] bg-[#1a1a1a]">
        <h3 className="text-xs font-semibold text-[#999] uppercase">AI Assistant</h3>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${msg.type === 'user'
                  ? 'bg-[#0D99FF] text-white rounded-br-none'
                  : 'bg-[#2a2a2a] text-[#e0e0e0] rounded-bl-none border border-[#333]'
                }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#2a2a2a] rounded-lg rounded-bl-none px-3 py-2 text-xs border border-[#333] flex items-center gap-2 text-[#999]">
              <Loader size={12} className="animate-spin" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Templates */}
      <div className="px-4 pb-2">
        <p className="text-[10px] text-[#666] font-medium mb-2 uppercase tracking-wider">Quick Actions</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(componentTemplates).map(([key, template]) => (
            <button
              key={key}
              onClick={() => handleTemplateClick(key as keyof typeof componentTemplates)}
              className="px-2 py-1 text-[10px] bg-[#2a2a2a] hover:bg-[#333] text-[#ccc] border border-[#333] rounded transition-colors"
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-[#2a2a2a] bg-[#1a1a1a]">
        <form onSubmit={handleGenerate} className="flex gap-2 relative">
          <input
            type="text"
            placeholder="Describe a component..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
            className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg pl-3 pr-10 py-2.5 text-xs text-white placeholder-[#555] focus:border-[#0D99FF] focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-1.5 top-1.5 p-1 bg-[#0D99FF] hover:bg-[#0a7acc] disabled:opacity-50 text-white rounded transition-colors"
          >
            <Send size={12} />
          </button>
        </form>
      </div>
    </div>
  );
}
