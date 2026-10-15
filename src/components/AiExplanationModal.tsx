import React, { useEffect, useState } from 'react';
import {
  Brain,
  X,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { MatchEvaluation } from '../types';
import { getAiMatchExplanation } from '../services/api';

interface AiExplanationModalProps {
  match: MatchEvaluation | null;
  onClose: () => void;
  onInitiateResolution: (match: MatchEvaluation) => void;
}

export const AiExplanationModal: React.FC<AiExplanationModalProps> = ({
  match,
  onClose,
  onInitiateResolution,
}) => {
  if (!match) return null;

  const [aiText, setAiText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isAiGenerated, setIsAiGenerated] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadExplanation() {
      setLoading(true);
      try {
        const res = await getAiMatchExplanation(match!.lostItem.id, match!.foundItem.id);
        if (isMounted) {
          setAiText(res.aiExplanation);
          setIsAiGenerated(res.isAiGenerated);
        }
      } catch (err) {
        if (isMounted) {
          setAiText(
            `### Algorithmic Evaluation Summary\n- **Overall Score**: ${match!.score.totalScore}%\n- **Category**: ${match!.score.categoryScore}/30 pts\n- **Name & Description**: ${match!.score.nameDescScore}/30 pts\n- **Color**: ${match!.score.colorScore}/15 pts\n- **Location**: ${match!.score.locationScore}/15 pts\n- **Date Proximity**: ${match!.score.dateScore}/10 pts\n\n### Security Verification Advice\n1. Inspect Claimant College ID card.\n2. Inquire about private markers before presenting item.`
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadExplanation();
    return () => {
      isMounted = false;
    };
  }, [match]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-violet-500/40 p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-violet-500/10 text-cyan-300 border border-violet-500/20">
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            <span>Gemini 3.8 Flash • Deep Correlation Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            AI Match Reasoning & Verification Advice
          </h2>
          <p className="text-xs text-slate-400">
            Evaluating probability, matching factors, and security safeguards for Case #{match.lostItem.id} vs #{match.foundItem.id}.
          </p>
        </div>

        {/* Algorithmic Breakdown Pill Summary */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Algorithmic Correlation Score:</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {match.score.totalScore}% ({match.confidence} Confidence)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] text-center">
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Category (30%)</span>
              <span className="font-bold text-cyan-300">{match.score.categoryScore}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Name/Desc (30%)</span>
              <span className="font-bold text-violet-300">{match.score.nameDescScore}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Color (15%)</span>
              <span className="font-bold text-emerald-300">{match.score.colorScore}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Location (15%)</span>
              <span className="font-bold text-amber-300">{match.score.locationScore}</span>
            </div>
            <div className="col-span-2 sm:col-span-1 p-2 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Date (10%)</span>
              <span className="font-bold text-rose-300">{match.score.dateScore}</span>
            </div>
          </div>
        </div>

        {/* AI Model Analysis Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Agent Reasoning & Verification Checklist:</span>
            </span>
            {isAiGenerated && (
              <span className="text-[10px] text-violet-400">Powered by Gemini 3.8 Flash</span>
            )}
          </div>

          {loading ? (
            <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Generating contextual verification checklist...</p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-3 whitespace-pre-line">
              {aiText}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            Close Analysis
          </button>
          <button
            onClick={() => {
              onClose();
              onInitiateResolution(match);
            }}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-700/20 transition flex items-center gap-2"
          >
            <span>Proceed to Authorized Handover</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
