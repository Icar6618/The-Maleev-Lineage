import React, { useMemo, useState } from 'react';
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
  Quote,
  Camera,
  Image as ImageIcon,
  ZoomIn,
  Volume2
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
  const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; caption?: string; year?: string } | null>(null);

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
            <div 
              onClick={() => {
                if (person.avatarUrl) {
                  setLightboxPhoto({ url: person.avatarUrl, caption: `${fullName} • Портрет` });
                } else {
                  onEdit(person);
                }
              }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[3px] bg-gradient-to-tr from-[#d4af37] via-[#ffd700] to-[#8c501e] shadow-[0_0_20px_rgba(212,175,55,0.35)] shrink-0 cursor-pointer relative group transition-transform hover:scale-105"
              title={person.avatarUrl ? 'Натисніть для перегляду у повний розмір' : 'Натисніть, щоб додати фото'}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#26170c] to-[#0f0904] flex items-center justify-center font-['Cinzel'] text-2xl sm:text-3xl font-black text-[#ffd700] overflow-hidden relative">
                {person.avatarUrl ? (
                  <>
                    <img
                      src={person.avatarUrl}
                      alt={fullName}
                      className="w-full h-full object-cover rounded-full"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                      <ZoomIn className="w-6 h-6 text-[#ffd700]" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center group-hover:text-[#ffd700]">
                    <span className="group-hover:hidden">{initialLetter}</span>
                    <Camera className="w-6 h-6 hidden group-hover:block text-[#ffd700]" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl sm:text-3xl font-black font-['Cinzel'] text-transparent bg-clip-text bg-gradient-to-r from-[#fffbeb] via-[#ffd700] to-[#e6ca65] break-words drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  {fullName}
                </h2>
                <button
                  type="button"
                  onClick={() => onEdit(person)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#d4af37]/20 hover:bg-[#d4af37]/40 active:scale-95 text-[#ffd700] rounded-xl border border-[#d4af37]/50 text-xs font-['Cinzel'] font-bold transition cursor-pointer"
                  title="Редагувати"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{hasName ? 'Редагувати' : 'Вписати'}</span>
                </button>
              </div>

              {!hasName && (
                <div 
                  onClick={() => onEdit(person)}
                  className="mt-2 p-3 bg-gradient-to-r from-[#382312] to-[#24170d] border border-[#d4af37] rounded-xl flex items-center justify-between gap-2 cursor-pointer hover:brightness-110 transition shadow-sm text-left"
                >
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-[#ffd700] shrink-0" />
                    <div>
                      <p className="text-xs font-['Cinzel'] font-bold text-[#ffd700]">Порожній шаблон</p>
                      <p className="text-[11px] text-[#fef3c7]/80">Натисніть тут, щоб вписати ім'я, дати, фах та світлину</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-[#ffd700] text-slate-950 text-xs font-bold rounded-lg font-['Cinzel'] shrink-0">
                    Вписати
                  </span>
                </div>
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

          {/* Audio Message / Voice Note */}
          {person.audioUrl && (
            <div className="bg-gradient-to-r from-[#2c1a0e]/95 via-[#1e1208]/90 to-[#140b05]/95 p-3.5 sm:p-4 rounded-2xl border border-[#d4af37]/60 shadow-[0_4px_20px_rgba(212,175,55,0.2)] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4af37] to-[#8c501e] p-[1.5px] shrink-0 shadow-md">
                  <div className="w-full h-full rounded-full bg-[#1c1007] flex items-center justify-center text-[#ffd700]">
                    <Volume2 className="w-5 h-5 text-[#ffd700]" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-['Cinzel'] font-bold text-[#ffd700] tracking-wide">
                    Голосове послання Віктора
                  </p>
                  <p className="text-xs text-[#fef3c7] italic font-serif">
                    «Давай, бублик»
                  </p>
                </div>
              </div>

              <audio 
                controls 
                src={person.audioUrl} 
                className="w-full sm:w-64 h-9 rounded-xl outline-none"
              />
            </div>
          )}

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

          {/* ======================================================== */}
          {/* СІМЕЙНИЙ ФОТОАЛЬБОМ (PHOTO GALLERY)                      */}
          {/* ======================================================== */}
          <div className="space-y-3 pt-2 border-t border-[#d4af37]/30">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-[#ffd700] flex items-center gap-1.5 font-['Cinzel']">
                <ImageIcon className="w-4 h-4 text-[#d4af37]" />
                <span>Сімейний фотоальбом {person.photos && person.photos.length > 0 ? `(${person.photos.length})` : ''}</span>
              </h3>

              <button
                onClick={() => onEdit(person)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#24170d] hover:bg-[#332012] active:scale-95 text-[#ffd700] border border-[#d4af37]/50 rounded-xl text-xs font-['Cinzel'] font-bold cursor-pointer transition shadow-xs"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{person.photos && person.photos.length > 0 ? '+ Додати ще' : '+ Додати фото'}</span>
              </button>
            </div>

            {person.photos && person.photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {person.photos.map((ph, idx) => (
                  <div
                    key={idx}
                    onClick={() => setLightboxPhoto(ph)}
                    className="group bg-[#150d07] border border-[#d4af37]/35 hover:border-[#ffd700] rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] shadow-md flex flex-col"
                  >
                    <div className="aspect-square w-full bg-black/60 overflow-hidden relative">
                      <img
                        src={ph.url}
                        alt={ph.caption || 'Світлина'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <ZoomIn className="w-6 h-6 text-[#ffd700]" />
                      </div>
                      {ph.year && (
                        <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-black/80 text-[10px] text-[#ffd700] border border-[#d4af37]/40 font-mono">
                          {ph.year}
                        </span>
                      )}
                    </div>
                    {ph.caption && (
                      <p className="p-2 text-xs text-[#fef3c7] font-medium truncate font-serif italic bg-[#180e07]">
                        «{ph.caption}»
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div 
                onClick={() => onEdit(person)}
                className="bg-[#150d07]/70 p-4 rounded-2xl border border-dashed border-[#d4af37]/30 text-center cursor-pointer hover:border-[#d4af37]/60 hover:bg-[#1a1008] transition"
              >
                <Camera className="w-6 h-6 text-[#d4af37]/50 mx-auto mb-1" />
                <p className="text-xs text-[#d4af37]/70 font-['Cinzel']">
                  У цьому літописі ще немає світлин.
                </p>
                <p className="text-[11px] text-[#fef3c7]/60 mt-0.5">
                  Натисніть тут, щоб додати світлину або поповнити сімейний архів
                </p>
              </div>
            )}
          </div>

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

        {/* Sticky Bottom Action Bar */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#1c120a] via-[#24170d] to-[#1c120a] border-t border-[#d4af37]/40 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(person)}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-[#b48228] via-[#ffd700] to-[#b48228] hover:brightness-110 active:scale-[0.99] text-slate-950 font-extrabold text-sm rounded-2xl shadow-[0_4px_20px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 transition cursor-pointer font-['Cinzel'] tracking-wide"
          >
            <Edit3 className="w-4 h-4 text-slate-950" />
            <span>{hasName ? 'Редагувати дані та світлини' : 'Вписати дані родича'}</span>
          </button>
        </div>
      </div>

      {/* Lightbox Modal (Full-Screen Photo Viewer) */}
      {lightboxPhoto && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-lg animate-in fade-in duration-200"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 p-3 text-[#d4af37] hover:text-[#ffd700] bg-[#1a1107]/80 hover:bg-[#2a1b0d] rounded-full border border-[#d4af37]/50 cursor-pointer shadow-lg z-10 transition active:scale-95"
            title="Закрити"
          >
            <X className="w-6 h-6" />
          </button>

          <div 
            className="max-w-4xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxPhoto.url}
              alt={lightboxPhoto.caption || 'Світлина'}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl border-2 border-[#d4af37]/70 shadow-[0_0_40px_rgba(212,175,55,0.4)]"
            />
            {(lightboxPhoto.caption || lightboxPhoto.year) && (
              <div className="mt-3.5 text-center">
                {lightboxPhoto.caption && (
                  <p className="text-base sm:text-lg text-[#ffd700] font-['Cinzel'] font-bold drop-shadow">
                    {lightboxPhoto.caption}
                  </p>
                )}
                {lightboxPhoto.year && (
                  <p className="text-xs text-[#fef3c7]/80 font-mono mt-0.5">
                    Рік зйомки: {lightboxPhoto.year}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
