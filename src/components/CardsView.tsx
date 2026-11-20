import React, { useState, useMemo } from 'react';
import type { Person } from '../types/family';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  User, 
  ArrowUpDown,
  PlusCircle,
  Quote
} from 'lucide-react';

interface CardsViewProps {
  persons: Person[];
  searchQuery: string;
  onSelectPerson: (person: Person) => void;
  onAddPerson?: () => void;
}

export const CardsView: React.FC<CardsViewProps> = ({
  persons,
  searchQuery,
  onSelectPerson,
}) => {
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [livingFilter, setLivingFilter] = useState<'all' | 'living' | 'deceased'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'birthDate' | 'generation'>('generation');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    persons.forEach(p => p.tags?.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [persons]);

  // Filtered and sorted list
  const filteredPersons = useMemo(() => {
    return persons
      .filter((p) => {
        // Search query
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const fullName = `${p.lastName} ${p.firstName} ${p.roleLabel || ''} ${p.middleName || ''} ${p.maidenName || ''}`.toLowerCase();
          const details = `${p.profession || ''} ${p.birthPlace || ''} ${p.bio || ''}`.toLowerCase();
          if (!fullName.includes(q) && !details.includes(q)) return false;
        }

        // Gender filter
        if (genderFilter !== 'all' && p.gender !== genderFilter) return false;

        // Living filter
        if (livingFilter === 'living' && !p.isLiving) return false;
        if (livingFilter === 'deceased' && p.isLiving) return false;

        // Tag filter
        if (selectedTag !== 'all' && !p.tags?.includes(selectedTag)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'generation') {
          return (a.generation || 1) - (b.generation || 1);
        }
        if (sortBy === 'name') {
          const nameA = a.lastName || a.roleLabel || '';
          const nameB = b.lastName || b.roleLabel || '';
          return nameA.localeCompare(nameB, 'uk');
        }
        if (sortBy === 'birthDate') {
          const yearA = parseInt(a.birthDate || '9999');
          const yearB = parseInt(b.birthDate || '9999');
          return yearA - yearB;
        }
        return 0;
      });
  }, [persons, searchQuery, genderFilter, livingFilter, selectedTag, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Filters & Sorting Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Gender Filter */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl text-xs">
            <button
              onClick={() => setGenderFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                genderFilter === 'all' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Усі ({persons.length})
            </button>
            <button
              onClick={() => setGenderFilter('male')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                genderFilter === 'male' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Чоловіки
            </button>
            <button
              onClick={() => setGenderFilter('female')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                genderFilter === 'female' ? 'bg-rose-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Жінки
            </button>
          </div>

          {/* Living Filter */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl text-xs">
            <button
              onClick={() => setLivingFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                livingFilter === 'all' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Усі статуси
            </button>
            <button
              onClick={() => setLivingFilter('living')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                livingFilter === 'living' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Живі
            </button>
            <button
              onClick={() => setLivingFilter('deceased')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                livingFilter === 'deceased' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Пам'ять
            </button>
          </div>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">Усі мітки / категорії</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ArrowUpDown className="w-4 h-4 text-slate-500" />
          <span>Сортування:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="generation">За старшинством роду</option>
            <option value="name">За прізвищем та ім'ям</option>
            <option value="birthDate">За роком народження</option>
          </select>
        </div>
      </div>

      {/* Grid of Cards */}
      {filteredPersons.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
          <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-300">Родичів не знайдено</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Спробуйте змінити фільтри або пошуковий запит
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredPersons.map((person) => {
            const hasName = Boolean(person.firstName || person.lastName);
            const fullName = hasName 
              ? `${person.lastName} ${person.firstName}`.trim() 
              : (person.roleLabel || 'Не заповнено');

            const isMale = person.gender === 'male';
            const initialLetter = person.firstName?.[0] || person.lastName?.[0] || person.roleLabel?.[0] || '?';

            return (
              <div
                key={person.id}
                onClick={() => onSelectPerson(person)}
                className={`group bg-gradient-to-br from-[#1a130a]/95 via-[#130d07]/95 to-[#0b0704]/95 text-[#fef3c7] border-2 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  hasName ? 'border-[#d4af37]/80 hover:border-[#ffd700]' : 'border-2 border-dashed border-[#d4af37]/50 hover:border-[#ffd700]'
                }`}
              >
                {/* Gold Shimmer Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ffd700] to-transparent shadow-[0_1px_4px_rgba(212,175,55,0.7)]" />

                <div>
                  {/* Header Row */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[10px] font-['Cinzel'] font-bold px-2 py-0.5 rounded-full bg-[#26190e]/90 text-[#fef3c7] border border-[#d4af37]/60">
                      {person.roleLabel || 'Член роду'}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-serif font-bold ${
                      hasName 
                        ? person.isLiving
                          ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40'
                          : 'bg-[#24170d] text-[#d4af37]/70 border border-[#d4af37]/30'
                        : 'bg-[#24170d] text-[#d4af37]/70 border border-[#d4af37]/30'
                    }`}>
                      {hasName ? (person.isLiving ? 'У здравії' : 'Вічна пам’ять') : 'Порожнє поле'}
                    </span>
                  </div>

                  {/* 1) Фото & 2) Назва */}
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className={`w-12 h-12 rounded-full p-[2px] shadow-md ring-2 ring-white/90 shrink-0 ${
                      isMale
                        ? 'bg-gradient-to-tr from-[#d4af37] via-[#fef08a] to-[#78350f]'
                        : 'bg-gradient-to-tr from-[#e6b17e] via-[#fef08a] to-[#991b1b]'
                    }`}>
                      <div className="w-full h-full rounded-full bg-[#120c06] flex items-center justify-center font-['Cinzel'] text-base font-extrabold overflow-hidden border border-[#d4af37]/40">
                        {person.avatarUrl ? (
                          <img
                            src={person.avatarUrl}
                            alt={fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[#d4af37]">{initialLetter}</span>
                        )}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-['Cinzel'] font-extrabold text-sm text-[#fffbeb] group-hover:text-[#ffd700] transition truncate">
                        {fullName}
                      </h4>
                      {person.middleName ? (
                        <p className="text-xs text-[#d4af37]/75 italic truncate font-serif">{person.middleName}</p>
                      ) : !hasName ? (
                        <p className="text-[11px] text-[#d4af37] flex items-center gap-1 mt-0.5 font-serif font-bold">
                          <PlusCircle className="w-3 h-3 text-[#d4af37]" />
                          <span>Заповнити профіль</span>
                        </p>
                      ) : null}
                      {person.maidenName && (
                        <p className="text-[10px] text-[#fca5a5] italic truncate font-serif">
                          ({person.maidenName})
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 3) Дата народження & 4) Дата смерті */}
                  <div className="grid grid-cols-2 gap-1 bg-[#1f150c]/80 px-2.5 py-1 rounded-xl border border-[#d4af37]/35 text-[10px] font-serif shadow-xs mb-2">
                    <div className="flex items-center gap-1 text-[#d4af37]/90 truncate">
                      <Calendar className="w-3 h-3 text-[#d4af37] shrink-0" />
                      <span className="font-semibold text-[#d4af37]/80">Нар:</span>
                      <span className="font-['Cinzel'] font-bold text-[#fffbeb] truncate">{person.birthDate || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#d4af37]/90 truncate">
                      <span className="text-[#d4af37] text-[10px] font-bold">†</span>
                      <span className="font-semibold text-[#d4af37]/80">Смерть:</span>
                      <span className="font-['Cinzel'] font-bold text-[#fffbeb] truncate">
                        {person.isLiving ? 'живе' : (person.deathDate || '—')}
                      </span>
                    </div>
                  </div>

                  {/* 7) Місце народження & 6) Професія */}
                  <div className="space-y-1 text-xs font-serif text-[#fef3c7] mb-2">
                    <div className="flex items-center gap-1.5 text-[11px] truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                      <span className="text-[#d4af37]/80 font-semibold shrink-0">Місце нар.:</span>
                      <span className="font-medium text-[#fef3c7] truncate">{person.birthPlace || 'Не зазначено'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] truncate">
                      <Briefcase className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                      <span className="text-[#d4af37]/80 font-semibold shrink-0">Професія:</span>
                      <span className="font-medium text-[#fef3c7] truncate">{person.profession || 'Не зазначено'}</span>
                    </div>
                  </div>

                  {/* 5) Улюблена цитата */}
                  <div className="bg-[#24170d]/90 px-2.5 py-1 rounded-lg border-l-2 border-[#d4af37] text-[10px] text-[#fef3c7] italic flex items-center gap-1 shadow-xs mb-2">
                    <Quote className="w-2.5 h-2.5 text-[#ffd700] shrink-0 inline opacity-90" />
                    <span className="truncate">{person.favoriteQuote ? `«${person.favoriteQuote}»` : '«Життєве кредо / цитата»'}</span>
                  </div>

                  {/* Bio teaser */}
                  {person.bio && (
                    <p className="text-[11px] text-[#d4af37]/90 line-clamp-2 italic bg-[#1f150c]/60 p-2 rounded-lg border border-[#d4af37]/30">
                      "{person.bio}"
                    </p>
                  )}
                </div>

                {/* Tags footer */}
                {person.tags && person.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-[#d4af37]/30">
                    {person.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[9px] font-['Cinzel'] font-bold bg-[#26190e] border border-[#d4af37]/40 text-[#fef3c7] px-2 py-0.5 rounded shadow-xs"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
