import type { FamilyData, Person } from '../types/family';
import { initialFamilyData } from '../data/initialData';

const STORAGE_KEY = 'the_maleev_lineage_data_v1';

export function loadFamilyData(): FamilyData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialFamilyData;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.persons)) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load family data from localStorage', e);
  }
  return initialFamilyData;
}

export function saveFamilyData(data: FamilyData): void {
  try {
    const updated = {
      ...data,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated, null, 2));
  } catch (e) {
    console.error('Failed to save family data to localStorage', e);
  }
}

export function resetFamilyData(): FamilyData {
  localStorage.removeItem(STORAGE_KEY);
  return initialFamilyData;
}

export function exportDataAsJson(data: FamilyData): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `maleev-lineage-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Normalizes bidirectional relations:
 * - If person A has fatherId B, person B has childrenIds including A
 * - If person A has spouseIds including B, person B has spouseIds including A
 */
export function synchronizeRelations(persons: Person[]): Person[] {
  const map = new Map<string, Person>();
  persons.forEach((p) => {
    map.set(p.id, {
      ...p,
      spouseIds: [...(p.spouseIds || [])],
      childrenIds: [...(p.childrenIds || [])]
    });
  });

  // Link children to parents
  map.forEach((p) => {
    if (p.fatherId && map.has(p.fatherId)) {
      const father = map.get(p.fatherId)!;
      if (!father.childrenIds?.includes(p.id)) {
        father.childrenIds = [...(father.childrenIds || []), p.id];
      }
    }
    if (p.motherId && map.has(p.motherId)) {
      const mother = map.get(p.motherId)!;
      if (!mother.childrenIds?.includes(p.id)) {
        mother.childrenIds = [...(mother.childrenIds || []), p.id];
      }
    }
    // Link spouses reciprocally
    p.spouseIds?.forEach((spId) => {
      if (map.has(spId)) {
        const spouse = map.get(spId)!;
        if (!spouse.spouseIds?.includes(p.id)) {
          spouse.spouseIds = [...(spouse.spouseIds || []), p.id];
        }
      }
    });
  });

  return Array.from(map.values());
}
