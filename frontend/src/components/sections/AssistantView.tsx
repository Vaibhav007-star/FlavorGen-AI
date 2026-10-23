import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, HelpCircle, Layers, ArrowRight, CornerDownLeft, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { CandidateFormulation } from '../../types/sensory';
import { PolarRadarChart } from '../charts/PolarRadarChart';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  queryType?: string;
  identifiedEntities?: string[];
  suggestedFollowups?: string[];
  formulationSuggestion?: CandidateFormulation;
  timestamp: string;
}

export const AssistantView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Welcome to the AI Sensory Intelligence Assistant. I am trained on chemoinformatics descriptors, 12-dimensional olfactory receptors, 10-dimensional gustatory vectors, and non-linear food matrix interactions.\n\nAsk me about molecule-to-perception pathways, formulation inversions, bitter suppression mechanisms, or bio-isosteric substitutions.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowups: [
        'What key molecules define roasted coffee aroma?',
        'How can I suppress bitterness in dark cocoa blends?',
        'Suggest a botanical substitute for vanilla orchid extract',
        'Explain how maltol enhances perceived sweetness',
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.queryAssistant(userMsg.content, history);

      const botMsg: Message = {
        role: 'assistant',
        content: res.response_text,
        queryType: res.query_type,
        identifiedEntities: res.identified_entities,
        suggestedFollowups: res.suggested_followups,
        formulationSuggestion: res.formulation_suggestion,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        role: 'assistant',
        content: `Error processing query: ${err.message || 'An unexpected error occurred.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const starterChips = [
    'What key molecules define roasted coffee aroma?',
    'How does lipid emulsion affect limonene release?',
    'Suggest a floral and citrus botanical blend',
    'Explain the chemical mechanism of furaneol in strawberry',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] space-y-4 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5 font-sans tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-[#D99738]/15 border border-[#D99738]/30 flex items-center justify-center text-[#E5A852]">
              <Bot className="w-5 h-5" />
            </div>
            AI Sensory Intelligence Assistant
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Multi-step reasoning engine linking chemical structures, human receptor pharmacology, and formulation dynamics.
          </p>
        </div>
        <button
          onClick={() =>
            setMessages([
              {
                role: 'assistant',
                content: 'Chat session reset. How can I assist your sensory synthesis workflow today?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                suggestedFollowups: starterChips,
              },
            ])
          }
          className="px-3 py-1.5 rounded-full bg-[#161920]/80 border border-white/10 hover:bg-[#1F2430] text-xs text-stone-300 hover:text-white flex items-center gap-1.5 transition-colors shadow-sm font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#E5A852]" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D99738] to-[#F59E0B] flex items-center justify-center text-stone-950 shrink-0 mt-1 shadow-[0_0_12px_rgba(217,151,56,0.3)] font-bold">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-3xl rounded-3xl p-5 space-y-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-[#1C202A] to-[#222733] border border-white/10 text-white rounded-tr-none shadow-md'
                  : 'bg-[#161920]/90 backdrop-blur-md border border-white/[0.08] text-stone-200 rounded-tl-none shadow-luxury-card'
              }`}
            >
              {/* Header inside bubble */}
              <div className="flex items-center justify-between gap-4 text-[11px] text-stone-400 font-mono">
                <span className="font-semibold text-stone-300">{msg.role === 'user' ? 'You' : 'Sensory Intelligence Core'}</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message text */}
              <div className="text-xs leading-relaxed whitespace-pre-line space-y-2 text-stone-200 font-sans">
                {msg.content}
              </div>

              {/* Identified Entities Chips */}
              {msg.identifiedEntities && msg.identifiedEntities.length > 0 && (
                <div className="pt-2 border-t border-white/[0.06]">
                  <span className="text-[10px] font-mono text-stone-400 block mb-1.5 uppercase font-bold tracking-wider">
                    Identified Entities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.identifiedEntities.map((ent, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full bg-[#D99738]/10 border border-[#D99738]/30 text-[11px] font-mono text-[#E5A852] font-semibold"
                      >
                        {ent}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulation Suggestion Card if attached */}
              {msg.formulationSuggestion && (
                <div className="p-4 rounded-2xl bg-[#101217]/95 border border-[#D99738]/30 space-y-3 mt-2 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#E5A852] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#D99738]" />
                      Synthesized Formulation Recipe
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      Confidence: {Math.round(msg.formulationSuggestion.confidence * 100)}%
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {msg.formulationSuggestion.formulation.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-xs bg-[#161920] px-3 py-1.5 rounded-xl border border-white/[0.06]"
                      >
                        <span className="text-stone-200 font-semibold">{item.ingredient_name || item.name}</span>
                        <span className="font-mono text-[#E5A852] font-bold">
                          {(item.proportion * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>

                  {msg.formulationSuggestion.predicted_aroma && (
                    <div className="pt-2 flex justify-center">
                      <PolarRadarChart
                        primaryData={msg.formulationSuggestion.predicted_aroma}
                        title="Formulation Sensory Geometry"
                        primaryColor="#D99738"
                        size={240}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Suggested Followups Chips */}
              {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block font-mono">
                    Suggested Investigations:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {msg.suggestedFollowups.map((followup, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(followup)}
                        className="text-left px-3 py-1.5 rounded-xl bg-[#1A1D24] hover:bg-[#222733] border border-white/[0.08] hover:border-[#D99738]/40 text-xs text-stone-300 hover:text-white transition-colors flex items-center gap-1.5 font-medium"
                      >
                        <ArrowRight className="w-3 h-3 shrink-0 text-[#E5A852]" />
                        <span>{followup}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-[#1F2430] border border-white/15 text-stone-200 flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-sm">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D99738] to-[#F59E0B] flex items-center justify-center text-stone-950 shrink-0 shadow-[0_0_12px_rgba(217,151,56,0.3)] font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-[#161920]/90 backdrop-blur-md border border-white/[0.08] rounded-tl-none flex items-center gap-2.5 text-xs text-stone-300 font-mono shadow-sm">
              <div className="w-3.5 h-3.5 border-2 border-[#D99738] border-t-transparent rounded-full animate-spin" />
              <span>Analyzing receptor pharmacology & mixture matrices...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="pt-3 border-t border-white/[0.08] space-y-2.5 shrink-0">
        {/* Quick prompt suggestions */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider font-mono shrink-0">
            Quick Queries:
          </span>
          {starterChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="px-3 py-1 rounded-full bg-[#161920]/90 hover:bg-[#1F2430] border border-white/[0.08] hover:border-[#D99738]/40 text-[11px] text-stone-300 hover:text-white whitespace-nowrap transition-colors shadow-sm font-medium"
            >
              {chip}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask anything about aroma chemistry, flavor balancing, bio-isosteric substitutions, or receptor targets..."
            className="flex-1 bg-[#161920]/90 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#D99738] focus:ring-1 focus:ring-[#D99738]/30 shadow-inner transition-colors font-sans"
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="px-6 py-3 bg-gradient-to-r from-[#D99738] to-[#C28328] hover:from-[#E5A852] hover:to-[#D99738] active:scale-98 text-stone-950 font-bold rounded-2xl text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(217,151,56,0.25)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
