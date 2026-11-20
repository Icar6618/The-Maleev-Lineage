import { useState, useEffect } from 'react';
import type { Person, ViewMode, FamilyData } from './types/family';
import { 
  loadFamilyData, 
  saveFamilyData, 
  resetFamilyData, 
  synchronizeRelations,
  exportDataAsJson 
} from './utils/storage';
import { Header } from './components/Header';
import { TreeView } from './components/TreeView';
import { CardsView } from './components/CardsView';
import { TimelineView } from './components/TimelineView';
import { StatsView } from './components/StatsView';
import { PersonDetailModal } from './components/PersonDetailModal';
import { PersonFormModal } from './components/PersonFormModal';
import { ExportImportModal } from './components/ExportImportModal';
import { Heart, ExternalLink, TreePine } from 'lucide-react';

export function App() {
  const [familyData, setFamilyData] = useState<FamilyData>(() => loadFamilyData());
  const [currentView, setCurrentView] = useState<ViewMode>('tree');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [presetParent, setPresetParent] = useState<Person | null>(null);
  const [presetSpouse, setPresetSpouse] = useState<Person | null>(null);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);

  // Synchronize on startup if needed
  useEffect(() => {
    const synchronized = synchronizeRelations(familyData.persons);
    if (JSON.stringify(synchronized) !== JSON.stringify(familyData.persons)) {
      const updated: FamilyData = { ...familyData, persons: synchronized };
      setFamilyData(updated);
      saveFamilyData(updated);
    }
  }, []);

  const handleSavePerson = (person: Person) => {
    let updatedList: Person[];
    const exists = familyData.persons.some((p) => p.id === person.id);

    if (exists) {
      updatedList = familyData.persons.map((p) => (p.id === person.id ? person : p));
    } else {
      updatedList = [...familyData.persons, person];
    }

    // Bidirectional sync
    updatedList = synchronizeRelations(updatedList);

    const updatedData: FamilyData = {
      ...familyData,
      persons: updatedList,
    };

    setFamilyData(updatedData);
    saveFamilyData(updatedData);

    // If currently inspecting the edited person, update modal
    if (selectedPerson && selectedPerson.id === person.id) {
      const refreshed = updatedList.find((p) => p.id === person.id) || null;
      setSelectedPerson(refreshed);
    }
  };

  const handleDeletePerson = (personId: string) => {
    const filteredPersons: Person[] = familyData.persons
      .filter((p) => p.id !== personId)
      .map((p) => {
        const copy: Person = { ...p };
        if (copy.fatherId === personId) delete copy.fatherId;
        if (copy.motherId === personId) delete copy.motherId;
        if (copy.spouseIds) {
          copy.spouseIds = copy.spouseIds.filter((id) => id !== personId);
        }
        if (copy.childrenIds) {
          copy.childrenIds = copy.childrenIds.filter((id) => id !== personId);
        }
        return copy;
      });

    const synchronized = synchronizeRelations(filteredPersons);

    const updatedData: FamilyData = {
      ...familyData,
      persons: synchronized,
    };

    setFamilyData(updatedData);
    saveFamilyData(updatedData);
    setSelectedPerson(null);
  };

  const handleAddPerson = () => {
    setEditingPerson(null);
    setPresetParent(null);
    setPresetSpouse(null);
    setIsFormOpen(true);
  };

  const handleAddChild = (parent: Person) => {
    setEditingPerson(null);
    setPresetParent(parent);
    setPresetSpouse(null);
    setIsFormOpen(true);
  };

  const handleAddSpouse = (person: Person) => {
    setEditingPerson(null);
    setPresetParent(null);
    setPresetSpouse(person);
    setIsFormOpen(true);
  };

  const handleEditPerson = (person: Person) => {
    setEditingPerson(person);
    setPresetParent(null);
    setPresetSpouse(null);
    setIsFormOpen(true);
  };

  const handleReset = () => {
    if (window.confirm('Скинути всі дані родоводу до початкового зразка?')) {
      const reset = resetFamilyData();
      setFamilyData(reset);
      setSelectedPerson(null);
    }
  };

  const handleImport = (imported: FamilyData) => {
    const synchronized = synchronizeRelations(imported.persons);
    const updated: FamilyData = { ...imported, persons: synchronized };
    setFamilyData(updated);
    saveFamilyData(updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddPerson={handleAddPerson}
        onExport={() => exportDataAsJson(familyData)}
        onImport={() => setIsExportImportOpen(true)}
        onReset={handleReset}
        totalPersons={familyData.persons.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative">
        {currentView === 'tree' && (
          <TreeView
            persons={familyData.persons}
            searchQuery={searchQuery}
            onSelectPerson={setSelectedPerson}
            onAddChild={handleAddChild}
            onAddSpouse={handleAddSpouse}
          />
        )}

        {currentView === 'cards' && (
          <CardsView
            persons={familyData.persons}
            searchQuery={searchQuery}
            onSelectPerson={setSelectedPerson}
            onAddPerson={handleAddPerson}
          />
        )}

        {currentView === 'timeline' && (
          <TimelineView
            persons={familyData.persons}
            onSelectPerson={setSelectedPerson}
          />
        )}

        {currentView === 'stats' && (
          <StatsView persons={familyData.persons} />
        )}
      </main>

      {/* Bottom Medieval Banner (Footer matching Top Header) */}
      <footer className="bg-[#120d08]/95 backdrop-blur-xl border-t border-[#d4af37]/30 shadow-2xl shadow-black/90 py-5 px-4 relative z-20">
        {/* Top Gold Leaf Trim of Bottom Banner */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent shadow-[0_0_10px_rgba(212,175,55,0.4)]" />

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-serif">
          {/* Left: Emblem + Lineage Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-[#2a1a0e] to-[#120d08] p-[1.5px] border border-[#d4af37]/50 shadow-md flex items-center justify-center">
              <TreePine className="w-4 h-4 text-[#d4af37]" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-['Cinzel'] font-bold text-sm tracking-wide bg-gradient-to-r from-[#fffbeb] via-[#fef3c7] to-[#d4af37] bg-clip-text text-transparent">
                Родовід Малеєвих
              </span>
              <span className="text-[#d4af37]/50">⚜</span>
              <span className="text-[#d4af37]/80 italic">
                Пам'ять поколінь, родинні корені та майбутнє
              </span>
            </div>
          </div>

          {/* Right: GitHub Project Link & Dedication */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center text-[11px]">
            <a
              href="https://github.com/Icar6618/The-Maleev-Lineage"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1e150d]/80 hover:bg-[#2a1d12] border border-[#d4af37]/40 text-[#fef3c7] hover:text-[#fffbeb] transition font-['Cinzel'] font-bold shadow-sm"
            >
              <span>GitHub проєкт</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#d4af37]" />
            </a>
            <span className="text-[#d4af37]/40">⚜</span>
            <span className="flex items-center gap-1.5 text-[#d4af37]/80">
              <span>З повагою до роду</span>
              <Heart className="w-3.5 h-3.5 text-[#991b1b] fill-[#991b1b] inline opacity-90" />
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PersonDetailModal
        person={selectedPerson}
        allPersons={familyData.persons}
        onClose={() => setSelectedPerson(null)}
        onEdit={(p) => {
          setSelectedPerson(null);
          handleEditPerson(p);
        }}
        onDelete={handleDeletePerson}
        onSelectPerson={setSelectedPerson}
      />

      <PersonFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingPerson(null);
          setPresetParent(null);
          setPresetSpouse(null);
        }}
        onSave={handleSavePerson}
        initialPerson={editingPerson}
        allPersons={familyData.persons}
        presetParent={presetParent}
        presetSpouse={presetSpouse}
      />

      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
        data={familyData}
        onImportData={handleImport}
      />
    </div>
  );
}

export default App;
