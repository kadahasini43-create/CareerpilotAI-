"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { 
  Send, Compass, Sparkles, MessageSquare, 
  HelpCircle, ChevronRight, Loader2, RefreshCw 
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

const suggestedPrompts = [
  "Write a binary search algorithm in TypeScript",
  "How do I switch careers into Product Management?",
  "Explain SQL Joins vs NoSQL Document References",
  "What is a multi-stage Dockerfile build?",
  "How do I negotiate a senior tech role salary?"
];

interface MarkdownBlock {
  type: 'text' | 'code';
  content: string;
  language?: string;
}

const parseMarkdown = (text: string): MarkdownBlock[] => {
  const blocks: MarkdownBlock[] = [];
  const lines = text.split('\n');
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLang = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        blocks.push({
          type: 'code',
          content: codeLines.join('\n'),
          language: codeLang
        });
        codeLines = [];
        codeLang = '';
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLang = line.trim().substring(3).trim();
      }
    } else {
      if (inCodeBlock) {
        codeLines.push(line);
      } else {
        const lastBlock = blocks[blocks.length - 1];
        if (lastBlock && lastBlock.type === 'text') {
          lastBlock.content += '\n' + line;
        } else {
          blocks.push({
            type: 'text',
            content: line
          });
        }
      }
    }
  }

  if (inCodeBlock && codeLines.length > 0) {
    blocks.push({
      type: 'code',
      content: codeLines.join('\n'),
      language: codeLang
    });
  }

  return blocks;
};

const CodeBlock = ({ content, language }: { content: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl font-mono text-[11px] text-gray-200">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5 text-[10px] text-gray-400 font-sans">
        <span className="uppercase tracking-wider font-semibold">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 active:scale-95 transition-all text-gray-300 hover:text-white"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto whitespace-pre leading-relaxed select-text">
        <code>{content}</code>
      </pre>
    </div>
  );
};

export default function MentorChat() {
  const { profile, refreshProfile } = useAuth();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setGeminiKey(localStorage.getItem('gemini_api_key') || '');
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setGeminiKey(key);
    if (typeof window !== 'undefined') {
      if (key.trim()) {
        localStorage.setItem('gemini_api_key', key.trim());
      } else {
        localStorage.removeItem('gemini_api_key');
      }
    }
  };

  useEffect(() => {
    // Seed initial message
    if (messages.length === 0) {
      setMessages([
        {
          role: 'model',
          content: `### Welcome to your CareerPilot AI Space!

I am your futuristic career mentor. I've synced with your onboarding target of **${profile?.dreamRole || 'Software Professional'}** and your skill set.

Here is how I can guide you today:
*   **Career Switch Advice:** Step-by-step transition planning.
*   **Salary Insights:** Geographic and specialization breakdowns.
*   **Learning Resources:** Curriculum and course recommendations.
*   **Portfolio Architecture:** Project ideas to display proof-of-work.

Type your query below or pick one of the quick suggestions to begin.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [profile]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      // Map message history to format required by the backend
      const apiHistory = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        content: m.content
      }));

      const response = await api.chat(text, apiHistory);
      
      const assistantMsg: ChatMessage = {
        role: 'model',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
      
      // Refresh user stats as they earn XP
      await refreshProfile();
    } catch (error) {
      console.error("Chat failure:", error);
      const errMsg: ChatMessage = {
        role: 'model',
        content: "⚠️ **System Communication Interrupted.** I was unable to connect to the AI model. Please verify your internet connection or try again later.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Advanced Markdown Block to HTML renderer helper
  const renderMarkdown = (text: string) => {
    const blocks = parseMarkdown(text);
    return blocks.map((block, blockIdx) => {
      if (block.type === 'code') {
        return <CodeBlock key={blockIdx} content={block.content} language={block.language} />;
      }

      return (
        <div key={blockIdx} className="space-y-1.5">
          {block.content.split('\n').map((line, idx) => {
            let content = line;
            
            // Headers
            if (content.startsWith('### ')) {
              return <h3 key={idx} className="text-sm font-extrabold text-white mt-4 mb-2">{content.substring(4)}</h3>;
            }
            if (content.startsWith('## ')) {
              return <h2 key={idx} className="text-base font-black text-white mt-5 mb-2.5 border-b border-white/5 pb-1">{content.substring(3)}</h2>;
            }
            if (content.startsWith('# ')) {
              return <h1 key={idx} className="text-lg font-black text-white mt-6 mb-3">{content.substring(2)}</h1>;
            }

            // Bullet points
            if (content.startsWith('* ') || content.startsWith('- ')) {
              const cleaned = content.substring(2);
              return (
                <li key={idx} className="list-disc ml-5 text-gray-300 text-xs leading-relaxed my-1 select-text">
                  {formatInlineMarkdown(cleaned)}
                </li>
              );
            }

            // Numbered lists
            const numberedMatch = content.match(/^(\d+)\.\s(.*)/);
            if (numberedMatch) {
              return (
                <li key={idx} className="list-decimal ml-5 text-gray-300 text-xs leading-relaxed my-1 select-text">
                  {formatInlineMarkdown(numberedMatch[2])}
                </li>
              );
            }

            // Standard paragraphs
            if (content.trim() === '') return <div key={idx} className="h-1.5" />;

            return <p key={idx} className="text-xs text-gray-300 leading-relaxed my-1.5 select-text">{formatInlineMarkdown(content)}</p>;
          })}
        </div>
      );
    });
  };

  const formatInlineMarkdown = (text: string) => {
    let parts: React.ReactNode[] = [];
    let currentIndex = 0;
    
    const regex = /(\*\*.*?\*\*|`.*?`|\?)/g;
    const matches = Array.from(text.matchAll(regex));
    
    if (matches.length === 0) {
      return text;
    }

    matches.forEach((m, idx) => {
      const start = m.index!;
      const end = start + m[0].length;
      
      if (start > currentIndex) {
        parts.push(text.substring(currentIndex, start));
      }
      
      const val = m[0];
      if (val.startsWith('**') && val.endsWith('**')) {
        parts.push(<strong key={idx} className="font-extrabold text-white">{val.slice(2, -2)}</strong>);
      } else if (val.startsWith('`') && val.endsWith('`')) {
        parts.push(<code key={idx} className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 font-mono text-[10px] text-blue-400">{val.slice(1, -1)}</code>);
      } else {
        parts.push(val);
      }
      
      currentIndex = end;
    });

    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }

    return parts;
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6 relative">
      {/* Left panel: Chat history window */}
      <div className="flex-1 glass-panel border border-white/5 rounded-2xl flex flex-col justify-between overflow-hidden shadow-2xl relative">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <MessageSquare className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">AI Mentor Console</h3>
              <p className="text-[10px] text-gray-500">Secured NLP Pipeline (GPT/Gemini Standard)</p>
            </div>
          </div>
          <button 
            onClick={clearChat}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            title="Reset Conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Conversation Logs Container */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex items-start gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar Icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border ${
                m.role === 'user' 
                  ? 'bg-blue-600/20 border-blue-500/30 text-white' 
                  : 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400'
              }`}>
                {m.role === 'user' ? 'U' : 'AI'}
              </div>

              {/* Chat Bubble */}
              <div className={`max-w-[80%] px-4.5 py-3.5 rounded-2xl border text-xs shadow-md ${
                m.role === 'user'
                  ? 'bg-blue-600/10 border-blue-500/25 rounded-tr-none text-white'
                  : 'bg-black/35 border-white/5 rounded-tl-none text-gray-300'
              }`}>
                {m.role === 'user' ? (
                  <p className="leading-relaxed">{m.content}</p>
                ) : (
                  <div className="space-y-1">{renderMarkdown(m.content)}</div>
                )}
                <div className={`text-[9px] text-gray-500 mt-2 text-right`}>
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Assistant Loading dot pulse */}
          {loading && (
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                AI
              </div>
              <div className="px-4.5 py-4 rounded-2xl rounded-tl-none bg-black/35 border border-white/5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-white/5 bg-black/15">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }} 
            className="flex gap-3 relative"
          >
            <input
              type="text"
              placeholder={`Ask anything about ${profile?.dreamRole || 'your career path'}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl pl-4 pr-12 py-3.5 outline-none focus:border-blue-500 text-xs text-white transition-all placeholder-gray-600"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-[0_0_10px_rgba(59,130,246,0.3)] disabled:opacity-30 disabled:bg-gray-800"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Right panel: Suggested Prompts Sidebar */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        {/* Tips / Preset prompts */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-xs uppercase tracking-wider">
            <HelpCircle className="w-4.5 h-4.5" />
            Suggested Coaching
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Click any prompt chip to feed it directly to CareerPilot AI for immediate processing.
          </p>

          <div className="flex flex-col gap-2.5">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                className="w-full text-left p-3 rounded-xl bg-black/20 hover:bg-white/5 border border-white/5 hover:border-white/10 text-[11px] text-gray-300 hover:text-white font-medium transition-all flex items-center justify-between group disabled:opacity-50"
              >
                <span>{prompt}</span>
                <ChevronRight className="w-4.5 h-4.5 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>

        {/* Sync Status Banner */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-indigo-950/20 to-black/40 flex flex-col items-center text-center">
          <Compass className="w-8 h-8 text-blue-500 animate-spin-slow mb-3" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Onboarding Synced</h4>
          <p className="text-[10px] text-gray-500 mt-1 max-w-[200px]">
            Targeting **{profile?.dreamRole || 'Software'}** with {profile?.skills?.length || 0} skills loaded.
          </p>
        </div>

        {/* Gemini API Key Configuration Card */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center gap-2 text-blue-400 font-extrabold text-xs uppercase tracking-wider">
            <Sparkles className="w-4.5 h-4.5" />
            Gemini Core Settings
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Configure a custom Gemini API Key to upgrade your AI mentor to full Gemini 1.5 capabilities. Otherwise, a high-fidelity local engine is used.
          </p>
          <div className="space-y-2">
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => handleSaveApiKey(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 outline-none focus:border-blue-500 text-[10px] text-white font-mono transition-all"
            />
            <div className="flex justify-between items-center text-[9px]">
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline flex items-center gap-0.5"
              >
                Get a free key
              </a>
              <span className={geminiKey ? "text-emerald-450 font-semibold" : "text-gray-500"}>
                {geminiKey ? "● Real Gemini Active" : "● Offline Fallback Active"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
