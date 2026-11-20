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
  TreePine
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
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 p-0.5 shadow-md shadow-amber-500/20 shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-amber-400">
                <TreePine className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              </div>
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-serif font-bold text-base sm:text-lg md:text-xl text-slate-100 tracking-tight truncate">
                  Родовід Малеєвих
                </h1>
                <span className="text-[10px] sm:text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 sm:px-2 py-0.5 rounded-full font-mono shrink-0">
                  {totalPersons}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block truncate">
                The Maleev Lineage • Генеалогічний сайт та архів пам'яті
              </p>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="relative hidden md:block flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Пошук родичів..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 bg-slate-800/80 focus:bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl text-sm text-slate-200 placeholder-slate-400 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Top Actions: Search toggle (mobile) + Add + Data Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="md:hidden p-2 text-slate-300 hover:text-white bg-slate-800/80 active:bg-slate-700 rounded-xl transition"
              title="Пошук"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Add Person Button */}
            <button
              onClick={onAddPerson}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-amber-500/20 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Додати родича</span>
              <span className="sm:hidden font-medium">Додати</span>
            </button>

            {/* Data Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDataMenuOpen(!isDataMenuOpen)}
                className="flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-slate-300 text-xs sm:text-sm rounded-xl border border-slate-700 transition cursor-pointer"
                title="Управління даними"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline text-xs">Дані</span>
              </button>

              {isDataMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsDataMenuOpen(false)} 
                  />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => {
                        setIsDataMenuOpen(false);
                        onExport();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      Експорт у JSON файл
                    </button>
                    <button
                      onClick={() => {
                        setIsDataMenuOpen(false);
                        onImport();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-cyan-400" />
                      Імпорт із JSON файлу
                    </button>
                    <div className="h-px bg-slate-800 my-1" />
                    <button
                      onClick={() => {
                        setIsDataMenuOpen(false);
                        onReset();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Скинути до шаблону
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        {isSearchExpanded && (
          <div className="md:hidden pb-2.5 pt-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Пошук за ім'ям, роллю, містом..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl text-base text-slate-200 placeholder-slate-400 focus:outline-none"
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

        {/* View Switcher Tabs (Horizontal scroll on mobile) */}
        <div className="flex items-center gap-1.5 border-t border-slate-800/80 py-2 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            onClick={() => onViewChange('tree')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl transition whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'tree'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <GitFork className="w-3.5 h-3.5 rotate-180" />
            <span>Дерево</span>
          </button>

          <button
            onClick={() => onViewChange('cards')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl transition whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'cards'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Картки ({totalPersons})</span>
          </button>

          <button
            onClick={() => onViewChange('timeline')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl transition whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'timeline'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Хронологія</span>
          </button>

          <button
            onClick={() => onViewChange('stats')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl transition whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'stats'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
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
