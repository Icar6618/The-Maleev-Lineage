import React, { useMemo } from 'react';
import type { Person } from '../types/family';
import { 
  X, 
  Edit3, 
  Trash2, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Users, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface PersonDetailModalProps {
  person: Person | null;
  allPersons: Person[];
  onClose: () => void;
  onEdit: (person: Person) => void;
  onDelete: (personId: string) => void;
  onSelectPerson: (person: Person) => void;
}

export const PersonDetailModal: React.FC<PersonDetailModalProps> = ({
  person,
  allPersons,
  onClose,
  onEdit,
  onDelete,
  onSelectPerson,
}) => {
  if (!person) return null;

  const personMap = useMemo(() => {
    const map = new Map<string, Person>();
    allPersons.forEach((p) => map.set(p.id, p));
    return map;
  }, [allPersons]);

  const father = person.fatherId ? personMap.get(person.fatherId) : null;
  const mother = person.motherId ? personMap.get(person.motherId) : null;

  const spouses = useMemo(() => {
    return (person.spouseIds || [])
      .map((id) => personMap.get(id))
      .filter(Boolean) as Person[];
  }, [person.spouseIds, personMap]);

  const children = useMemo(() => {
    // Both explicitly listed in childrenIds and people who have this person as father/mother
    const directChildren = (person.childrenIds || [])
      .map((id) => personMap.get(id))
      .filter(Boolean) as Person[];

    const inferredChildren = allPersons.filter(
      (p) => (p.fatherId === person.id || p.motherId === person.id) && !directChildren.some(dc => dc.id === p.id)
    );

    return [...directChildren, ...inferredChildren];
  }, [person, allPersons, personMap]);

  // Siblings
  const siblings = useMemo(() => {
    if (!person.fatherId && !person.motherId) return [];
    return allPersons.filter(
      (p) => p.id !== person.id && (
        (person.fatherId && p.fatherId === person.fatherId) ||
        (person.motherId && p.motherId === person.motherId)
      )
    );
  }, [person, allPersons]);

  const isMale = person.gender === 'male';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className={`h-24 p-6 flex items-start justify-between relative ${
          isMale 
            ? 'bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-900 border-b border-cyan-500/20' 
            : 'bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 border-b border-rose-500/20'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 font-mono">
              Покоління {person.generation}
            </span>
            {person.branch && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {person.branch}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(person)}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl transition cursor-pointer"
              title="Редагувати картку"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Ви впевнені, що хочете видалити ${person.firstName} ${person.lastName} з дерева?`)) {
                  onDelete(person.id);
                  onClose();
                }
              }}
              className="p-2 bg-slate-800/80 hover:bg-rose-900/60 text-slate-300 hover:text-rose-400 rounded-xl transition cursor-pointer"
              title="Видалити"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl transition cursor-pointer"
              title="Закрити"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 -mt-12 space-y-6">
          
          {/* Avatar & Main Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center font-serif text-3xl font-bold shrink-0 shadow-2xl ${
              isMale
                ? 'bg-gradient-to-tr from-cyan-900 to-cyan-700 text-cyan-200 border-2 border-cyan-400/50'
                : 'bg-gradient-to-tr from-rose-900 to-rose-700 text-rose-200 border-2 border-rose-400/50'
            }`}>
              {person.avatarUrl ? (
                <img
                  src={person.avatarUrl}
                  alt={person.firstName}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <span>{person.firstName[0]}{person.lastName[0]}</span>
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-100">
                {person.lastName} {person.firstName} {person.middleName}
              </h2>
              {person.maidenName && (
                <p className="text-sm text-amber-400 italic mt-0.5">
                  Дівоче прізвище: {person.maidenName}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  person.isLiving
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {person.isLiving ? '🟢 Нині живий(а)' : '🕊️ Світла пам’ять'}
                </span>

                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                  {isMale ? 'Чоловік' : 'Жінка'}
                </span>
              </div>
            </div>
          </div>

          {/* Life Dates & Locations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-300 font-medium">Роки життя:</span>
              </div>
              <p className="text-sm font-mono text-slate-200 pl-6">
                {person.birthDate || 'невідомо'} — {person.isLiving ? 'досі' : (person.deathDate || 'невідомо')}
              </p>
            </div>

            {person.profession && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Briefcase className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-slate-300 font-medium">Професія:</span>
                </div>
                <p className="text-sm text-slate-200 pl-6 truncate">
                  {person.profession}
                </p>
              </div>
            )}

            {person.birthPlace && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-300 font-medium">Місце народження:</span>
                </div>
                <p className="text-sm text-slate-200 pl-6 truncate">
                  {person.birthPlace}
                </p>
              </div>
            )}

            {!person.isLiving && person.deathPlace && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-slate-300 font-medium">Місце упокоєння:</span>
                </div>
                <p className="text-sm text-slate-200 pl-6 truncate">
                  {person.deathPlace}
                </p>
              </div>
            )}
          </div>

          {/* Biography & Memories */}
          {person.bio && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Біографія та спогади
              </h3>
              <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {person.bio}
              </div>
            </div>
          )}

          {/* Family Connections */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Родинні зв'язки
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Parents */}
              <div className="bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-medium text-slate-400">Батьки:</span>
                {father || mother ? (
                  <div className="space-y-1.5">
                    {father && (
                      <button
                        onClick={() => onSelectPerson(father)}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-left transition cursor-pointer"
                      >
                        <span className="text-cyan-300 font-medium truncate">
                          👨 Батько: {father.firstName} {father.lastName}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                      </button>
                    )}
                    {mother && (
                      <button
                        onClick={() => onSelectPerson(mother)}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-left transition cursor-pointer"
                      >
                        <span className="text-rose-300 font-medium truncate">
                          👩 Мати: {mother.firstName} {mother.lastName}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Батьків не вказано</p>
                )}
              </div>

              {/* Spouses */}
              <div className="bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-medium text-slate-400">Подружжя:</span>
                {spouses.length > 0 ? (
                  <div className="space-y-1.5">
                    {spouses.map((sp) => (
                      <button
                        key={sp.id}
                        onClick={() => onSelectPerson(sp)}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-left transition cursor-pointer"
                      >
                        <span className="text-amber-300 font-medium truncate">
                          💍 {sp.firstName} {sp.lastName} {sp.maidenName ? `(${sp.maidenName})` : ''}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Подружжя не вказано</p>
                )}
              </div>

              {/* Children */}
              <div className="bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-medium text-slate-400">Діти ({children.length}):</span>
                {children.length > 0 ? (
                  <div className="space-y-1.5">
                    {children.map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => onSelectPerson(ch)}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-left transition cursor-pointer"
                      >
                        <span className="text-slate-200 font-medium truncate">
                          👶 {ch.firstName} {ch.lastName}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Дітей не вказано</p>
                )}
              </div>

              {/* Siblings */}
              <div className="bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-medium text-slate-400">Брати та сестри ({siblings.length}):</span>
                {siblings.length > 0 ? (
                  <div className="space-y-1.5">
                    {siblings.map((sb) => (
                      <button
                        key={sb.id}
                        onClick={() => onSelectPerson(sb)}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-left transition cursor-pointer"
                      >
                        <span className="text-slate-300 font-medium truncate">
                          🤝 {sb.firstName} {sb.lastName}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Братів чи сестер не знайдено</p>
                )}
              </div>

            </div>
          </div>

          {/* Tags */}
          {person.tags && person.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
              {person.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
