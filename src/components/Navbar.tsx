import React from 'react';
import {
  Compass,
  FilePlus,
  PackageCheck,
  GitCompare,
  Bot,
  Database,
  Award,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stats: {
    totalLost: number;
    totalFound: number;
    potentialMatches: number;
    resolved: number;
  };
  onResetDemo: () => void;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  stats,
  onResetDemo,
  isResetting,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Compass },
    { id: 'report-lost', label: 'Report Lost', icon: FilePlus },
    { id: 'report-found', label: 'Report Found', icon: PackageCheck },
    { id: 'matches', label: 'Find Matches', icon: GitCompare, badge: stats.potentialMatches },
    { id: 'chat', label: 'AI Assistant', icon: Bot, highlight: true },
    { id: 'records', label: 'My Reports & DB', icon: Database },
    { id: 'cie-hub', label: 'CIE Test Hub', icon: Award, special: true },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-indigo-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-300 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 tracking-tight text-lg">
                  Lost & Found
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-indigo-500/10 text-cyan-400 border border-cyan-500/20">
                  AI Agent
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Campus Belongings Assistant • CIE Challenge</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600/20 text-cyan-300 border border-cyan-500/30 shadow-inner'
                      : item.highlight
                      ? 'text-violet-300 hover:text-white hover:bg-violet-950/40'
                      : item.special
                      ? 'text-amber-300 hover:text-amber-200 hover:bg-amber-950/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : ''}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onResetDemo}
              disabled={isResetting}
              title="Reset demonstration database to standard state"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-slate-400 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Reset Demo DB</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-600/25 border border-violet-400/30 transition transform hover:-translate-y-0.5"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-300" />
              <span>Ask AI Agent</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Scrollbar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-900 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-semibold ${
                  isActive
                    ? 'bg-indigo-600/30 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white bg-slate-900/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1 text-[9px] font-bold bg-cyan-500/20 text-cyan-300 rounded">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
