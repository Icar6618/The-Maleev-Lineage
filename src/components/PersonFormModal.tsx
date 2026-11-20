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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif text-base sm:text-lg font-bold text-slate-100 truncate">
              {initialPerson ? `Заповнення: ${initialPerson.roleLabel || initialPerson.firstName || 'Картка'}` : 'Додати родича'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl active:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          
          {/* Role Label */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Роль / Ким приходиться
            </label>
            <input
              type="text"
              value={roleLabel}
              onChange={(e) => setRoleLabel(e.target.value)}
              placeholder="напр. Батько, Тітка, Я"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-base sm:text-sm text-slate-100 focus:outline-none"
            />
          </div>

          {/* Names Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Прізвище
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="напр. Малеєв"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-base sm:text-sm text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Ім'я
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="напр. Віктор"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-base sm:text-sm text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                По батькові
              </label>
              <input
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="напр. Володимирович"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-base sm:text-sm text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Дівоче прізвище (для жінок)
              </label>
              <input
                type="text"
                value={maidenName}
                onChange={(e) => setMaidenName(e.target.value)}
                placeholder="Дівоче прізвище"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-base sm:text-sm text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          {/* Gender & Living status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-3.5 sm:p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Стать
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`flex-1 py-2 sm:py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    gender === 'male'
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 active:text-white'
                  }`}
                >
                  Чоловік
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`flex-1 py-2 sm:py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    gender === 'female'
                      ? 'bg-rose-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 active:text-white'
                  }`}
                >
                  Жінка
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Покоління
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={generation}
                onChange={(e) => setGeneration(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl text-base sm:text-sm text-slate-100 focus:outline-none"
              />
            </div>

            <div className="flex items-center pt-2 sm:pt-4">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-medium text-slate-200">
                <input
                  type="checkbox"
                  checked={isLiving}
                  onChange={(e) => setIsLiving(e.target.checked)}
                  className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700"
                />
                <span>Нині живий(а)</span>
              </label>
            </div>
          </div>

          {/* Dates & Places */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Рік / дата народження
              </label>
              <input
                type="text"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder="напр. 1965"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-base sm:text-sm text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Місце народження
              </label>
              <input
                type="text"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                placeholder="напр. Київ"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-base sm:text-sm text-slate-100 focus:outline-none"
              />
            </div>

            {!isLiving && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Рік / дата смерті
                  </label>
                  <input
                    type="text"
                    value={deathDate}
                    onChange={(e) => setDeathDate(e.target.value)}
                    placeholder="напр. 2010"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-base sm:text-sm text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Місце спочинку
                  </label>
                  <input
                    type="text"
                    value={deathPlace}
                    onChange={(e) => setDeathPlace(e.target.value)}
                    placeholder="напр. Київ"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-base sm:text-sm text-slate-100 focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>

          {/* Profession & Branch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Професія
              </label>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="напр. Інженер, Лікар"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-base sm:text-sm text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Лінія / Гілка
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="напр. Лінія батька"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-base sm:text-sm text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          {/* Parents & Spouses Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-950/40 p-3.5 sm:p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Батько
              </label>
              <select
                value={fatherId}
                onChange={(e) => setFatherId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl text-base sm:text-xs text-slate-200 focus:outline-none"
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
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Мати
              </label>
              <select
                value={motherId}
                onChange={(e) => setMotherId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl text-base sm:text-xs text-slate-200 focus:outline-none"
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
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Подружжя
              </label>
              <select
                value={spouseIds[0] || ''}
                onChange={(e) => setSpouseIds(e.target.value ? [e.target.value] : [])}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl text-base sm:text-xs text-slate-200 focus:outline-none"
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
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Улюблена цитата / Життєве кредо
            </label>
            <input
              type="text"
              value={favoriteQuote}
              onChange={(e) => setFavoriteQuote(e.target.value)}
              placeholder="напр. «Сім'я — це коріння, з якого проростає майбутнє»"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-base sm:text-sm text-slate-100 focus:outline-none italic font-serif"
            />
          </div>

          {/* Bio / Memories */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Біографія та спогади
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Цікаві спогади з життя..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-base sm:text-sm text-slate-100 focus:outline-none"
            />
          </div>

          {/* Sticky/Fixed Footer on Mobile */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 active:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition cursor-pointer"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-sm font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer"
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
