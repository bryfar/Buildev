'use client';

import { Send, Sparkles, X, Bot, Zap, RotateCcw } from 'lucide-react';
import { useState } from 'react';

export default function AiSidebar() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'system', text: 'Welcome to Buildev AI. I can help you generate code, fix bugs, or design UI components.' },
        { role: 'user', text: 'Fix the useEffect dependency array error in page.tsx' },
        { role: 'system', text: 'I noticed a missing dependency. I\'ve added `currentProject` to the dependency array locally. Would you like to apply this fix?', isAction: true },
    ]);

    return (
        <div className="h-full flex flex-col bg-[#1e1e1e] border-l border-[#333] text-[#cccccc] font-sans">
            {/* Header */}
            <div className="h-9 flex items-center justify-between px-4 border-b border-[#3e3e42] bg-[#252526]">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
                    <Bot size={14} />
                    <span>AI Assistant</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-[#333] rounded text-gray-400 hover:text-white" title="Clear Chat">
                        <RotateCcw size={12} />
                    </button>
                    <button className="p-1 hover:bg-[#333] rounded text-gray-400 hover:text-white">
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-[#333]' : 'bg-purple-600/20 text-purple-400'}`}>
                            {msg.role === 'user' ? <span className="text-[10px] font-bold">You</span> : <Sparkles size={12} />}
                        </div>
                        <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`text-sm leading-relaxed p-3 rounded-lg ${msg.role === 'user' ? 'bg-[#2d2d2d] text-gray-200' : 'text-gray-300'}`}>
                                {msg.text}
                            </div>
                            {msg.isAction && (
                                <div className="flex gap-2">
                                    <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors flex items-center gap-1">
                                        Apply Fix
                                    </button>
                                    <button className="px-3 py-1.5 bg-[#333] hover:bg-[#444] text-gray-300 text-xs rounded transition-colors">
                                        Explain
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[#3e3e42] bg-[#1e1e1e]">
                <div className="relative">
                    <textarea
                        className="w-full bg-[#2d2d2d] text-white text-sm rounded-md border border-[#3e3e42] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 p-3 min-h-[80px] resize-none focus:outline-none placeholder-gray-500"
                        placeholder="Ask AI to generate component, fix bugs..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <div className="absolute bottom-2 right-2 flex gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-white transition-colors">
                            <Zap size={14} />
                        </button>
                        <button className={`p-1.5 rounded transition-colors ${input.trim() ? 'bg-purple-600 text-white' : 'bg-[#333] text-gray-500'}`}>
                            <Send size={14} />
                        </button>
                    </div>
                </div>
                <div className="mt-2 text-[10px] text-gray-500 flex justify-between px-1">
                    <span>Model: Gemini 2.0 Pro</span>
                    <span className="flex items-center gap-1 cursor-pointer hover:text-gray-300">
                        Context: page.tsx <X size={8} />
                    </span>
                </div>
            </div>
        </div>
    );
}
