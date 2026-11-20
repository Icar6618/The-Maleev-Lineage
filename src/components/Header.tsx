import React from 'react';
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
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2 gap-4 flex-wrap md:flex-nowrap">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-amber-400">
                <TreePine className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-lg md:text-xl text-slate-100 tracking-wide">
                  Родовід Малеєвих
                </h1>
                <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                  {totalPersons} родичів
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                The Maleev Lineage • Генеалогічний сайт та архів пам'яті
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-xs min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Пошук за ім'ям, містом, професією..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-800/80 hover:bg-slate-800 focus:bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-lg text-sm text-slate-200 placeholder-slate-400 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Actions: Add Person & Data Management */}
          <div className="flex items-center gap-2">
            <button
              onClick={onAddPerson}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-semibold text-sm rounded-lg shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Додати родича</span>
              <span className="sm:hidden">Додати</span>
            </button>

            <div className="relative group">
              <button
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg border border-slate-700 transition cursor-pointer"
                title="Управління даними"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline text-xs">Дані</span>
              </button>
              <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50">
                <button
                  onClick={onExport}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  Експорт у JSON
                </button>
                <button
                  onClick={onImport}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-cyan-400" />
                  Імпорт із JSON
                </button>
                <div className="h-px bg-slate-800 my-1" />
                <button
                  onClick={onReset}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Скинути до зразка
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 border-t border-slate-800/60 pt-2 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onViewChange('tree')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap cursor-pointer ${
              currentView === 'tree'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <GitFork className="w-4 h-4 rotate-180" />
            Інтерактивне дерево
          </button>

          <button
            onClick={() => onViewChange('cards')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap cursor-pointer ${
              currentView === 'cards'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-4 h-4" />
            Список роду (Картки)
          </button>

          <button
            onClick={() => onViewChange('timeline')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap cursor-pointer ${
              currentView === 'timeline'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Clock className="w-4 h-4" />
            Хронологія подій
          </button>

          <button
            onClick={() => onViewChange('stats')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap cursor-pointer ${
              currentView === 'stats'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Статистика роду
          </button>
        </div>
      </div>
    </header>
  );
};
