import React, { useState, useEffect } from 'react';
import type { Person, Gender } from '../types/family';
import { X, Save, UserPlus } from 'lucide-react';

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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#150d07]/90 p-3.5 sm:p-4 rounded-2xl border border-[#d4af37]/35">
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

            <div>
              <label className="block text-xs font-semibold text-[#d4af37] mb-1.5 font-['Cinzel']">
                Покоління
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={generation}
                onChange={(e) => setGeneration(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-[#120b06] border border-[#d4af37]/40 focus:border-[#ffd700] rounded-xl text-base sm:text-sm text-[#fffbeb] focus:outline-none"
              />
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
