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
  Crown,
  Activity,
  Sparkles
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
  // CONNECTORS (Sleek Fiber-Optic Energy Paths)
  // ================================================================
  const posMap = new Map<string, NodePos>();
  positions.forEach(np => posMap.set(np.id, np));

  const topOf = (np: NodePos) => ({ x: np.x + CARD_W / 2, y: np.y });
  const botOf = (np: NodePos) => ({ x: np.x + CARD_W / 2, y: np.y + CARD_H });

  // Marriage connections (Quantum Entanglement Bridge)
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
      color: '#38bdf8',
      width: 2.5,
      label: '⚡',
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
        color: '#06b6d4',
        width: 2.5,
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
        color: '#f43f5e',
        width: 2.5,
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
        color: '#818cf8',
        width: 3,
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
          color: '#06b6d4',
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
          d: `M ${topOf(mp).x} ${topOf(mp).y} C ${topOf(mp).x} ${botOf(cp).y}, ${botOf(cp).x} ${topOf(mp).y}, ${botOf(cp).x} ${botOf(cp).y}`,
          color: '#f43f5e',
          width: 2,
          dashed: true,
        });
      }
    }
  });

  return { positions, connectors };
}


/* ================================================================
   FUTURISTIC QUANTUM NEURAL TREE (SVG)
   Minimalist cybernetic fiber-optic conduits, glowing quantum core,
   subtle holographic rings and geometric lineage paths.
   ================================================================ */

const QuantumTreeSVG: React.FC<{ canvasW: number; canvasH: number }> = ({ canvasW, canvasH }) => {
  const cx = canvasW / 2;
  const bottom = canvasH + 40;
  const trunkBottom = bottom - 40;
  const mid = canvasH * 0.48;
  const trunkTop = canvasH * 0.16;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ width: canvasW, height: canvasH }}
      viewBox={`0 0 ${canvasW} ${canvasH}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Futuristic Laser Gradients */}
        <linearGradient id="quantumCoreGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#6366f1" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.9" />
        </linearGradient>

        <linearGradient id="neonLaserCyan" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#0891b2" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.9" />
        </linearGradient>

        <linearGradient id="neonLaserViolet" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#c084fc" stopOpacity="0.9" />
        </linearGradient>

        <radialGradient id="quantumCoreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
          <stop offset="60%" stopColor="#6366f1" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#030712" stopOpacity="0" />
        </radialGradient>

        {/* Glow Filters */}
        <filter id="neonGlowWide" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="laserSharpGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ========================================================= */}
      {/* 1. QUANTUM CORE BACKGROUND AMBIENT RADIANCE              */}
      {/* ========================================================= */}
      <circle cx={cx} cy={trunkBottom - 40} r={320} fill="url(#quantumCoreGlow)" />
      <circle cx={cx} cy={mid} r={280} fill="url(#quantumCoreGlow)" opacity="0.6" />
      <circle cx={cx} cy={trunkTop - 50} r={240} fill="url(#quantumCoreGlow)" opacity="0.8" />

      {/* ========================================================= */}
      {/* 2. HOLOGRAPHIC GEOMETRIC RINGS (MINIMALIST TECH ACCENTS)  */}
      {/* ========================================================= */}
      <g opacity="0.35">
        {/* Core Base Ring */}
        <circle cx={cx} cy={trunkBottom} r={140} stroke="#06b6d4" strokeWidth="1" strokeDasharray="6 8" />
        <circle cx={cx} cy={trunkBottom} r={90} stroke="#6366f1" strokeWidth="1.5" strokeDasharray="3 6" />

        {/* Mid Conduits Junction Ring */}
        <circle cx={cx} cy={mid + 20} r={100} stroke="#a855f7" strokeWidth="1" strokeDasharray="8 6" />
        <circle cx={cx} cy={mid + 20} r={50} stroke="#06b6d4" strokeWidth="1" strokeDasharray="2 4" />

        {/* Apex Ring */}
        <circle cx={cx} cy={trunkTop - 30} r={80} stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="4 6" />
      </g>

      {/* ========================================================= */}
      {/* 3. FIBER-OPTIC ROOTS / ORIGIN CONDUITS                    */}
      {/* ========================================================= */}
      <g filter="url(#laserSharpGlow)" opacity="0.85">
        {/* Left Ancestral Lineage Bus (Grandparents Line) */}
        <path d={`M ${cx - 20} ${trunkBottom} C ${cx - 140} ${trunkBottom + 20}, ${cx - 320} ${bottom - 10}, ${cx - 480} ${bottom + 20}`} stroke="url(#neonLaserCyan)" strokeWidth="3" />
        <path d={`M ${cx - 10} ${trunkBottom + 10} C ${cx - 90} ${trunkBottom + 30}, ${cx - 220} ${bottom}, ${cx - 320} ${bottom + 25}`} stroke="#0891b2" strokeWidth="2" strokeDasharray="8 6" />
        <path d={`M ${cx - 30} ${trunkBottom + 5} C ${cx - 160} ${trunkBottom + 45}, ${cx - 260} ${bottom + 10}, ${cx - 380} ${bottom + 35}`} stroke="#06b6d4" strokeWidth="1.5" />

        {/* Right Ancestral Lineage Bus */}
        <path d={`M ${cx + 20} ${trunkBottom} C ${cx + 140} ${trunkBottom + 20}, ${cx + 320} ${bottom - 10}, ${cx + 480} ${bottom + 20}`} stroke="url(#neonLaserViolet)" strokeWidth="3" />
        <path d={`M ${cx + 10} ${trunkBottom + 10} C ${cx + 90} ${trunkBottom + 30}, ${cx + 220} ${bottom}, ${cx + 320} ${bottom + 25}`} stroke="#6366f1" strokeWidth="2" strokeDasharray="8 6" />
        <path d={`M ${cx + 30} ${trunkBottom + 5} C ${cx + 160} ${trunkBottom + 45}, ${cx + 260} ${bottom + 10}, ${cx + 380} ${bottom + 35}`} stroke="#a855f7" strokeWidth="1.5" />
      </g>

      {/* ========================================================= */}
      {/* 4. CENTRAL QUANTUM SPINE / TRUNK                         */}
      {/* ========================================================= */}
      <g filter="url(#neonGlowWide)">
        {/* Core Luminous Conduit */}
        <path
          d={`M ${cx} ${trunkBottom} L ${cx} ${trunkTop}`}
          stroke="url(#quantumCoreGrad)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Parallel Cybernetic Traces */}
        <path
          d={`M ${cx - 14} ${trunkBottom} C ${cx - 16} ${mid + 80}, ${cx - 10} ${mid}, ${cx - 8} ${trunkTop}`}
          stroke="#06b6d4"
          strokeWidth="1.5"
          strokeDasharray="12 6"
          opacity="0.8"
        />
        <path
          d={`M ${cx + 14} ${trunkBottom} C ${cx + 16} ${mid + 80}, ${cx + 10} ${mid}, ${cx + 8} ${trunkTop}`}
          stroke="#a855f7"
          strokeWidth="1.5"
          strokeDasharray="12 6"
          opacity="0.8"
        />
      </g>

      {/* ========================================================= */}
      {/* 5. HORIZONTAL NEURAL BUSES (PARENTS & SIBLINGS LEVEL)     */}
      {/* ========================================================= */}
      <g filter="url(#laserSharpGlow)" opacity="0.9">
        {/* Left Bough Bus (Father Line) */}
        <path
          d={`M ${cx - 10} ${mid + 30} C ${cx - 120} ${mid + 20}, ${cx - 280} ${mid - 20}, ${cx - 480} ${mid - 30}`}
          stroke="#06b6d4" strokeWidth="3"
        />
        <path
          d={`M ${cx - 150} ${mid + 20} C ${cx - 220} ${mid - 40}, ${cx - 320} ${mid - 60}, ${cx - 440} ${mid - 70}`}
          stroke="#0891b2" strokeWidth="1.5" strokeDasharray="6 4"
        />

        {/* Right Bough Bus (Mother Line) */}
        <path
          d={`M ${cx + 10} ${mid + 30} C ${cx + 120} ${mid + 20}, ${cx + 280} ${mid - 20}, ${cx + 480} ${mid - 30}`}
          stroke="#ec4899" strokeWidth="3"
        />
        <path
          d={`M ${cx + 150} ${mid + 20} C ${cx + 220} ${mid - 40}, ${cx + 320} ${mid - 60}, ${cx + 440} ${mid - 70}`}
          stroke="#a855f7" strokeWidth="1.5" strokeDasharray="6 4"
        />
      </g>

      {/* ========================================================= */}
      {/* 6. ZENITH CONDUITS (TOP CROWN — ME & BROTHER)             */}
      {/* ========================================================= */}
      <g filter="url(#laserSharpGlow)">
        {/* Left Crown Spline */}
        <path
          d={`M ${cx} ${trunkTop + 30} C ${cx - 40} ${trunkTop}, ${cx - 100} ${trunkTop - 40}, ${cx - 180} ${trunkTop - 80}`}
          stroke="#38bdf8" strokeWidth="3"
        />
        {/* Right Crown Spline */}
        <path
          d={`M ${cx} ${trunkTop + 30} C ${cx + 40} ${trunkTop}, ${cx + 100} ${trunkTop - 40}, ${cx + 180} ${trunkTop - 80}`}
          stroke="#818cf8" strokeWidth="3"
        />
      </g>

      {/* ========================================================= */}
      {/* 7. QUANTUM DATA PACKETS (FLOATING NEON NODES)             */}
      {/* ========================================================= */}
      <g>
        {[
          { cx: cx - 180, cy: trunkTop - 80, color: '#38bdf8' },
          { cx: cx + 180, cy: trunkTop - 80, color: '#818cf8' },
          { cx: cx, cy: trunkTop, color: '#c084fc' },
          { cx: cx - 360, cy: mid - 25, color: '#22d3ee' },
          { cx: cx + 360, cy: mid - 25, color: '#f43f5e' },
          { cx: cx, cy: mid + 30, color: '#6366f1' },
          { cx: cx - 220, cy: bottom - 10, color: '#06b6d4' },
          { cx: cx + 220, cy: bottom - 10, color: '#a855f7' },
        ].map((node, i) => (
          <g key={`quantum-node-${i}`}>
            <circle cx={node.cx} cy={node.cy} r={6} fill={node.color} opacity="0.3" />
            <circle cx={node.cx} cy={node.cy} r={3} fill="#ffffff" />
            <circle cx={node.cx} cy={node.cy} r={10} stroke={node.color} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
          </g>
        ))}
      </g>
    </svg>
  );
};


/* ================================================================
   MAIN TREE VIEW COMPONENT (FUTURISTIC GLASSMORPHISM)
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
  // RENDER FUTURISTIC GLASSMORPHIC HUD CARD
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

    // Glassmorphism Token Sets
    const glassBorder = isMe
      ? 'border-amber-400/80 ring-1 ring-amber-400/30'
      : isMale
        ? 'border-cyan-500/40 hover:border-cyan-400/80'
        : 'border-rose-500/40 hover:border-rose-400/80';

    const glassBg = isMe
      ? 'bg-gradient-to-b from-amber-500/10 via-slate-900/60 to-slate-950/80'
      : isMale
        ? 'bg-gradient-to-b from-cyan-500/[0.07] via-slate-900/60 to-slate-950/80'
        : 'bg-gradient-to-b from-rose-500/[0.07] via-slate-900/60 to-slate-950/80';

    const glassGlow = isMe
      ? 'shadow-[0_8px_32px_rgba(245,158,11,0.25)]'
      : isMale
        ? 'shadow-[0_8px_32px_rgba(6,182,212,0.15)]'
        : 'shadow-[0_8px_32px_rgba(244,63,94,0.15)]';

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
          className={`w-full h-full rounded-2xl p-4 cursor-pointer relative overflow-hidden backdrop-blur-2xl transition-all duration-200 border
            ${glassBg}
            ${glassBorder}
            ${glassGlow}
            ${isSearchMatch
              ? 'ring-4 ring-cyan-400 scale-105 shadow-[0_0_30px_rgba(34,211,238,0.5)]'
              : isHovered
                ? 'scale-[1.03] -translate-y-1 bg-white/[0.08]'
                : ''
            }
            ${!hasName ? 'border-dashed border-cyan-500/40 opacity-80 hover:opacity-100' : ''}
          `}
        >
          {/* Top Hairline Laser Trim */}
          <div className={`absolute top-0 left-0 right-0 h-[1.5px] ${
            isMe 
              ? 'bg-gradient-to-r from-transparent via-amber-400 to-transparent'
              : isMale
                ? 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent'
                : 'bg-gradient-to-r from-transparent via-rose-400 to-transparent'
          }`} />

          {/* Top Row: Futuristic Node Badge & Vital Status */}
          <div className="flex items-center justify-between gap-1 mb-2.5">
            <span className={`text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border backdrop-blur-md ${
              isMe
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : isMale
                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
            }`}>
              {isMe ? <Crown className="w-3 h-3 text-amber-400 inline" /> : <Activity className="w-2.5 h-2.5 opacity-70" />}
              <span className="truncate">{person.roleLabel || (isMale ? 'Чоловік' : 'Жінка')}</span>
            </span>

            {/* Living Status Dot / Generation Badge */}
            <div className="flex items-center gap-2">
              {person.isLiving && (
                <span className="relative flex h-2 w-2" title="Живий">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              )}

              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-slate-300">
                L{person.generation}
              </span>
            </div>
          </div>

          {/* Holographic Avatar & Identity Area */}
          <div className="flex items-start gap-3 mb-2.5">
            <div className={`relative w-12 h-12 rounded-2xl shrink-0 p-[1.5px] shadow-lg backdrop-blur-xl ${
              isMe
                ? 'bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-600 ring-2 ring-amber-400/40'
                : isMale
                  ? 'bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-600 ring-1 ring-cyan-400/40'
                  : 'bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 ring-1 ring-rose-400/40'
            }`}>
              <div className="w-full h-full rounded-[14px] bg-[#030712]/90 flex items-center justify-center font-['Outfit'] text-base font-bold overflow-hidden">
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
              <h3 className={`font-['Outfit'] font-bold text-sm leading-tight transition-colors truncate ${
                hasName 
                  ? 'text-white group-hover:text-cyan-300' 
                  : 'text-cyan-300/80 font-medium'
              }`}>
                {fullName}
              </h3>

              {person.middleName && (
                <p className="text-xs text-slate-400 truncate mt-0.5 font-sans">{person.middleName}</p>
              )}
              {person.maidenName && (
                <p className="text-[11px] text-cyan-400/70 italic truncate">({person.maidenName})</p>
              )}

              {!hasName && (
                <p className="text-[11px] text-cyan-400 flex items-center gap-1 mt-1 font-mono">
                  <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ініціалізувати дані</span>
                </p>
              )}
            </div>
          </div>

          {/* Details Grid (Dates, Geo, Profession) */}
          <div className="border-t border-white/[0.08] pt-2 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Calendar className="w-3 h-3 shrink-0 text-cyan-400/70" />
              {person.birthDate ? (
                <span className="font-mono text-slate-300">
                  {person.birthDate} — {person.isLiving ? 'досі' : (person.deathDate || '?')}
                </span>
              ) : (
                <span className="italic text-slate-500 font-mono">Час не вказано</span>
              )}
            </div>

            {person.birthPlace && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                <MapPin className="w-3 h-3 shrink-0 text-cyan-400/70" />
                <span className="truncate">{person.birthPlace}</span>
              </div>
            )}

            {person.profession && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                <Briefcase className="w-3 h-3 shrink-0 text-cyan-400/70" />
                <span className="truncate">{person.profession}</span>
              </div>
            )}

            {/* Connection Count & Status Pill */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span className="flex items-center gap-1 text-slate-500 font-mono">
                <Users className="w-3 h-3" />
                <span>{connectionCount} з'єднань</span>
              </span>

              <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] ${
                person.isLiving
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/[0.04] text-slate-400 border border-white/10'
              }`}>
                {person.isLiving ? 'ACTIVE' : 'ARCHIVED'}
              </span>
            </div>
          </div>

          {/* Minimalist Action HUD Footer */}
          <div className="absolute bottom-2.5 left-4 right-4 pt-1.5 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
            <button
              onClick={(e) => { e.stopPropagation(); onSelectPerson(person); }}
              className="px-2.5 py-0.5 text-cyan-300 hover:text-white bg-white/[0.04] hover:bg-cyan-500/20 active:bg-cyan-500/30 border border-cyan-500/30 rounded-lg transition-all flex items-center gap-1 font-mono text-[10px]"
            >
              <Edit3 className="w-3 h-3" />
              <span>{hasName ? 'ПРОФІЛЬ' : 'ВНЕСТИ'}</span>
            </button>

            <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px]">
              <button
                onClick={(e) => { e.stopPropagation(); onAddChild(person); }}
                className="px-2 py-0.5 hover:text-cyan-300 hover:bg-white/[0.06] rounded transition"
                title="Додати дочірню ноду"
              >
                +Дитина
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onAddSpouse(person); }}
                className="px-2 py-0.5 hover:text-rose-300 hover:bg-white/[0.06] rounded transition"
                title="Додати зв'язок союзу"
              >
                +Союз
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Minimalist Quantum Banners
  const tierLabels = useMemo(() => {
    const tier0_y = 0;
    const tier1_y = CARD_H + GAP_Y;
    const tier2_y = (CARD_H + GAP_Y) * 2;
    return [
      { y: tier0_y, label: 'ZENITH LAYER • ТЕПЕРІШНЄ ПОКОЛІННЯ (Я ТА БРАТ)', color: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30' },
      { y: tier1_y, label: 'CORE NEXUS • БАТЬКИ, ДЯДЬКИ ТА ТІТКИ', color: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30' },
      { y: tier2_y, label: 'ORIGIN FOUNDATION • ДІДУСІ ТА БАБУСІ', color: 'text-purple-300 bg-purple-500/10 border-purple-500/30' },
    ];
  }, []);

  return (
    <div className="relative w-full h-[calc(100dvh-130px)] sm:h-[calc(100vh-140px)] bg-[#030712] overflow-hidden select-none touch-none">

      {/* Cybernetic Matrix Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '36px 36px',
        }}
      />

      {/* Deep Space Diffuse Glows */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% 90%, rgba(6,182,212,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 50% 20%, rgba(99,102,241,0.12) 0%, transparent 60%),
            radial-gradient(circle at center, rgba(168,85,247,0.08) 0%, transparent 70%)
          `,
        }}
      />

      {/* Minimalist Floating Glass Toolbar */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 bg-white/[0.03] backdrop-blur-2xl p-1.5 sm:p-2 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <button onClick={() => handleZoom(0.12)} className="p-2 text-slate-300 hover:text-cyan-300 hover:bg-white/[0.06] active:bg-white/[0.1] rounded-xl transition" title="Збільшити">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={() => handleZoom(-0.12)} className="p-2 text-slate-300 hover:text-cyan-300 hover:bg-white/[0.06] active:bg-white/[0.1] rounded-xl transition" title="Зменшити">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={handleResetZoom} className="p-2 text-slate-300 hover:text-cyan-300 hover:bg-white/[0.06] active:bg-white/[0.1] rounded-xl transition" title="Центрувати">
          <Maximize2 className="w-4 h-4" />
        </button>
        <span className="text-[11px] text-cyan-300 font-mono px-1 font-medium">{Math.round(scale * 100)}%</span>
        <div className="h-4 w-px bg-white/10 mx-0.5" />
        <button
          onClick={() => setShowLegend(v => !v)}
          className={`p-2 rounded-xl transition cursor-pointer ${
            showLegend 
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]' 
              : 'text-slate-400 hover:text-cyan-300 hover:bg-white/[0.06]'
          }`}
          title="Легенда"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Futuristic Minimalist Legend Card */}
      {showLegend && (
        <div className="absolute top-3 right-3 z-30 bg-[#030712]/80 backdrop-blur-3xl p-3.5 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-[11px] space-y-2 max-w-[210px] animate-in fade-in duration-200">
          <h4 className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5 border-b border-white/10 pb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Квантові лінії зв'язку</span>
          </h4>
          <div className="flex items-center gap-2"><div className="w-5 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" /><span className="text-slate-300 font-mono text-[10px]">⚡ Шлюбний квант</span></div>
          <div className="flex items-center gap-2"><div className="w-5 h-1 bg-sky-400 rounded-full" /><span className="text-slate-300 font-mono text-[10px]">Канал батька</span></div>
          <div className="flex items-center gap-2"><div className="w-5 h-1 bg-rose-400 rounded-full" /><span className="text-slate-300 font-mono text-[10px]">Канал матері</span></div>
          <div className="flex items-center gap-2"><div className="w-5 h-1 bg-indigo-400 rounded-full" /><span className="text-slate-300 font-mono text-[10px]">Батьки → Діти</span></div>
          <div className="mt-2 pt-2 border-t border-white/10 space-y-1.5">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full border border-cyan-400 bg-cyan-950" /><span className="text-slate-400 font-mono text-[10px]">Чоловіча нода</span></div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full border border-rose-400 bg-rose-950" /><span className="text-slate-400 font-mono text-[10px]">Жіноча нода</span></div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full border border-amber-400 bg-amber-950" /><span className="text-slate-400 font-mono text-[10px]">👑 Prime-нода (Я)</span></div>
          </div>
          <div className="mt-2 pt-2 border-t border-white/10 text-slate-500 font-mono text-[9px]">
            Scroll / Pinch для зуму • Drag для переміщення
          </div>
        </div>
      )}

      {/* Minimalist Bottom Indicator */}
      <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-30 pointer-events-none text-[11px] text-slate-300 bg-white/[0.03] px-3.5 py-2 rounded-2xl border border-white/10 backdrop-blur-2xl flex items-center gap-2.5 shadow-xl font-mono">
        <span className="text-cyan-300 font-bold">Zenith (Я)</span>
        <span className="text-slate-600">▲</span>
        <span className="text-indigo-300 font-bold">Nexus (Батьки)</span>
        <span className="text-slate-600">▲</span>
        <span className="text-purple-300 font-bold">Origin (Дідусі)</span>
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
          {/* Layer 1: Futuristic Quantum Neural Tree Artwork */}
          <QuantumTreeSVG canvasW={canvasW} canvasH={canvasH} />

          {/* Layer 2: Glowing Laser Connectors */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ width: canvasW, height: canvasH, zIndex: 10 }}
            viewBox={`0 0 ${canvasW} ${canvasH}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id="neonFilamentGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

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
                <g key={c.key}>
                  {/* Outer Laser Glow */}
                  <path 
                    d={offsetD} 
                    stroke={c.color} 
                    strokeWidth={c.width + 4} 
                    strokeLinecap="round" 
                    opacity={0.25}
                    filter="url(#neonFilamentGlow)"
                    strokeDasharray={c.dashed ? '8 6' : undefined} 
                  />
                  {/* Sharp Laser Core */}
                  <path 
                    d={offsetD} 
                    stroke={c.color} 
                    strokeWidth={c.width} 
                    strokeLinecap="round" 
                    strokeDasharray={c.dashed ? '8 6' : undefined}
                    opacity={0.95} 
                  />
                </g>
              );
            })}

            {/* Quantum Entanglement Badges for Marriages */}
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
                  <circle cx={mx} cy={my} r={14} fill="#030712" stroke="#38bdf8" strokeWidth="1.5" />
                  <circle cx={mx} cy={my} r={10} fill="#0284c7" opacity="0.25" />
                  <circle cx={mx} cy={my} r={3} fill="#38bdf8" />
                </g>
              );
            })}
          </svg>

          {/* Layer 3: Minimalist Tier Stage Headers */}
          {tierLabels.map(({ y, label, color }) => (
            <div
              key={label}
              className={`absolute z-10 text-[10px] font-mono font-semibold tracking-wider px-3.5 py-1 rounded-full border backdrop-blur-xl shadow-lg ${color}`}
              style={{ left: 16, top: y - bounds.minY - 34 }}
            >
              {label}
            </div>
          ))}

          {/* Layer 4: Minimalist Glassmorphic Person Cards */}
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
