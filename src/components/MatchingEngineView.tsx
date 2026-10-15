import React, { useState } from 'react';
import {
  GitCompare,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MapPin,
  Calendar,
  Tag,
  ArrowRight,
  ShieldCheck,
  Brain,
  Filter,
  Layers,
} from 'lucide-react';
import { ItemReport, MatchEvaluation } from '../types';
import { evaluateItemMatch, findMatchesForLostItem } from '../utils/matchingEngine';

interface MatchingEngineViewProps {
  reports: ItemReport[];
  potentialMatches: MatchEvaluation[];
  onOpenMatchDetails: (match: MatchEvaluation) => void;
  onInitiateResolution: (lostItem: ItemReport, foundItem: ItemReport) => void;
}

export const MatchingEngineView: React.FC<MatchingEngineViewProps> = ({
  reports,
  potentialMatches,
  onOpenMatchDetails,
  onInitiateResolution,
}) => {
  const lostItems = reports.filter((r) => r.type === 'lost' && r.status !== 'resolved');
  const foundItems = reports.filter((r) => r.type === 'found' && r.status !== 'resolved');

  const [selectedLostId, setSelectedLostId] = useState<string>('all');
  const [minConfidence, setMinConfidence] = useState<'all' | 'high' | 'moderate'>('all');

  // Compute displayed matches
  let displayedMatches: MatchEvaluation[] = [];

  if (selectedLostId === 'all') {
    displayedMatches = potentialMatches;
  } else {
    const selectedItem = lostItems.find((l) => l.id === selectedLostId);
    if (selectedItem) {
      displayedMatches = findMatchesForLostItem(selectedItem, foundItems, 20);
    }
  }

  if (minConfidence === 'high') {
    displayedMatches = displayedMatches.filter((m) => m.score.totalScore >= 75);
  } else if (minConfidence === 'moderate') {
    displayedMatches = displayedMatches.filter((m) => m.score.totalScore >= 50);
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-cyan-300 border border-cyan-500/20">
          <GitCompare className="w-3.5 h-3.5 text-cyan-400" />
          <span>Transparent 5-Factor Evaluation System</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Intelligent Matching Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Cross-examines lost reports against logged found items using a transparent, explainable weighted scoring formula.
          Every percentage score is an estimate—never definitive proof of ownership without physical ID verification.
        </p>
      </div>

      {/* Algorithm Breakdown Educational Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Transparent Scoring Formula Weights
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Total: 100% Normalized</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-indigo-900/30 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Category</span>
              <span className="font-bold text-cyan-400">30%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="w-full h-full bg-cyan-400" />
            </div>
            <p className="text-[10px] text-slate-400">Exact vs related campus item class</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-indigo-900/30 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Name & Desc</span>
              <span className="font-bold text-violet-400">30%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="w-full h-full bg-violet-400" />
            </div>
            <p className="text-[10px] text-slate-400">Jaccard tokens + Brand match bonus</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-indigo-900/30 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Color Match</span>
              <span className="font-bold text-emerald-400">15%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="w-full h-full bg-emerald-400" />
            </div>
            <p className="text-[10px] text-slate-400">Exact shade or multi-color tolerance</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-indigo-900/30 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Location</span>
              <span className="font-bold text-amber-400">15%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="w-full h-full bg-amber-400" />
            </div>
            <p className="text-[10px] text-slate-400">Campus zone & building proximity</p>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-slate-950/80 border border-indigo-900/30 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Date Proximity</span>
              <span className="font-bold text-rose-400">10%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="w-full h-full bg-rose-400" />
            </div>
            <p className="text-[10px] text-slate-400">Days gap between loss & turn-in</p>
          </div>
        </div>
      </div>

      {/* Filter and Selection Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        {/* Item Selector */}
        <div className="flex items-center gap-2 flex-1">
          <Filter className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="space-y-0.5 flex-1">
            <label className="text-[11px] font-semibold text-slate-400 block">Select Lost Item to Match:</label>
            <select
              value={selectedLostId}
              onChange={(e) => setSelectedLostId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Active Lost Items ({lostItems.length} items)</option>
              {lostItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} ({item.location} • {item.date})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Confidence threshold tabs */}
        <div className="flex items-center gap-1 self-end sm:self-auto bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setMinConfidence('all')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              minConfidence === 'all'
                ? 'bg-indigo-600/40 text-cyan-300 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Scores
          </button>
          <button
            onClick={() => setMinConfidence('moderate')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              minConfidence === 'moderate'
                ? 'bg-indigo-600/40 text-cyan-300 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            &gt; 50% (Moderate+)
          </button>
          <button
            onClick={() => setMinConfidence('high')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              minConfidence === 'high'
                ? 'bg-indigo-600/40 text-cyan-300 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            &gt; 75% (High Only)
          </button>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Found {displayedMatches.length} potential correlation pair(s)</span>
          <span className="text-[11px] text-amber-300/80">⚠️ High score != Ownership. Staff verification required.</span>
        </div>

        {displayedMatches.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/30 border border-slate-800/80 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Suitable Match in Current Records</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No suitable match is available in the current records. You can save your report and check again later, or broaden your search criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedMatches.map((m, idx) => {
              const score = m.score.totalScore;
              const isHigh = score >= 75;
              const isMod = score >= 50 && score < 75;

              return (
                <div
                  key={`${m.lostItem.id}-${m.foundItem.id}-${idx}`}
                  className="rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 p-6 space-y-5 transition-all shadow-lg"
                >
                  {/* Top Bar: Confidence Badge & Score Gauge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-extrabold ${
                          isHigh
                            ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                            : isMod
                            ? 'bg-violet-500/10 text-violet-300 border border-violet-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        <span className="text-xl leading-none">{score}%</span>
                        <span className="text-[9px] font-semibold uppercase mt-0.5">Score</span>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isHigh
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : isMod
                                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {m.label}
                          </span>
                          {m.lostItem.isDemo && (
                            <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                              DEMO SCENARIO
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          Comparison between Lost #{m.lostItem.id} and Found #{m.foundItem.id}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onOpenMatchDetails(m)}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-violet-950/60 hover:bg-violet-900/60 text-violet-200 border border-violet-700/50 transition flex items-center gap-1.5"
                      >
                        <Brain className="w-3.5 h-3.5 text-cyan-300" />
                        <span>AI Deep Reasoner</span>
                      </button>

                      <button
                        onClick={() => onInitiateResolution(m.lostItem, m.foundItem)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-700/20 transition flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verify & Resolve Case</span>
                      </button>
                    </div>
                  </div>

                  {/* Comparison Columns: Lost vs Found */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Lost Item Details */}
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-rose-900/30 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-rose-400 uppercase tracking-wider">Lost Report</span>
                        <span className="text-slate-400">{m.lostItem.date}</span>
                      </div>
                      <h4 className="font-bold text-sm text-white">{m.lostItem.title}</h4>
                      <p className="text-xs text-slate-300">{m.lostItem.description}</p>
                      <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                        <div>
                          <span className="text-slate-400">Category:</span>{' '}
                          <span className="text-slate-200">{m.lostItem.category.replace('_', ' ')}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Color:</span>{' '}
                          <span className="text-slate-200">{m.lostItem.color}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Brand:</span>{' '}
                          <span className="text-slate-200">{m.lostItem.brand || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Last Seen:</span>{' '}
                          <span className="text-slate-200">{m.lostItem.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Found Item Details */}
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-cyan-900/30 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-cyan-400 uppercase tracking-wider">Found Item</span>
                        <span className="text-slate-400">{m.foundItem.date}</span>
                      </div>
                      <h4 className="font-bold text-sm text-white">{m.foundItem.title}</h4>
                      <p className="text-xs text-slate-300">{m.foundItem.description}</p>
                      <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                        <div>
                          <span className="text-slate-400">Category:</span>{' '}
                          <span className="text-slate-200">{m.foundItem.category.replace('_', ' ')}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Color:</span>{' '}
                          <span className="text-slate-200">{m.foundItem.color}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Brand:</span>{' '}
                          <span className="text-slate-200">{m.foundItem.brand || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Discovered at:</span>{' '}
                          <span className="text-slate-200">{m.foundItem.location}</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-cyan-300 bg-cyan-950/30 px-2.5 py-1 rounded-lg border border-cyan-800/30">
                        Custody Location: {m.foundItem.dropOffLocation || 'Central Security Desk'}
                      </div>
                    </div>
                  </div>

                  {/* 5-Criteria Point Breakdown Badges */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Score Components Breakdown:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 block">Category</span>
                        <span className="font-bold text-cyan-300">{m.score.categoryScore} / 30</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 block">Name & Desc</span>
                        <span className="font-bold text-violet-300">{m.score.nameDescScore} / 30</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 block">Color</span>
                        <span className="font-bold text-emerald-300">{m.score.colorScore} / 15</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 block">Location</span>
                        <span className="font-bold text-amber-300">{m.score.locationScore} / 15</span>
                      </div>
                      <div className="col-span-2 sm:col-span-1 p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 block">Date Proximity</span>
                        <span className="font-bold text-rose-300">{m.score.dateScore} / 10</span>
                      </div>
                    </div>
                  </div>

                  {/* Matching & Mismatching Attributes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Matching Attributes:</span>
                      </span>
                      <ul className="space-y-1">
                        {m.matchingAttributes.map((attr, aIdx) => (
                          <li key={aIdx} className="text-slate-300 flex items-start gap-1.5">
                            <span className="text-emerald-400 mt-0.5">•</span>
                            <span>{attr}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1.5">
                      <span className="font-bold text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Discrepancies / Unknowns:</span>
                      </span>
                      {m.mismatchingAttributes.length === 0 ? (
                        <p className="text-slate-400 italic">No significant conflicts detected.</p>
                      ) : (
                        <ul className="space-y-1">
                          {m.mismatchingAttributes.map((attr, aIdx) => (
                            <li key={aIdx} className="text-slate-400 flex items-start gap-1.5">
                              <span className="text-rose-400 mt-0.5">•</span>
                              <span>{attr}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Recommended Action Footer */}
                  <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-xs text-indigo-200 flex items-center gap-2">
                    <span className="font-semibold text-cyan-300 shrink-0">Recommended Protocol:</span>
                    <span>{m.recommendedAction}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
