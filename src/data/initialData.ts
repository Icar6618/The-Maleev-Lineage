import type { FamilyData } from '../types/family';

export const initialFamilyData: FamilyData = {
  title: 'Родовід Малеєвих',
  description: 'Порожнє дерево на 3 покоління. Заповніть дані родичів у кожній картці.',
  lastUpdated: new Date().toISOString().split('T')[0],
  persons: [
    // ========================================================
    // ПОКОЛІННЯ 1: ДІДУСІ ТА БАБУСІ
    // ========================================================
    
    // Лінія батька
    {
      id: 'p-paternal-grandfather',
      roleLabel: 'Дідусь (по батькові)',
      firstName: '',
      lastName: '',
      gender: 'male',
      isLiving: false,
      generation: 1,
      branch: 'Лінія батька',
      spouseIds: ['p-paternal-grandmother'],
      childrenIds: ['p-father', 'p-paternal-uncle', 'p-paternal-aunt'],
      tags: ['Дідусь', 'Лінія батька']
    },
    {
      id: 'p-paternal-grandmother',
      roleLabel: 'Бабуся (по батькові)',
      firstName: '',
      lastName: '',
      gender: 'female',
      isLiving: false,
      generation: 1,
      branch: 'Лінія батька',
      spouseIds: ['p-paternal-grandfather'],
      childrenIds: ['p-father', 'p-paternal-uncle', 'p-paternal-aunt'],
      tags: ['Бабуся', 'Лінія батька']
    },

    // Лінія матері
    {
      id: 'p-maternal-grandfather',
      roleLabel: 'Дідусь (по матері)',
      firstName: '',
      lastName: '',
      gender: 'male',
      isLiving: false,
      generation: 1,
      branch: 'Лінія матері',
      spouseIds: ['p-maternal-grandmother'],
      childrenIds: ['p-mother', 'p-maternal-aunt', 'p-maternal-uncle'],
      tags: ['Дідусь', 'Лінія матері']
    },
    {
      id: 'p-maternal-grandmother',
      roleLabel: 'Бабуся (по матері)',
      firstName: '',
      lastName: '',
      gender: 'female',
      isLiving: false,
      generation: 1,
      branch: 'Лінія матері',
      spouseIds: ['p-maternal-grandfather'],
      childrenIds: ['p-mother', 'p-maternal-aunt', 'p-maternal-uncle'],
      tags: ['Бабуся', 'Лінія матері']
    },

    // ========================================================
    // ПОКОЛІННЯ 2: БАТЬКИ, ДЯДЬКИ ТА ТІТКИ
    // ========================================================

    // Батько
    {
      id: 'p-father',
      roleLabel: 'Батько (Тато)',
      firstName: '',
      lastName: '',
      gender: 'male',
      isLiving: true,
      generation: 2,
      branch: 'Основна гілка',
      fatherId: 'p-paternal-grandfather',
      motherId: 'p-paternal-grandmother',
      spouseIds: ['p-mother'],
      childrenIds: ['p-me', 'p-brother'],
      tags: ['Батько', 'Основна гілка']
    },

    // Мати
    {
      id: 'p-mother',
      roleLabel: 'Мати (Мама)',
      firstName: '',
      lastName: '',
      gender: 'female',
      isLiving: true,
      generation: 2,
      branch: 'Основна гілка',
      fatherId: 'p-maternal-grandfather',
      motherId: 'p-maternal-grandmother',
      spouseIds: ['p-father'],
      childrenIds: ['p-me', 'p-brother'],
      tags: ['Мати', 'Основна гілка']
    },

    // Брат тата (Дядько)
    {
      id: 'p-paternal-uncle',
      roleLabel: 'Брат тата (Дядько)',
      firstName: '',
      lastName: '',
      gender: 'male',
      isLiving: true,
      generation: 2,
      branch: 'Лінія батька',
      fatherId: 'p-paternal-grandfather',
      motherId: 'p-paternal-grandmother',
      spouseIds: [],
      childrenIds: [],
      tags: ['Дядько', 'Лінія батька']
    },

    // Сестра тата (Тітка)
    {
      id: 'p-paternal-aunt',
      roleLabel: 'Сестра тата (Тітка)',
      firstName: '',
      lastName: '',
      gender: 'female',
      isLiving: true,
      generation: 2,
      branch: 'Лінія батька',
      fatherId: 'p-paternal-grandfather',
      motherId: 'p-paternal-grandmother',
      spouseIds: [],
      childrenIds: [],
      tags: ['Тітка', 'Лінія батька']
    },

    // Сестра мами (Тітка)
    {
      id: 'p-maternal-aunt',
      roleLabel: 'Сестра мами (Тітка)',
      firstName: '',
      lastName: '',
      gender: 'female',
      isLiving: true,
      generation: 2,
      branch: 'Лінія матері',
      fatherId: 'p-maternal-grandfather',
      motherId: 'p-maternal-grandmother',
      spouseIds: [],
      childrenIds: [],
      tags: ['Тітка', 'Лінія матері']
    },

    // Брат мами (Дядько)
    {
      id: 'p-maternal-uncle',
      roleLabel: 'Брат мами (Дядько)',
      firstName: '',
      lastName: '',
      gender: 'male',
      isLiving: true,
      generation: 2,
      branch: 'Лінія матері',
      fatherId: 'p-maternal-grandfather',
      motherId: 'p-maternal-grandmother',
      spouseIds: [],
      childrenIds: [],
      tags: ['Дядько', 'Лінія матері']
    },

    // ========================================================
    // ПОКОЛІННЯ 3: Я ТА МІЙ БРАТ
    // ========================================================

    // Я
    {
      id: 'p-me',
      roleLabel: 'Я (Власник дерева)',
      firstName: '',
      lastName: '',
      gender: 'male',
      isLiving: true,
      generation: 3,
      branch: 'Основна гілка',
      fatherId: 'p-father',
      motherId: 'p-mother',
      spouseIds: [],
      childrenIds: [],
      tags: ['Я', 'Основна гілка']
    },

    // Мій брат
    {
      id: 'p-brother',
      roleLabel: 'Мій брат',
      firstName: '',
      lastName: '',
      gender: 'male',
      isLiving: true,
      generation: 3,
      branch: 'Основна гілка',
      fatherId: 'p-father',
      motherId: 'p-mother',
      spouseIds: [],
      childrenIds: [],
      tags: ['Брат', 'Основна гілка']
    }
  ]
};
