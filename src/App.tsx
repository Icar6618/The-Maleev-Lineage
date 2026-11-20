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
import { Heart, ExternalLink } from 'lucide-react';

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

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-slate-300">The Maleev Lineage</span>
            <span>•</span>
            <span>Пам'ять поколінь, родинні корені та майбутнє</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Icar6618/The-Maleev-Lineage"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-amber-400 transition"
            >
              <span>GitHub проєкт</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <span>•</span>
            <span className="flex items-center gap-1">
              Зроблено з любов'ю до родини <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
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
