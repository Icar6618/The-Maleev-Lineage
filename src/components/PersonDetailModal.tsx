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
  PlusCircle,
  Quote
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-gradient-to-br from-[#1c140c] via-[#120d07] to-[#090603] border-2 border-[#d4af37]/80 rounded-t-3xl sm:rounded-3xl max-w-2xl w-full shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden max-h-[92vh] sm:max-h-[85vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Metallic Gold Shimmer Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-[#ffd700] to-transparent shadow-[0_2px_10px_rgba(212,175,55,0.7)] shrink-0" />

        {/* Header Banner */}
        <div className="p-4 sm:p-5 flex items-start justify-between shrink-0 relative bg-gradient-to-r from-[#2a1a0f] via-[#1a110a] to-[#140c06] border-b border-[#d4af37]/40">
          <div className="flex items-center gap-1.5 flex-wrap">
            {person.roleLabel ? (
              <span className="text-xs px-3 py-1 rounded-full bg-[#2d1b0d] text-[#ffd700] border border-[#d4af37]/70 font-['Cinzel'] font-bold shadow-xs">
                {person.roleLabel}
              </span>
            ) : (
              <span className="text-xs px-3 py-1 rounded-full bg-[#22140a] text-[#fef3c7] border border-[#d4af37]/40 font-['Cinzel'] tracking-wide">
                Член роду
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(person)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#b48228] via-[#d4af37] to-[#996515] hover:brightness-110 active:scale-95 text-[#1a1107] font-bold text-xs rounded-xl shadow-[0_2px_10px_rgba(212,175,55,0.35)] transition cursor-pointer font-['Cinzel']"
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
              className="p-2 bg-[#22140a] hover:bg-rose-950/80 active:bg-rose-900 text-[#d4af37]/80 hover:text-rose-400 border border-[#d4af37]/30 rounded-xl transition cursor-pointer"
              title="Видалити"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-[#22140a] hover:bg-[#382313] active:bg-[#382313] text-[#d4af37] hover:text-[#ffd700] border border-[#d4af37]/30 rounded-xl transition cursor-pointer"
              title="Закрити"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body (Scrollable on mobile) */}
        <div className="p-4 sm:p-7 space-y-5 overflow-y-auto flex-1">
          
          {/* Avatar & Main Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[3px] bg-gradient-to-tr from-[#d4af37] via-[#ffd700] to-[#8c501e] shadow-[0_0_20px_rgba(212,175,55,0.35)] shrink-0">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#26170c] to-[#0f0904] flex items-center justify-center font-['Cinzel'] text-2xl sm:text-3xl font-black text-[#ffd700] overflow-hidden">
                {person.avatarUrl ? (
                  <img
                    src={person.avatarUrl}
                    alt={fullName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span>{initialLetter}</span>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-black font-['Cinzel'] text-transparent bg-clip-text bg-gradient-to-r from-[#fffbeb] via-[#ffd700] to-[#e6ca65] break-words drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {fullName}
              </h2>

              {!hasName && (
                <p className="text-xs text-[#ffd700] mt-1 flex items-center justify-center sm:justify-start gap-1 font-['Cinzel']">
                  <PlusCircle className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Порожній шаблон • Натисніть «Заповнити» вгорі</span>
                </p>
              )}

              {person.maidenName && (
                <p className="text-xs sm:text-sm text-[#d4af37]/90 italic mt-0.5 font-['Cinzel']">
                  Дівоче прізвище: {person.maidenName}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2.5">
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-['Cinzel'] font-semibold ${
                  hasName
                    ? person.isLiving
                      ? 'bg-[#142918] text-[#86efac] border border-[#22c55e]/50 shadow-[0_0_8px_rgba(34,197,94,0.2)]'
                      : 'bg-[#241a14] text-[#e2d5c4] border border-[#a89988]/40'
                    : 'bg-[#22140a] text-[#d4af37]/70 border border-[#d4af37]/30'
                }`}>
                  {hasName ? (person.isLiving ? '🟢 У Здравії' : '🕊️ Вічна пам’ять') : 'Статус не вказано'}
                </span>

                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#22140a] text-[#fef3c7] border border-[#d4af37]/30 font-['Cinzel']">
                  {isMale ? 'Чоловік' : 'Жінка'}
                </span>
              </div>
            </div>
          </div>

          {/* Life Dates & Locations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#150d07]/90 p-4 rounded-2xl border border-[#d4af37]/35 text-xs sm:text-sm shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-[#d4af37] font-['Cinzel'] font-semibold">
                <Calendar className="w-3.5 h-3.5 text-[#ffd700] shrink-0" />
                <span>Роки життя:</span>
              </div>
              <p className="text-[#fffbeb] pl-5 font-mono">
                {person.birthDate ? `${person.birthDate} — ${person.isLiving ? 'досі' : (person.deathDate || '?')}` : 'Не вказано'}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-[#d4af37] font-['Cinzel'] font-semibold">
                <Briefcase className="w-3.5 h-3.5 text-[#ffd700] shrink-0" />
                <span>Професія:</span>
              </div>
              <p className="text-[#fffbeb] pl-5 truncate">
                {person.profession || 'Не вказано'}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-[#d4af37] font-['Cinzel'] font-semibold">
                <MapPin className="w-3.5 h-3.5 text-[#ffd700] shrink-0" />
                <span>Місце народження:</span>
              </div>
              <p className="text-[#fffbeb] pl-5 truncate">
                {person.birthPlace || 'Не вказано'}
              </p>
            </div>

            {!person.isLiving && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#d4af37] font-['Cinzel'] font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-[#ffd700] shrink-0" />
                  <span>Місце спочинку:</span>
                </div>
                <p className="text-[#fffbeb] pl-5 truncate">
                  {person.deathPlace || 'Не вказано'}
                </p>
              </div>
            )}
          </div>

          {/* Favorite Quote */}
          {person.favoriteQuote && (
            <div className="bg-gradient-to-r from-[#2a1a0e]/95 via-[#1d1209]/90 to-[#140c06]/90 p-4 rounded-2xl border-l-4 border-[#d4af37] border border-[#d4af37]/30 text-xs sm:text-sm text-[#fef3c7] shadow-md">
              <div className="text-[11px] font-semibold text-[#ffd700] not-italic mb-1 flex items-center gap-1.5 font-['Cinzel']">
                <Quote className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Улюблена цитата / Життєве кредо:</span>
              </div>
              <p className="italic font-serif pl-5 text-[#fffbeb]">
                «{person.favoriteQuote}»
              </p>
            </div>
          )}

          {/* Biography & Memories */}
          {person.bio && (
            <div className="space-y-2">
              <h3 className="text-xs sm:text-sm font-bold text-[#ffd700] flex items-center gap-1.5 font-['Cinzel']">
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
                Біографія та спогади
              </h3>
              <div className="bg-[#150d07]/90 p-4 rounded-2xl border border-[#d4af37]/35 text-xs sm:text-sm text-[#fef3c7] leading-relaxed whitespace-pre-line shadow-inner">
                {person.bio}
              </div>
            </div>
          )}

          {/* Family Connections */}
          <div className="space-y-3 pt-2 border-t border-[#d4af37]/30">
            <h3 className="text-xs sm:text-sm font-bold text-[#ffd700] flex items-center gap-1.5 font-['Cinzel']">
              <Users className="w-4 h-4 text-[#d4af37]" />
              Родинні зв'язки
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Parents */}
              <div className="bg-[#150d07]/90 p-3.5 rounded-2xl border border-[#d4af37]/35 space-y-2">
                <span className="text-xs font-semibold text-[#d4af37] font-['Cinzel']">Батьки:</span>
                {father || mother ? (
                  <div className="space-y-1.5">
                    {father && (
                      <button
                        onClick={() => onSelectPerson(father)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-[#24170d] to-[#180e06] hover:from-[#352112] hover:to-[#24160a] border border-[#d4af37]/40 hover:border-[#ffd700]/70 text-xs text-left transition shadow-sm cursor-pointer"
                      >
                        <span className="text-[#fef3c7] font-medium truncate font-['Cinzel']">
                          👨 Батько: {father.firstName || father.lastName ? `${father.firstName} ${father.lastName}` : (father.roleLabel || 'Батько')}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#d4af37] shrink-0 ml-1" />
                      </button>
                    )}
                    {mother && (
                      <button
                        onClick={() => onSelectPerson(mother)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-[#24170d] to-[#180e06] hover:from-[#352112] hover:to-[#24160a] border border-[#d4af37]/40 hover:border-[#ffd700]/70 text-xs text-left transition shadow-sm cursor-pointer"
                      >
                        <span className="text-[#fef3c7] font-medium truncate font-['Cinzel']">
                          👩 Мати: {mother.firstName || mother.lastName ? `${mother.firstName} ${mother.lastName}` : (mother.roleLabel || 'Мати')}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#d4af37] shrink-0 ml-1" />
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-[#d4af37]/50 italic pl-1">Батьків не вказано</p>
                )}
              </div>

              {/* Spouses */}
              <div className="bg-[#150d07]/90 p-3.5 rounded-2xl border border-[#d4af37]/35 space-y-2">
                <span className="text-xs font-semibold text-[#d4af37] font-['Cinzel']">Подружжя:</span>
                {spouses.length > 0 ? (
                  <div className="space-y-1.5">
                    {spouses.map((sp) => (
                      <button
                        key={sp.id}
                        onClick={() => onSelectPerson(sp)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-[#24170d] to-[#180e06] hover:from-[#352112] hover:to-[#24160a] border border-[#d4af37]/40 hover:border-[#ffd700]/70 text-xs text-left transition shadow-sm cursor-pointer"
                      >
                        <span className="text-[#ffd700] font-medium truncate font-['Cinzel']">
                          💍 {sp.firstName || sp.lastName ? `${sp.firstName} ${sp.lastName}` : (sp.roleLabel || 'Подружжя')}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#d4af37] shrink-0 ml-1" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#d4af37]/50 italic pl-1">Подружжя не вказано</p>
                )}
              </div>

              {/* Children */}
              <div className="bg-[#150d07]/90 p-3.5 rounded-2xl border border-[#d4af37]/35 space-y-2">
                <span className="text-xs font-semibold text-[#d4af37] font-['Cinzel']">Діти ({children.length}):</span>
                {children.length > 0 ? (
                  <div className="space-y-1.5">
                    {children.map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => onSelectPerson(ch)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-[#24170d] to-[#180e06] hover:from-[#352112] hover:to-[#24160a] border border-[#d4af37]/40 hover:border-[#ffd700]/70 text-xs text-left transition shadow-sm cursor-pointer"
                      >
                        <span className="text-[#fef3c7] font-medium truncate font-['Cinzel']">
                          👶 {ch.firstName || ch.lastName ? `${ch.firstName} ${ch.lastName}` : (ch.roleLabel || 'Дитина')}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#d4af37] shrink-0 ml-1" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#d4af37]/50 italic pl-1">Дітей не вказано</p>
                )}
              </div>

              {/* Siblings */}
              <div className="bg-[#150d07]/90 p-3.5 rounded-2xl border border-[#d4af37]/35 space-y-2">
                <span className="text-xs font-semibold text-[#d4af37] font-['Cinzel']">Брати та сестри ({siblings.length}):</span>
                {siblings.length > 0 ? (
                  <div className="space-y-1.5">
                    {siblings.map((sb) => (
                      <button
                        key={sb.id}
                        onClick={() => onSelectPerson(sb)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-[#24170d] to-[#180e06] hover:from-[#352112] hover:to-[#24160a] border border-[#d4af37]/40 hover:border-[#ffd700]/70 text-xs text-left transition shadow-sm cursor-pointer"
                      >
                        <span className="text-[#fef3c7] font-medium truncate font-['Cinzel']">
                          🤝 {sb.firstName || sb.lastName ? `${sb.firstName} ${sb.lastName}` : (sb.roleLabel || 'Брат/сестра')}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#d4af37] shrink-0 ml-1" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#d4af37]/50 italic pl-1">Братів чи сестер не знайдено</p>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
