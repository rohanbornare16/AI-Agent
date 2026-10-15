import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  GitCompare,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Calendar,
  Layers,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { ChatMessage, AgentWorkflowStage, AgentIntent, ItemReport } from '../types';
import { sendAgentMessage } from '../services/api';

interface AiAssistantViewProps {
  onNavigateToReport: (type: 'lost' | 'found', prefill?: any) => void;
  onNavigateToMatches: () => void;
  reports: ItemReport[];
}

const WORKFLOW_STAGES: { id: AgentWorkflowStage; label: string; short: string }[] = [
  { id: 'INTENT_DETECTION', label: 'Intent Detection', short: 'Intent' },
  { id: 'INFORMATION_GATHERING', label: 'Info Gathering', short: 'Info' },
  { id: 'RECORD_SEARCH', label: 'Record Search', short: 'Search' },
  { id: 'MATCH_EVALUATION', label: 'Match Evaluation', short: 'Match' },
  { id: 'RESPONSE_GENERATION', label: 'Response Generation', short: 'Response' },
  { id: 'NEXT_ACTION', label: 'Next Action', short: 'Action' },
];

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  onNavigateToReport,
  onNavigateToMatches,
  reports,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-01',
      sender: 'assistant',
      text: "Hello! I am your Campus Lost & Found AI Assistant. You can describe any missing belongings, report items you discovered on campus, or inquire about official return procedures. How may I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stage: 'RESPONSE_GENERATION',
      intent: 'GENERAL_HELP',
      isAiGenerated: false,
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState<AgentWorkflowStage>('RESPONSE_GENERATION');
  const [activeIntent, setActiveIntent] = useState<AgentIntent>('GENERAL_HELP');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setCurrentStage('INTENT_DETECTION');

    try {
      // Build conversation history for context
      const history = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      // Call full-stack server endpoint
      const result = await sendAgentMessage(text, history);

      setCurrentStage(result.stage || 'RESPONSE_GENERATION');
      setActiveIntent(result.intent || 'GENERAL_HELP');

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: result.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: result.intent,
        stage: result.stage,
        matchedReports: result.matchedReports,
        potentialMatches: result.potentialMatches,
        isAiGenerated: result.isAiGenerated,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "I encountered an error querying the campus records. Please check that the server is active or try rephrasing your query.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        stage: 'RESPONSE_GENERATION',
        intent: 'GENERAL_HELP',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: "Session refreshed. What campus belongings can I assist you with?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        stage: 'RESPONSE_GENERATION',
        intent: 'GENERAL_HELP',
      },
    ]);
    setCurrentStage('RESPONSE_GENERATION');
    setActiveIntent('GENERAL_HELP');
  };

  const samplePrompts = [
    { label: 'Lost Wallet in Library', text: 'I lost my black wallet in the college library.' },
    { label: 'Water Bottle in 204', text: 'Did anyone turn in a blue water bottle in Classroom 204?' },
    { label: 'Unmatched MacBook', text: 'I lost my silver MacBook Pro in Science Lab 3.' },
    { label: 'Found College ID', text: 'I found a student College ID card in the Main Canteen.' },
    { label: 'Verification Rules', text: 'What is the official procedure to claim an item from Central Security?' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header & Agent Workflow Stages */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-cyan-300 border border-violet-500/20">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>Multi-Stage Autonomous Agent</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Campus Assistant
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Clear Session</span>
            </button>
          </div>
        </div>

        {/* Workflow Stage Pipeline Indicator */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>Live Agent Pipeline:</span>
            </span>
            <span className="text-cyan-300 font-mono font-medium">
              Intent: {activeIntent}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {WORKFLOW_STAGES.map((s, idx) => {
              const isActive = currentStage === s.id;
              return (
                <div
                  key={s.id}
                  className={`px-2 py-1.5 rounded-lg text-center text-[10px] font-semibold transition ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30 border border-cyan-400/50'
                      : 'bg-slate-950/70 text-slate-400 border border-slate-800'
                  }`}
                >
                  <span className="block truncate">{s.short}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="rounded-3xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-2xl flex flex-col h-[520px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[88%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${
                    isUser
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-2 flex-1">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-none'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-line">{m.text}</div>

                    {/* Matched Reports Embed (if any found during search) */}
                    {m.potentialMatches && m.potentialMatches.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                        <span className="text-[11px] font-bold text-cyan-300 block">
                          Potential Matches Found in Custody:
                        </span>
                        {m.potentialMatches.map((pm, pIdx) => (
                          <div
                            key={pIdx}
                            className="p-2.5 rounded-xl bg-slate-900/90 border border-indigo-900/40 text-xs text-slate-300 space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">{pm.foundItem.title}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                {pm.matchScore}% Match
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Location: {pm.foundItem.location} • Held at: {pm.foundItem.dropOffLocation || 'Security Desk'}
                            </p>
                          </div>
                        ))}

                        <button
                          onClick={onNavigateToMatches}
                          className="mt-2 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                        >
                          <span>Open Detailed Match Analysis</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{m.timestamp}</span>
                      {m.isAiGenerated && (
                        <span className="flex items-center gap-1 text-violet-300">
                          <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                          <span>Gemini 3.8 Flash</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Agent analyzing database records & evaluating correlations...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2 sm:px-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] text-slate-400 whitespace-nowrap pl-1">Suggested:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.text)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition disabled:opacity-40"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message (e.g. 'I lost my black wallet in the college library')..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2.5 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/30 transition disabled:opacity-40 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
