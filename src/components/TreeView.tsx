import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import type { Person } from '../types/family';
import { MedievalTree3D } from './MedievalTree3D';
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
  Shield,
  Sparkles,
  Quote
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
   Roots (Tier 2) -> Kingdom Council (Tier 1) -> Crown (Tier 0)
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

const CARD_W = 295;
const CARD_H = 270;
const GAP_X = 46;
const GAP_Y = 130;
const COUPLE_GAP = 30;

function buildLayout(persons: Person[]) {
  const positions: NodePos[] = [];
  const connectors: Connector[] = [];

  const pairW = CARD_W * 2 + COUPLE_GAP;
  const tierGap = 130;
  const totalW = pairW * 2 + tierGap;
  const startX = -totalW / 2;

  // ---- Tier 2 (BOTTOM): Patriarchs & Founders of Kingdom ----
  const tier2_y = (CARD_H + GAP_Y) * 2;

  const pgf_x = startX;
  const pgm_x = startX + CARD_W + COUPLE_GAP;
  positions.push({ id: 'p-paternal-grandfather', x: pgf_x, y: tier2_y });
  positions.push({ id: 'p-paternal-grandmother', x: pgm_x, y: tier2_y });

  const mgf_x = startX + pairW + tierGap;
  const mgm_x = mgf_x + CARD_W + COUPLE_GAP;
  positions.push({ id: 'p-maternal-grandfather', x: mgf_x, y: tier2_y });
  positions.push({ id: 'p-maternal-grandmother', x: mgm_x, y: tier2_y });

  // ---- Tier 1 (MIDDLE): Royal Council / Parents, Uncles, Aunts ----
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

  // ---- Tier 0 (TOP): Supreme Crown / Me & Brother ----
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
  // CONNECTORS (Royal Gold Ribbons & Filaments)
  // ================================================================
  const posMap = new Map<string, NodePos>();
  positions.forEach(np => posMap.set(np.id, np));

  const topOf = (np: NodePos) => ({ x: np.x + CARD_W / 2, y: np.y });
  const botOf = (np: NodePos) => ({ x: np.x + CARD_W / 2, y: np.y + CARD_H });

  // Holy Marriage Union Bonds
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
      color: '#d4af37',
      width: 2.5,
      label: '⚜',
    });
  });

  // Paternal Grandparents → Father, Uncle, Aunt
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
      const deltaY = hubY - cb.y;
      connectors.push({
        key: `parent-patgp-${cid}`,
        d: `M ${hubX} ${hubY} C ${hubX} ${hubY - deltaY * 0.5}, ${cb.x} ${cb.y + deltaY * 0.5}, ${cb.x} ${cb.y}`,
        color: '#b8860b',
        width: 2,
      });
    });
  }

  // Maternal Grandparents → Mother, Aunt, Uncle
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
      const deltaY = hubY - cb.y;
      connectors.push({
        key: `parent-matgp-${cid}`,
        d: `M ${hubX} ${hubY} C ${hubX} ${hubY - deltaY * 0.5}, ${cb.x} ${cb.y + deltaY * 0.5}, ${cb.x} ${cb.y}`,
        color: '#991b1b',
        width: 2,
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
      const deltaY = hubY - cb.y;
      connectors.push({
        key: `parent-fm-${cid}`,
        d: `M ${hubX} ${hubY} C ${hubX} ${hubY - deltaY * 0.5}, ${cb.x} ${cb.y + deltaY * 0.5}, ${cb.x} ${cb.y}`,
        color: '#d4af37',
        width: 2.5,
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
          color: '#b8860b',
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
          color: '#991b1b',
          width: 1.5,
          dashed: true,
        });
      }
    }
  });

  return { positions, connectors };
}


/* ================================================================
   MAIN TREE VIEW COMPONENT (MEDIEVAL KINGDOM 3D)
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

  // Compute bounds with generous margins so cards and 3D tree never touch edges
  const bounds = useMemo(() => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    positions.forEach(np => {
      minX = Math.min(minX, np.x);
      maxX = Math.max(maxX, np.x + CARD_W);
      minY = Math.min(minY, np.y);
      maxY = Math.max(maxY, np.y + CARD_H);
    });
    return { minX: minX - 320, maxX: maxX + 320, minY: minY - 280, maxY: maxY + 320 };
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

  // Perfect centering of the Tree of Life in the viewport on startup and reset
  const handleResetZoom = useCallback(() => {
    if (!containerRef.current) {
      setScale(0.55);
      setPan({ x: 0, y: 0 });
      return;
    }
    const { clientWidth: cw, clientHeight: ch } = containerRef.current;
    if (cw > 0 && ch > 0) {
      // Calculate fit scale so entire tree and cards are beautifully framed
      const fitScale = Math.min(
        (cw * 0.92) / canvasW,
        (ch * 0.92) / canvasH,
        0.75
      );
      setScale(Math.max(0.2, Math.min(fitScale, 0.65)));
    } else {
      setScale(0.55);
    }
    setPan({ x: 0, y: 0 });
  }, [canvasW, canvasH]);

  // Center tree on initial mount and when canvas dimensions update
  useEffect(() => {
    handleResetZoom();
  }, [handleResetZoom]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.06 : 0.06;
    setScale(prev => Math.min(Math.max(0.15, prev + delta), 2.5));
  }, []);

  // ================================================================
  // RENDER MEDIEVAL ROYAL HERALDIC PARCHMENT CARD
  // ================================================================
  const renderCard = (person: Person, pos: NodePos) => {
    const hasName = Boolean(person.firstName || person.lastName);
    const fullName = hasName
      ? `${person.lastName} ${person.firstName}`.trim()
      : (person.roleLabel || 'Не вписано в літопис');
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

    // White-Gold Metallic Plate Styling
    const metallicBorder = isMe
      ? 'border-2 border-[#ffd700] ring-2 ring-[#d4af37]/60 shadow-[0_12px_36px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,1),0_0_24px_rgba(212,175,55,0.4)]'
      : isMale
        ? 'border-2 border-[#d4af37]/90 hover:border-[#f59e0b] shadow-[0_10px_30px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,1)]'
        : 'border-2 border-[#e6b17e] hover:border-[#d4af37] shadow-[0_10px_30px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,1)]';

    const metallicBg = 'bg-gradient-to-br from-[#ffffff] via-[#f8f6f0] to-[#eae3cf] text-[#1c1309]';

    return (
      <div
        key={person.id}
        className="person-node absolute transition-all duration-300 touch-manipulation group"
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
          className={`w-full h-full rounded-2xl p-3.5 cursor-pointer relative overflow-hidden transition-all duration-200 shadow-2xl
            ${metallicBg}
            ${metallicBorder}
            ${isSearchMatch
              ? 'ring-4 ring-[#d4af37] scale-105 shadow-[0_0_35px_rgba(212,175,55,0.8)]'
              : isHovered
                ? '-translate-y-1.5 scale-[1.02]'
                : ''
            }
            ${!hasName ? 'border-dashed border-[#d4af37]/60 opacity-90 hover:opacity-100' : ''}
          `}
        >
          {/* Metallic Gold Leaf Shimmer Top Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ffd700] to-transparent shadow-[0_1px_4px_rgba(212,175,55,0.7)]" />

          {/* Corner Heraldic Fleur-de-lis Accents */}
          <div className="absolute top-1.5 left-2 text-[10px] text-[#b48608] font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">⚜</div>
          <div className="absolute top-1.5 right-2 text-[10px] text-[#b48608] font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">⚜</div>
          <div className="absolute bottom-1 left-2 text-[9px] text-[#b48608]/60">⚜</div>
          <div className="absolute bottom-1 right-2 text-[9px] text-[#b48608]/60">⚜</div>

          {/* Top Row: 2) Назва / Роль + Покоління + Печать */}
          <div className="flex items-center justify-between gap-1 mb-2 pl-3 pr-3">
            <span className="text-[10px] font-['Cinzel'] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 bg-gradient-to-r from-[#fef3c7] via-[#fde68a] to-[#fef3c7] border border-[#d4af37] text-[#78350f] shadow-xs">
              <Shield className="w-3 h-3 text-[#b45309] inline opacity-90" />
              <span className="truncate">{person.roleLabel || (isMe ? 'Власник Дерева' : isMale ? 'Член роду' : 'Членкиня роду')}</span>
            </span>

            {/* Red Wax Seal Motif + Generation */}
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-gradient-to-br from-[#991b1b] to-[#7f1d1d] border border-[#f87171] shadow-xs flex items-center justify-center text-[7px] text-[#fffbeb] font-bold" title="Родинна Печать">
                ⚜
              </span>
              <span className="text-[9px] font-['Cinzel'] font-bold px-1.5 py-0.5 rounded bg-[#fef3c7] border border-[#d4af37] text-[#78350f] shadow-xs">
                П{person.generation}
              </span>
            </div>
          </div>

          {/* 1) Фото + 2) Назва / Ім'я */}
          <div className="flex items-start gap-2.5 mb-2">
            {/* 1) Фото Cameo Medallion */}
            <div className={`relative w-12 h-12 rounded-full shrink-0 p-[2px] shadow-md ring-2 ring-white/90 ${
              isMe
                ? 'bg-gradient-to-tr from-[#d4af37] via-[#ffd700] to-[#b45309]'
                : isMale
                  ? 'bg-gradient-to-tr from-[#d4af37] via-[#fef08a] to-[#78350f]'
                  : 'bg-gradient-to-tr from-[#e6b17e] via-[#fef08a] to-[#991b1b]'
            }`}>
              <div className="w-full h-full rounded-full bg-[#fdfbf7] flex items-center justify-center font-['Cinzel'] text-base font-extrabold overflow-hidden border border-[#d4af37]/40">
                {person.avatarUrl ? (
                  <img src={person.avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#78350f]">{initialLetter}</span>
                )}
              </div>
            </div>

            {/* 2) Назва / ПІБ */}
            <div className="flex-1 min-w-0">
              <h3 className={`font-['Cinzel'] font-extrabold text-[13px] leading-tight transition-colors truncate drop-shadow-xs ${
                hasName 
                  ? 'text-[#1c1309] group-hover:text-[#b45309]' 
                  : 'text-[#92400e] font-bold'
              }`}>
                {fullName}
              </h3>

              {person.middleName && (
                <p className="text-[11px] text-[#78350f] truncate font-serif italic">{person.middleName}</p>
              )}
              {person.maidenName && (
                <p className="text-[10px] text-[#991b1b] italic font-serif truncate">({person.maidenName})</p>
              )}

              {!hasName && (
                <p className="text-[10px] text-[#b45309] flex items-center gap-1 mt-0.5 font-serif font-bold">
                  <PlusCircle className="w-3 h-3 text-[#b45309]" />
                  <span>Вписати ім'я</span>
                </p>
              )}
            </div>
          </div>

          {/* Data List (3: Дата нар., 4: Дата смерті, 7: Місце нар., 6: Професія, 5: Цитата) */}
          <div className="space-y-1 text-xs font-serif pt-1 border-t border-[#d4af37]/30">
            {/* 3) Дата народження & 4) Дата смерті */}
            <div className="grid grid-cols-2 gap-1 bg-[#fefce8]/70 px-2 py-0.5 rounded-lg border border-[#d4af37]/40 text-[10px] shadow-xs">
              <div className="flex items-center gap-1 text-[#78350f] truncate" title={`Дата народження: ${person.birthDate || 'не вказано'}`}>
                <Calendar className="w-3 h-3 text-[#b45309] shrink-0" />
                <span className="font-semibold text-[#78350f]">Нар:</span>
                <span className="font-['Cinzel'] font-bold text-[#1c1309] truncate">{person.birthDate || '—'}</span>
              </div>
              <div className="flex items-center gap-1 text-[#78350f] truncate" title={`Дата смерті: ${person.deathDate || (person.isLiving ? 'живе' : 'не вказано')}`}>
                <span className="text-[#b45309] text-[10px] font-bold">†</span>
                <span className="font-semibold text-[#78350f]">Смерть:</span>
                <span className="font-['Cinzel'] font-bold text-[#1c1309] truncate">
                  {person.isLiving ? 'живе' : (person.deathDate || '—')}
                </span>
              </div>
            </div>

            {/* 7) Місце народження */}
            <div className="flex items-center gap-1.5 text-[10px] text-[#451a03] truncate" title={`Місце народження: ${person.birthPlace || 'Не зазначено'}`}>
              <MapPin className="w-3 h-3 text-[#b45309] shrink-0" />
              <span className="text-[#78350f] font-semibold shrink-0">Місце нар.:</span>
              <span className="font-medium text-[#1c1309] truncate">{person.birthPlace || 'Не зазначено'}</span>
            </div>

            {/* 6) Професія (одна або декілька) */}
            <div className="flex items-center gap-1.5 text-[10px] text-[#451a03] truncate" title={`Професія: ${person.profession || 'Не зазначено'}`}>
              <Briefcase className="w-3 h-3 text-[#b45309] shrink-0" />
              <span className="text-[#78350f] font-semibold shrink-0">Фах:</span>
              <span className="font-medium text-[#1c1309] truncate">{person.profession || 'Не зазначено'}</span>
            </div>

            {/* 5) Улюблена цитата */}
            <div className="bg-gradient-to-r from-[#fef3c7] via-[#fef9c3]/90 to-[#fef3c7] px-2 py-0.5 rounded border-l-2 border-[#d4af37] text-[10px] text-[#5c2406] italic truncate flex items-center gap-1 shadow-xs" title={person.favoriteQuote || 'Життєве кредо не вказано'}>
              <Quote className="w-2.5 h-2.5 text-[#b45309] shrink-0 inline opacity-90" />
              <span className="truncate">{person.favoriteQuote ? `«${person.favoriteQuote}»` : '«Життєве кредо / цитата»'}</span>
            </div>

            {/* Connection count & Life status */}
            <div className="flex items-center justify-between text-[10px] text-[#78350f] pt-0.5">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-[#b45309]" />
                <span className="font-medium">{connectionCount} зв'язків</span>
              </span>

              <span className={`px-2 py-0.2 rounded-full font-serif font-bold text-[9px] shadow-xs ${
                person.isLiving
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-400/60'
                  : 'bg-[#f5e6d3] text-[#78350f] border border-[#d4af37]/60'
              }`}>
                {person.isLiving ? 'У здравії' : 'Вічна пам’ять'}
              </span>
            </div>
          </div>

          {/* Action Footer (Metallic Gold Signet Buttons) */}
          <div className="absolute bottom-2 left-3 right-3 pt-1 border-t border-[#d4af37]/30 flex items-center justify-between text-[10px]">
            <button
              onClick={(e) => { e.stopPropagation(); onSelectPerson(person); }}
              className="px-2.5 py-1 bg-gradient-to-r from-[#d4af37] via-[#f59e0b] to-[#d4af37] text-[#1c1309] hover:text-black font-['Cinzel'] font-bold rounded-lg shadow-sm border border-[#b45309]/50 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
            >
              <Edit3 className="w-3 h-3 text-[#1c1309]" />
              <span>{hasName ? 'ГРАМОТА' : 'ВПИСАТИ'}</span>
            </button>

            <div className="flex items-center gap-1.5 font-['Cinzel'] font-bold text-[9px]">
              <button
                onClick={(e) => { e.stopPropagation(); onAddChild(person); }}
                className="px-2 py-0.5 bg-white/90 hover:bg-[#fef3c7] text-[#78350f] border border-[#d4af37]/60 rounded-md transition cursor-pointer shadow-xs"
                title="Вписати нащадка"
              >
                +Нащадок
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onAddSpouse(person); }}
                className="px-2 py-0.5 bg-white/90 hover:bg-[#fef3c7] text-[#78350f] border border-[#d4af37]/60 rounded-md transition cursor-pointer shadow-xs"
                title="Вписати союз"
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
    <div className="relative w-full h-[calc(100dvh-130px)] sm:h-[calc(100vh-140px)] bg-[#0c0906] overflow-hidden select-none touch-none">

      {/* Medieval Castle Stone / Tapestry Atmosphere */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 90% 70% at 50% 90%, rgba(120,53,15,0.25) 0%, transparent 60%),
            radial-gradient(ellipse 70% 50% at 50% 10%, rgba(212,175,55,0.15) 0%, transparent 50%),
            radial-gradient(circle at center, rgba(30,19,10,0.8) 0%, transparent 80%)
          `,
        }}
      />

      {/* Floating Medieval Toolbar */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 bg-[#181109]/90 backdrop-blur-xl p-1.5 sm:p-2 rounded-2xl border border-[#d4af37]/40 shadow-2xl shadow-black/80">
        <button onClick={() => handleZoom(0.12)} className="p-2 text-[#d4af37] hover:text-[#fffbeb] bg-[#26190e] active:bg-[#3d2716] rounded-xl transition" title="Збільшити">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={() => handleZoom(-0.12)} className="p-2 text-[#d4af37] hover:text-[#fffbeb] bg-[#26190e] active:bg-[#3d2716] rounded-xl transition" title="Зменшити">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={handleResetZoom} className="p-2 text-[#d4af37] hover:text-[#fffbeb] bg-[#26190e] active:bg-[#3d2716] rounded-xl transition" title="Центрувати літопис">
          <Maximize2 className="w-4 h-4" />
        </button>
        <span className="text-[11px] text-[#fef3c7] font-['Cinzel'] font-bold px-1.5">{Math.round(scale * 100)}%</span>
        <div className="h-4 w-px bg-[#d4af37]/30 mx-0.5" />
        <button
          onClick={() => setShowLegend(v => !v)}
          className={`p-2 rounded-xl transition cursor-pointer ${
            showLegend 
              ? 'bg-[#d4af37] text-slate-950 font-bold shadow-md shadow-[#d4af37]/30' 
              : 'text-[#d4af37] hover:text-[#fffbeb] bg-[#26190e]'
          }`}
          title="Гербова Легенда"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Medieval Heraldic Legend Card */}
      {showLegend && (
        <div className="absolute top-3 right-3 z-30 bg-[#181109]/95 backdrop-blur-2xl p-4 rounded-2xl border border-[#d4af37]/50 shadow-2xl shadow-black/90 text-[11px] space-y-2 max-w-[220px] animate-in fade-in duration-200 font-serif">
          <h4 className="text-xs font-['Cinzel'] font-bold text-[#fef3c7] flex items-center gap-1.5 border-b border-[#d4af37]/30 pb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Геральдичні Узи</span>
          </h4>
          <div className="flex items-center gap-2"><div className="w-5 h-1 bg-[#d4af37] rounded-full shadow-sm" /><span className="text-[#fef3c7] font-serif">⚜ Родинний Союз</span></div>
          <div className="flex items-center gap-2"><div className="w-5 h-1 bg-[#b8860b] rounded-full" /><span className="text-[#d4af37]">Батьківська лінія</span></div>
          <div className="flex items-center gap-2"><div className="w-5 h-1 bg-[#991b1b] rounded-full" /><span className="text-[#fca5a5]">Материнська лінія</span></div>
          <div className="flex items-center gap-2"><div className="w-5 h-1 bg-[#d4af37] rounded-full" /><span className="text-[#fef3c7]">Молодше покоління (Я та брат)</span></div>
          <div className="mt-2 pt-2 border-t border-[#d4af37]/30 space-y-1.5">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full border border-[#d4af37] bg-[#2a1a0e]" /><span className="text-[#fef3c7]">Чоловіча гілка</span></div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full border border-[#f87171] bg-[#261010]" /><span className="text-[#fca5a5]">Жіноча гілка</span></div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full border-2 border-[#d4af37] bg-[#78350f]" /><span className="text-[#fef3c7] font-bold">⚜ Власник Дерева (Я)</span></div>
          </div>
          <div className="mt-2 pt-2 border-t border-[#d4af37]/30 text-[#d4af37]/60 text-[9px] italic">
            🌳 Живе 3D Дерево Роду Малеєвих
          </div>
        </div>
      )}

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
        className={`w-full h-full overflow-hidden relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: canvasW,
            height: canvasH,
            transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.12s ease-out',
          }}
        >
          {/* ======================================================== */}
          {/* LAYER 1: INTERACTIVE 3D MEDIEVAL TREE OF LIFE            */}
          {/* ======================================================== */}
          <MedievalTree3D canvasW={canvasW} canvasH={canvasH} />

          {/* ======================================================== */}
          {/* LAYER 2: ROYAL GOLD RIBBONS & CHAINS                     */}
          {/* ======================================================== */}
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
                  opacity={0.9} 
                />
              );
            })}

            {/* Holy Marriage Wax Signet Badge */}
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
                  <circle cx={mx} cy={my} r={14} fill="#181109" stroke="#d4af37" strokeWidth="2" />
                  <circle cx={mx} cy={my} r={10} fill="#991b1b" />
                  <text x={mx} y={my + 1} textAnchor="middle" dominantBaseline="central" fontSize="10" fill="#fef3c7">
                    ⚜
                  </text>
                </g>
              );
            })}
          </svg>

          {/* ======================================================== */}
          {/* LAYER 3: ROYAL HERALDIC PARCHMENT CARDS                  */}
          {/* ======================================================== */}
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
