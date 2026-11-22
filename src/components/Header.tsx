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
  TreePine,
  Moon,
  Sun
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
  isNight: boolean;
  onToggleTheme: () => void;
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
  isNight,
  onToggleTheme,
}) => {
  const [isDataMenuOpen, setIsDataMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#120d08]/90 backdrop-blur-xl border-b border-[#d4af37]/30 shadow-2xl shadow-black/80">
      {/* Top Gold Leaf Trim */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#d4af37] to-transparent shadow-[0_0_10px_rgba(212,175,55,0.4)]" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo & Family Coat of Arms */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="relative group cursor-pointer">
              {/* Heraldic Aura */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#d4af37] via-[#991b1b] to-[#b45309] rounded-2xl blur-sm opacity-50 group-hover:opacity-90 transition duration-300" />
              
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-b from-[#2a1a0e] to-[#120d08] p-[1.5px] border border-[#d4af37]/60 shadow-xl flex items-center justify-center">
                <div className="w-full h-full rounded-[14px] bg-[#1a110a] flex items-center justify-center text-[#d4af37]">
                  <TreePine className="w-6 h-6 text-[#d4af37] drop-shadow-[0_2px_10px_rgba(212,175,55,0.6)]" />
                </div>
              </div>
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-['Cinzel'] font-bold text-base sm:text-xl md:text-2xl tracking-wide bg-gradient-to-r from-[#fffbeb] via-[#fef3c7] to-[#d4af37] bg-clip-text text-transparent truncate drop-shadow">
                  Родовід Малеєвих
                </h1>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#991b1b]/20 border border-[#d4af37]/40 text-[#fef3c7] text-[10px] sm:text-xs font-serif font-bold shadow-sm">
                  <span>{totalPersons} осіб</span>
                </div>
              </div>
              <p className="text-[11px] sm:text-xs text-[#d4af37]/70 hidden md:flex items-center gap-1.5 truncate font-serif italic">
                <Shield className="w-3.5 h-3.5 text-[#d4af37] inline" />
                <span>The Maleev Lineage • Дерево Роду та Фамільний Літопис</span>
              </p>
            </div>
          </div>

          {/* Desktop Search Bar (Antique Scroll Input) */}
          <div className="relative hidden md:block flex-1 max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]/60" />
            <input
              type="text"
              placeholder="Шукати у літописі..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-[#1e150d]/80 hover:bg-[#251a10] focus:bg-[#251a10] border border-[#d4af37]/40 focus:border-[#d4af37] rounded-xl text-sm text-[#fef3c7] placeholder-[#d4af37]/40 focus:outline-none transition-all shadow-inner font-serif"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#d4af37]/70 hover:text-white transition"
              >
                ✕
              </button>
            )}
          </div>

          {/* Top Actions: Add to Tree & Archive */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="md:hidden p-2.5 text-[#d4af37] bg-[#1e150d] hover:bg-[#2a1d12] rounded-xl border border-[#d4af37]/40 transition"
              title="Шукати"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Add Person (Button) */}
            <button
              onClick={onAddPerson}
              className="group relative flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-[#d4af37] via-[#f59e0b] to-[#b45309] hover:from-[#f59e0b] hover:to-[#d4af37] text-slate-950 font-['Cinzel'] font-bold text-xs sm:text-sm rounded-xl shadow-[0_4px_16px_rgba(212,175,55,0.3)] transition-all duration-200 hover:scale-[1.02] cursor-pointer border border-[#fef3c7]/50"
            >
              <UserPlus className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline">Вписати у родовід</span>
              <span className="sm:hidden">Вписати</span>
            </button>

            {/* Theme Toggle Button: Day / Night with Stars & Moon */}
            <button
              type="button"
              onClick={onToggleTheme}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all duration-300 cursor-pointer text-xs font-['Cinzel'] font-bold shadow-md ${
                !isNight
                  ? 'bg-gradient-to-r from-[#0a1120] to-[#141f38] text-[#38bdf8] border-[#38bdf8]/50 hover:border-[#7dd3fc] hover:shadow-[0_0_15px_rgba(56,189,248,0.35)]'
                  : 'bg-gradient-to-r from-[#24170d] to-[#362214] text-[#ffd700] border-[#d4af37]/60 hover:border-[#ffd700] hover:shadow-[0_0_15px_rgba(212,175,55,0.35)]'
              }`}
              title={isNight ? 'Перемкнути на сонячний небесний день' : 'Перемкнути на зоряну ніч з місяцем'}
            >
              {!isNight ? (
                <>
                  <Moon className="w-4 h-4 text-[#38bdf8] fill-[#38bdf8]/20" />
                  <span className="hidden sm:inline text-[#e0f2fe]">Зоряна ніч</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-[#ffd700] fill-[#ffd700]/20" />
                  <span className="hidden sm:inline text-[#fef3c7]">Світлий день</span>
                </>
              )}
            </button>

            {/* Archive Menu */}
            <div className="relative">
              <button
                onClick={() => setIsDataMenuOpen(!isDataMenuOpen)}
                className="flex items-center gap-1.5 p-2.5 sm:px-3 sm:py-2 bg-[#1e150d] hover:bg-[#2a1d12] text-[#fef3c7] text-xs sm:text-sm rounded-xl border border-[#d4af37]/40 transition-all cursor-pointer font-serif"
                title="Фамільний Літопис"
              >
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
                <span className="hidden md:inline font-['Cinzel'] text-xs font-semibold">Літопис</span>
              </button>

              {isDataMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsDataMenuOpen(false)} 
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a120b] border border-[#d4af37]/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[10px] font-['Cinzel'] uppercase tracking-wider text-[#d4af37] border-b border-[#d4af37]/20 mb-1">
                      Архівні Грамоти
                    </div>
                    <button
                      onClick={() => {
                        setIsDataMenuOpen(false);
                        onExport();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-[#fef3c7] hover:text-[#d4af37] hover:bg-[#d4af37]/10 rounded-xl transition cursor-pointer font-serif"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      Зберегти Грамоту (JSON)
                    </button>
                    <button
                      onClick={() => {
                        setIsDataMenuOpen(false);
                        onImport();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-[#fef3c7] hover:text-[#d4af37] hover:bg-[#d4af37]/10 rounded-xl transition cursor-pointer font-serif"
                    >
                      <Upload className="w-4 h-4 text-cyan-400" />
                      Відновити Грамоту (JSON)
                    </button>
                    <div className="h-px bg-[#d4af37]/20 my-1" />
                    <button
                      onClick={() => {
                        setIsDataMenuOpen(false);
                        onReset();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-rose-400 hover:bg-rose-500/15 rounded-xl transition cursor-pointer font-serif"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Скинути до чистого літопису
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
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]/60" />
              <input
                type="text"
                autoFocus
                placeholder="Шукати персону..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-[#1e150d] border border-[#d4af37]/40 rounded-xl text-sm text-[#fef3c7] placeholder-[#d4af37]/40 focus:outline-none shadow-lg font-serif"
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

        {/* View Switcher Tabs (Royal Medieval Banners) */}
        <div className="flex items-center gap-2 border-t border-[#d4af37]/20 py-2 sm:py-2.5 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            onClick={() => onViewChange('tree')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-['Cinzel'] font-bold rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'tree'
                ? 'bg-gradient-to-r from-[#d4af37]/25 via-[#b45309]/30 to-[#d4af37]/25 text-[#fef3c7] border border-[#d4af37]/60 shadow-[0_2px_12px_rgba(212,175,55,0.2)]'
                : 'text-[#d4af37]/60 hover:text-[#fef3c7] hover:bg-[#1e150d]'
            }`}
          >
            <GitFork className="w-3.5 h-3.5 rotate-180 text-[#d4af37]" />
            <span>3D Дерево Роду</span>
          </button>

          <button
            onClick={() => onViewChange('cards')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-['Cinzel'] font-medium rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'cards'
                ? 'bg-gradient-to-r from-[#d4af37]/25 via-[#b45309]/30 to-[#d4af37]/25 text-[#fef3c7] border border-[#d4af37]/60 shadow-[0_2px_12px_rgba(212,175,55,0.2)] font-bold'
                : 'text-[#d4af37]/60 hover:text-[#fef3c7] hover:bg-[#1e150d]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Родинні Особи ({totalPersons})</span>
          </button>

          <button
            onClick={() => onViewChange('timeline')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-['Cinzel'] font-medium rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'timeline'
                ? 'bg-gradient-to-r from-[#d4af37]/25 via-[#b45309]/30 to-[#d4af37]/25 text-[#fef3c7] border border-[#d4af37]/60 shadow-[0_2px_12px_rgba(212,175,55,0.2)] font-bold'
                : 'text-[#d4af37]/60 hover:text-[#fef3c7] hover:bg-[#1e150d]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Хроніка Епох</span>
          </button>

          <button
            onClick={() => onViewChange('stats')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-['Cinzel'] font-medium rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'stats'
                ? 'bg-gradient-to-r from-[#d4af37]/25 via-[#b45309]/30 to-[#d4af37]/25 text-[#fef3c7] border border-[#d4af37]/60 shadow-[0_2px_12px_rgba(212,175,55,0.2)] font-bold'
                : 'text-[#d4af37]/60 hover:text-[#fef3c7] hover:bg-[#1e150d]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Сила Династії</span>
          </button>
        </div>

      </div>
    </header>
  );
};
