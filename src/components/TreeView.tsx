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
   Roots = Tier 2 (Grandparents)
   Trunk & Main Boughs = Tier 1 (Parents, Uncles, Aunts)
   Crown = Tier 0 (Me & Brother)
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

const CARD_W = 270;
const CARD_H = 210;
const GAP_X = 42;
const GAP_Y = 135;
const COUPLE_GAP = 28;

function buildLayout(persons: Person[]) {
  const positions: NodePos[] = [];
  const connectors: Connector[] = [];

  const pairW = CARD_W * 2 + COUPLE_GAP;
  const tierGap = 120;
  const totalW = pairW * 2 + tierGap;
  const startX = -totalW / 2;

  // ---- Tier 2 (BOTTOM): Grandparents = ROOTS ----
  const tier2_y = (CARD_H + GAP_Y) * 2;

  const pgf_x = startX;
  const pgm_x = startX + CARD_W + COUPLE_GAP;
  positions.push({ id: 'p-paternal-grandfather', x: pgf_x, y: tier2_y });
  positions.push({ id: 'p-paternal-grandmother', x: pgm_x, y: tier2_y });

  const mgf_x = startX + pairW + tierGap;
  const mgm_x = mgf_x + CARD_W + COUPLE_GAP;
  positions.push({ id: 'p-maternal-grandfather', x: mgf_x, y: tier2_y });
  positions.push({ id: 'p-maternal-grandmother', x: mgm_x, y: tier2_y });

  // ---- Tier 1 (MIDDLE): Parents + uncles/aunts = TRUNK ----
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

  // ---- Tier 0 (TOP): Me & Brother = CROWN ----
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
  // CONNECTORS (Rising upwards with organic curves)
  // ================================================================
  const posMap = new Map<string, NodePos>();
  positions.forEach(np => posMap.set(np.id, np));

  const topOf = (np: NodePos) => ({ x: np.x + CARD_W / 2, y: np.y });
  const botOf = (np: NodePos) => ({ x: np.x + CARD_W / 2, y: np.y + CARD_H });

  // Marriage connections
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
      width: 3.5,
      label: '💍',
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
        color: '#38bdf8',
        width: 3,
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
        width: 3,
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
        color: '#fbbf24',
        width: 3.5,
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
          color: '#38bdf8',
          width: 2.5,
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
          width: 2.5,
          dashed: true,
        });
      }
    }
  });

  return { positions, connectors };
}


/* ================================================================
   ANCIENT OAK TREE ARTWORK (SVG) — ВІКОВИЙ ДУБ
   Iconic features of an ancient oak:
   1. Extremely wide, powerful flaring trunk with furrowed oak bark fissures
   2. Gnarled, muscular, twisting elbow boughs
   3. Lobed oak foliage clusters (лопатеві листки дуба)
   4. Clusters of hanging golden-bronze acorns (жолуді з шапочками)
   5. Deep buttress roots gripping the earth with ancient moss
   ================================================================ */

const AncientOakTreeSVG: React.FC<{ canvasW: number; canvasH: number }> = ({ canvasW, canvasH }) => {
  const cx = canvasW / 2;
  const bottom = canvasH + 60;
  const trunkBottom = bottom - 50;
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
        {/* Ancient Oak Weathered Bark Gradient */}
        <linearGradient id="oakBarkGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#1a0c06" />
          <stop offset="25%" stopColor="#2e140a" />
          <stop offset="50%" stopColor="#451e0e" />
          <stop offset="75%" stopColor="#632e15" />
          <stop offset="90%" stopColor="#7c3a1d" />
          <stop offset="100%" stopColor="#9a4b22" />
        </linearGradient>

        {/* Oak Heartwood Sap Gradient */}
        <linearGradient id="oakHeartwood" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#3d1b0d" />
          <stop offset="50%" stopColor="#854d0e" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Oak Leaf Silhouette Template (Lobed leaf) */}
        <g id="oakLeafLobe">
          <path
            d="M 0 0 C -4 -5, -10 -4, -8 -10 C -6 -15, -14 -16, -11 -23 C -8 -29, -13 -32, -9 -39 C -6 -44, -10 -48, 0 -54 C 10 -48, 6 -44, 9 -39 C 13 -32, 8 -29, 11 -23 C 14 -16, 6 -15, 8 -10 C 10 -4, 4 -5, 0 0 Z"
            fill="#047857"
            stroke="#065f46"
            strokeWidth="0.8"
          />
          {/* Central vein */}
          <line x1="0" y1="0" x2="0" y2="-50" stroke="#10b981" strokeWidth="1" opacity="0.6" />
        </g>

        {/* Acorn Motif (Жолудь) */}
        <g id="acornDuo">
          {/* Little twigs */}
          <path d="M 0 0 Q -3 6 -6 12 M 0 0 Q 3 6 7 11" stroke="#5c2b0e" strokeWidth="1.5" strokeLinecap="round" />
          
          {/* Left Acorn */}
          <g transform="translate(-7, 12)">
            {/* Cupule / Cap (Шапочка жолудя з насічками) */}
            <path d="M -5 0 Q 0 -3 5 0 L 4 3 Q 0 4 -4 3 Z" fill="#451a03" stroke="#78350f" strokeWidth="0.8" />
            {/* Acorn body */}
            <path d="M -4 2 Q -4.5 9 0 12 Q 4.5 9 4 2 Z" fill="#b45309" stroke="#d97706" strokeWidth="0.6" />
            {/* Specular shine */}
            <path d="M -1.5 4 Q -2 7 -0.5 9" stroke="#fef3c7" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
          </g>

          {/* Right Acorn */}
          <g transform="translate(7, 11)">
            <path d="M -5 0 Q 0 -3 5 0 L 4 3 Q 0 4 -4 3 Z" fill="#451a03" stroke="#78350f" strokeWidth="0.8" />
            <path d="M -4 2 Q -4.5 9 0 12 Q 4.5 9 4 2 Z" fill="#b45309" stroke="#d97706" strokeWidth="0.6" />
            <path d="M -1.5 4 Q -2 7 -0.5 9" stroke="#fef3c7" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
          </g>
        </g>

        {/* Oak Canopy Cloud Gradient */}
        <radialGradient id="oakCanopyDeep" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#065f46" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#064e3b" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#022c22" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="oakCanopySunlit" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#059669" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#064e3b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="oakCanopyGold" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
          <stop offset="65%" stopColor="#b45309" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
        </radialGradient>

        {/* Oak Bark Texture Filter */}
        <filter id="oakBarkFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ========================================================= */}
      {/* 1. MIST & SUNBEAMS FILTERING THROUGH OAK DOME             */}
      {/* ========================================================= */}
      <g opacity="0.45">
        <polygon points={`${cx},20 ${cx - 520},${canvasH * 0.8} ${cx - 250},${canvasH * 0.8}`} fill="#fbbf24" opacity="0.08" />
        <polygon points={`${cx},20 ${cx + 250},${canvasH * 0.8} ${cx + 520},${canvasH * 0.8}`} fill="#fbbf24" opacity="0.08" />
        <polygon points={`${cx},20 ${cx - 180},${canvasH * 0.55} ${cx + 180},${canvasH * 0.55}`} fill="#10b981" opacity="0.06" />
      </g>

      {/* ========================================================= */}
      {/* 2. EARTHEN GROUND & MOSS STRATA                           */}
      {/* ========================================================= */}
      <g>
        <ellipse cx={cx} cy={bottom + 10} rx={cx * 0.85} ry={70} fill="#140a04" />
        <ellipse cx={cx} cy={bottom - 10} rx={cx * 0.7} ry={45} fill="#1f0f07" />
        <ellipse cx={cx} cy={bottom - 30} rx={cx * 0.52} ry={25} fill="#2e160a" />
        {/* Ancient Oak Moss Base */}
        <ellipse cx={cx} cy={bottom - 35} rx={380} ry={20} fill="#064e3b" opacity="0.55" />
        <ellipse cx={cx - 120} cy={bottom - 32} rx={160} ry={14} fill="#047857" opacity="0.4" />
        <ellipse cx={cx + 120} cy={bottom - 32} rx={160} ry={14} fill="#047857" opacity="0.4" />
      </g>

      {/* ========================================================= */}
      {/* 3. MASSIVE OAK BUTTRESS ROOTS (МОГУТНІ ДУБОВІ КОРЕНІ)     */}
      {/* Oak roots are famously thick, serpentine and ancient       */}
      {/* ========================================================= */}
      <g strokeLinecap="round" opacity="0.95">
        {/* Extreme Left Anchor Root */}
        <path d={`M ${cx - 55} ${trunkBottom} C ${cx - 160} ${trunkBottom + 30}, ${cx - 360} ${bottom - 15}, ${cx - 520} ${bottom + 25}`} stroke="#1f0f07" strokeWidth="32" />
        <path d={`M ${cx - 45} ${trunkBottom} C ${cx - 140} ${trunkBottom + 35}, ${cx - 340} ${bottom - 10}, ${cx - 490} ${bottom + 20}`} stroke="url(#oakBarkGrad)" strokeWidth="24" />
        <path d={`M ${cx - 160} ${trunkBottom + 30} C ${cx - 260} ${trunkBottom + 70}, ${cx - 360} ${bottom + 15}, ${cx - 440} ${bottom + 35}`} stroke="#3d1b0d" strokeWidth="14" />

        {/* Extreme Right Anchor Root */}
        <path d={`M ${cx + 55} ${trunkBottom} C ${cx + 160} ${trunkBottom + 30}, ${cx + 360} ${bottom - 15}, ${cx + 520} ${bottom + 25}`} stroke="#1f0f07" strokeWidth="32" />
        <path d={`M ${cx + 45} ${trunkBottom} C ${cx + 140} ${trunkBottom + 35}, ${cx + 340} ${bottom - 10}, ${cx + 490} ${bottom + 20}`} stroke="url(#oakBarkGrad)" strokeWidth="24" />
        <path d={`M ${cx + 160} ${trunkBottom + 30} C ${cx + 260} ${trunkBottom + 70}, ${cx + 360} ${bottom + 15}, ${cx + 440} ${bottom + 35}`} stroke="#3d1b0d" strokeWidth="14" />

        {/* Intermediate Knees & Roots */}
        <path d={`M ${cx - 25} ${trunkBottom} C ${cx - 80} ${trunkBottom + 45}, ${cx - 180} ${bottom + 5}, ${cx - 260} ${bottom + 35}`} stroke="#4a2311" strokeWidth="18" />
        <path d={`M ${cx + 25} ${trunkBottom} C ${cx + 80} ${trunkBottom + 45}, ${cx + 180} ${bottom + 5}, ${cx + 260} ${bottom + 35}`} stroke="#4a2311" strokeWidth="18" />

        {/* Central Taproots into bedrock */}
        <path d={`M ${cx - 10} ${trunkBottom} C ${cx - 30} ${trunkBottom + 50}, ${cx - 60} ${bottom + 15}, ${cx - 90} ${bottom + 45}`} stroke="#2e140a" strokeWidth="16" />
        <path d={`M ${cx + 10} ${trunkBottom} C ${cx + 30} ${trunkBottom + 50}, ${cx + 60} ${bottom + 15}, ${cx + 90} ${bottom + 45}`} stroke="#2e140a" strokeWidth="16" />
      </g>

      {/* ========================================================= */}
      {/* 4. MONUMENTAL OAK TRUNK (ВЕЛИЧНИЙ СТОВБУР СТАРОГО ДУБА)    */}
      {/* Oak trunk is extremely wide at base, tapering slowly with  */}
      {/* muscular sinews, hollows and deep vertical bark grooves.   */}
      {/* ========================================================= */}
      <g filter="url(#oakBarkFilter)">
        {/* Massive Outer Bark Shell */}
        <path
          d={`M ${cx - 70} ${trunkBottom} C ${cx - 75} ${mid + 140}, ${cx - 52} ${mid}, ${cx - 38} ${trunkTop}`}
          stroke="url(#oakBarkGrad)" strokeWidth="68" strokeLinecap="round"
        />
        <path
          d={`M ${cx + 70} ${trunkBottom} C ${cx + 75} ${mid + 140}, ${cx + 52} ${mid}, ${cx + 38} ${trunkTop}`}
          stroke="url(#oakBarkGrad)" strokeWidth="68" strokeLinecap="round"
        />

        {/* Solid Trunk Body */}
        <path
          d={`M ${cx} ${trunkBottom} C ${cx} ${mid + 110}, ${cx} ${mid - 20}, ${cx} ${trunkTop}`}
          stroke="url(#oakHeartwood)" strokeWidth="48" strokeLinecap="round"
        />

        {/* Furrowed Bark Grooves & Fissures (Характерні тріщини кори дуба) */}
        {[
          `M ${cx - 35} ${trunkBottom - 10} C ${cx - 40} ${mid + 100}, ${cx - 28} ${mid + 30}, ${cx - 20} ${trunkTop + 30}`,
          `M ${cx - 15} ${trunkBottom - 20} C ${cx - 18} ${mid + 90}, ${cx - 12} ${mid + 10}, ${cx - 8} ${trunkTop + 20}`,
          `M ${cx + 15} ${trunkBottom - 20} C ${cx + 18} ${mid + 90}, ${cx + 12} ${mid + 10}, ${cx + 8} ${trunkTop + 20}`,
          `M ${cx + 35} ${trunkBottom - 10} C ${cx + 40} ${mid + 100}, ${cx + 28} ${mid + 30}, ${cx + 20} ${trunkTop + 30}`,
          `M ${cx} ${trunkBottom - 30} C ${cx} ${mid + 60}, ${cx + 5} ${mid - 20}, ${cx} ${trunkTop + 40}`,
        ].map((fissure, idx) => (
          <path key={`fissure-${idx}`} d={fissure} stroke="#170903" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
        ))}

        {/* Oak Knots / Burls (Дубові нарости та дупла) */}
        <ellipse cx={cx - 18} cy={mid + 70} rx={10} ry={16} fill="#140702" stroke="#451e0e" strokeWidth="2.5" />
        <ellipse cx={cx + 22} cy={mid + 120} rx={8} ry={13} fill="#140702" stroke="#451e0e" strokeWidth="2" />
        <circle cx={cx - 18} cy={mid + 70} r={4} fill="#0d0401" />

        {/* Moss climbing up the north bark */}
        <path d={`M ${cx - 48} ${trunkBottom - 40} Q ${cx - 40} ${mid + 80} ${cx - 35} ${mid + 20}`} stroke="#15803d" strokeWidth="12" strokeLinecap="round" opacity="0.4" />
        <path d={`M ${cx - 42} ${trunkBottom - 60} Q ${cx - 36} ${mid + 70} ${cx - 30} ${mid + 30}`} stroke="#16a34a" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
      </g>

      {/* ========================================================= */}
      {/* 5. GNARLED OAK BOUGHS (КОРЯВІ М'ЯЗИСТІ ДУБОВІ ГІЛЛЯКИ)     */}
      {/* Oak branches make strong angular bends (elbows) rather    */}
      {/* than soft curves.                                         */}
      {/* ========================================================= */}
      <g strokeLinecap="round" opacity="0.95">
        {/* Left Father-line Heavy Oak Bough (with elbow joint) */}
        <path
          d={`M ${cx - 32} ${mid + 60} L ${cx - 140} ${mid + 35} L ${cx - 290} ${mid - 15} L ${cx - 480} ${mid - 35}`}
          stroke="url(#oakBarkGrad)" strokeWidth="32" strokeLinejoin="round"
        />
        {/* Left Secondary Fork */}
        <path
          d={`M ${cx - 140} ${mid + 35} L ${cx - 240} ${mid - 45} L ${cx - 360} ${mid - 65}`}
          stroke="#5c2b0e" strokeWidth="20" strokeLinejoin="round"
        />
        <path
          d={`M ${cx - 290} ${mid - 15} L ${cx - 370} ${mid + 25} L ${cx - 460} ${mid + 15}`}
          stroke="#78350f" strokeWidth="14" strokeLinejoin="round"
        />
        <path
          d={`M ${cx - 360} ${mid - 65} L ${cx - 440} ${mid - 100} L ${cx - 500} ${mid - 90}`}
          stroke="#92400e" strokeWidth="10" strokeLinejoin="round"
        />

        {/* Right Mother-line Heavy Oak Bough (with elbow joint) */}
        <path
          d={`M ${cx + 32} ${mid + 60} L ${cx + 140} ${mid + 35} L ${cx + 290} ${mid - 15} L ${cx + 480} ${mid - 35}`}
          stroke="url(#oakBarkGrad)" strokeWidth="32" strokeLinejoin="round"
        />
        {/* Right Secondary Fork */}
        <path
          d={`M ${cx + 140} ${mid + 35} L ${cx + 240} ${mid - 45} L ${cx + 360} ${mid - 65}`}
          stroke="#5c2b0e" strokeWidth="20" strokeLinejoin="round"
        />
        <path
          d={`M ${cx + 290} ${mid - 15} L ${cx + 370} ${mid + 25} L ${cx + 460} ${mid + 15}`}
          stroke="#78350f" strokeWidth="14" strokeLinejoin="round"
        />
        <path
          d={`M ${cx + 360} ${mid - 65} L ${cx + 440} ${mid - 100} L ${cx + 500} ${mid - 90}`}
          stroke="#92400e" strokeWidth="10" strokeLinejoin="round"
        />

        {/* Massive Top Oak Fork (Leading to Crown) */}
        <path
          d={`M ${cx} ${trunkTop + 45} L ${cx - 70} ${trunkTop} L ${cx - 160} ${trunkTop - 45} L ${cx - 240} ${trunkTop - 85}`}
          stroke="url(#oakBarkGrad)" strokeWidth="26" strokeLinejoin="round"
        />
        <path
          d={`M ${cx} ${trunkTop + 45} L ${cx + 70} ${trunkTop} L ${cx + 160} ${trunkTop - 45} L ${cx + 240} ${trunkTop - 85}`}
          stroke="url(#oakBarkGrad)" strokeWidth="26" strokeLinejoin="round"
        />
        {/* Central Crown Spire */}
        <path
          d={`M ${cx} ${trunkTop + 20} L ${cx - 15} ${trunkTop - 50} L ${cx} ${trunkTop - 110} L ${cx} ${trunkTop - 150}`}
          stroke="#78350f" strokeWidth="18" strokeLinejoin="round"
        />
      </g>

      {/* ========================================================= */}
      {/* 6. SPRAWLING DOME CANOPY OF OAK FOLIAGE (ДУБОВІ ШАТРА)   */}
      {/* Distinctive lobed cloud masses + individual oak leaf     */}
      {/* silhouettes.                                              */}
      {/* ========================================================= */}
      <g>
        {/* Massive Background Canopy Silhouette (Dense Deep Green) */}
        <circle cx={cx} cy={trunkTop - 140} r={75} fill="url(#oakCanopyDeep)" />
        <circle cx={cx - 190} cy={trunkTop - 95} r={65} fill="url(#oakCanopyDeep)" />
        <circle cx={cx + 190} cy={trunkTop - 95} r={65} fill="url(#oakCanopyDeep)" />
        <circle cx={cx - 110} cy={trunkTop - 65} r={55} fill="url(#oakCanopyDeep)" />
        <circle cx={cx + 110} cy={trunkTop - 65} r={55} fill="url(#oakCanopyDeep)" />

        {/* Side Bough Canopy Masses */}
        <circle cx={cx - 460} cy={mid - 65} r={50} fill="url(#oakCanopyDeep)" />
        <circle cx={cx + 460} cy={mid - 65} r={50} fill="url(#oakCanopyDeep)" />
        <circle cx={cx - 330} cy={mid - 45} r={46} fill="url(#oakCanopyDeep)" />
        <circle cx={cx + 330} cy={mid - 45} r={46} fill="url(#oakCanopyDeep)" />
        <circle cx={cx - 240} cy={mid - 25} r={40} fill="url(#oakCanopyDeep)" />
        <circle cx={cx + 240} cy={mid - 25} r={40} fill="url(#oakCanopyDeep)" />

        {/* Sunlit Foreground Oak Leaves Foliage Masses */}
        <circle cx={cx} cy={trunkTop - 155} r={55} fill="url(#oakCanopySunlit)" />
        <circle cx={cx - 170} cy={trunkTop - 110} r={48} fill="url(#oakCanopySunlit)" />
        <circle cx={cx + 170} cy={trunkTop - 110} r={48} fill="url(#oakCanopySunlit)" />
        <circle cx={cx - 80} cy={trunkTop - 140} r={42} fill="url(#oakCanopyGold)" />
        <circle cx={cx + 80} cy={trunkTop - 140} r={42} fill="url(#oakCanopyGold)" />
        <circle cx={cx - 440} cy={mid - 80} r={38} fill="url(#oakCanopySunlit)" />
        <circle cx={cx + 440} cy={mid - 80} r={38} fill="url(#oakCanopySunlit)" />
        <circle cx={cx - 310} cy={mid - 60} r={35} fill="url(#oakCanopySunlit)" />
        <circle cx={cx + 310} cy={mid - 60} r={35} fill="url(#oakCanopySunlit)" />

        {/* Distinctive Lobed Oak Leaves Silhouette Badges */}
        {[
          { x: cx - 210, y: trunkTop - 110, rot: -35, scale: 0.65 },
          { x: cx - 180, y: trunkTop - 140, rot: -15, scale: 0.7 },
          { x: cx + 180, y: trunkTop - 140, rot: 15, scale: 0.7 },
          { x: cx + 210, y: trunkTop - 110, rot: 35, scale: 0.65 },
          { x: cx, y: trunkTop - 175, rot: 0, scale: 0.75 },
          { x: cx - 40, y: trunkTop - 165, rot: -20, scale: 0.6 },
          { x: cx + 40, y: trunkTop - 165, rot: 20, scale: 0.6 },
          { x: cx - 460, y: mid - 85, rot: -45, scale: 0.6 },
          { x: cx + 460, y: mid - 85, rot: 45, scale: 0.6 },
          { x: cx - 330, y: mid - 70, rot: -25, scale: 0.55 },
          { x: cx + 330, y: mid - 70, rot: 25, scale: 0.55 },
        ].map((leaf, i) => (
          <use
            key={`oak-leaf-${i}`}
            href="#oakLeafLobe"
            x={leaf.x}
            y={leaf.y}
            transform={`rotate(${leaf.rot}, ${leaf.x}, ${leaf.y}) scale(${leaf.scale})`}
          />
        ))}
      </g>

      {/* ========================================================= */}
      {/* 7. HANGING ACORNS (ЖОЛУДІ — СИМВОЛ ДУБА ТА НАЩАДКІВ)       */}
      {/* Pairs of acorns hanging proudly beneath oak boughs         */}
      {/* ========================================================= */}
      <g>
        {[
          { x: cx - 140, y: trunkTop - 70 },
          { x: cx + 140, y: trunkTop - 70 },
          { x: cx - 50, y: trunkTop - 110 },
          { x: cx + 50, y: trunkTop - 110 },
          { x: cx, y: trunkTop - 130 },
          { x: cx - 380, y: mid - 45 },
          { x: cx + 380, y: mid - 45 },
          { x: cx - 260, y: mid - 30 },
          { x: cx + 260, y: mid - 30 },
          { x: cx - 470, y: mid - 55 },
          { x: cx + 470, y: mid - 55 },
        ].map((pos, idx) => (
          <use key={`acorn-${idx}`} href="#acornDuo" x={pos.x} y={pos.y} />
        ))}
      </g>

      {/* ========================================================= */}
      {/* 8. GOLDEN OAK POLLEN & LINEAGE SPARKS                     */}
      {/* ========================================================= */}
      <g>
        {[
          { cx: cx - 60, cy: trunkTop - 100, r: 3 },
          { cx: cx + 70, cy: trunkTop - 115, r: 2.5 },
          { cx: cx - 220, cy: mid - 75, r: 3 },
          { cx: cx + 230, cy: mid - 80, r: 3.5 },
          { cx: cx - 130, cy: mid + 20, r: 2 },
          { cx: cx + 140, cy: mid + 15, r: 2.5 },
          { cx: cx - 25, cy: mid + 100, r: 2.5 },
          { cx: cx + 30, cy: mid + 80, r: 3 },
          { cx: cx - 360, cy: mid - 25, r: 2 },
          { cx: cx + 370, cy: mid - 30, r: 2 },
        ].map((spark, i) => (
          <g key={`spark-${i}`}>
            <circle cx={spark.cx} cy={spark.cy} r={spark.r * 2.5} fill="#fbbf24" opacity="0.35" />
            <circle cx={spark.cx} cy={spark.cy} r={spark.r} fill="#fffbeb" opacity="0.95" />
          </g>
        ))}
      </g>
    </svg>
  );
};


/* ================================================================
   MAIN TREE VIEW COMPONENT
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

  // Compute canvas bounds with breathing room
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
  // RENDER LUXURY CAMEO CARD
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

    // Luxury Theme Tokens
    const frameBorder = isMe
      ? 'border-amber-400/90 ring-1 ring-amber-300/40'
      : isMale
        ? 'border-sky-500/50 hover:border-sky-400/80'
        : 'border-rose-500/50 hover:border-rose-400/80';

    const frameBg = isMe
      ? 'bg-gradient-to-b from-amber-950/70 via-slate-950/90 to-slate-950/95'
      : isMale
        ? 'bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-950/95'
        : 'bg-gradient-to-b from-rose-950/40 via-slate-950/90 to-slate-950/95';

    const frameGlow = isMe
      ? 'shadow-[0_12px_36px_rgba(245,158,11,0.25)]'
      : isMale
        ? 'shadow-[0_10px_30px_rgba(14,165,233,0.15)]'
        : 'shadow-[0_10px_30px_rgba(244,63,94,0.15)]';

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
          className={`w-full h-full rounded-2xl p-4 cursor-pointer relative overflow-hidden border backdrop-blur-2xl transition-all duration-200
            ${frameBg}
            ${frameBorder}
            ${frameGlow}
            ${isSearchMatch
              ? 'ring-4 ring-amber-400 scale-105 shadow-amber-500/40'
              : isHovered
                ? 'scale-[1.03] -translate-y-1'
                : ''
            }
            ${!hasName ? 'border-dashed border-amber-500/40 opacity-90 hover:opacity-100' : ''}
          `}
        >
          {/* Top Gold Filigree Header Trim */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />

          {/* Corner Heraldic Accents */}
          <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-amber-400/40" />
          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400/40" />

          {/* Top Ribbon: Role Tag + Status */}
          <div className="flex items-center justify-between gap-1 mb-2.5">
            <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border shadow-sm ${
              isMe
                ? 'bg-gradient-to-r from-amber-500/30 to-amber-600/30 text-amber-200 border-amber-400/50'
                : isMale
                  ? 'bg-sky-500/15 text-sky-200 border-sky-400/30'
                  : 'bg-rose-500/15 text-rose-200 border-rose-400/30'
            }`}>
              {isMe ? <Crown className="w-3 h-3 text-amber-400 inline" /> : <Sparkles className="w-2.5 h-2.5 opacity-70" />}
              <span className="truncate">{person.roleLabel || (isMale ? 'Чоловік' : 'Жінка')}</span>
            </span>

            <div className="flex items-center gap-1">
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md border ${
                person.generation === 1
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : person.generation === 2
                    ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}>
                П{person.generation}
              </span>
            </div>
          </div>

          {/* Portrait Cameo + Name Area */}
          <div className="flex items-start gap-3 mb-2.5">
            {/* Medallion Avatar */}
            <div className={`relative w-12 h-12 rounded-full shrink-0 p-[2px] shadow-lg ${
              isMe
                ? 'bg-gradient-to-tr from-amber-600 via-amber-300 to-amber-500 ring-2 ring-amber-400/50'
                : isMale
                  ? 'bg-gradient-to-tr from-sky-600 via-sky-300 to-slate-800 ring-1 ring-sky-400/30'
                  : 'bg-gradient-to-tr from-rose-600 via-rose-300 to-slate-800 ring-1 ring-rose-400/30'
            }`}>
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-serif text-base font-bold overflow-hidden">
                {person.avatarUrl ? (
                  <img src={person.avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className={isMe ? 'text-amber-300 font-serif' : isMale ? 'text-sky-300' : 'text-rose-300'}>
                    {initialLetter}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className={`font-serif font-bold text-sm leading-tight transition-colors truncate ${
                hasName 
                  ? 'text-slate-100 group-hover:text-amber-300' 
                  : 'text-amber-300/90 font-medium'
              }`}>
                {fullName}
              </h3>

              {person.middleName && (
                <p className="text-xs text-slate-400 truncate mt-0.5 font-sans">{person.middleName}</p>
              )}
              {person.maidenName && (
                <p className="text-[11px] text-amber-400/90 italic truncate">({person.maidenName})</p>
              )}

              {!hasName && (
                <p className="text-[11px] text-amber-400 flex items-center gap-1 mt-1 font-semibold">
                  <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Внести дані родича</span>
                </p>
              )}
            </div>
          </div>

          {/* Details Row (Dates, Place, Career) */}
          <div className="border-t border-slate-800/80 pt-2 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Calendar className="w-3 h-3 shrink-0 text-amber-400/70" />
              {person.birthDate ? (
                <span className="font-mono text-slate-300">
                  {person.birthDate} — {person.isLiving ? 'досі' : (person.deathDate || '?')}
                </span>
              ) : (
                <span className="italic text-slate-500">Роки не вказано</span>
              )}
            </div>

            {person.birthPlace && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                <MapPin className="w-3 h-3 shrink-0 text-amber-400/70" />
                <span className="truncate">{person.birthPlace}</span>
              </div>
            )}

            {person.profession && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                <Briefcase className="w-3 h-3 shrink-0 text-amber-400/70" />
                <span className="truncate">{person.profession}</span>
              </div>
            )}

            {/* Living status pill + Connections count */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span className="flex items-center gap-1 text-slate-500 font-mono">
                <Users className="w-3 h-3" />
                <span>{connectionCount} зв'язків</span>
              </span>

              <span className={`px-2 py-0.5 rounded-full font-medium ${
                person.isLiving
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800/90 text-slate-400 border border-slate-700'
              }`}>
                {person.isLiving ? 'Живий(а)' : 'Світла пам’ять'}
              </span>
            </div>
          </div>

          {/* Action Footer Bar */}
          <div className="absolute bottom-2.5 left-4 right-4 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
            <button
              onClick={(e) => { e.stopPropagation(); onSelectPerson(person); }}
              className="px-2.5 py-0.5 text-amber-300 hover:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 active:bg-amber-500/30 border border-amber-500/40 rounded-lg transition-all flex items-center gap-1 font-semibold"
            >
              <Edit3 className="w-3 h-3" />
              <span>{hasName ? 'Профіль' : 'Заповнити'}</span>
            </button>

            <div className="flex items-center gap-1.5 text-slate-400">
              <button
                onClick={(e) => { e.stopPropagation(); onAddChild(person); }}
                className="px-2 py-0.5 hover:text-amber-300 hover:bg-slate-800/80 rounded transition"
                title="Додати дитину"
              >
                +Дитина
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onAddSpouse(person); }}
                className="px-2 py-0.5 hover:text-rose-300 hover:bg-slate-800/80 rounded transition"
                title="Додати подружжя"
              >
                +Шлюб
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Generation Stage Banners
  const tierLabels = useMemo(() => {
    const tier0_y = 0;
    const tier1_y = CARD_H + GAP_Y;
    const tier2_y = (CARD_H + GAP_Y) * 2;
    return [
      { y: tier0_y, label: '🍃 КРОНА ДУБА • МОЛОДЕ ПОКОЛІННЯ (Я ТА БРАТ)', color: 'text-amber-300 bg-amber-500/10 border-amber-500/30' },
      { y: tier1_y, label: '🌿 МОГУТНІ ДУБОВІ ГІЛЛЯКИ • БАТЬКИ, ДЯДЬКИ ТА ТІТКИ', color: 'text-sky-300 bg-sky-500/10 border-sky-500/30' },
      { y: tier2_y, label: '🌱 КОРІННЯ СТАРОГО ДУБА • ДІДУСІ ТА БАБУСІ', color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' },
    ];
  }, []);

  return (
    <div className="relative w-full h-[calc(100dvh-130px)] sm:h-[calc(100vh-140px)] bg-slate-950 overflow-hidden select-none touch-none">

      {/* Atmospheric Forest Depth Background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 90% 70% at 50% 90%, rgba(120,53,15,0.22) 0%, transparent 60%),
            radial-gradient(ellipse 70% 50% at 50% 10%, rgba(6,78,59,0.18) 0%, transparent 50%),
            radial-gradient(circle at center, rgba(15,23,42,0.6) 0%, transparent 80%)
          `,
        }}
      />

      {/* Floating Toolbar */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-2xl p-1.5 sm:p-2 rounded-2xl border border-amber-500/30 shadow-2xl shadow-black/80">
        <button onClick={() => handleZoom(0.12)} className="p-2 text-slate-300 hover:text-amber-300 bg-slate-900/80 active:bg-slate-800 rounded-xl transition" title="Збільшити">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={() => handleZoom(-0.12)} className="p-2 text-slate-300 hover:text-amber-300 bg-slate-900/80 active:bg-slate-800 rounded-xl transition" title="Зменшити">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={handleResetZoom} className="p-2 text-slate-300 hover:text-amber-300 bg-slate-900/80 active:bg-slate-800 rounded-xl transition" title="Скинути зум">
          <Maximize2 className="w-4 h-4" />
        </button>
        <span className="text-[11px] text-amber-300 font-mono px-1 font-bold">{Math.round(scale * 100)}%</span>
        <div className="h-4 w-px bg-slate-800 mx-0.5" />
        <button
          onClick={() => setShowLegend(v => !v)}
          className={`p-2 rounded-xl transition cursor-pointer ${
            showLegend 
              ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20' 
              : 'text-slate-400 hover:text-amber-300 bg-slate-900/80'
          }`}
          title="Легенда"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Legend Card */}
      {showLegend && (
        <div className="absolute top-3 right-3 z-30 bg-slate-950/95 backdrop-blur-2xl p-3.5 rounded-2xl border border-amber-500/30 shadow-2xl shadow-black/80 text-[11px] space-y-2 max-w-[210px] animate-in fade-in duration-200">
          <h4 className="text-xs font-serif font-bold text-amber-200 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Віковий Дуб Роду</span>
          </h4>
          <div className="flex items-center gap-2"><div className="w-5 h-1 bg-amber-400 rounded-full shadow-sm shadow-amber-400/50" /><span className="text-slate-300 font-medium">💍 Шлюбний союз</span></div>
          <div className="flex items-center gap-2"><div className="w-5 h-1 bg-sky-400 rounded-full" /><span className="text-slate-300 font-medium">Лінія батька</span></div>
          <div className="flex items-center gap-2"><div className="w-5 h-1 bg-rose-400 rounded-full" /><span className="text-slate-300 font-medium">Лінія матері</span></div>
          <div className="flex items-center gap-2"><div className="w-5 h-1 bg-amber-400 rounded-full" /><span className="text-slate-300 font-medium">Батьки → Діти</span></div>
          <div className="mt-2 pt-2 border-t border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-sky-400 bg-sky-950" /><span className="text-slate-400">Чоловік</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-rose-400 bg-rose-950" /><span className="text-slate-400">Жінка</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-amber-400 bg-amber-950" /><span className="text-slate-400">👑 Я (Власник)</span></div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 text-slate-500 text-[10px] italic">
            🌳 Могутній дуб із жолудями та лопатевим листям
          </div>
        </div>
      )}

      {/* Floating Bottom Navigator Pill */}
      <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-30 pointer-events-none text-[11px] sm:text-xs text-slate-300 bg-slate-950/90 px-3.5 py-2 rounded-2xl border border-amber-500/25 backdrop-blur-2xl flex items-center gap-2.5 shadow-xl">
        <span className="text-amber-300 font-serif font-bold">🍃 Крона дуба (Я)</span>
        <span className="text-amber-500/60">▲</span>
        <span className="text-sky-300 font-serif font-bold">🌿 Гілля (Батьки)</span>
        <span className="text-amber-500/60">▲</span>
        <span className="text-emerald-300 font-serif font-bold">🌱 Коріння (Дідусі)</span>
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
          {/* Layer 1: Ancient Oak Tree Artwork */}
          <AncientOakTreeSVG canvasW={canvasW} canvasH={canvasH} />

          {/* Layer 2: Glowing Filament Connectors */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ width: canvasW, height: canvasH, zIndex: 10 }}
            viewBox={`0 0 ${canvasW} ${canvasH}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id="filamentGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
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
                  {/* Outer ambient glow */}
                  <path 
                    d={offsetD} 
                    stroke={c.color} 
                    strokeWidth={c.width + 5} 
                    strokeLinecap="round" 
                    opacity={0.2}
                    filter="url(#filamentGlow)"
                    strokeDasharray={c.dashed ? '8 6' : undefined} 
                  />
                  {/* Sharp core filament */}
                  <path 
                    d={offsetD} 
                    stroke={c.color} 
                    strokeWidth={c.width} 
                    strokeLinecap="round" 
                    strokeDasharray={c.dashed ? '8 6' : undefined}
                    opacity={0.9} 
                  />
                </g>
              );
            })}

            {/* Marriage Signet Badges */}
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
                  <circle cx={mx} cy={my} r={16} fill="#090d16" stroke="#f59e0b" strokeWidth={2.5} />
                  <circle cx={mx} cy={my} r={12} fill="#78350f" opacity="0.6" />
                  <text x={mx} y={my + 1} textAnchor="middle" dominantBaseline="central" fontSize="13">
                    💍
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Layer 3: Tier Stage Headers */}
          {tierLabels.map(({ y, label, color }) => (
            <div
              key={label}
              className={`absolute z-10 text-[11px] font-serif font-bold tracking-wider px-4 py-1.5 rounded-full border backdrop-blur-xl shadow-lg ${color}`}
              style={{ left: 16, top: y - bounds.minY - 38 }}
            >
              {label}
            </div>
          ))}

          {/* Layer 4: Person Cameo Cards */}
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
