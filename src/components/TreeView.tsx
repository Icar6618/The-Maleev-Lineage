import React, { useState, useRef, useMemo, useCallback } from 'react';
import type { Person } from '../types/family';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Briefcase,
  PlusCircle,
  Edit3,
  MapPin,
  Calendar,
  Users,
  Info,
  Crown
} from 'lucide-react';

interface TreeViewProps {
  persons: Person[];
  searchQuery: string;
  onSelectPerson: (person: Person) => void;
  onAddChild: (parent: Person) => void;
  onAddSpouse: (person: Person) => void;
}

/* ================================================================
   LAYOUT ENGINE — Bottom-to-top hierarchical tree
   Roots (Tier 2) -> Hub/Trunk (Tier 1) -> Zenith (Tier 0)
   ================================================================ */

interface NodePos {
  id: string;
  x: number;
  y: number;
}

interface Connector {
  key: string;
  d: string;
  color: string;
  width: number;
  dashed?: boolean;
  label?: string;
}

const CARD_W = 280;
const CARD_H = 205;
const GAP_X = 44;
const GAP_Y = 135;
const COUPLE_GAP = 28;

function buildLayout(persons: Person[]) {
  const positions: NodePos[] = [];
  const connectors: Connector[] = [];

  const pairW = CARD_W * 2 + COUPLE_GAP;
  const tierGap = 130;
  const totalW = pairW * 2 + tierGap;
  const startX = -totalW / 2;

  // ---- Tier 2 (BOTTOM): Origins / Grandparents ----
  const tier2_y = (CARD_H + GAP_Y) * 2;

  const pgf_x = startX;
  const pgm_x = startX + CARD_W + COUPLE_GAP;
  positions.push({ id: 'p-paternal-grandfather', x: pgf_x, y: tier2_y });
  positions.push({ id: 'p-paternal-grandmother', x: pgm_x, y: tier2_y });

  const mgf_x = startX + pairW + tierGap;
  const mgm_x = mgf_x + CARD_W + COUPLE_GAP;
  positions.push({ id: 'p-maternal-grandfather', x: mgf_x, y: tier2_y });
  positions.push({ id: 'p-maternal-grandmother', x: mgm_x, y: tier2_y });

  // ---- Tier 1 (MIDDLE): Core Trunk / Parents, Uncles, Aunts ----
  const tier1_y = CARD_H + GAP_Y;

  const patCentreX = (pgf_x + pgm_x + CARD_W) / 2;
  const matCentreX = (mgf_x + mgm_x + CARD_W) / 2;

  const pUncle_x = patCentreX - CARD_W / 2 - GAP_X / 2 - CARD_W;
  const pAunt_x = pUncle_x - GAP_X - CARD_W;

  positions.push({ id: 'p-paternal-aunt', x: pAunt_x, y: tier1_y });
  positions.push({ id: 'p-paternal-uncle', x: pUncle_x, y: tier1_y });

  const parentsCentreX = (patCentreX + matCentreX) / 2;
  const fatherFinal_x = parentsCentreX - COUPLE_GAP / 2 - CARD_W;
  const mother_x = parentsCentreX + COUPLE_GAP / 2;
  positions.push({ id: 'p-father', x: fatherFinal_x, y: tier1_y });
  positions.push({ id: 'p-mother', x: mother_x, y: tier1_y });

  const mAunt_x = mother_x + CARD_W + GAP_X;
  const mUncle_x = mAunt_x + CARD_W + GAP_X;
  positions.push({ id: 'p-maternal-aunt', x: mAunt_x, y: tier1_y });
  positions.push({ id: 'p-maternal-uncle', x: mUncle_x, y: tier1_y });

  // ---- Tier 0 (TOP): Zenith / Me & Brother ----
  const tier0_y = 0;
  const me_x = parentsCentreX - COUPLE_GAP / 2 - CARD_W;
  const bro_x = parentsCentreX + COUPLE_GAP / 2;
  positions.push({ id: 'p-me', x: me_x, y: tier0_y });
  positions.push({ id: 'p-brother', x: bro_x, y: tier0_y });

  // Extra dynamic persons
  let extraX = mUncle_x + CARD_W + GAP_X * 2;
  persons.forEach(p => {
    if (!positions.find(np => np.id === p.id)) {
      const tier = p.generation === 1 ? tier2_y : p.generation === 2 ? tier1_y : tier0_y;
      positions.push({ id: p.id, x: extraX, y: tier });
      extraX += CARD_W + GAP_X;
    }
  });

  // ================================================================
  // CONNECTORS (Clean, minimalist structural lines — no glow)
  // ================================================================
  const posMap = new Map<string, NodePos>();
  positions.forEach(np => posMap.set(np.id, np));

  const topOf = (np: NodePos) => ({ x: np.x + CARD_W / 2, y: np.y });
  const botOf = (np: NodePos) => ({ x: np.x + CARD_W / 2, y: np.y + CARD_H });

  // Marriage connections (Clean horizontal link)
  const marriagePairs: [string, string][] = [
    ['p-paternal-grandfather', 'p-paternal-grandmother'],
    ['p-maternal-grandfather', 'p-maternal-grandmother'],
    ['p-father', 'p-mother'],
  ];

  marriagePairs.forEach(([a, b]) => {
    const na = posMap.get(a);
    const nb = posMap.get(b);
    if (!na || !nb) return;
    const ya = na.y + CARD_H / 2;
    const xa = na.x + CARD_W;
    const xb = nb.x;
    connectors.push({
      key: `marriage-${a}-${b}`,
      d: `M ${xa} ${ya} L ${xb} ${ya}`,
      color: '#475569',
      width: 1.5,
      label: 'link',
    });
  });

  // Paternal grandparents → Father, Uncle, Aunt
  const pgfPos = posMap.get('p-paternal-grandfather');
  const pgmPos = posMap.get('p-paternal-grandmother');
  if (pgfPos && pgmPos) {
    const hubX = (pgfPos.x + CARD_W + pgmPos.x) / 2;
    const hubY = pgfPos.y;
    const childIds = ['p-father', 'p-paternal-uncle', 'p-paternal-aunt'];
    childIds.forEach(cid => {
      const cp = posMap.get(cid);
      if (!cp) return;
      const cb = botOf(cp);
      const midY = hubY - (hubY - cb.y) * 0.5;
      connectors.push({
        key: `parent-patgp-${cid}`,
        d: `M ${hubX} ${hubY} C ${hubX} ${midY}, ${cb.x} ${hubY - (hubY - cb.y) * 0.25}, ${cb.x} ${cb.y}`,
        color: '#334155',
        width: 1.5,
      });
    });
  }

  // Maternal grandparents → Mother, Aunt, Uncle
  const mgfPos = posMap.get('p-maternal-grandfather');
  const mgmPos = posMap.get('p-maternal-grandmother');
  if (mgfPos && mgmPos) {
    const hubX = (mgfPos.x + CARD_W + mgmPos.x) / 2;
    const hubY = mgfPos.y;
    const childIds = ['p-mother', 'p-maternal-aunt', 'p-maternal-uncle'];
    childIds.forEach(cid => {
      const cp = posMap.get(cid);
      if (!cp) return;
      const cb = botOf(cp);
      const midY = hubY - (hubY - cb.y) * 0.5;
      connectors.push({
        key: `parent-matgp-${cid}`,
        d: `M ${hubX} ${hubY} C ${hubX} ${midY}, ${cb.x} ${hubY - (hubY - cb.y) * 0.25}, ${cb.x} ${cb.y}`,
        color: '#334155',
        width: 1.5,
      });
    });
  }

  // Parents → Me, Brother
  const fatherPos = posMap.get('p-father');
  const motherPos = posMap.get('p-mother');
  if (fatherPos && motherPos) {
    const hubX = (fatherPos.x + CARD_W + motherPos.x) / 2;
    const hubY = fatherPos.y;
    const childIds = ['p-me', 'p-brother'];
    childIds.forEach(cid => {
      const cp = posMap.get(cid);
      if (!cp) return;
      const cb = botOf(cp);
      const midY = hubY - (hubY - cb.y) * 0.5;
      connectors.push({
        key: `parent-fm-${cid}`,
        d: `M ${hubX} ${hubY} C ${hubX} ${midY}, ${cb.x} ${hubY - (hubY - cb.y) * 0.25}, ${cb.x} ${cb.y}`,
        color: '#475569',
        width: 1.5,
      });
    });
  }

  // Dynamic additions
  persons.forEach(p => {
    if (['p-paternal-grandfather', 'p-paternal-grandmother', 'p-maternal-grandfather', 'p-maternal-grandmother', 'p-father', 'p-mother', 'p-paternal-uncle', 'p-paternal-aunt', 'p-maternal-aunt', 'p-maternal-uncle', 'p-me', 'p-brother'].includes(p.id)) return;
    if (p.fatherId) {
      const fp = posMap.get(p.fatherId);
      const cp = posMap.get(p.id);
      if (fp && cp) {
        connectors.push({
          key: `dyn-father-${p.id}`,
          d: `M ${topOf(fp).x} ${topOf(fp).y} C ${topOf(fp).x} ${botOf(cp).y}, ${botOf(cp).x} ${topOf(fp).y}, ${botOf(cp).x} ${botOf(cp).y}`,
          color: '#334155',
          width: 1.5,
          dashed: true,
        });
      }
    }
    if (p.motherId) {
      const mp = posMap.get(p.motherId);
      const cp = posMap.get(p.id);
      if (mp && cp) {
        connectors.push({
          key: `dyn-mother-${p.id}`,
          d: `M ${topOf(mp).x} ${topOf(mp).y} C ${topOf(mp).x} ${botOf(cp).y}, ${botOf(cp).x} ${topOf(mp).y}, ${botOf(cp).x} ${botOf(cp).y}`,
          color: '#334155',
          width: 1.5,
          dashed: true,
        });
      }
    }
  });

  return { positions, connectors };
}


/* ================================================================
   MAIN TREE VIEW COMPONENT (MINIMALIST GLASSMORPHISM — NO GLOWS)
   ================================================================ */

export const TreeView: React.FC<TreeViewProps> = ({
  persons,
  searchQuery,
  onSelectPerson,
  onAddChild,
  onAddSpouse,
}) => {
  const [scale, setScale] = useState(0.55);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pinchStartDist, setPinchStartDist] = useState<number | null>(null);
  const [pinchStartScale, setPinchStartScale] = useState<number>(0.55);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const { positions, connectors } = useMemo(() => buildLayout(persons), [persons]);

  const personMap = useMemo(() => {
    const m = new Map<string, Person>();
    persons.forEach(p => m.set(p.id, p));
    return m;
  }, [persons]);

  // Compute bounds
  const bounds = useMemo(() => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    positions.forEach(np => {
      minX = Math.min(minX, np.x);
      maxX = Math.max(maxX, np.x + CARD_W);
      minY = Math.min(minY, np.y);
      maxY = Math.max(maxY, np.y + CARD_H);
    });
    return { minX: minX - 140, maxX: maxX + 140, minY: minY - 160, maxY: maxY + 120 };
  }, [positions]);

  const canvasW = bounds.maxX - bounds.minX;
  const canvasH = bounds.maxY - bounds.minY;

  // Pan & Zoom gestures
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.person-node') || (e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.person-node') || (e.target as HTMLElement).closest('button')) return;
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      setPinchStartDist(dist);
      setPinchStartScale(scale);
    }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setPan({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
    } else if (e.touches.length === 2 && pinchStartDist) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      setScale(Math.min(Math.max(0.15, pinchStartScale * (dist / pinchStartDist)), 2.5));
    }
  };
  const handleTouchEnd = () => { setIsDragging(false); setPinchStartDist(null); };

  const handleZoom = (delta: number) => setScale(prev => Math.min(Math.max(0.15, prev + delta), 2.5));
  const handleResetZoom = () => { setScale(0.55); setPan({ x: 0, y: 0 }); };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.06 : 0.06;
    setScale(prev => Math.min(Math.max(0.15, prev + delta), 2.5));
  }, []);

  // ================================================================
  // RENDER PURE MINIMALIST GLASSMORPHIC CARD (NO GLOWS)
  // ================================================================
  const renderCard = (person: Person, pos: NodePos) => {
    const hasName = Boolean(person.firstName || person.lastName);
    const fullName = hasName
      ? `${person.lastName} ${person.firstName}`.trim()
      : (person.roleLabel || 'Не заповнено');
    const isMe = person.id === 'p-me';
    const isMale = person.gender === 'male';
    const initialLetter = person.firstName?.[0] || person.lastName?.[0] || person.roleLabel?.[0] || '?';

    const isSearchMatch = searchQuery && (
      `${fullName} ${person.roleLabel || ''} ${person.middleName || ''} ${person.profession || ''} ${person.birthPlace || ''}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

    const isHovered = hoveredId === person.id;

    const connectionCount =
      (person.fatherId ? 1 : 0) +
      (person.motherId ? 1 : 0) +
      (person.spouseIds?.length || 0) +
      (person.childrenIds?.length || 0);

    // Clean Minimalist Glassmorphism Tokens (Strictly no neon halos)
    const glassBorder = isMe
      ? 'border-amber-400/60'
      : isMale
        ? 'border-slate-700/80 hover:border-cyan-500/50'
        : 'border-slate-700/80 hover:border-rose-500/50';

    const glassBg = 'bg-slate-900/60 hover:bg-slate-850/80 backdrop-blur-xl';

    return (
      <div
        key={person.id}
        className="person-node absolute transition-all duration-200 touch-manipulation group"
        style={{
          left: pos.x - bounds.minX,
          top: pos.y - bounds.minY,
          width: CARD_W,
          height: CARD_H,
          zIndex: isHovered || isSearchMatch ? 35 : 15,
        }}
        onMouseEnter={() => setHoveredId(person.id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        <div
          onClick={() => onSelectPerson(person)}
          className={`w-full h-full rounded-2xl p-4 cursor-pointer relative overflow-hidden transition-all duration-200 border shadow-lg shadow-black/40
            ${glassBg}
            ${glassBorder}
            ${isSearchMatch
              ? 'ring-2 ring-cyan-400 border-cyan-400 scale-102'
              : isHovered
                ? '-translate-y-1'
                : ''
            }
            ${!hasName ? 'border-dashed border-slate-700 opacity-80 hover:opacity-100' : ''}
          `}
        >
          {/* Top Row: Clean Minimal Role Badge & Generation */}
          <div className="flex items-center justify-between gap-1 mb-2.5">
            <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-lg flex items-center gap-1.5 border ${
              isMe
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : isMale
                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                  : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
            }`}>
              {isMe && <Crown className="w-3 h-3 text-amber-400 inline" />}
              <span className="truncate">{person.roleLabel || (isMale ? 'Чоловік' : 'Жінка')}</span>
            </span>

            {/* Simple dot + Gen indicator */}
            <div className="flex items-center gap-1.5">
              {person.isLiving && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" title="Живий" />
              )}
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-400">
                П{person.generation}
              </span>
            </div>
          </div>

          {/* Clean Avatar & Identity Area */}
          <div className="flex items-start gap-3 mb-2.5">
            <div className={`relative w-11 h-11 rounded-xl shrink-0 p-0.5 border ${
              isMe
                ? 'border-amber-400/50 bg-amber-950/40'
                : isMale
                  ? 'border-cyan-500/30 bg-cyan-950/30'
                  : 'border-rose-500/30 bg-rose-950/30'
            }`}>
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center font-['Outfit'] text-sm font-semibold overflow-hidden">
                {person.avatarUrl ? (
                  <img src={person.avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className={isMe ? 'text-amber-300' : isMale ? 'text-cyan-300' : 'text-rose-300'}>
                    {initialLetter}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className={`font-['Outfit'] font-semibold text-sm leading-tight transition-colors truncate ${
                hasName 
                  ? 'text-slate-100 group-hover:text-cyan-300' 
                  : 'text-slate-300 font-medium'
              }`}>
                {fullName}
              </h3>

              {person.middleName && (
                <p className="text-xs text-slate-400 truncate mt-0.5 font-sans">{person.middleName}</p>
              )}
              {person.maidenName && (
                <p className="text-[11px] text-slate-400 italic truncate">({person.maidenName})</p>
              )}

              {!hasName && (
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 font-mono">
                  <PlusCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Внести дані</span>
                </p>
              )}
            </div>
          </div>

          {/* Details Grid (Dates, Geo, Profession) */}
          <div className="border-t border-slate-800/80 pt-2 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Calendar className="w-3 h-3 shrink-0 text-slate-500" />
              {person.birthDate ? (
                <span className="font-mono text-slate-300">
                  {person.birthDate} — {person.isLiving ? 'досі' : (person.deathDate || '?')}
                </span>
              ) : (
                <span className="italic text-slate-500 font-mono">Дати не вказано</span>
              )}
            </div>

            {person.birthPlace && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                <MapPin className="w-3 h-3 shrink-0 text-slate-500" />
                <span className="truncate">{person.birthPlace}</span>
              </div>
            )}

            {person.profession && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                <Briefcase className="w-3 h-3 shrink-0 text-slate-500" />
                <span className="truncate">{person.profession}</span>
              </div>
            )}

            {/* Connection Count & Status */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 font-mono">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{connectionCount} зв'язків</span>
              </span>

              <span className={`px-2 py-0.5 rounded text-[9px] ${
                person.isLiving
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-slate-800/80 text-slate-400'
              }`}>
                {person.isLiving ? 'Живий(а)' : 'Пам’ять'}
              </span>
            </div>
          </div>

          {/* Minimalist Action Footer */}
          <div className="absolute bottom-2.5 left-4 right-4 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
            <button
              onClick={(e) => { e.stopPropagation(); onSelectPerson(person); }}
              className="px-2 py-0.5 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 active:bg-slate-700 border border-slate-700/60 rounded-lg transition-all flex items-center gap-1 font-mono text-[10px]"
            >
              <Edit3 className="w-3 h-3" />
              <span>{hasName ? 'ЗМІНИТИ' : 'ВНЕСТИ'}</span>
            </button>

            <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px]">
              <button
                onClick={(e) => { e.stopPropagation(); onAddChild(person); }}
                className="px-2 py-0.5 hover:text-slate-200 hover:bg-slate-800/60 rounded transition"
                title="Додати дитину"
              >
                +Дитина
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onAddSpouse(person); }}
                className="px-2 py-0.5 hover:text-slate-200 hover:bg-slate-800/60 rounded transition"
                title="Додати союз"
              >
                +Союз
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Clean Minimalist Tier Labels
  const tierLabels = useMemo(() => {
    const tier0_y = 0;
    const tier1_y = CARD_H + GAP_Y;
    const tier2_y = (CARD_H + GAP_Y) * 2;
    return [
      { y: tier0_y, label: 'ПОКОЛІННЯ 3 • ТЕПЕРІШНЄ ПОКОЛІННЯ (Я ТА БРАТ)', color: 'text-slate-400 bg-slate-900/60 border-slate-800' },
      { y: tier1_y, label: 'ПОКОЛІННЯ 2 • БАТЬКИ, ДЯДЬКИ ТА ТІТКИ', color: 'text-slate-400 bg-slate-900/60 border-slate-800' },
      { y: tier2_y, label: 'ПОКОЛІННЯ 1 • ДІДУСІ ТА БАБУСІ', color: 'text-slate-400 bg-slate-900/60 border-slate-800' },
    ];
  }, []);

  return (
    <div className="relative w-full h-[calc(100dvh-130px)] sm:h-[calc(100vh-140px)] bg-[#030712] overflow-hidden select-none touch-none">

      {/* Very subtle minimalist grid dots (calm and clean) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Minimalist Floating Glass Toolbar */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-xl p-1.5 sm:p-2 rounded-2xl border border-slate-800 shadow-xl">
        <button onClick={() => handleZoom(0.12)} className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 active:bg-slate-700 rounded-xl transition" title="Збільшити">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={() => handleZoom(-0.12)} className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 active:bg-slate-700 rounded-xl transition" title="Зменшити">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={handleResetZoom} className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 active:bg-slate-700 rounded-xl transition" title="Центрувати">
          <Maximize2 className="w-4 h-4" />
        </button>
        <span className="text-[11px] text-slate-400 font-mono px-1 font-medium">{Math.round(scale * 100)}%</span>
        <div className="h-4 w-px bg-slate-800 mx-0.5" />
        <button
          onClick={() => setShowLegend(v => !v)}
          className={`p-2 rounded-xl transition cursor-pointer ${
            showLegend 
              ? 'bg-slate-800 text-white border border-slate-700' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
          title="Легенда"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Minimalist Clean Legend Card */}
      {showLegend && (
        <div className="absolute top-3 right-3 z-30 bg-slate-900/90 backdrop-blur-2xl p-3.5 rounded-2xl border border-slate-800 shadow-xl text-[11px] space-y-2 max-w-[200px] animate-in fade-in duration-200">
          <h4 className="text-xs font-mono font-medium text-slate-300 border-b border-slate-800 pb-1.5">
            Зв'язки дерева
          </h4>
          <div className="flex items-center gap-2"><div className="w-5 h-0.5 bg-slate-500 rounded" /><span className="text-slate-400 font-mono text-[10px]">Шлюбний зв'язок</span></div>
          <div className="flex items-center gap-2"><div className="w-5 h-0.5 bg-slate-600 rounded" /><span className="text-slate-400 font-mono text-[10px]">Батьки → Діти</span></div>
          <div className="mt-2 pt-2 border-t border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded border border-cyan-500/40 bg-cyan-950/40" /><span className="text-slate-400 font-mono text-[10px]">Чоловік</span></div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded border border-rose-500/40 bg-rose-950/40" /><span className="text-slate-400 font-mono text-[10px]">Жінка</span></div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded border border-amber-400/50 bg-amber-950/40" /><span className="text-slate-400 font-mono text-[10px]">👑 Я (Власник)</span></div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 text-slate-500 font-mono text-[9px]">
            Scroll для зуму • Drag для руху
          </div>
        </div>
      )}

      {/* Minimalist Bottom Indicator */}
      <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-30 pointer-events-none text-[11px] text-slate-400 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800 backdrop-blur-xl flex items-center gap-2.5 shadow-lg font-mono">
        <span>Покоління 3 (Я)</span>
        <span className="text-slate-600">▲</span>
        <span>Покоління 2 (Батьки)</span>
        <span className="text-slate-600">▲</span>
        <span>Покоління 1 (Дідусі)</span>
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
        onWheel={handleWheel}
        className={`w-full h-full overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.12s ease-out',
            width: canvasW,
            height: canvasH,
            position: 'relative',
            margin: '0 auto',
          }}
        >
          {/* Clean Structural SVG Connectors (No glows, no blur filters, no background trunk lasers) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ width: canvasW, height: canvasH, zIndex: 10 }}
            viewBox={`0 0 ${canvasW} ${canvasH}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {connectors.map(c => {
              const offsetD = c.d.replace(
                /(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/g,
                (_match, xStr, yStr) => {
                  const x = parseFloat(xStr) - bounds.minX;
                  const y = parseFloat(yStr) - bounds.minY;
                  return `${x} ${y}`;
                }
              );

              return (
                <path 
                  key={c.key}
                  d={offsetD} 
                  stroke={c.color} 
                  strokeWidth={c.width} 
                  strokeLinecap="round" 
                  strokeDasharray={c.dashed ? '6 4' : undefined}
                  opacity={0.8} 
                />
              );
            })}

            {/* Marriage Minimalist Signet Point */}
            {connectors.filter(c => c.label).map(c => {
              const coords = c.d.match(/-?\d+\.?\d*/g);
              if (!coords || coords.length < 4) return null;
              const x1 = parseFloat(coords[0]) - bounds.minX;
              const y1 = parseFloat(coords[1]) - bounds.minY;
              const x2 = parseFloat(coords[2]) - bounds.minX;
              const y2 = parseFloat(coords[3]) - bounds.minY;
              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2;

              return (
                <g key={`signet-${c.key}`}>
                  <circle cx={mx} cy={my} r={4} fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
                </g>
              );
            })}
          </svg>

          {/* Minimalist Tier Stage Headers */}
          {tierLabels.map(({ y, label, color }) => (
            <div
              key={label}
              className={`absolute z-10 text-[10px] font-mono font-medium tracking-wider px-3 py-1 rounded-lg border backdrop-blur-md ${color}`}
              style={{ left: 16, top: y - bounds.minY - 34 }}
            >
              {label}
            </div>
          ))}

          {/* Minimalist Glassmorphic Person Cards */}
          {positions.map(pos => {
            const person = personMap.get(pos.id);
            if (!person) return null;
            return renderCard(person, pos);
          })}
        </div>
      </div>
    </div>
  );
};
