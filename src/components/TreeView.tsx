import React, { useState, useRef, useMemo } from 'react';
import type { Person } from '../types/family';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Heart, 
  MapPin, 
  Briefcase,
  ChevronDown,
  ChevronUp
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
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [collapsedGenerations, setCollapsedGenerations] = useState<Record<number, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);

  // Group persons by generation
  const { generations, branches, personMap } = useMemo(() => {
    const map = new Map<string, Person>();
    const branchSet = new Set<string>();

    persons.forEach((p) => {
      map.set(p.id, p);
      if (p.branch) branchSet.add(p.branch);
    });

    const genMap = new Map<number, Person[]>();
    persons.forEach((p) => {
      const gen = p.generation || 1;
      if (!genMap.has(gen)) {
        genMap.set(gen, []);
      }
      genMap.get(gen)!.push(p);
    });

    const sortedGens = Array.from(genMap.keys()).sort((a, b) => a - b);
    return {
      generations: sortedGens.map((gen) => ({
        generation: gen,
        members: genMap.get(gen) || [],
      })),
      branches: Array.from(branchSet),
      personMap: map,
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

  const handleZoom = (delta: number) => {
    setScale((prev) => Math.min(Math.max(0.4, prev + delta), 2.2));
  };

  const handleResetZoom = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const toggleGenCollapse = (gen: number) => {
    setCollapsedGenerations((prev) => ({
      ...prev,
      [gen]: !prev[gen],
    }));
  };

  const genLabels: Record<number, string> = {
    1: 'I Покоління • Пращури та засновники',
    2: 'II Покоління • Старше покоління',
    3: 'III Покоління • Батьківське покоління',
    4: 'IV Покоління • Сучасники та молодь',
    5: 'V Покоління • Нащадки та діти',
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] bg-slate-950 overflow-hidden select-none border-b border-slate-800">
      
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* Floating Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 shadow-xl">
        <button
          onClick={() => handleZoom(0.15)}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
          title="Збільшити масштаб"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(-0.15)}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
          title="Зменшити масштаб"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition text-xs font-mono cursor-pointer"
          title="Скинути положення (100%)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-700 mx-1" />

        <span className="text-xs text-slate-400 font-mono px-1">
          {Math.round(scale * 100)}%
        </span>

        {branches.length > 0 && (
          <>
            <div className="h-4 w-px bg-slate-700 mx-1" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">Усі гілки роду</option>
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Helper hint */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none text-xs text-slate-500 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur-sm hidden sm:block">
        💡 Затисніть та перетягуйте мишкою дерево • Клікніть на картку для біографії
      </div>

      {/* Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`w-full h-full overflow-hidden flex items-center justify-center ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          className="p-16 flex flex-col items-center gap-16 min-w-max"
        >
          {generations.map(({ generation, members }) => {
            const isCollapsed = collapsedGenerations[generation];
            const filteredMembers = selectedBranch === 'all' 
              ? members 
              : members.filter(m => !m.branch || m.branch === selectedBranch);

            if (filteredMembers.length === 0) return null;

            return (
              <div key={generation} className="flex flex-col items-center w-full relative">
                
                {/* Generation Header Pill */}
                <div className="flex items-center gap-2 mb-6">
                  <button
                    onClick={() => toggleGenCollapse(generation)}
                    className="flex items-center gap-2 px-4 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-full text-xs font-semibold text-slate-300 shadow-lg transition cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>{genLabels[generation] || `Покоління ${generation}`}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({filteredMembers.length})</span>
                    {isCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                </div>

                {/* Generation Row Cards */}
                {!isCollapsed && (
                  <div className="flex flex-wrap items-center justify-center gap-8 relative z-10 max-w-7xl">
                    {filteredMembers.map((person) => {
                      const isMatchesSearch = searchQuery && (
                        `${person.firstName} ${person.lastName} ${person.maidenName || ''} ${person.profession || ''} ${person.birthPlace || ''}`
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      );

                      const spouses = (person.spouseIds || [])
                        .map((id) => personMap.get(id))
                        .filter(Boolean) as Person[];

                      const isMale = person.gender === 'male';

                      return (
                        <div
                          key={person.id}
                          className="flex items-center gap-3 relative person-node"
                        >
                          {/* Person Card */}
                          <div
                            onClick={() => onSelectPerson(person)}
                            className={`w-64 rounded-2xl p-4 transition-all duration-200 cursor-pointer text-left relative group ${
                              isMatchesSearch
                                ? 'ring-2 ring-amber-400 bg-slate-900 shadow-amber-500/20 shadow-xl'
                                : 'bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 shadow-xl hover:shadow-2xl'
                            } ${
                              isMale 
                                ? 'hover:border-cyan-500/50' 
                                : 'hover:border-rose-500/50'
                            }`}
                          >
                            {/* Branch or Living Status Badge */}
                            <div className="flex items-center justify-between gap-1 mb-2">
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                isMale
                                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}>
                                {isMale ? 'Чоловік' : 'Жінка'}
                              </span>

                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                person.isLiving
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-slate-800 text-slate-400'
                              }`}>
                                {person.isLiving ? 'Живий(а)' : 'У вічності'}
                              </span>
                            </div>

                            {/* Avatar & Names */}
                            <div className="flex items-start gap-3">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-serif text-lg font-bold shrink-0 ${
                                isMale
                                  ? 'bg-gradient-to-tr from-cyan-900/40 to-cyan-700/30 text-cyan-300 border border-cyan-500/30'
                                  : 'bg-gradient-to-tr from-rose-900/40 to-rose-700/30 text-rose-300 border border-rose-500/30'
                              }`}>
                                {person.avatarUrl ? (
                                  <img
                                    src={person.avatarUrl}
                                    alt={person.firstName}
                                    className="w-full h-full object-cover rounded-xl"
                                  />
                                ) : (
                                  <span>{person.firstName[0]}{person.lastName[0]}</span>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm text-slate-100 group-hover:text-amber-400 transition truncate">
                                  {person.firstName} {person.lastName}
                                </h3>
                                {person.middleName && (
                                  <p className="text-xs text-slate-400 truncate">
                                    {person.middleName}
                                  </p>
                                )}
                                {person.maidenName && (
                                  <p className="text-[11px] text-amber-400/80 italic">
                                    ({person.maidenName})
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Dates & Profession */}
                            <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1 text-xs text-slate-400">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-mono text-slate-300">
                                  {person.birthDate || '?'} — {person.isLiving ? 'сьогодні' : (person.deathDate || '?')}
                                </span>
                              </div>

                              {person.profession && (
                                <div className="flex items-center gap-1.5 text-slate-400 truncate text-[11px]">
                                  <Briefcase className="w-3 h-3 text-slate-500 shrink-0" />
                                  <span className="truncate">{person.profession}</span>
                                </div>
                              )}

                              {person.birthPlace && (
                                <div className="flex items-center gap-1.5 text-slate-400 truncate text-[11px]">
                                  <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                                  <span className="truncate">{person.birthPlace}</span>
                                </div>
                              )}
                            </div>

                            {/* Quick Add buttons on hover */}
                            <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between gap-1 text-[11px]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddChild(person);
                                }}
                                className="px-2 py-0.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition cursor-pointer"
                                title="Додати дитину до цього родича"
                              >
                                + Дитина
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddSpouse(person);
                                }}
                                className="px-2 py-0.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition cursor-pointer"
                                title="Додати дружину/чоловіка"
                              >
                                + Подружжя
                              </button>
                            </div>
                          </div>

                          {/* Spouse connector badge if spouse exists in same generation */}
                          {spouses.length > 0 && person.gender === 'male' && (
                            <div className="flex items-center text-rose-400" title="Подружній союз">
                              <Heart className="w-4 h-4 fill-rose-500/20 text-rose-400" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Connecting branch line to next generation */}
                {generation < generations[generations.length - 1].generation && !isCollapsed && (
                  <div className="w-0.5 h-12 bg-gradient-to-b from-slate-700 via-amber-500/40 to-slate-700 my-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
