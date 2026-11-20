import React, { useState, useMemo } from 'react';
import type { Person } from '../types/family';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  User, 
  ArrowUpDown,
  PlusCircle
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
            <option value="generation">За поколінням</option>
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
                className={`group bg-slate-900/90 hover:bg-slate-850 border rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  hasName ? 'border-slate-800' : 'border-2 border-dashed border-slate-800 hover:border-amber-500/50'
                } ${
                  isMale ? 'hover:border-cyan-500/40' : 'hover:border-rose-500/40'
                }`}
              >
                <div>
                  {/* Header Row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                      Покоління {person.generation || 1}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      hasName 
                        ? person.isLiving
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {hasName ? (person.isLiving ? 'Живий(а)' : 'У вічності') : 'Порожнє поле'}
                    </span>
                  </div>

                  {/* Avatar & Name */}
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-serif text-lg font-bold shrink-0 ${
                      isMale
                        ? 'bg-gradient-to-tr from-cyan-900/40 to-cyan-700/30 text-cyan-300 border border-cyan-500/30'
                        : 'bg-gradient-to-tr from-rose-900/40 to-rose-700/30 text-rose-300 border border-rose-500/30'
                    }`}>
                      {person.avatarUrl ? (
                        <img
                          src={person.avatarUrl}
                          alt={fullName}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <span>{initialLetter}</span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className={`font-semibold transition text-sm truncate ${
                        hasName ? 'text-slate-100 group-hover:text-amber-400' : 'text-amber-400'
                      }`}>
                        {fullName}
                      </h4>
                      {person.middleName ? (
                        <p className="text-xs text-slate-400 truncate">{person.middleName}</p>
                      ) : !hasName ? (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <PlusCircle className="w-3 h-3 text-amber-400" />
                          <span>Заповнити профіль</span>
                        </p>
                      ) : null}
                      {person.maidenName && (
                        <p className="text-[11px] text-amber-400/80 italic truncate">
                          ({person.maidenName})
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Info list */}
                  <div className="space-y-1.5 text-xs text-slate-400 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="font-mono text-slate-300">
                        {person.birthDate ? (
                          `${person.birthDate} — ${person.isLiving ? 'досі' : (person.deathDate || '?')}`
                        ) : (
                          <span className="text-slate-400 italic">Роки життя не вказано</span>
                        )}
                      </span>
                    </div>

                    {person.profession && (
                      <div className="flex items-center gap-2 truncate">
                        <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{person.profession}</span>
                      </div>
                    )}

                    {person.birthPlace && (
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{person.birthPlace}</span>
                      </div>
                    )}
                  </div>

                  {/* Bio teaser */}
                  {person.bio && (
                    <p className="text-xs text-slate-400 line-clamp-2 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/50">
                      "{person.bio}"
                    </p>
                  )}
                </div>

                {/* Tags footer */}
                {person.tags && person.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4 pt-3 border-t border-slate-800/80">
                    {person.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] bg-slate-800/60 hover:bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md"
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
