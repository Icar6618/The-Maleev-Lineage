import React, { useMemo } from 'react';
import type { Person } from '../types/family';
import { 
  Users, 
  Layers, 
  MapPin, 
  Briefcase, 
  Heart, 
  Sparkles,
  Award
} from 'lucide-react';

interface StatsViewProps {
  persons: Person[];
}

export const StatsView: React.FC<StatsViewProps> = ({ persons }) => {
  const stats = useMemo(() => {
    const total = persons.length;
    const living = persons.filter((p) => p.isLiving).length;
    const deceased = total - living;
    const males = persons.filter((p) => p.gender === 'male').length;
    const females = persons.filter((p) => p.gender === 'female').length;

    const generations = Array.from(new Set(persons.map((p) => p.generation || 1)));
    const maxGen = Math.max(...generations, 1);

    // Locations
    const placesMap = new Map<string, number>();
    persons.forEach((p) => {
      if (p.birthPlace) {
        placesMap.set(p.birthPlace, (placesMap.get(p.birthPlace) || 0) + 1);
      }
    });

    // Professions
    const profMap = new Map<string, number>();
    persons.forEach((p) => {
      if (p.profession) {
        profMap.set(p.profession, (profMap.get(p.profession) || 0) + 1);
      }
    });

    // Branches
    const branchesMap = new Map<string, number>();
    persons.forEach((p) => {
      const b = p.branch || 'Головна гілка';
      branchesMap.set(b, (branchesMap.get(b) || 0) + 1);
    });

    return {
      total,
      living,
      deceased,
      males,
      females,
      maxGen,
      places: Array.from(placesMap.entries()).sort((a, b) => b[1] - a[1]),
      professions: Array.from(profMap.entries()).sort((a, b) => b[1] - a[1]),
      branches: Array.from(branchesMap.entries()).sort((a, b) => b[1] - a[1]),
    };
  }, [persons]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="text-center">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100">
          Аналітика та Демографія Роду
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          Загальні відомості про родовід Малеєвих, покоління, географію та історію.
        </p>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">Всього родичів</span>
            <Users className="w-5 h-5 text-amber-400" />
          </div>
          <p className="font-serif text-3xl font-bold text-slate-100">{stats.total}</p>
          <p className="text-[11px] text-slate-500 mt-1">Зафіксовано в системі</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">Поколінь</span>
            <Layers className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="font-serif text-3xl font-bold text-cyan-400">{stats.maxGen}</p>
          <p className="text-[11px] text-slate-500 mt-1">Охоплено лінією часу</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">Нині живих</span>
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="font-serif text-3xl font-bold text-emerald-400">{stats.living}</p>
          <p className="text-[11px] text-slate-500 mt-1">{stats.deceased} у вічній пам'яті</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">Співвідношення</span>
            <Heart className="w-5 h-5 text-rose-400" />
          </div>
          <p className="font-serif text-xl font-bold text-slate-100">
            <span className="text-cyan-400">{stats.males} Ч</span> / <span className="text-rose-400">{stats.females} Ж</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Чоловіків та жінок</p>
        </div>
      </div>

      {/* Grid of details: Geography, Professions, Branches */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Geography */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-slate-200 text-sm">Географія походження</h3>
          </div>
          {stats.places.length === 0 ? (
            <p className="text-xs text-slate-500">Місця народження ще не вказано</p>
          ) : (
            <div className="space-y-3">
              {stats.places.map(([place, count]) => (
                <div key={place} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 truncate">{place}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-mono">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Professions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-slate-200 text-sm">Професії та покликання</h3>
          </div>
          {stats.professions.length === 0 ? (
            <p className="text-xs text-slate-500">Професії ще не заповнено</p>
          ) : (
            <div className="space-y-3">
              {stats.professions.map(([prof, count]) => (
                <div key={prof} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 truncate">{prof}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 font-mono">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Branches */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-slate-200 text-sm">Родинні гілки</h3>
          </div>
          <div className="space-y-3">
            {stats.branches.map(([branch, count]) => (
              <div key={branch} className="flex items-center justify-between text-xs">
                <span className="text-slate-300">{branch}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-mono">
                  {count} родичів
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
