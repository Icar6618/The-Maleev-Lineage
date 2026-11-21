import React, { useState, useEffect } from 'react';
import type { Person, Gender, FamilyPhoto } from '../types/family';
import { X, Save, UserPlus, Upload, Camera, Image as ImageIcon, Trash2, Plus, Link as LinkIcon, Volume2 } from 'lucide-react';
import { compressImageFile } from '../utils/imageCompressor';

interface PersonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (person: Person) => void;
  initialPerson?: Person | null;
  allPersons: Person[];
  presetParent?: Person | null;
  presetSpouse?: Person | null;
}

export const PersonFormModal: React.FC<PersonFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPerson,
  allPersons,
  presetParent,
  presetSpouse,
}) => {
  const [roleLabel, setRoleLabel] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [maidenName, setMaidenName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [isLiving, setIsLiving] = useState(true);
  const [generation, setGeneration] = useState(3);
  const [birthDate, setBirthDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [deathPlace, setDeathPlace] = useState('');
  const [profession, setProfession] = useState('');
  const [favoriteQuote, setFavoriteQuote] = useState('');
  const [branch, setBranch] = useState('Основна гілка');
  const [fatherId, setFatherId] = useState<string>('');
  const [motherId, setMotherId] = useState<string>('');
  const [spouseIds, setSpouseIds] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [photos, setPhotos] = useState<FamilyPhoto[]>([]);

  useEffect(() => {
    if (initialPerson) {
      setRoleLabel(initialPerson.roleLabel || '');
      setFirstName(initialPerson.firstName || '');
      setLastName(initialPerson.lastName || '');
      setMiddleName(initialPerson.middleName || '');
      setMaidenName(initialPerson.maidenName || '');
      setGender(initialPerson.gender);
      setIsLiving(initialPerson.isLiving);
      setGeneration(initialPerson.generation || 3);
      setBirthDate(initialPerson.birthDate || '');
      setBirthPlace(initialPerson.birthPlace || '');
      setDeathDate(initialPerson.deathDate || '');
      setDeathPlace(initialPerson.deathPlace || '');
      setProfession(initialPerson.profession || '');
      setFavoriteQuote(initialPerson.favoriteQuote || '');
      setBranch(initialPerson.branch || 'Основна гілка');
      setFatherId(initialPerson.fatherId || '');
      setMotherId(initialPerson.motherId || '');
      setSpouseIds(initialPerson.spouseIds || []);
      setBio(initialPerson.bio || '');
      setTagsStr((initialPerson.tags || []).join(', '));
      setAvatarUrl(initialPerson.avatarUrl || '');
      setAudioUrl(initialPerson.audioUrl || '');
      setPhotos(initialPerson.photos || []);
    } else {
      setRoleLabel('');
      setFirstName('');
      setLastName('');
      setMiddleName('');
      setMaidenName('');
      setGender('male');
      setIsLiving(true);
      setBirthDate('');
      setBirthPlace('');
      setDeathDate('');
      setDeathPlace('');
      setProfession('');
      setFavoriteQuote('');
      setBranch('Основна гілка');
      setBio('');
      setTagsStr('');
      setAvatarUrl('');
      setAudioUrl('');
      setPhotos([]);

      if (presetParent) {
        setGeneration((presetParent.generation || 1) + 1);
        if (presetParent.gender === 'male') {
          setFatherId(presetParent.id);
          setMotherId(presetParent.spouseIds?.[0] || '');
        } else {
          setMotherId(presetParent.id);
          setFatherId(presetParent.spouseIds?.[0] || '');
        }
        setSpouseIds([]);
      } else if (presetSpouse) {
        setGeneration(presetSpouse.generation || 1);
        setSpouseIds([presetSpouse.id]);
        setGender(presetSpouse.gender === 'male' ? 'female' : 'male');
        setFatherId('');
        setMotherId('');
      } else {
        setGeneration(3);
        setFatherId('');
        setMotherId('');
        setSpouseIds([]);
      }
    }
  }, [initialPerson, presetParent, presetSpouse, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() && !lastName.trim() && !roleLabel.trim()) {
      alert("Будь ласка, вкажіть хоча б ім'я або роль родича.");
      return;
    }

    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newPerson: Person = {
      id: initialPerson ? initialPerson.id : `p-${Date.now()}`,
      roleLabel: roleLabel.trim() || undefined,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      middleName: middleName.trim() || undefined,
      maidenName: maidenName.trim() || undefined,
      gender,
      isLiving,
      generation: Number(generation) || 1,
      birthDate: birthDate.trim() || undefined,
      birthPlace: birthPlace.trim() || undefined,
      deathDate: !isLiving ? deathDate.trim() || undefined : undefined,
      deathPlace: !isLiving ? deathPlace.trim() || undefined : undefined,
      profession: profession.trim() || undefined,
      favoriteQuote: favoriteQuote.trim() || undefined,
      branch: branch.trim() || undefined,
      fatherId: fatherId || undefined,
      motherId: motherId || undefined,
      spouseIds: spouseIds.length > 0 ? spouseIds : undefined,
      childrenIds: initialPerson?.childrenIds || [],
      bio: bio.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      avatarUrl: avatarUrl.trim() || undefined,
      audioUrl: audioUrl.trim() || undefined,
      photos: photos.length > 0 ? photos : undefined,
    };

    onSave(newPerson);
    onClose();
  };

  const potentialFathers = allPersons.filter(
    (p) => p.gender === 'male' && (!initialPerson || p.id !== initialPerson.id)
  );
  const potentialMothers = allPersons.filter(
    (p) => p.gender === 'female' && (!initialPerson || p.id !== initialPerson.id)
  );
  const potentialSpouses = allPersons.filter(
    (p) => !initialPerson || p.id !== initialPerson.id
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-gradient-to-br from-[#1c140c] via-[#120d07] to-[#090603] border-2 border-[#d4af37]/80 rounded-t-3xl sm:rounded-3xl max-w-2xl w-full shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden max-h-[92vh] sm:max-h-[85vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Metallic Gold Shimmer Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-[#ffd700] to-transparent shadow-[0_2px_10px_rgba(212,175,55,0.7)] shrink-0" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#d4af37]/40 flex items-center justify-between shrink-0 bg-gradient-to-r from-[#2a1a0f] via-[#1a110a] to-[#140c06]">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#ffd700]" />
            <h2 className="font-['Cinzel'] text-base sm:text-lg font-bold text-[#ffd700] truncate">
              {initialPerson ? `Заповнення: ${initialPerson.roleLabel || initialPerson.firstName || 'Картка'}` : 'Додати родича'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#d4af37] hover:text-[#ffd700] rounded-xl active:bg-[#22140a] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          
          {/* Role Label */}
          <div>
            <label className="block text-xs font-semibold text-[#d4af37] mb-1 font-['Cinzel']">
              Роль / Ким приходиться
            </label>
            <input
              type="text"
              value={roleLabel}
              onChange={(e) => setRoleLabel(e.target.value)}
              placeholder="напр. Батько, Тітка, Я"
              className="w-full px-3.5 py-2.5 bg-[#120b06] border border-[#d4af37]/40 focus:border-[#ffd700] rounded-xl text-base sm:text-sm text-[#fffbeb] placeholder-[#a89078]/50 focus:outline-none"
            />
          </div>

          {/* ======================================================== */}
          {/* ПОРТРЕТ ТА СВІТЛИНА (AVATAR PHOTO UPLOAD)                 */}
          {/* ======================================================== */}
          <div className="bg-[#170e08]/95 p-3.5 sm:p-4 rounded-2xl border border-[#d4af37]/40 shadow-inner">
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-semibold text-[#ffd700] font-['Cinzel'] tracking-wide flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#ffd700]" />
                <span>Головна світлина / Портрет персони</span>
              </label>
              {avatarUrl && (
                <span className="text-[10px] text-emerald-400 font-sans font-medium">
                  ✓ Фото додано
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* Cameo Avatar Preview */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[2.5px] bg-gradient-to-tr from-[#d4af37] via-[#ffd700] to-[#8c501e] shadow-[0_0_18px_rgba(212,175,55,0.4)]">
                  <div className="w-full h-full rounded-full bg-[#120b06] flex items-center justify-center font-['Cinzel'] text-2xl font-black text-[#ffd700] overflow-hidden border border-[#d4af37]/40 relative">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Портрет"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#d4af37]/60">
                        <Camera className="w-7 h-7 mb-0.5 opacity-75" />
                        <span className="text-[9px] font-['Cinzel'] font-bold uppercase tracking-wider">
                          {firstName?.[0] || lastName?.[0] || roleLabel?.[0] || 'Фото'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="absolute -top-1 -right-1 p-1 bg-red-900/90 hover:bg-red-700 text-white rounded-full border border-red-500 shadow-md transition cursor-pointer"
                    title="Прибрати фото"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-2.5 w-full text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2c1c10] to-[#3a2516] hover:from-[#3a2516] hover:to-[#4a301c] active:scale-95 text-[#ffd700] border border-[#d4af37]/60 hover:border-[#ffd700] rounded-xl text-xs font-['Cinzel'] font-bold cursor-pointer transition shadow-sm">
                    <Upload className="w-4 h-4 text-[#ffd700]" />
                    <span>{avatarUrl ? 'Замінити світлину' : 'Завантажити фото з пристрою'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const compressed = await compressImageFile(file, 600, 0.85);
                          setAvatarUrl(compressed);
                        } catch (err) {
                          console.error('Failed to compress image', err);
                        }
                      }}
                    />
                  </label>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="px-3 py-2 bg-[#221209] hover:bg-red-950/70 text-red-300 hover:text-red-200 border border-red-800/50 rounded-xl text-xs font-['Cinzel'] transition cursor-pointer"
                    >
                      Видалити
                    </button>
                  )}
                </div>

                {/* Direct URL input option */}
                <div className="pt-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#d4af37]/70 mb-1">
                    <LinkIcon className="w-3 h-3 text-[#d4af37]/80" />
                    <span>Або вкажіть посилання на фото в інтернеті:</span>
                  </div>
                  <input
                    type="url"
                    value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder={avatarUrl.startsWith('data:') ? '✓ Завантажено локальний файл з вашого пристрою' : 'https://example.com/photo.jpg'}
                    className="w-full px-3 py-1.5 bg-[#100905] border border-[#d4af37]/30 focus:border-[#ffd700] rounded-lg text-xs text-[#fffbeb] placeholder-[#a89078]/40 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Names Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#d4af37] mb-1 font-['Cinzel']">
                Прізвище
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="напр. Малеєв"
                className="w-full px-3.5 py-2.5 bg-[#120b06] border border-[#d4af37]/40 focus:border-[#ffd700] rounded-xl text-base sm:text-sm text-[#fffbeb] placeholder-[#a89078]/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#d4af37] mb-1 font-['Cinzel']">
                Ім'я
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="напр. Віктор"
                className="w-full px-3.5 py-2.5 bg-[#120b06] border border-[#d4af37]/40 focus:border-[#ffd700] rounded-xl text-base sm:text-sm text-[#fffbeb] placeholder-[#a89078]/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#d4af37] mb-1 font-['Cinzel']">
                По батькові
              </label>
              <input
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="напр. Володимирович"
                className="w-full px-3.5 py-2.5 bg-[#120b06] border border-[#d4af37]/40 focus:border-[#ffd700] rounded-xl text-base sm:text-sm text-[#fffbeb] placeholder-[#a89078]/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#d4af37] mb-1 font-['Cinzel']">
                Дівоче прізвище (для жінок)
              </label>
              <input
                type="text"
                value={maidenName}
                onChange={(e) => setMaidenName(e.target.value)}
                placeholder="Дівоче прізвище"
                className="w-full px-3.5 py-2.5 bg-[#120b06] border border-[#d4af37]/40 focus:border-[#ffd700] rounded-xl text-base sm:text-sm text-[#fffbeb] placeholder-[#a89078]/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Gender & Living status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#150d07]/90 p-3.5 sm:p-4 rounded-2xl border border-[#d4af37]/35">
            <div>
              <label className="block text-xs font-semibold text-[#d4af37] mb-1.5 font-['Cinzel']">
                Стать
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`flex-1 py-2 sm:py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer font-['Cinzel'] ${
                    gender === 'male'
                      ? 'bg-gradient-to-r from-[#2a1a0f] to-[#3d2411] text-[#ffd700] border border-[#d4af37] shadow-sm'
                      : 'bg-[#120b06] text-[#a89078] border border-[#d4af37]/20 active:text-white'
                  }`}
                >
                  Чоловік
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`flex-1 py-2 sm:py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer font-['Cinzel'] ${
                    gender === 'female'
                      ? 'bg-gradient-to-r from-[#3d1822] to-[#241016] text-[#fca5a5] border border-rose-500/60 shadow-sm'
                      : 'bg-[#120b06] text-[#a89078] border border-[#d4af37]/20 active:text-white'
                  }`}
                >
                  Жінка
                </button>
              </div>
            </div>

            <div className="flex items-center pt-2 sm:pt-4">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-semibold text-[#fef3c7] font-['Cinzel']">
                <input
                  type="checkbox"
                  checked={isLiving}
                  onChange={(e) => setIsLiving(e.target.checked)}
                  className="w-5 h-5 rounded text-[#d4af37] focus:ring-[#ffd700] bg-[#120b06] border-[#d4af37]/50"
                />
                <span>Нині живий(а)</span>
              </label>
            </div>
          </div>

          {/* Dates & Places */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#d4af37] mb-1 font-['Cinzel']">
                Рік / дата народження
              </label>
              <input
                type="text"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder="напр. 1965"
                className="w-full px-3.5 py-2.5 bg-[#120b06] border border-[#d4af37]/40 focus:border-[#ffd700] rounded-xl text-base sm:text-sm text-[#fffbeb] placeholder-[#a89078]/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#d4af37] mb-1 font-['Cinzel']">
                Місце народження
              </label>
              <input
                type="text"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                placeholder="напр. Київ"
                className="w-full px-3.5 py-2.5 bg-[#120b06] border border-[#d4af37]/40 focus:border-[#ffd700] rounded-xl text-base sm:text-sm text-[#fffbeb] placeholder-[#a89078]/50 focus:outline-none"
              />
            </div>

            {!isLiving && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#d4af37] mb-1 font-['Cinzel']">
                    Рік / дата смерті
                  </label>
                  <input
                    type="text"
                    value={deathDate}
                    onChange={(e) => setDeathDate(e.target.value)}
                    placeholder="напр. 2010"
                    className="w-full px-3.5 py-2.5 bg-[#120b06] border border-[#d4af37]/40 focus:border-[#ffd700] rounded-xl text-base sm:text-sm text-[#fffbeb] placeholder-[#a89078]/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#d4af37] mb-1 font-['Cinzel']">
                    Місце спочинку
                  </label>
                  <input
                    type="text"
                    value={deathPlace}
                    onChange={(e) => setDeathPlace(e.target.value)}
                    placeholder="напр. Київ"
                    className="w-full px-3.5 py-2.5 bg-[#120b06] border border-[#d4af37]/40 focus:border-[#ffd700] rounded-xl text-base sm:text-sm text-[#fffbeb] placeholder-[#a89078]/50 focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>

          {/* Profession & Branch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#d4af37] mb-1 font-['Cinzel']">
                Професія
              </label>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="напр. Інженер, Лікар"
                className="w-full px-3.5 py-2.5 bg-[#120b06] border border-[#d4af37]/40 focus:border-[#ffd700] rounded-xl text-base sm:text-sm text-[#fffbeb] placeholder-[#a89078]/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#d4af37] mb-1 font-['Cinzel']">
                Лінія / Гілка
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="напр. Лінія батька"
                className="w-full px-3.5 py-2.5 bg-[#120b06] border border-[#d4af37]/40 focus:border-[#ffd700] rounded-xl text-base sm:text-sm text-[#fffbeb] placeholder-[#a89078]/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Parents & Spouses Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-[#150d07]/90 p-3.5 sm:p-4 rounded-2xl border border-[#d4af37]/35">
            <div>
              <label className="block text-xs font-semibold text-[#d4af37] mb-1 font-['Cinzel']">
                Батько
              </label>
              <select
                value={fatherId}
                onChange={(e) => setFatherId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#120b06] border border-[#d4af37]/40 focus:border-[#ffd700] rounded-xl text-base sm:text-xs text-[#fffbeb] focus:outline-none"
              >
                <option value="">Не вказано</option>
                {potentialFathers.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.firstName || f.lastName ? `${f.firstName} ${f.lastName}` : (f.roleLabel || 'Чоловік')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#d4af37] mb-1 font-['Cinzel']">
                Мати
              </label>
              <select
                value={motherId}
                onChange={(e) => setMotherId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#120b06] border border-[#d4af37]/40 focus:border-[#ffd700] rounded-xl text-base sm:text-xs text-[#fffbeb] focus:outline-none"
              >
                <option value="">Не вказано</option>
                {potentialMothers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.firstName || m.lastName ? `${m.firstName} ${m.lastName}` : (m.roleLabel || 'Жінка')}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#d4af37] mb-1 font-['Cinzel']">
                Подружжя
              </label>
              <select
                value={spouseIds[0] || ''}
                onChange={(e) => setSpouseIds(e.target.value ? [e.target.value] : [])}
                className="w-full px-3.5 py-2.5 bg-[#120b06] border border-[#d4af37]/40 focus:border-[#ffd700] rounded-xl text-base sm:text-xs text-[#fffbeb] focus:outline-none"
              >
                <option value="">Не вказано</option>
                {potentialSpouses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName || s.lastName ? `${s.firstName} ${s.lastName}` : (s.roleLabel || 'Родич')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Favorite Quote */}
          <div>
            <label className="block text-xs font-semibold text-[#d4af37] mb-1 font-['Cinzel']">
              Улюблена цитата / Життєве кредо
            </label>
            <input
              type="text"
              value={favoriteQuote}
              onChange={(e) => setFavoriteQuote(e.target.value)}
              placeholder="напр. «Сім'я — це коріння, з якого проростає майбутнє»"
              className="w-full px-3.5 py-2.5 bg-[#120b06] border border-[#d4af37]/40 focus:border-[#ffd700] rounded-xl text-base sm:text-sm text-[#fffbeb] placeholder-[#a89078]/50 focus:outline-none italic font-serif"
            />
          </div>

          {/* Voice Note / Audio Message */}
          <div className="bg-[#170e08]/95 p-3.5 rounded-2xl border border-[#d4af37]/35 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#ffd700] font-['Cinzel'] tracking-wide flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#ffd700]" />
                <span>Голосове повідомлення / Аудіозапис</span>
              </label>

              <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#24170d] hover:bg-[#332012] text-[#ffd700] border border-[#d4af37]/50 rounded-lg text-xs font-['Cinzel'] font-bold cursor-pointer transition shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>{audioUrl ? 'Замінити аудіо' : 'Завантажити аудіо'}</span>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === 'string') {
                        setAudioUrl(reader.result);
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </div>

            {audioUrl ? (
              <div className="flex items-center gap-3 pt-1">
                <audio controls src={audioUrl} className="flex-1 h-8 rounded-lg outline-none" />
                <button
                  type="button"
                  onClick={() => setAudioUrl('')}
                  className="p-1.5 bg-[#221209] hover:bg-red-950/70 text-red-300 border border-red-800/40 rounded-lg text-xs transition cursor-pointer"
                  title="Видалити аудіо"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-[#d4af37]/60 italic font-serif">
                Немає прикріпленого аудіопослання. Ви можете завантажити голосовий запис.
              </p>
            )}
          </div>

          {/* Bio / Memories */}
          <div>
            <label className="block text-xs font-semibold text-[#d4af37] mb-1 font-['Cinzel']">
              Біографія та спогади
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Цікаві спогади з життя..."
              className="w-full px-3.5 py-2.5 bg-[#120b06] border border-[#d4af37]/40 focus:border-[#ffd700] rounded-xl text-base sm:text-sm text-[#fffbeb] placeholder-[#a89078]/50 focus:outline-none"
            />
          </div>

          {/* ======================================================== */}
          {/* СІМЕЙНИЙ ФОТОАРХІВ (ADDITIONAL FAMILY PHOTOS)             */}
          {/* ======================================================== */}
          <div className="bg-[#170e08]/95 p-3.5 sm:p-4 rounded-2xl border border-[#d4af37]/40 shadow-inner">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-[#ffd700] font-['Cinzel'] tracking-wide flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#ffd700]" />
                <span>Сімейний фотоальбом ({photos.length})</span>
              </label>

              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#24170d] hover:bg-[#332012] active:scale-95 text-[#ffd700] border border-[#d4af37]/50 rounded-xl text-xs font-['Cinzel'] font-bold cursor-pointer transition shadow-xs">
                <Plus className="w-3.5 h-3.5" />
                <span>+ Додати світлину</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length === 0) return;
                    for (const f of files) {
                      try {
                        const compressed = await compressImageFile(f, 800, 0.82);
                        setPhotos(prev => [
                          ...prev,
                          { url: compressed, caption: f.name.replace(/\.[^/.]+$/, ''), year: '' }
                        ]);
                      } catch (err) {
                        console.error('Failed to load file', err);
                      }
                    }
                  }}
                />
              </label>
            </div>

            {photos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                {photos.map((ph, idx) => (
                  <div key={idx} className="flex gap-2.5 p-2 bg-[#100905] border border-[#d4af37]/30 rounded-xl relative group">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-black shrink-0 border border-[#d4af37]/30">
                      <img src={ph.url} alt={ph.caption || 'Фото'} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <input
                        type="text"
                        value={ph.caption || ''}
                        onChange={(e) => {
                          const newPhotos = [...photos];
                          newPhotos[idx] = { ...newPhotos[idx], caption: e.target.value };
                          setPhotos(newPhotos);
                        }}
                        placeholder="Підпис світлини..."
                        className="w-full px-2 py-1 bg-[#180e07] border border-[#d4af37]/25 focus:border-[#ffd700] rounded text-xs text-[#fef3c7] focus:outline-none"
                      />
                      <input
                        type="text"
                        value={ph.year || ''}
                        onChange={(e) => {
                          const newPhotos = [...photos];
                          newPhotos[idx] = { ...newPhotos[idx], year: e.target.value };
                          setPhotos(newPhotos);
                        }}
                        placeholder="Рік зйомки (напр. 1982)"
                        className="w-full px-2 py-0.5 bg-[#180e07] border border-[#d4af37]/25 focus:border-[#ffd700] rounded text-[11px] text-[#fef3c7]/80 focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                      className="p-1 text-[#d4af37]/60 hover:text-red-400 self-start transition cursor-pointer"
                      title="Видалити"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#d4af37]/50 italic text-center py-2 font-serif">
                Ще немає доданих світлин. Натисніть «+ Додати світлину», щоб завантажити архівні фото родича.
              </p>
            )}
          </div>

          {/* Sticky/Fixed Footer on Mobile */}
          <div className="pt-3 border-t border-[#d4af37]/30 flex items-center justify-end gap-2.5 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-[#22140a] hover:bg-[#331c0e] active:bg-[#331c0e] text-[#fef3c7] border border-[#d4af37]/40 text-sm font-semibold rounded-xl transition cursor-pointer font-['Cinzel']"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#b48228] via-[#d4af37] to-[#996515] hover:brightness-110 active:scale-95 text-[#1a1107] text-sm font-bold rounded-xl shadow-lg shadow-[#d4af37]/25 transition cursor-pointer font-['Cinzel']"
            >
              <Save className="w-4 h-4" />
              <span>Зберегти</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
