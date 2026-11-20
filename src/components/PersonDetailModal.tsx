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
  ArrowRight,
  PlusCircle
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
  const hasName = Boolean(person.firstName || person.lastName);
  const fullName = hasName 
    ? `${person.lastName} ${person.firstName} ${person.middleName || ''}`.trim()
    : (person.roleLabel || 'Не заповнено');
  const initialLetter = person.firstName?.[0] || person.lastName?.[0] || person.roleLabel?.[0] || '?';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className={`p-4 sm:p-6 flex items-start justify-between shrink-0 relative ${
          isMale 
            ? 'bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-900 border-b border-cyan-500/20' 
            : 'bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 border-b border-rose-500/20'
        }`}>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 font-mono">
              Покоління {person.generation}
            </span>
            {person.roleLabel && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {person.roleLabel}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(person)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-semibold text-xs rounded-xl shadow-md transition cursor-pointer"
              title="Редагувати"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{hasName ? 'Редагувати' : 'Заповнити'}</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Видалити цю картку з дерева?`)) {
                  onDelete(person.id);
                  onClose();
                }
              }}
              className="p-2 bg-slate-800/80 hover:bg-rose-900/60 active:bg-rose-900 text-slate-300 hover:text-rose-400 rounded-xl transition cursor-pointer"
              title="Видалити"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 active:bg-slate-700 text-slate-200 rounded-xl transition cursor-pointer"
              title="Закрити"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body (Scrollable on mobile) */}
        <div className="p-4 sm:p-8 space-y-5 overflow-y-auto flex-1">
          
          {/* Avatar & Main Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center font-serif text-2xl sm:text-3xl font-bold shrink-0 shadow-2xl ${
              isMale
                ? 'bg-gradient-to-tr from-cyan-900 to-cyan-700 text-cyan-200 border-2 border-cyan-400/50'
                : 'bg-gradient-to-tr from-rose-900 to-rose-700 text-rose-200 border-2 border-rose-400/50'
            }`}>
              {person.avatarUrl ? (
                <img
                  src={person.avatarUrl}
                  alt={fullName}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <span>{initialLetter}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-100 break-words">
                {fullName}
              </h2>

              {!hasName && (
                <p className="text-xs text-amber-400 mt-1 flex items-center justify-center sm:justify-start gap-1">
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Порожній шаблон • Натисніть «Заповнити» вгорі</span>
                </p>
              )}

              {person.maidenName && (
                <p className="text-xs sm:text-sm text-amber-400 italic mt-0.5">
                  Дівоче прізвище: {person.maidenName}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2.5">
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                  hasName
                    ? person.isLiving
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {hasName ? (person.isLiving ? '🟢 Живий(а)' : '🕊️ Світла пам’ять') : 'Статус не вказано'}
                </span>

                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {isMale ? 'Чоловік' : 'Жінка'}
                </span>
              </div>
            </div>
          </div>

          {/* Life Dates & Locations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-950/60 p-3.5 sm:p-4 rounded-2xl border border-slate-800 text-xs sm:text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-slate-300 font-medium">Роки життя:</span>
              </div>
              <p className="font-mono text-slate-200 pl-5">
                {person.birthDate ? `${person.birthDate} — ${person.isLiving ? 'досі' : (person.deathDate || '?')}` : 'Не вказано'}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Briefcase className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-slate-300 font-medium">Професія:</span>
              </div>
              <p className="text-slate-200 pl-5 truncate">
                {person.profession || 'Не вказано'}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-300 font-medium">Місце народження:</span>
              </div>
              <p className="text-slate-200 pl-5 truncate">
                {person.birthPlace || 'Не вказано'}
              </p>
            </div>

            {!person.isLiving && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="text-slate-300 font-medium">Місце спочинку:</span>
                </div>
                <p className="text-slate-200 pl-5 truncate">
                  {person.deathPlace || 'Не вказано'}
                </p>
              </div>
            )}
          </div>

          {/* Favorite Quote */}
          {person.favoriteQuote && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-3.5 rounded-2xl border-l-4 border-amber-400 text-xs sm:text-sm text-amber-200 italic font-serif">
              <span className="text-amber-400 text-base font-bold mr-1">“</span>
              {person.favoriteQuote}
              <span className="text-amber-400 text-base font-bold ml-1">”</span>
            </div>
          )}

          {/* Biography & Memories */}
          {person.bio && (
            <div className="space-y-2">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Біографія та спогади
              </h3>
              <div className="bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {person.bio}
              </div>
            </div>
          )}

          {/* Family Connections */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-cyan-400" />
              Родинні зв'язки
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Parents */}
              <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                <span className="text-xs font-medium text-slate-400">Батьки:</span>
                {father || mother ? (
                  <div className="space-y-1.5">
                    {father && (
                      <button
                        onClick={() => onSelectPerson(father)}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900 active:bg-slate-800 text-xs text-left transition"
                      >
                        <span className="text-cyan-300 font-medium truncate">
                          👨 Батько: {father.firstName || father.lastName ? `${father.firstName} ${father.lastName}` : (father.roleLabel || 'Батько')}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500 shrink-0 ml-1" />
                      </button>
                    )}
                    {mother && (
                      <button
                        onClick={() => onSelectPerson(mother)}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900 active:bg-slate-800 text-xs text-left transition"
                      >
                        <span className="text-rose-300 font-medium truncate">
                          👩 Мати: {mother.firstName || mother.lastName ? `${mother.firstName} ${mother.lastName}` : (mother.roleLabel || 'Мати')}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500 shrink-0 ml-1" />
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Батьків не вказано</p>
                )}
              </div>

              {/* Spouses */}
              <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                <span className="text-xs font-medium text-slate-400">Подружжя:</span>
                {spouses.length > 0 ? (
                  <div className="space-y-1.5">
                    {spouses.map((sp) => (
                      <button
                        key={sp.id}
                        onClick={() => onSelectPerson(sp)}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900 active:bg-slate-800 text-xs text-left transition"
                      >
                        <span className="text-amber-300 font-medium truncate">
                          💍 {sp.firstName || sp.lastName ? `${sp.firstName} ${sp.lastName}` : (sp.roleLabel || 'Подружжя')}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500 shrink-0 ml-1" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Подружжя не вказано</p>
                )}
              </div>

              {/* Children */}
              <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                <span className="text-xs font-medium text-slate-400">Діти ({children.length}):</span>
                {children.length > 0 ? (
                  <div className="space-y-1.5">
                    {children.map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => onSelectPerson(ch)}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900 active:bg-slate-800 text-xs text-left transition"
                      >
                        <span className="text-slate-200 font-medium truncate">
                          👶 {ch.firstName || ch.lastName ? `${ch.firstName} ${ch.lastName}` : (ch.roleLabel || 'Дитина')}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500 shrink-0 ml-1" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Дітей не вказано</p>
                )}
              </div>

              {/* Siblings */}
              <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                <span className="text-xs font-medium text-slate-400">Брати та сестри ({siblings.length}):</span>
                {siblings.length > 0 ? (
                  <div className="space-y-1.5">
                    {siblings.map((sb) => (
                      <button
                        key={sb.id}
                        onClick={() => onSelectPerson(sb)}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900 active:bg-slate-800 text-xs text-left transition"
                      >
                        <span className="text-slate-300 font-medium truncate">
                          🤝 {sb.firstName || sb.lastName ? `${sb.firstName} ${sb.lastName}` : (sb.roleLabel || 'Брат/сестра')}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500 shrink-0 ml-1" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Братів чи сестер не знайдено</p>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
