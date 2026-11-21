import type { FamilyData } from '../types/family';
import { VIKTOR_AUDIO_DATA_URL } from './viktorAudio';
import { VIKTOR_AVATAR_DATA_URL, VIKTOR_INITIAL_PHOTOS } from './viktorPhotos';

export const initialFamilyData: FamilyData = {
  title: 'Родовід Малеєвих',
  description: 'Родовід на 4 покоління: Пращури під землею, Дідусі на землі, Батьки на стовбурі, Нащадки на верхівці.',
  lastUpdated: new Date().toISOString().split('T')[0],
  persons: [
    // ========================================================
    // ПОКОЛІННЯ 1: ПРАДІДУСІ ТА ПРАБАБУСІ (ПІД ЗЕМЛЕЮ)
    // ========================================================

    // Лінія батька: Батьки дідуся (по батькові)
    {
      id: 'p-pat-gf-father',
      roleLabel: 'Прадідусь (батько дідуся по батькові)',
      firstName: '',
      lastName: '',
      gender: 'male',
      isLiving: false,
      generation: 1,
      branch: 'Лінія батька',
      spouseIds: ['p-pat-gf-mother'],
      childrenIds: ['p-paternal-grandfather'],
      tags: ['Прадідусь', 'Лінія батька']
    },
    {
      id: 'p-pat-gf-mother',
      roleLabel: 'Прабабуся (мати дідуся по батькові)',
      firstName: '',
      lastName: '',
      gender: 'female',
      isLiving: false,
      generation: 1,
      branch: 'Лінія батька',
      spouseIds: ['p-pat-gf-father'],
      childrenIds: ['p-paternal-grandfather'],
      tags: ['Прабабуся', 'Лінія батька']
    },

    // Лінія батька: Батьки бабусі (по батькові)
    {
      id: 'p-pat-gm-father',
      roleLabel: 'Прадідусь (батько бабусі по батькові)',
      firstName: '',
      lastName: '',
      gender: 'male',
      isLiving: false,
      generation: 1,
      branch: 'Лінія батька',
      spouseIds: ['p-pat-gm-mother'],
      childrenIds: ['p-paternal-grandmother'],
      tags: ['Прадідусь', 'Лінія батька']
    },
    {
      id: 'p-pat-gm-mother',
      roleLabel: 'Прабабуся (мати бабусі по батькові)',
      firstName: '',
      lastName: '',
      gender: 'female',
      isLiving: false,
      generation: 1,
      branch: 'Лінія батька',
      spouseIds: ['p-pat-gm-father'],
      childrenIds: ['p-paternal-grandmother'],
      tags: ['Прабабуся', 'Лінія батька']
    },

    // Лінія матері: Батьки дідуся (по матері)
    {
      id: 'p-mat-gf-father',
      roleLabel: 'Прадідусь (батько дідуся по матері)',
      firstName: '',
      lastName: '',
      gender: 'male',
      isLiving: false,
      generation: 1,
      branch: 'Лінія матері',
      spouseIds: ['p-mat-gf-mother'],
      childrenIds: ['p-maternal-grandfather'],
      tags: ['Прадідусь', 'Лінія матері']
    },
    {
      id: 'p-mat-gf-mother',
      roleLabel: 'Прабабуся (мати дідуся по матері)',
      firstName: '',
      lastName: '',
      gender: 'female',
      isLiving: false,
      generation: 1,
      branch: 'Лінія матері',
      spouseIds: ['p-mat-gf-father'],
      childrenIds: ['p-maternal-grandfather'],
      tags: ['Прабабуся', 'Лінія матері']
    },

    // Лінія матері: Батьки бабусі (по матері)
    {
      id: 'p-mat-gm-father',
      roleLabel: 'Прадідусь (батько бабусі по матері)',
      firstName: '',
      lastName: '',
      gender: 'male',
      isLiving: false,
      generation: 1,
      branch: 'Лінія матері',
      spouseIds: ['p-mat-gm-mother'],
      childrenIds: ['p-maternal-grandmother'],
      tags: ['Прадідусь', 'Лінія матері']
    },
    {
      id: 'p-mat-gm-mother',
      roleLabel: 'Прабабуся (мати бабусі по матері)',
      firstName: '',
      lastName: '',
      gender: 'female',
      isLiving: false,
      generation: 1,
      branch: 'Лінія матері',
      spouseIds: ['p-mat-gm-father'],
      childrenIds: ['p-maternal-grandmother'],
      tags: ['Прабабуся', 'Лінія матері']
    },

    // ========================================================
    // ПОКОЛІННЯ 2: ДІДУСІ ТА БАБУСІ (НА ЗЕМЛІ)
    // ========================================================
    
    // Лінія батька
    {
      id: 'p-paternal-grandfather',
      roleLabel: 'Дідусь (по батькові)',
      firstName: '',
      lastName: '',
      gender: 'male',
      isLiving: false,
      generation: 2,
      branch: 'Лінія батька',
      fatherId: 'p-pat-gf-father',
      motherId: 'p-pat-gf-mother',
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
      generation: 2,
      branch: 'Лінія батька',
      fatherId: 'p-pat-gm-father',
      motherId: 'p-pat-gm-mother',
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
      generation: 2,
      branch: 'Лінія матері',
      fatherId: 'p-mat-gf-father',
      motherId: 'p-mat-gf-mother',
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
      generation: 2,
      branch: 'Лінія матері',
      fatherId: 'p-mat-gm-father',
      motherId: 'p-mat-gm-mother',
      spouseIds: ['p-maternal-grandfather'],
      childrenIds: ['p-mother', 'p-maternal-aunt', 'p-maternal-uncle'],
      tags: ['Бабуся', 'Лінія матері']
    },

    // ========================================================
    // ПОКОЛІННЯ 3: БАТЬКИ, ДЯДЬКИ ТА ТІТКИ (НА СТОВБУРІ)
    // ========================================================

    // Батько
    {
      id: 'p-father',
      roleLabel: 'Батько (Тато)',
      firstName: '',
      lastName: '',
      gender: 'male',
      isLiving: true,
      generation: 3,
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
      generation: 3,
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
      generation: 3,
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
      generation: 3,
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
      generation: 3,
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
      generation: 3,
      branch: 'Лінія матері',
      fatherId: 'p-maternal-grandfather',
      motherId: 'p-maternal-grandmother',
      spouseIds: [],
      childrenIds: [],
      tags: ['Дядько', 'Лінія матері']
    },

    // ========================================================
    // ПОКОЛІННЯ 4: Я ТА МІЙ БРАТ (НА ВЕРХІВЦІ КРОНИ)
    // ========================================================

    // Я (Віктор Малеєв)
    {
      id: 'p-me',
      roleLabel: 'Син',
      firstName: 'Віктор',
      lastName: 'Малеєв',
      middleName: 'Вікторович',
      gender: 'male',
      isLiving: true,
      generation: 4,
      birthDate: '2003',
      birthPlace: 'Дніпро',
      profession: 'Музичкант, дизайнер',
      favoriteQuote: 'Життя в кредит',
      avatarUrl: VIKTOR_AVATAR_DATA_URL,
      photos: VIKTOR_INITIAL_PHOTOS,
      branch: 'Основна гілка',
      fatherId: 'p-father',
      motherId: 'p-mother',
      audioUrl: VIKTOR_AUDIO_DATA_URL,
      spouseIds: [],
      childrenIds: [],
      tags: ['Я', 'Основна гілка', 'Віктор']
    },

    // Мій брат
    {
      id: 'p-brother',
      roleLabel: 'Мій брат',
      firstName: '',
      lastName: '',
      gender: 'male',
      isLiving: true,
      generation: 4,
      branch: 'Основна гілка',
      fatherId: 'p-father',
      motherId: 'p-mother',
      spouseIds: [],
      childrenIds: [],
      tags: ['Брат', 'Основна гілка']
    }
  ]
};
