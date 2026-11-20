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
  Leaf
} from 'lucide-react';

interface TreeViewProps {
  persons: Person[];
  searchQuery: string;
  onSelectPerson: (person: Person) => void;
  onAddChild: (parent: Person) => void;
  onAddSpouse: (person: Person) => void;
}

/* ================================================================
   LAYOUT ENGINE — computes absolute {x,y} positions for every node
   and SVG connector paths between them.
   ================================================================ */

interface NodePos {
  id: string;
  x: number;   // centre-x
  y: number;   // top-y
}

interface Connector {
  key: string;
  d: string;      // SVG path d attribute
  color: string;
  width: number;
  dashed?: boolean;
  label?: string;
}

const CARD_W = 260;
const CARD_H = 200;
const GAP_X = 36;
const GAP_Y = 110;
const COUPLE_GAP = 24;

function buildLayout(persons: Person[]) {
  const pm = new Map<string, Person>();
  persons.forEach(p => pm.set(p.id, p));

  const positions: NodePos[] = [];
  const connectors: Connector[] = [];

  // ---- Tier 0 (top): Grandparents ----
  // paternal pair                    maternal pair
  // [pgf] --- [pgm]      gap      [mgf] --- [mgm]
  const pairW = CARD_W * 2 + COUPLE_GAP;        // width of a couple block
  const tierGap = 100;                           // gap between two grandparent pairs
  const totalW = pairW * 2 + tierGap;
  const startX = -totalW / 2;

  const tier0_y = 0;

  // Paternal grandparents
  const pgf_x = startX;
  const pgm_x = startX + CARD_W + COUPLE_GAP;
  positions.push({ id: 'p-paternal-grandfather', x: pgf_x, y: tier0_y });
  positions.push({ id: 'p-paternal-grandmother', x: pgm_x, y: tier0_y });

  // Maternal grandparents
  const mgf_x = startX + pairW + tierGap;
  const mgm_x = mgf_x + CARD_W + COUPLE_GAP;
  positions.push({ id: 'p-maternal-grandfather', x: mgf_x, y: tier0_y });
  positions.push({ id: 'p-maternal-grandmother', x: mgm_x, y: tier0_y });

  // ---- Tier 1: Parents + uncles/aunts ----
  const tier1_y = tier0_y + CARD_H + GAP_Y;

  // Father's siblings to the left of father

  // Father centred under paternal grandparents
  const patCentreX = (pgf_x + pgm_x + CARD_W) / 2; // centre of paternal pair
  const matCentreX = (mgf_x + mgm_x + CARD_W) / 2; // centre of maternal pair

  // Paternal uncle to the left of father
  const pUncle_x = patCentreX - CARD_W / 2 - GAP_X / 2 - CARD_W;
  const pAunt_x = pUncle_x - GAP_X - CARD_W;

  positions.push({ id: 'p-paternal-aunt', x: pAunt_x, y: tier1_y });
  positions.push({ id: 'p-paternal-uncle', x: pUncle_x, y: tier1_y });

  // Parents in the centre
  const parentsCentreX = (patCentreX + matCentreX) / 2;
  const fatherFinal_x = parentsCentreX - COUPLE_GAP / 2 - CARD_W;
  const mother_x = parentsCentreX + COUPLE_GAP / 2;
  positions.push({ id: 'p-father', x: fatherFinal_x, y: tier1_y });
  positions.push({ id: 'p-mother', x: mother_x, y: tier1_y });

  // Maternal aunt/uncle to the right of mother
  const mAunt_x = mother_x + CARD_W + GAP_X;
  const mUncle_x = mAunt_x + CARD_W + GAP_X;
  positions.push({ id: 'p-maternal-aunt', x: mAunt_x, y: tier1_y });
  positions.push({ id: 'p-maternal-uncle', x: mUncle_x, y: tier1_y });

  // ---- Tier 2 (bottom): Me & Brother ----
  const tier2_y = tier1_y + CARD_H + GAP_Y;
  const me_x = parentsCentreX - COUPLE_GAP / 2 - CARD_W;
  const bro_x = parentsCentreX + COUPLE_GAP / 2;
  positions.push({ id: 'p-me', x: me_x, y: tier2_y });
  positions.push({ id: 'p-brother', x: bro_x, y: tier2_y });

  // Any extra persons not in the template: place them off to the right
  let extraX = mUncle_x + CARD_W + GAP_X * 2;
  persons.forEach(p => {
    if (!positions.find(np => np.id === p.id)) {
      const tier = p.generation === 1 ? tier0_y : p.generation === 2 ? tier1_y : tier2_y;
      positions.push({ id: p.id, x: extraX, y: tier });
      extraX += CARD_W + GAP_X;
    }
  });

  // ================================================================
  // BUILD CONNECTORS
  // ================================================================
  const posMap = new Map<string, NodePos>();
  positions.forEach(np => posMap.set(np.id, np));

  const bot = (np: NodePos) => ({ x: np.x + CARD_W / 2, y: np.y + CARD_H });
  const top = (np: NodePos) => ({ x: np.x + CARD_W / 2, y: np.y });

  // Marriage connectors (horizontal line between spouses)
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
      color: '#f59e0b',
      width: 3,
      label: '💍',
    });
  });

  // Parent → child connectors
  // The connector goes from the bottom centre of the parent-couple "hub"
  // down to the top centre of each child

  // Paternal grandparents → their children (father, uncle, aunt)
  const pgfPos = posMap.get('p-paternal-grandfather');
  const pgmPos = posMap.get('p-paternal-grandmother');
  if (pgfPos && pgmPos) {
    const hubX = (pgfPos.x + CARD_W + pgmPos.x) / 2;  // between the couple
    const hubY = pgfPos.y + CARD_H;
    const childIds = ['p-father', 'p-paternal-uncle', 'p-paternal-aunt'];
    childIds.forEach(cid => {
      const cp = posMap.get(cid);
      if (!cp) return;
      const ct = top(cp);
      const midY = hubY + (ct.y - hubY) / 2;
      connectors.push({
        key: `parent-patgp-${cid}`,
        d: `M ${hubX} ${hubY} L ${hubX} ${midY} Q ${hubX} ${ct.y} ${ct.x} ${ct.y}`,
        color: '#22d3ee',
        width: 2.5,
      });
    });
  }

  // Maternal grandparents → their children
  const mgfPos = posMap.get('p-maternal-grandfather');
  const mgmPos = posMap.get('p-maternal-grandmother');
  if (mgfPos && mgmPos) {
    const hubX = (mgfPos.x + CARD_W + mgmPos.x) / 2;
    const hubY = mgfPos.y + CARD_H;
    const childIds = ['p-mother', 'p-maternal-aunt', 'p-maternal-uncle'];
    childIds.forEach(cid => {
      const cp = posMap.get(cid);
      if (!cp) return;
      const ct = top(cp);
      const midY = hubY + (ct.y - hubY) / 2;
      connectors.push({
        key: `parent-matgp-${cid}`,
        d: `M ${hubX} ${hubY} L ${hubX} ${midY} Q ${hubX} ${ct.y} ${ct.x} ${ct.y}`,
        color: '#fb7185',
        width: 2.5,
      });
    });
  }

  // Father + Mother → their children (me, brother)
  const fatherPos = posMap.get('p-father');
  const motherPos = posMap.get('p-mother');
  if (fatherPos && motherPos) {
    const hubX = (fatherPos.x + CARD_W + motherPos.x) / 2;
    const hubY = fatherPos.y + CARD_H;
    const childIds = ['p-me', 'p-brother'];
    childIds.forEach(cid => {
      const cp = posMap.get(cid);
      if (!cp) return;
      const ct = top(cp);
      const midY = hubY + (ct.y - hubY) / 2;
      connectors.push({
        key: `parent-fm-${cid}`,
        d: `M ${hubX} ${hubY} L ${hubX} ${midY} Q ${hubX} ${ct.y} ${ct.x} ${ct.y}`,
        color: '#a78bfa',
        width: 2.5,
      });
    });
  }

  // Also draw connectors for any dynamically-added persons
  persons.forEach(p => {
    if (['p-paternal-grandfather', 'p-paternal-grandmother', 'p-maternal-grandfather', 'p-maternal-grandmother', 'p-father', 'p-mother', 'p-paternal-uncle', 'p-paternal-aunt', 'p-maternal-aunt', 'p-maternal-uncle', 'p-me', 'p-brother'].includes(p.id)) return;
    // Connect to father
    if (p.fatherId) {
      const fp = posMap.get(p.fatherId);
      const cp = posMap.get(p.id);
      if (fp && cp) {
        connectors.push({
          key: `dyn-father-${p.id}`,
          d: `M ${bot(fp).x} ${bot(fp).y} Q ${bot(fp).x} ${top(cp).y} ${top(cp).x} ${top(cp).y}`,
          color: '#22d3ee',
          width: 2,
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
          d: `M ${bot(mp).x} ${bot(mp).y} Q ${bot(mp).x} ${top(cp).y} ${top(cp).x} ${top(cp).y}`,
          color: '#fb7185',
          width: 2,
          dashed: true,
        });
      }
    }
  });

  return { positions, connectors, posMap };
}


/* ================================================================
   TREE VIEW COMPONENT
   ================================================================ */

export const TreeView: React.FC<TreeViewProps> = ({
  persons,
  searchQuery,
  onSelectPerson,
  onAddChild,
  onAddSpouse,
}) => {
  const [scale, setScale] = useState(0.65);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pinchStartDist, setPinchStartDist] = useState<number | null>(null);
  const [pinchStartScale, setPinchStartScale] = useState<number>(0.65);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // Build layout
  const { positions, connectors } = useMemo(() => buildLayout(persons), [persons]);

  const personMap = useMemo(() => {
    const m = new Map<string, Person>();
    persons.forEach(p => m.set(p.id, p));
    return m;
  }, [persons]);

  // Compute canvas bounds
  const bounds = useMemo(() => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    positions.forEach(np => {
      minX = Math.min(minX, np.x);
      maxX = Math.max(maxX, np.x + CARD_W);
      minY = Math.min(minY, np.y);
      maxY = Math.max(maxY, np.y + CARD_H);
    });
    return { minX: minX - 80, maxX: maxX + 80, minY: minY - 80, maxY: maxY + 80 };
  }, [positions]);

  const canvasW = bounds.maxX - bounds.minX;
  const canvasH = bounds.maxY - bounds.minY;

  // ---- Pan & Zoom handlers ----

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
      setScale(Math.min(Math.max(0.2, pinchStartScale * (dist / pinchStartDist)), 2.5));
    }
  };
  const handleTouchEnd = () => { setIsDragging(false); setPinchStartDist(null); };

  const handleZoom = (delta: number) => setScale(prev => Math.min(Math.max(0.2, prev + delta), 2.5));
  const handleResetZoom = () => { setScale(0.65); setPan({ x: 0, y: 0 }); };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setScale(prev => Math.min(Math.max(0.2, prev + delta), 2.5));
  }, []);

  // ================================================================
  // Render a detailed person card
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

    // Count family connections
    const connectionCount =
      (person.fatherId ? 1 : 0) +
      (person.motherId ? 1 : 0) +
      (person.spouseIds?.length || 0) +
      (person.childrenIds?.length || 0);

    // Accent color based on gender + branch
    const accentBorder = isMe
      ? 'border-amber-400'
      : isMale ? 'border-cyan-500/50' : 'border-rose-500/50';
    const accentGlow = isMe
      ? 'shadow-amber-500/30'
      : isMale ? 'shadow-cyan-500/20' : 'shadow-rose-500/20';
    const accentBg = isMe
      ? 'from-amber-950/60 to-slate-900'
      : isMale ? 'from-cyan-950/40 to-slate-900' : 'from-rose-950/40 to-slate-900';

    return (
      <div
        key={person.id}
        className={`person-node absolute transition-all duration-200 touch-manipulation`}
        style={{
          left: pos.x - bounds.minX,
          top: pos.y - bounds.minY,
          width: CARD_W,
          height: CARD_H,
          zIndex: isHovered || isSearchMatch ? 30 : 10,
        }}
        onMouseEnter={() => setHoveredId(person.id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        <div
          onClick={() => onSelectPerson(person)}
          className={`w-full h-full rounded-2xl p-3.5 cursor-pointer relative overflow-hidden border-2 backdrop-blur-xl
            bg-gradient-to-b ${accentBg}
            ${accentBorder}
            ${isSearchMatch
              ? 'ring-4 ring-amber-400 shadow-2xl shadow-amber-500/40 scale-105'
              : isHovered
                ? `shadow-2xl ${accentGlow} scale-[1.03]`
                : `shadow-lg ${accentGlow}`
            }
            ${!hasName ? 'border-dashed opacity-80 hover:opacity-100' : ''}
          `}
        >
          {/* Top decorative bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${
            isMe ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500'
              : isMale ? 'bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-600'
              : 'bg-gradient-to-r from-rose-600 via-rose-400 to-rose-600'
          }`} />

          {/* Generation badge */}
          <div className="absolute top-2 right-2">
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
              person.generation === 1 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : person.generation === 2 ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
            }`}>
              П{person.generation}
            </span>
          </div>

          {/* Role label pill */}
          <div className="mb-2">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
              isMe
                ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                : isMale
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
            }`}>
              {isMe && <span>👑</span>}
              <span>{person.roleLabel || (isMale ? 'Чоловік' : 'Жінка')}</span>
            </span>

            {!hasName && (
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-medium">
                Порожнє
              </span>
            )}
          </div>

          {/* Avatar + Name */}
          <div className="flex items-start gap-2.5 mb-2">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-serif text-base font-bold shrink-0 shadow-md ${
              isMe
                ? 'bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 text-slate-950 ring-2 ring-amber-400/60'
                : isMale
                  ? 'bg-gradient-to-tr from-cyan-900/60 to-cyan-700/40 text-cyan-200 border border-cyan-500/40'
                  : 'bg-gradient-to-tr from-rose-900/60 to-rose-700/40 text-rose-200 border border-rose-500/40'
            }`}>
              {person.avatarUrl ? (
                <img src={person.avatarUrl} alt={fullName} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <span>{initialLetter}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-sm truncate ${
                hasName ? 'text-slate-100' : 'text-amber-300/90 font-medium'
              }`}>
                {fullName}
              </h3>
              {person.middleName && (
                <p className="text-xs text-slate-400 truncate">{person.middleName}</p>
              )}
              {person.maidenName && (
                <p className="text-[11px] text-amber-400/80 italic">({person.maidenName})</p>
              )}
              {!hasName && !person.middleName && (
                <p className="text-[11px] text-amber-400 flex items-center gap-1 mt-0.5 font-medium">
                  <PlusCircle className="w-3 h-3" />
                  <span>Заповнити дані</span>
                </p>
              )}
            </div>
          </div>

          {/* Details grid */}
          <div className="border-t border-slate-800/80 pt-2 space-y-1">
            {/* Dates */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Calendar className="w-3 h-3 shrink-0 text-slate-500" />
              {person.birthDate ? (
                <span className="font-mono">
                  {person.birthDate} — {person.isLiving ? 'досі' : (person.deathDate || '?')}
                </span>
              ) : (
                <span className="italic">Дати не вказано</span>
              )}
            </div>

            {/* Birth place */}
            {person.birthPlace && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                <MapPin className="w-3 h-3 shrink-0 text-slate-500" />
                <span className="truncate">{person.birthPlace}</span>
              </div>
            )}

            {/* Profession */}
            {person.profession && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                <Briefcase className="w-3 h-3 shrink-0 text-slate-500" />
                <span className="truncate">{person.profession}</span>
              </div>
            )}

            {/* Connections counter */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Users className="w-3 h-3 shrink-0" />
              <span>{connectionCount} зв'язків</span>
              {person.isLiving !== undefined && (
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  person.isLiving
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}>
                  {person.isLiving ? '● Живий(а)' : '○ Пам\'ять'}
                </span>
              )}
            </div>
          </div>

          {/* Action bar */}
          <div className="mt-auto pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] absolute bottom-2 left-3.5 right-3.5">
            <button
              onClick={(e) => { e.stopPropagation(); onSelectPerson(person); }}
              className="px-2 py-0.5 text-amber-400 hover:text-amber-300 bg-slate-800/80 active:bg-slate-700 rounded-lg transition flex items-center gap-1 font-medium"
            >
              <Edit3 className="w-3 h-3" />
              <span>{hasName ? 'Змінити' : 'Внести'}</span>
            </button>

            <div className="flex items-center gap-1 text-slate-500">
              <button
                onClick={(e) => { e.stopPropagation(); onAddChild(person); }}
                className="px-1.5 py-0.5 hover:text-amber-400 transition"
                title="Додати дитину"
              >
                +Дитина
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onAddSpouse(person); }}
                className="px-1.5 py-0.5 hover:text-rose-400 transition"
                title="Додати подружжя"
              >
                +Союз
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-[calc(100dvh-130px)] sm:h-[calc(100vh-140px)] bg-slate-950 overflow-hidden select-none touch-none">

      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 30% 30%, rgba(34,211,238,0.04) 0%, transparent 60%),
            radial-gradient(ellipse 80% 60% at 70% 70%, rgba(251,113,133,0.04) 0%, transparent 60%),
            radial-gradient(circle at center, rgba(120,53,15,0.08) 0%, transparent 50%)
          `,
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* ============ TOOLBAR ============ */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-slate-900/95 backdrop-blur-xl p-1.5 sm:p-2 rounded-2xl border border-slate-800 shadow-2xl">
        <button onClick={() => handleZoom(0.15)} className="p-2 text-slate-300 hover:text-white bg-slate-800/60 active:bg-slate-700 rounded-xl transition" title="Збільшити">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={() => handleZoom(-0.15)} className="p-2 text-slate-300 hover:text-white bg-slate-800/60 active:bg-slate-700 rounded-xl transition" title="Зменшити">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={handleResetZoom} className="p-2 text-slate-300 hover:text-white bg-slate-800/60 active:bg-slate-700 rounded-xl transition" title="Скинути">
          <Maximize2 className="w-4 h-4" />
        </button>
        <span className="text-[11px] text-slate-400 font-mono px-1">{Math.round(scale * 100)}%</span>

        <div className="h-4 w-px bg-slate-700 mx-0.5" />

        <button
          onClick={() => setShowLegend(v => !v)}
          className={`p-2 rounded-xl transition ${showLegend ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white bg-slate-800/60'}`}
          title="Легенда"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* ============ LEGEND ============ */}
      {showLegend && (
        <div className="absolute top-3 right-3 z-20 bg-slate-900/95 backdrop-blur-xl p-3 rounded-2xl border border-slate-800 shadow-2xl text-[11px] space-y-1.5 max-w-[200px]">
          <h4 className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            Легенда зв'язків
          </h4>
          <div className="flex items-center gap-2">
            <div className="w-5 h-0.5 bg-amber-500 rounded" />
            <span className="text-slate-300">💍 Шлюб</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-0.5 bg-cyan-400 rounded" />
            <span className="text-slate-300">Лінія батька</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-0.5 bg-rose-400 rounded" />
            <span className="text-slate-300">Лінія матері</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-0.5 bg-violet-400 rounded" />
            <span className="text-slate-300">Батьки → Діти</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 border-cyan-500/60 bg-cyan-950/50" />
              <span className="text-slate-400">Чоловік</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 border-rose-500/60 bg-rose-950/50" />
              <span className="text-slate-400">Жінка</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 border-amber-400 bg-amber-950/50" />
              <span className="text-slate-400">👑 Я</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 border-dashed border-amber-500/50" />
              <span className="text-slate-400">Порожнє</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 text-slate-500 text-[10px]">
            Scroll / Pinch для зуму<br/>
            Drag для переміщення
          </div>
        </div>
      )}

      {/* ============ GENERATION LABELS ============ */}
      <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-20 pointer-events-none text-[11px] sm:text-xs text-slate-300 bg-slate-900/95 px-3 py-2 rounded-xl border border-slate-800 backdrop-blur-xl flex items-center gap-3 shadow-xl">
        <span className="text-emerald-400 font-bold">П1</span>
        <span className="text-slate-500">Дідусі / Бабусі</span>
        <span className="text-slate-700">•</span>
        <span className="text-blue-400 font-bold">П2</span>
        <span className="text-slate-500">Батьки / Дядьки / Тітки</span>
        <span className="text-slate-700">•</span>
        <span className="text-purple-400 font-bold">П3</span>
        <span className="text-slate-500">Молоде покоління</span>
      </div>

      {/* ============ CANVAS ============ */}
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
          {/* SVG layer for connectors */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ width: canvasW, height: canvasH }}
            viewBox={`0 0 ${canvasW} ${canvasH}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Glow filter */}
              <filter id="connectorGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Arrow marker */}
              <marker id="arrowCyan" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#22d3ee" />
              </marker>
              <marker id="arrowRose" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#fb7185" />
              </marker>
              <marker id="arrowViolet" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#a78bfa" />
              </marker>
            </defs>

            {/* Render connector paths */}
            {connectors.map(c => {
              // Offset path coordinates by -bounds.min
              const offsetD = c.d.replace(
                /(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/g,
                (_match, xStr, yStr) => {
                  const x = parseFloat(xStr) - bounds.minX;
                  const y = parseFloat(yStr) - bounds.minY;
                  return `${x} ${y}`;
                }
              );

              const markerEnd = c.color === '#22d3ee' ? 'url(#arrowCyan)'
                : c.color === '#fb7185' ? 'url(#arrowRose)'
                : c.color === '#a78bfa' ? 'url(#arrowViolet)'
                : undefined;

              return (
                <g key={c.key}>
                  {/* Glow background */}
                  <path
                    d={offsetD}
                    stroke={c.color}
                    strokeWidth={c.width + 4}
                    strokeLinecap="round"
                    opacity={0.15}
                    strokeDasharray={c.dashed ? '8 6' : undefined}
                    filter="url(#connectorGlow)"
                  />
                  {/* Main path */}
                  <path
                    d={offsetD}
                    stroke={c.color}
                    strokeWidth={c.width}
                    strokeLinecap="round"
                    strokeDasharray={c.dashed ? '8 6' : undefined}
                    markerEnd={c.key.startsWith('marriage') ? undefined : markerEnd}
                    opacity={0.85}
                  />
                </g>
              );
            })}

            {/* Marriage symbols */}
            {connectors.filter(c => c.label).map(c => {
              // Find midpoint of marriage line
              const coords = c.d.match(/-?\d+\.?\d*/g);
              if (!coords || coords.length < 4) return null;
              const x1 = parseFloat(coords[0]) - bounds.minX;
              const y1 = parseFloat(coords[1]) - bounds.minY;
              const x2 = parseFloat(coords[2]) - bounds.minX;
              const y2 = parseFloat(coords[3]) - bounds.minY;
              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2;

              return (
                <g key={`label-${c.key}`}>
                  <circle cx={mx} cy={my} r={14} fill="#1e1b4b" stroke="#f59e0b" strokeWidth={2} />
                  <text x={mx} y={my + 1} textAnchor="middle" dominantBaseline="central" fontSize="12" fill="white">
                    💍
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Tier labels (floating on canvas) */}
          {[
            { y: 0, label: '🌱 Покоління 1 — Дідусі та Бабусі', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
            { y: CARD_H + GAP_Y, label: '🌿 Покоління 2 — Батьки, Дядьки, Тітки', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
            { y: (CARD_H + GAP_Y) * 2, label: '🍃 Покоління 3 — Молоде покоління', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
          ].map(({ y, label, color }) => (
            <div
              key={label}
              className={`absolute z-5 text-[11px] font-semibold px-3 py-1 rounded-full border backdrop-blur-md ${color}`}
              style={{
                left: 10,
                top: y - bounds.minY - 32,
              }}
            >
              {label}
            </div>
          ))}

          {/* Render person cards */}
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
