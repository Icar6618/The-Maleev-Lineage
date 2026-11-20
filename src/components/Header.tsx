import React, { useState } from 'react';
import type { ViewMode } from '../types/family';
import { 
  GitFork, 
  Users, 
  Clock, 
  BarChart3, 
  Search, 
  UserPlus, 
  Download, 
  Upload, 
  RotateCcw,
  Sparkles,
  Cpu,
  Layers
} from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAddPerson: () => void;
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
  totalPersons: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  onAddPerson,
  onExport,
  onImport,
  onReset,
  totalPersons,
}) => {
  const [isDataMenuOpen, setIsDataMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#030712]/70 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Top subtle neon laser gradient */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/50 via-indigo-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4">
          
          {/* Logo & Futuristic Quantum Core */}
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="relative group cursor-pointer">
              {/* Diffuse Neon Aura */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 rounded-2xl blur-md opacity-30 group-hover:opacity-75 transition duration-500" />
              
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/20 p-1 flex items-center justify-center shadow-inner">
                <div className="w-full h-full rounded-[10px] bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 flex items-center justify-center text-cyan-400">
                  <Cpu className="w-5 h-5 text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                </div>
              </div>
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-['Outfit'] font-bold text-base sm:text-xl md:text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent truncate">
                  Родовід Малеєвих
                </h1>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] sm:text-xs font-mono font-medium shadow-[0_0_12px_rgba(6,182,212,0.15)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>{totalPersons} нод</span>
                </div>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 hidden md:flex items-center gap-1.5 truncate font-mono">
                <Layers className="w-3 h-3 text-cyan-400/80 inline" />
                <span>The Maleev Lineage • Квантовий нейронний родовід</span>
              </p>
            </div>
          </div>

          {/* Desktop Minimalist Glass Search */}
          <div className="relative hidden md:block flex-1 max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/60" />
            <input
              type="text"
              placeholder="Пошук у квантовому дереві..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.08] backdrop-blur-xl border border-white/10 focus:border-cyan-400/60 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            )}
          </div>

          {/* Top Actions: Add Node & System Data */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="md:hidden p-2.5 text-cyan-300 bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] rounded-xl border border-white/10 transition"
              title="Пошук"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Add Person Button (Futuristic Cyber-Glass Pill) */}
            <button
              onClick={onAddPerson}
              className="relative group flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-cyan-500/90 to-blue-600/90 hover:from-cyan-400 hover:to-blue-500 active:from-cyan-600 active:to-blue-700 text-slate-950 font-['Space_Grotesk'] font-bold text-xs sm:text-sm rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all duration-200 hover:scale-[1.02] cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline">Додати ноду</span>
              <span className="sm:hidden">Додати</span>
            </button>

            {/* Data Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDataMenuOpen(!isDataMenuOpen)}
                className="flex items-center gap-1.5 p-2.5 sm:px-3 sm:py-2 bg-white/[0.03] hover:bg-white/[0.08] active:bg-white/[0.12] text-slate-300 hover:text-cyan-300 text-xs sm:text-sm rounded-xl border border-white/10 hover:border-cyan-500/40 transition-all backdrop-blur-xl cursor-pointer"
                title="Система"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="hidden md:inline font-mono text-xs">Дані</span>
              </button>

              {isDataMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsDataMenuOpen(false)} 
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#030712]/90 backdrop-blur-3xl border border-white/15 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-cyan-400/80 border-b border-white/10 mb-1">
                      Системні операції
                    </div>
                    <button
                      onClick={() => {
                        setIsDataMenuOpen(false);
                        onExport();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-200 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-xl transition cursor-pointer font-mono"
                    >
                      <Download className="w-4 h-4 text-cyan-400" />
                      Експорт дерева (JSON)
                    </button>
                    <button
                      onClick={() => {
                        setIsDataMenuOpen(false);
                        onImport();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-200 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-xl transition cursor-pointer font-mono"
                    >
                      <Upload className="w-4 h-4 text-indigo-400" />
                      Імпорт дерева (JSON)
                    </button>
                    <div className="h-px bg-white/10 my-1" />
                    <button
                      onClick={() => {
                        setIsDataMenuOpen(false);
                        onReset();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-rose-400 hover:bg-rose-500/15 rounded-xl transition cursor-pointer font-mono"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Скинути до початкового
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        {isSearchExpanded && (
          <div className="md:hidden pb-3 pt-1">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/60" />
              <input
                type="text"
                autoFocus
                placeholder="Пошук ноди..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-white/[0.05] border border-cyan-500/30 focus:border-cyan-400 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none shadow-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* View Switcher Tabs (Minimalist Glass Pills) */}
        <div className="flex items-center gap-2 border-t border-white/[0.06] py-2 sm:py-2.5 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            onClick={() => onViewChange('tree')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-['Space_Grotesk'] font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'tree'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <GitFork className="w-3.5 h-3.5 rotate-180 text-cyan-400" />
            <span>Квантове Дерево</span>
          </button>

          <button
            onClick={() => onViewChange('cards')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-['Space_Grotesk'] font-medium rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'cards'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)] font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Ноди ({totalPersons})</span>
          </button>

          <button
            onClick={() => onViewChange('timeline')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-['Space_Grotesk'] font-medium rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'timeline'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)] font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Часова лінія</span>
          </button>

          <button
            onClick={() => onViewChange('stats')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-['Space_Grotesk'] font-medium rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'stats'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)] font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Метрики</span>
          </button>
        </div>

      </div>
    </header>
  );
};
