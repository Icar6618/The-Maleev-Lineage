import React, { useState, useRef, useMemo } from 'react';
import type { Person } from '../types/family';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Briefcase, 
  PlusCircle, 
  Edit3,
  TreePine,
  LayoutGrid,
  Leaf
} from 'lucide-react';

interface TreeViewProps {
  persons: Person[];
  searchQuery: string;
  onSelectPerson: (person: Person) => void;
  onAddChild: (parent: Person) => void;
  onAddSpouse: (person: Person) => void;
}

export const TreeView: React.FC<TreeViewProps> = ({
  persons,
  searchQuery,
  onSelectPerson,
  onAddChild,
  onAddSpouse,
}) => {
  const [scale, setScale] = useState(0.85);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pinchStartDist, setPinchStartDist] = useState<number | null>(null);
  const [pinchStartScale, setPinchStartScale] = useState<number>(0.85);
  const [treeStyle, setTreeStyle] = useState<'organic' | 'classic'>('organic');

  const containerRef = useRef<HTMLDivElement>(null);

  // Group persons by roles/levels for the organic tree
  const { 
    paternalGrandparents,
    maternalGrandparents,
    parentsGroup,
    paternalUnclesAunts,
    maternalUnclesAunts,
    youngerGen,
    generations
  } = useMemo(() => {
    // Grandparents
    const patGrand = persons.filter(p => p.id === 'p-paternal-grandfather' || p.id === 'p-paternal-grandmother');
    const matGrand = persons.filter(p => p.id === 'p-maternal-grandfather' || p.id === 'p-maternal-grandmother');

    // Parents
    const parents = persons.filter(p => p.id === 'p-father' || p.id === 'p-mother');

    // Uncles & Aunts
    const patUncles = persons.filter(p => p.id === 'p-paternal-uncle' || p.id === 'p-paternal-aunt');
    const matUncles = persons.filter(p => p.id === 'p-maternal-uncle' || p.id === 'p-maternal-aunt');

    // Youngest generation
    const young = persons.filter(p => p.id === 'p-me' || p.id === 'p-brother' || p.generation === 3);

    // Classic generations grouping
    const genMap = new Map<number, Person[]>();
    persons.forEach((p) => {
      const g = p.generation || 1;
      if (!genMap.has(g)) genMap.set(g, []);
      genMap.get(g)!.push(p);
    });
    const sortedGens = Array.from(genMap.keys()).sort((a, b) => a - b);

    return {
      paternalGrandparents: patGrand,
      maternalGrandparents: matGrand,
      parentsGroup: parents,
      paternalUnclesAunts: patUncles,
      maternalUnclesAunts: matUncles,
      youngerGen: young,
      generations: sortedGens.map(g => ({ generation: g, members: genMap.get(g) || [] }))
    };
  }, [persons]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.person-node') || (e.target as HTMLElement).closest('button')) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.person-node') || (e.target as HTMLElement).closest('button')) {
      return;
    }
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setPinchStartDist(dist);
      setPinchStartScale(scale);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    } else if (e.touches.length === 2 && pinchStartDist) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const newScale = Math.min(Math.max(0.35, pinchStartScale * (dist / pinchStartDist)), 2.2);
      setScale(newScale);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setPinchStartDist(null);
  };

  const handleZoom = (delta: number) => {
    setScale((prev) => Math.min(Math.max(0.35, prev + delta), 2.2));
  };

  const handleResetZoom = () => {
    setScale(0.85);
    setPan({ x: 0, y: 0 });
  };

  // Renders a single artistic genealogical plaque
  const renderPlaque = (person: Person, isCrown = false) => {
    const hasName = Boolean(person.firstName || person.lastName);
    const fullName = hasName 
      ? `${person.lastName} ${person.firstName}`.trim() 
      : (person.roleLabel || 'Не заповнено');

    const isMatchesSearch = searchQuery && (
      `${fullName} ${person.roleLabel || ''} ${person.middleName || ''} ${person.profession || ''} ${person.birthPlace || ''}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

    const isMale = person.gender === 'male';
    const initialLetter = person.firstName?.[0] || person.lastName?.[0] || person.roleLabel?.[0] || '?';

    return (
      <div
        key={person.id}
        onClick={() => onSelectPerson(person)}
        className={`person-node w-[235px] sm:w-[255px] rounded-2xl p-3 sm:p-3.5 transition-all duration-200 cursor-pointer text-left relative group touch-manipulation backdrop-blur-md ${
          isMatchesSearch
            ? 'ring-4 ring-amber-400 bg-slate-900 shadow-2xl shadow-amber-500/30 scale-105 z-30'
            : isCrown
              ? 'bg-slate-900/90 hover:bg-slate-850 border-2 border-amber-500/50 shadow-xl shadow-amber-950/40 hover:scale-102'
              : hasName
                ? 'bg-slate-900/90 active:bg-slate-850 hover:bg-slate-850 border border-slate-700/80 shadow-lg hover:scale-102'
                : 'bg-slate-900/70 active:bg-slate-900 hover:bg-slate-900 border-2 border-dashed border-amber-500/40 hover:border-amber-400 shadow-md hover:scale-102'
        } ${
          isMale ? 'hover:border-cyan-400/70' : 'hover:border-rose-400/70'
        }`}
      >
        {/* Top Plaque Ribbon */}
        <div className="flex items-center justify-between gap-1 mb-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
            isCrown 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : isMale
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
          }`}>
            {isCrown && <span>👑</span>}
            <span>{person.roleLabel || (isMale ? 'Чоловік' : 'Жінка')}</span>
          </span>

          {hasName ? (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              person.isLiving
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {person.isLiving ? 'Живий(а)' : 'Пам’ять'}
            </span>
          ) : (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-medium">
              Порожнє
            </span>
          )}
        </div>

        {/* Avatar & Name */}
        <div className="flex items-start gap-2.5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-serif text-base font-bold shrink-0 shadow-md ${
            isCrown
              ? 'bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 text-slate-950 ring-2 ring-amber-400/60'
              : isMale
                ? 'bg-gradient-to-tr from-cyan-900/60 to-cyan-700/40 text-cyan-200 border border-cyan-500/40'
                : 'bg-gradient-to-tr from-rose-900/60 to-rose-700/40 text-rose-200 border border-rose-500/40'
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

          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-sm transition truncate ${
              hasName 
                ? 'text-slate-100 group-hover:text-amber-400' 
                : 'text-amber-300/90 font-medium'
            }`}>
              {fullName}
            </h3>

            {person.middleName ? (
              <p className="text-xs text-slate-400 truncate">
                {person.middleName}
              </p>
            ) : !hasName ? (
              <p className="text-[11px] text-amber-400 flex items-center gap-1 mt-0.5 font-medium">
                <PlusCircle className="w-3 h-3 text-amber-400" />
                <span>Заповнити дані</span>
              </p>
            ) : null}

            {person.maidenName && (
              <p className="text-[11px] text-amber-400/80 italic">
                ({person.maidenName})
              </p>
            )}
          </div>
        </div>

        {/* Dates & Profession */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-0.5 text-xs text-slate-400">
          <div className="text-[11px] font-mono text-slate-400">
            {person.birthDate ? (
              `${person.birthDate} — ${person.isLiving ? 'досі' : (person.deathDate || '?')}`
            ) : (
              <span className="italic text-slate-400">Роки не вказано</span>
            )}
          </div>

          {person.profession && (
            <div className="flex items-center gap-1.5 text-slate-400 truncate text-[11px]">
              <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{person.profession}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-2.5 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectPerson(person);
            }}
            className="px-2 py-0.5 text-amber-400 hover:text-amber-300 bg-slate-800/80 active:bg-slate-700 rounded-lg transition flex items-center gap-1 font-medium"
          >
            <Edit3 className="w-3 h-3" />
            <span>{hasName ? 'Змінити' : 'Внести'}</span>
          </button>

          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(person);
              }}
              className="px-1.5 py-0.5 hover:text-amber-400 transition"
              title="Додати дитину"
            >
              + Дитина
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddSpouse(person);
              }}
              className="px-1.5 py-0.5 hover:text-rose-400 transition"
              title="Додати подружжя"
            >
              + Союз
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-[calc(100dvh-130px)] sm:h-[calc(100vh-140px)] bg-slate-950 overflow-hidden select-none border-b border-slate-800 touch-none">
      
      {/* Background Wood / Radial Glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at center, #78350f 0%, #1e1b4b 50%, transparent 80%)`,
        }}
      />

      {/* Floating Toolbar */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl border border-slate-800 shadow-2xl">
        <button
          onClick={() => handleZoom(0.15)}
          className="p-2 text-slate-300 hover:text-white bg-slate-800/60 active:bg-slate-700 rounded-xl transition"
          title="Збільшити"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(-0.15)}
          className="p-2 text-slate-300 hover:text-white bg-slate-800/60 active:bg-slate-700 rounded-xl transition"
          title="Зменшити"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2 text-slate-300 hover:text-white bg-slate-800/60 active:bg-slate-700 rounded-xl transition"
          title="Скинути положення"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <span className="text-[11px] text-slate-400 font-mono px-1">
          {Math.round(scale * 100)}%
        </span>

        <div className="h-4 w-px bg-slate-700 mx-0.5" />

        {/* View Mode Switcher: Organic Tree vs Classic Grid */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-xl">
          <button
            onClick={() => setTreeStyle('organic')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              treeStyle === 'organic'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Художнє Дерево Роду"
          >
            <TreePine className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Дерево Роду</span>
          </button>
          <button
            onClick={() => setTreeStyle('classic')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
              treeStyle === 'classic'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Класична схема"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Схема</span>
          </button>
        </div>
      </div>

      {/* Floating Info Pill */}
      <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-20 pointer-events-none text-[11px] sm:text-xs text-slate-300 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800 backdrop-blur-md flex items-center justify-between sm:justify-start gap-2 shadow-xl">
        <div className="flex items-center gap-1.5 truncate">
          <Leaf className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">
            {treeStyle === 'organic' 
              ? '🌳 Крона вгорі (Я і Брат) • Коріння внизу (Дідусі та Бабусі)' 
              : '📐 Класичний ієрархічний вигляд за поколіннями'}
          </span>
        </div>
      </div>

      {/* Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`w-full h-full overflow-hidden flex items-center justify-center ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.08s ease-out',
          }}
          className="p-8 sm:p-16 flex flex-col items-center justify-center min-w-max relative"
        >
          {/* ======================================================== */}
          {/* 1. ORGANIC TREE OF LIFE VIEW                             */}
          {/* ======================================================== */}
          {treeStyle === 'organic' ? (
            <div className="relative flex flex-col items-center w-[1000px] py-10">
              
              {/* SVG Tree Trunk & Graceful Branches Background */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none z-0" 
                viewBox="0 0 1000 900"
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Trunk Wood Gradient */}
                  <linearGradient id="trunkGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#451a03" />
                    <stop offset="50%" stopColor="#78350f" />
                    <stop offset="100%" stopColor="#92400e" />
                  </linearGradient>

                  {/* Branch Gradient Left */}
                  <linearGradient id="branchLeft" x1="500" y1="500" x2="150" y2="400">
                    <stop offset="0%" stopColor="#78350f" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>

                  {/* Branch Gradient Right */}
                  <linearGradient id="branchRight" x1="500" y1="500" x2="850" y2="400">
                    <stop offset="0%" stopColor="#78350f" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>
                </defs>

                {/* Roots in ground (Bottom) */}
                <path d="M 500 860 Q 450 890 350 910 M 500 860 Q 550 890 650 910" stroke="#78350f" strokeWidth="12" strokeLinecap="round" />
                <path d="M 500 860 Q 300 880 200 840 M 500 860 Q 700 880 800 840" stroke="#451a03" strokeWidth="8" strokeLinecap="round" />

                {/* Main Central Trunk */}
                <path 
                  d="M 470 860 C 470 700, 480 550, 485 450 C 490 380, 490 280, 490 180" 
                  stroke="url(#trunkGrad)" 
                  strokeWidth="38" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 530 860 C 530 700, 520 550, 515 450 C 510 380, 510 280, 510 180" 
                  stroke="url(#trunkGrad)" 
                  strokeWidth="38" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 500 860 C 500 700, 500 550, 500 180" 
                  stroke="#92400e" 
                  strokeWidth="28" 
                  strokeLinecap="round" 
                />

                {/* Left Branch (Father Line & Grandparents) */}
                <path 
                  d="M 485 580 C 400 580, 250 630, 250 720" 
                  stroke="url(#branchLeft)" 
                  strokeWidth="16" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 485 450 C 350 450, 200 420, 160 400" 
                  stroke="url(#branchLeft)" 
                  strokeWidth="14" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 485 450 C 420 450, 360 440, 360 400" 
                  stroke="url(#branchLeft)" 
                  strokeWidth="12" 
                  strokeLinecap="round" 
                />

                {/* Right Branch (Mother Line & Grandparents) */}
                <path 
                  d="M 515 580 C 600 580, 750 630, 750 720" 
                  stroke="url(#branchRight)" 
                  strokeWidth="16" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 515 450 C 650 450, 800 420, 840 400" 
                  stroke="url(#branchRight)" 
                  strokeWidth="14" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 515 450 C 580 450, 640 440, 640 400" 
                  stroke="url(#branchRight)" 
                  strokeWidth="12" 
                  strokeLinecap="round" 
                />

                {/* Top Canopy Branches (Youngest Generation: Me & Brother) */}
                <path 
                  d="M 500 240 C 460 210, 420 180, 380 140" 
                  stroke="#b45309" 
                  strokeWidth="14" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 500 240 C 540 210, 580 180, 620 140" 
                  stroke="#b45309" 
                  strokeWidth="14" 
                  strokeLinecap="round" 
                />

                {/* Leaves & Buds around branches */}
                <circle cx="360" cy="120" r="14" fill="#059669" opacity="0.6" />
                <circle cx="640" cy="120" r="14" fill="#059669" opacity="0.6" />
                <circle cx="500" cy="80" r="18" fill="#10b981" opacity="0.5" />
                <circle cx="160" cy="380" r="12" fill="#059669" opacity="0.5" />
                <circle cx="840" cy="380" r="12" fill="#059669" opacity="0.5" />
                <circle cx="230" cy="700" r="10" fill="#047857" opacity="0.4" />
                <circle cx="770" cy="700" r="10" fill="#047857" opacity="0.4" />
              </svg>

              {/* -------------------------------------------------- */}
              {/* TIER 1 (TOP CROWN): Я ТА МІЙ БРАТ                   */}
              {/* -------------------------------------------------- */}
              <div className="relative z-10 flex flex-col items-center mb-16">
                <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold mb-4 shadow-lg backdrop-blur-md">
                  <span>🍃 КРОНА РОДУ • МОЛОДЕ ПОКОЛІННЯ</span>
                </div>

                <div className="flex items-center justify-center gap-8">
                  {youngerGen.map(p => renderPlaque(p, true))}
                </div>
              </div>

              {/* -------------------------------------------------- */}
              {/* TIER 2 (MIDDLE BOUGHS): БАТЬКИ, ДЯДЬКИ ТА ТІТКИ    */}
              {/* -------------------------------------------------- */}
              <div className="relative z-10 w-full flex items-center justify-between gap-4 mb-20 px-2">
                
                {/* Left: Line of Father's Siblings */}
                <div className="flex flex-col items-center gap-3">
                  <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-800/60">
                    Рідня батька (Дядько / Тітка)
                  </span>
                  <div className="flex flex-col gap-3">
                    {paternalUnclesAunts.map(p => renderPlaque(p))}
                  </div>
                </div>

                {/* Center: Parents Union */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold mb-3 shadow-lg backdrop-blur-md">
                    <span>💍 ГОЛОВНИЙ СТОВБУР • БАТЬКИ</span>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-950/70 p-3 rounded-3xl border border-amber-500/30 shadow-2xl backdrop-blur-md">
                    {parentsGroup.map(p => renderPlaque(p))}
                  </div>
                </div>

                {/* Right: Line of Mother's Siblings */}
                <div className="flex flex-col items-center gap-3">
                  <span className="text-[11px] font-semibold text-rose-400 bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-800/60">
                    Рідня матері (Тітка / Дядько)
                  </span>
                  <div className="flex flex-col gap-3">
                    {maternalUnclesAunts.map(p => renderPlaque(p))}
                  </div>
                </div>

              </div>

              {/* -------------------------------------------------- */}
              {/* TIER 3 (BOTTOM ROOTS): ДІДУСІ ТА БАБУСІ             */}
              {/* -------------------------------------------------- */}
              <div className="relative z-10 w-full flex items-center justify-between gap-8 pt-4">
                
                {/* Left Roots: Paternal Grandparents */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3 shadow-lg">
                    <span>🌱 Коріння по батькові (Дідусь & Бабуся)</span>
                  </div>
                  <div className="flex gap-4">
                    {paternalGrandparents.map(p => renderPlaque(p))}
                  </div>
                </div>

                {/* Right Roots: Maternal Grandparents */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-rose-500/30 text-rose-300 text-xs font-semibold mb-3 shadow-lg">
                    <span>🌱 Коріння по матері (Дідусь & Бабуся)</span>
                  </div>
                  <div className="flex gap-4">
                    {maternalGrandparents.map(p => renderPlaque(p))}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* ======================================================== */
            /* 2. CLASSIC GENERATION DIAGRAM                            */
            /* ======================================================== */
            <div className="flex flex-col items-center gap-14 max-w-7xl">
              {generations.map(({ generation, members }) => (
                <div key={generation} className="flex flex-col items-center w-full">
                  <div className="flex items-center gap-2 px-4 py-1 bg-slate-900/90 border border-slate-800 rounded-full text-xs font-semibold text-slate-300 mb-6 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Покоління {generation}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({members.length})</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-6">
                    {members.map(p => renderPlaque(p))}
                  </div>

                  {generation < generations[generations.length - 1].generation && (
                    <div className="w-0.5 h-10 bg-slate-800 my-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
