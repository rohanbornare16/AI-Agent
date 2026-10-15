import React from 'react';
import {
  Search,
  FilePlus,
  PackageCheck,
  GitCompare,
  Bot,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Tag,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Award,
  ChevronRight,
} from 'lucide-react';
import { ItemReport, MatchEvaluation } from '../types';
import { CATEGORIES } from '../utils/constants';

interface DashboardViewProps {
  reports: ItemReport[];
  potentialMatches: MatchEvaluation[];
  setActiveTab: (tab: string) => void;
  onSelectReport: (report: ItemReport) => void;
  onOpenMatchDetails: (match: MatchEvaluation) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  reports,
  potentialMatches,
  setActiveTab,
  onSelectReport,
  onOpenMatchDetails,
}) => {
  const lostCount = reports.filter((r) => r.type === 'lost' && r.status !== 'resolved').length;
  const foundCount = reports.filter((r) => r.type === 'found' && r.status !== 'resolved').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;
  const total = reports.length;
  const resolutionRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;

  const recentReports = [...reports]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const topMatches = potentialMatches.slice(0, 3);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-950 border border-indigo-800/40 p-8 sm:p-10 shadow-2xl shadow-indigo-950/50">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-24 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-cyan-300 border border-cyan-500/20 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI-Driven Campus Property Recovery Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Lost Something?{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-300 to-indigo-300">
              Let's Find It.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base font-normal max-w-2xl leading-relaxed">
            Your smart campus companion for lost and found belongings. Powered by multi-stage
            agent reasoning, transparent weighted attribute scoring, and secure administrative verification.
          </p>

          {/* Call to Actions */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('report-lost')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
            >
              <FilePlus className="w-4 h-4 text-cyan-300" />
              <span>Report Lost Item</span>
            </button>

            <button
              onClick={() => setActiveTab('report-found')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 shadow-md transition transform hover:-translate-y-0.5"
            >
              <PackageCheck className="w-4 h-4 text-emerald-400" />
              <span>Report Found Item</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-violet-950/60 hover:bg-violet-900/70 text-violet-200 border border-violet-700/50 transition transform hover:-translate-y-0.5"
            >
              <Bot className="w-4 h-4 text-cyan-300" />
              <span>Talk to AI Assistant</span>
            </button>

            <button
              onClick={() => setActiveTab('cie-hub')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>CIE Evaluation Hub</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Lost */}
        <div
          onClick={() => setActiveTab('records')}
          className="group cursor-pointer p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/40 transition-all hover:bg-slate-900/90"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Lost Items Active</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{lostCount}</span>
            <span className="text-xs text-rose-400 font-medium">awaiting return</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Reports currently listed across campus</p>
        </div>

        {/* Total Found */}
        <div
          onClick={() => setActiveTab('records')}
          className="group cursor-pointer p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/40 transition-all hover:bg-slate-900/90"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Found Items Logged</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{foundCount}</span>
            <span className="text-xs text-cyan-400 font-medium">in security custody</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Stored at official campus drop points</p>
        </div>

        {/* Potential Matches */}
        <div
          onClick={() => setActiveTab('matches')}
          className="group cursor-pointer p-5 rounded-2xl bg-slate-900/70 border border-indigo-700/40 hover:border-cyan-400/60 transition-all hover:bg-indigo-950/30"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Potential Matches</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
              <GitCompare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-300">{potentialMatches.length}</span>
            <span className="text-xs text-cyan-400 font-medium">detected pairs</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">5-factor algorithmic correlation &gt; 50%</p>
        </div>

        {/* Resolved Cases */}
        <div
          onClick={() => setActiveTab('records')}
          className="group cursor-pointer p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-emerald-500/40 transition-all hover:bg-slate-900/90"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Resolved Cases</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">{resolvedCount}</span>
            <span className="text-xs text-emerald-400 font-medium">{resolutionRate}% rate</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Safely returned with verified student ID</p>
        </div>
      </div>

      {/* Middle Section: Potential Match Highlights & AI Chat Prompt */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High Confidence Potential Matches */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Algorithmically Correlated Pairs</h2>
            </div>
            <button
              onClick={() => setActiveTab('matches')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View All Matches</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {topMatches.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
              <p className="text-sm text-slate-400">No high-confidence matches detected in the current records.</p>
              <p className="text-xs text-slate-400">New items reported will be evaluated automatically.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topMatches.map((m, idx) => {
                const score = m.score.totalScore;
                const isHigh = score >= 75;
                return (
                  <div
                    key={`${m.lostItem.id}-${m.foundItem.id}-${idx}`}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-600/40 transition group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              isHigh
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                            }`}
                          >
                            {score}% Match ({m.confidence} Confidence)
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Category: {m.lostItem.category.replace('_', ' ').toUpperCase()}
                          </span>
                          {m.lostItem.isDemo && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              Demo Case
                            </span>
                          )}
                        </div>

                        {/* Lost vs Found comparison line */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-rose-900/20">
                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Lost Item</span>
                            <p className="font-semibold text-slate-200 truncate">{m.lostItem.title}</p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{m.lostItem.location}</span>
                              <span className="mx-1">•</span>
                              <span>{m.lostItem.date}</span>
                            </p>
                          </div>

                          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-cyan-900/20">
                            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Found Item</span>
                            <p className="font-semibold text-slate-200 truncate">{m.foundItem.title}</p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{m.foundItem.location}</span>
                              <span className="mx-1">•</span>
                              <span>{m.foundItem.date}</span>
                            </p>
                          </div>
                        </div>

                        {/* Match points */}
                        <div className="text-[11px] text-slate-400 flex flex-wrap gap-1.5 pt-1">
                          {m.matchingAttributes.slice(0, 3).map((attr, aIdx) => (
                            <span key={aIdx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              ✓ {attr}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action */}
                      <div className="sm:self-center shrink-0">
                        <button
                          onClick={() => onOpenMatchDetails(m)}
                          className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600/50 text-cyan-300 border border-cyan-500/30 transition flex items-center justify-center gap-1.5"
                        >
                          <span>Analyze Breakdown</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Interactive AI Assistant Feature Box */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-bold text-white">Smart AI Agent</h2>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-b from-violet-950/40 to-slate-900 border border-violet-800/40 space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">Multi-Turn Assistant</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Describe missing belongings in natural language. The agent parses entities, conducts honest database searches, and formulates recovery plans.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-semibold text-slate-400">Try asking the agent:</span>
              <button
                onClick={() => setActiveTab('chat')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white transition group flex items-center justify-between"
              >
                <span>"I lost my black wallet in the college library"</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400" />
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white transition group flex items-center justify-between"
              >
                <span>"Did anyone turn in a blue water bottle in room 204?"</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400" />
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white transition group flex items-center justify-between"
              >
                <span>"How do I claim a found student ID card?"</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400" />
              </button>
            </div>

            <button
              onClick={() => setActiveTab('chat')}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-700/20 transition flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4 text-cyan-300" />
              <span>Open Conversational Agent</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Campus Activity Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Recent Campus Property Reports</h2>
          </div>
          <button
            onClick={() => setActiveTab('records')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Explore All Records</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentReports.map((report) => {
            const isLost = report.type === 'lost';
            const isResolved = report.status === 'resolved';
            return (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 cursor-pointer transition space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isResolved
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isLost
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {isResolved ? 'RESOLVED' : isLost ? 'LOST REPORT' : 'FOUND REPORT'}
                  </span>

                  {report.isDemo && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      Demonstration Data
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-100 truncate">{report.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{report.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1 truncate max-w-[60%]">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{report.location}</span>
                  </div>
                  <span>{report.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
