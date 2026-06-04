import { useState, useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Play, Square, Settings2, RotateCcw, Copy, Check } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

export function Playground({ user }: { user: User }) {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant' | 'system', content: string}[]>([
    { role: 'system', content: 'You are a helpful AI assistant.' }
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.');
  const [showSettings, setShowSettings] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;

    const userMsg = input;
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(newMessages);
    setStreaming(true);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${baseUrl}/v1/playground`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen-max',
          messages: newMessages,
          stream: false
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Request failed');

      setMessages(prev => [...prev, { role: 'assistant', content: data.choices[0].message.content }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `**Error:** ${e.message}` }]);
    } finally {
      setStreaming(false);
    }
  };

  const clearChat = () => {
    if (confirm("Clear conversation history?")) {
      setMessages([{ role: 'system', content: systemPrompt }]);
    }
  };

  const applySystemPrompt = () => {
    if (messages.length === 1 && messages[0].role === 'system') {
      setMessages([{ role: 'system', content: systemPrompt }]);
    }
    setShowSettings(false);
  }

  return (
    <div className="flex flex-col flex-1 h-full min-h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Playground</h1>
          <p className="text-neutral-400 mt-1">Test models interactively.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 bg-neutral-900 border border-neutral-800 rounded-md text-neutral-400 hover:text-white transition-colors">
            <Settings2 className="size-5" />
          </button>
          <button onClick={clearChat} className="p-2 bg-neutral-900 border border-neutral-800 rounded-md text-neutral-400 hover:text-white transition-colors">
            <RotateCcw className="size-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <label className="block text-sm font-medium text-white mb-2">System Prompt</label>
              <textarea 
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm font-mono text-neutral-300 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 resize-none h-24"
              />
              <div className="mt-3 flex justify-end">
                <button onClick={applySystemPrompt} className="px-4 py-2 bg-white text-neutral-950 text-sm font-medium rounded-md hover:bg-neutral-200">
                  Update
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.filter(m => m.role !== 'system').map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                msg.role === 'user' 
                  ? 'bg-neutral-800 text-white rounded-br-sm' 
                  : 'bg-transparent text-neutral-200 border border-neutral-800 rounded-bl-sm'
              }`}>
                {msg.role === 'assistant' ? (
                   <div className="markdown-body prose prose-invert max-w-none prose-sm font-sans representation-prose">
                     <Markdown>{msg.content}</Markdown>
                   </div>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
              </div>
            </div>
          ))}
          {streaming && (
            <div className="flex justify-start">
              <div className="bg-transparent border border-neutral-800 rounded-2xl rounded-bl-sm px-5 py-4 flex items-center gap-2">
                <span className="size-2 bg-neutral-400 rounded-full animate-pulse"></span>
                <span className="size-2 bg-neutral-400 rounded-full animate-pulse delay-75"></span>
                <span className="size-2 bg-neutral-400 rounded-full animate-pulse delay-150"></span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        
        {/* Input */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/50">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Message an AI..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-4 pr-12 py-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 resize-none min-h-[56px] max-h-32"
            />
            <button
              type="submit"
              disabled={!input.trim() || streaming}
              className="absolute right-3 bottom-3 p-1.5 bg-white text-neutral-950 rounded-lg hover:bg-neutral-200 disabled:opacity-50 disabled:bg-neutral-700 disabled:text-neutral-400 transition-colors"
            >
              <Play className="size-4" />
            </button>
          </form>
          <div className="mt-2 text-center text-xs text-neutral-500">
            Model: qwen-max via Puter Abstraction Layer
          </div>
        </div>
      </div>
    </div>
  );
}
