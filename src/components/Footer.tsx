import React from 'react';
import { ShieldCheck, Sparkles, School, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-indigo-950/60 bg-slate-950/95 py-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Branding and College CIE tag */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">Lost & Found Assistant</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-violet-950/80 text-violet-300 border border-violet-800/40">
                AI Agent Design Challenge
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Intelligent multi-stage campus belonging retrieval agent for 20-Mark CIE Assignment.
            </p>
          </div>

          {/* Privacy & Safety protocols */}
          <div className="flex items-start gap-2 bg-slate-900/40 border border-slate-800/80 p-2.5 rounded-lg">
            <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-[11px] space-y-0.5 text-slate-400">
              <span className="font-semibold text-slate-300">Privacy & Handover Safeguards:</span>
              <p>Sensitive attributes remain confidential. Authorized campus security verification required prior to physical release.</p>
            </div>
          </div>

          {/* Status & Credits */}
          <div className="flex flex-col md:items-end gap-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-medium">Gemini 3.8 Flash Core Active</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Transparent 5-Factor Weighted Scoring</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400">
          <p>© 2026 Lost & Found Assistant | AI Agent Design Challenge. All demonstration records are simulated campus test scenarios.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400">Security Room 102</span>
            <span>•</span>
            <span className="hover:text-slate-400">Central Library Desk</span>
            <span>•</span>
            <span className="hover:text-slate-400">Main Gate Post</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
