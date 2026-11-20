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
  Shield,
  Crown
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
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-amber-500/20 shadow-2xl shadow-black/60">
      {/* Top subtle golden shimmer line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo & Heraldic Crest */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="relative group cursor-pointer">
              {/* Outer Golden Aura */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600 rounded-2xl blur-sm opacity-40 group-hover:opacity-80 transition duration-300" />
              
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-[1.5px] ring-1 ring-amber-500/40 shadow-xl flex items-center justify-center">
                <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-amber-950/60 via-slate-950 to-slate-950 flex items-center justify-center text-amber-400">
                  <Crown className="w-5 h-5 text-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]" />
                </div>
              </div>
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-base sm:text-xl md:text-2xl tracking-tight bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400 bg-clip-text text-transparent truncate drop-shadow-sm">
                  Родовід Малеєвих
                </h1>
                <span className="text-[10px] sm:text-xs bg-amber-500/15 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono font-bold shrink-0 shadow-sm shadow-amber-500/10">
                  {totalPersons} осіб
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-amber-200/60 hidden md:flex items-center gap-1.5 truncate font-serif italic">
                <Shield className="w-3 h-3 text-amber-500/80 inline" />
                <span>The Maleev Lineage • Фамільний архів та священне дерево роду</span>
              </p>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="relative hidden md:block flex-1 max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/60" />
            <input
              type="text"
              placeholder="Пошук у родоводі..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-slate-900/90 focus:bg-slate-900 border border-slate-800 focus:border-amber-500/70 rounded-2xl text-sm text-amber-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-amber-300 transition"
              >
                ✕
              </button>
            )}
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="md:hidden p-2.5 text-amber-300/80 hover:text-amber-200 bg-slate-900/90 active:bg-slate-800 rounded-xl border border-slate-800 transition shadow-sm"
              title="Пошук"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Add Person Button */}
            <button
              onClick={onAddPerson}
              className="group relative flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 active:from-amber-600 active:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Додати родича</span>
              <span className="sm:hidden">Додати</span>
            </button>

            {/* Data Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDataMenuOpen(!isDataMenuOpen)}
                className="flex items-center gap-1.5 p-2.5 sm:px-3 sm:py-2 bg-slate-900/90 hover:bg-slate-850 active:bg-slate-800 text-slate-300 hover:text-amber-300 text-xs sm:text-sm rounded-xl border border-amber-500/30 hover:border-amber-500/50 transition-all shadow-md cursor-pointer"
                title="Управління архівом"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline font-medium text-xs">Архів</span>
              </button>

              {isDataMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsDataMenuOpen(false)} 
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-slate-950/95 backdrop-blur-2xl border border-amber-500/30 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-amber-400/70 border-b border-slate-800 mb-1">
                      Фамільні дані
                    </div>
                    <button
                      onClick={() => {
                        setIsDataMenuOpen(false);
                        onExport();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-200 hover:text-amber-300 hover:bg-amber-500/10 rounded-xl transition cursor-pointer font-medium"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      Зберегти резервну копію (JSON)
                    </button>
                    <button
                      onClick={() => {
                        setIsDataMenuOpen(false);
                        onImport();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-200 hover:text-amber-300 hover:bg-amber-500/10 rounded-xl transition cursor-pointer font-medium"
                    >
                      <Upload className="w-4 h-4 text-cyan-400" />
                      Відновити з файлу (JSON)
                    </button>
                    <div className="h-px bg-slate-800/80 my-1" />
                    <button
                      onClick={() => {
                        setIsDataMenuOpen(false);
                        onReset();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-rose-400 hover:bg-rose-500/15 rounded-xl transition cursor-pointer font-medium"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Скинути до чистого шаблону
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
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/60" />
              <input
                type="text"
                autoFocus
                placeholder="Пошук за ім'ям, роллю, роками..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-900 border border-amber-500/30 focus:border-amber-400 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none shadow-lg"
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

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-800/60 py-2 sm:py-2.5 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            onClick={() => onViewChange('tree')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'tree'
                ? 'bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <GitFork className="w-3.5 h-3.5 rotate-180 text-amber-400" />
            <span>Дерево Роду</span>
          </button>

          <button
            onClick={() => onViewChange('cards')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'cards'
                ? 'bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-500/10 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Картки ({totalPersons})</span>
          </button>

          <button
            onClick={() => onViewChange('timeline')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'timeline'
                ? 'bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-500/10 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Хронологія</span>
          </button>

          <button
            onClick={() => onViewChange('stats')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'stats'
                ? 'bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-500/10 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Аналітика</span>
          </button>
        </div>

      </div>
    </header>
  );
};
