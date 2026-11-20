import React, { useMemo } from 'react';
import type { Person } from '../types/family';
import { MapPin } from 'lucide-react';

interface TimelineViewProps {
  persons: Person[];
  onSelectPerson: (person: Person) => void;
}

interface TimelineEvent {
  year: number;
  dateStr: string;
  type: 'birth' | 'death';
  person: Person;
  title: string;
  description?: string;
  place?: string;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  persons,
  onSelectPerson,
}) => {
  const events = useMemo(() => {
    const list: TimelineEvent[] = [];

    persons.forEach((p) => {
      // Birth event
      if (p.birthDate) {
        const year = parseInt(p.birthDate.match(/\d{4}/)?.[0] || '0');
        if (year > 1800 && year < 2100) {
          list.push({
            year,
            dateStr: p.birthDate,
            type: 'birth',
            person: p,
            title: `Народження: ${p.firstName} ${p.lastName}`,
            description: p.profession ? `Професія / покликання: ${p.profession}` : undefined,
            place: p.birthPlace,
          });
        }
      }

      // Death event
      if (!p.isLiving && p.deathDate) {
        const year = parseInt(p.deathDate.match(/\d{4}/)?.[0] || '0');
        if (year > 1800 && year < 2100) {
          list.push({
            year,
            dateStr: p.deathDate,
            type: 'death',
            person: p,
            title: `Світла пам'ять: ${p.firstName} ${p.lastName}`,
            description: p.bio ? `«${p.bio.slice(0, 100)}...»` : undefined,
            place: p.deathPlace,
          });
        }
      }
    });

    return list.sort((a, b) => a.year - b.year);
  }, [persons]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      
      {/* Intro */}
      <div className="text-center mb-12">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100">
          Хронологія Роду Малеєвих
        </h2>
        <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
          Хронологічний літопис народжень, етапів та ключових подій у житті нашої родини крізь десятиліття.
        </p>
      </div>

      {/* Vertical Timeline */}
      <div className="relative border-l-2 border-slate-800 ml-4 sm:ml-32 space-y-8 pb-12">
        {events.map((evt, idx) => {
          const isBirth = evt.type === 'birth';
          const isMale = evt.person.gender === 'male';

          return (
            <div key={`${evt.person.id}-${evt.type}-${idx}`} className="relative pl-6 sm:pl-8 group">
              
              {/* Year marker on left (for desktop) */}
              <div className="hidden sm:block absolute -left-32 top-1 text-right w-24">
                <span className="font-serif text-lg font-bold text-amber-400">
                  {evt.year}
                </span>
              </div>

              {/* Node dot on line */}
              <div className={`absolute -left-[9px] top-2 w-4 h-4 rounded-full border-2 border-slate-950 transition group-hover:scale-125 ${
                isBirth ? 'bg-amber-400 ring-4 ring-amber-500/20' : 'bg-slate-600 ring-4 ring-slate-700/20'
              }`} />

              {/* Event card */}
              <div
                onClick={() => onSelectPerson(evt.person)}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-lg transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                  <div className="flex items-center gap-2">
                    <span className="sm:hidden font-mono font-bold text-amber-400 text-sm">
                      {evt.year} р.
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isBirth ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isBirth ? 'Народження' : 'У вічність'}
                    </span>
                    {evt.person.roleLabel && (
                      <span className="text-xs text-slate-500 font-mono">
                        ({evt.person.roleLabel})
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-400 hover:text-amber-400 transition">
                    Переглянути профіль →
                  </span>
                </div>

                <div className="flex items-start gap-3 mt-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    isMale ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {evt.person.firstName[0]}{evt.person.lastName[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-100 group-hover:text-amber-400 transition text-base">
                      {evt.title}
                    </h3>

                    {evt.place && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{evt.place}</span>
                      </div>
                    )}

                    {evt.description && (
                      <p className="text-xs text-slate-400 mt-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                        {evt.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
