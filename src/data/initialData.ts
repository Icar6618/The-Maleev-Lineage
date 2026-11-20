import type { FamilyData } from '../types/family';

export const initialFamilyData: FamilyData = {
  title: 'Родовід Малеєвих',
  description: 'Родинне дерево на 3 покоління. Заповніть картки своїми справжніми рідними.',
  lastUpdated: new Date().toISOString().split('T')[0],
  persons: [
    // ========================================================
    // ПОКОЛІННЯ 1: ДІДУСІ ТА БАБУСІ
    // ========================================================
    
    // Лінія батька
    {
      id: 'p-paternal-grandfather',
      firstName: 'Дідусь (по батькові)',
      lastName: 'Малеєв',
      middleName: '[По батькові]',
      gender: 'male',
      birthDate: '1935',
      birthPlace: 'Україна',
      isLiving: false,
      generation: 1,
      branch: 'Лінія батька',
      profession: '[Вкажіть професію дідуся]',
      bio: 'Батько мого тата. Натисніть «Редагувати», щоб вказати справжнє ім’я, роки життя та історію.',
      spouseIds: ['p-paternal-grandmother'],
      childrenIds: ['p-father', 'p-paternal-uncle', 'p-paternal-aunt'],
      tags: ['Дідусь', 'Лінія батька']
    },
    {
      id: 'p-paternal-grandmother',
      firstName: 'Бабуся (по батькові)',
      lastName: 'Малеєва',
      maidenName: '[Дівоче прізвище]',
      middleName: '[По батькові]',
      gender: 'female',
      birthDate: '1938',
      birthPlace: 'Україна',
      isLiving: false,
      generation: 1,
      branch: 'Лінія батька',
      profession: '[Вкажіть професію бабусі]',
      bio: 'Мати мого тата. Натисніть «Редагувати», щоб внести дівоче прізвище та спогади.',
      spouseIds: ['p-paternal-grandfather'],
      childrenIds: ['p-father', 'p-paternal-uncle', 'p-paternal-aunt'],
      tags: ['Бабуся', 'Лінія батька']
    },

    // Лінія матері
    {
      id: 'p-maternal-grandfather',
      firstName: 'Дідусь (по матері)',
      lastName: '[Прізвище дідуся]',
      middleName: '[По батькові]',
      gender: 'male',
      birthDate: '1936',
      birthPlace: 'Україна',
      isLiving: false,
      generation: 1,
      branch: 'Лінія матері',
      profession: '[Вкажіть професію дідуся]',
      bio: 'Батько моєї мами. Натисніть «Редагувати», щоб ввести ім’я та історію життя.',
      spouseIds: ['p-maternal-grandmother'],
      childrenIds: ['p-mother', 'p-maternal-aunt', 'p-maternal-uncle'],
      tags: ['Дідусь', 'Лінія матері']
    },
    {
      id: 'p-maternal-grandmother',
      firstName: 'Бабуся (по матері)',
      lastName: '[Прізвище]',
      maidenName: '[Дівоче прізвище]',
      middleName: '[По батькові]',
      gender: 'female',
      birthDate: '1940',
      birthPlace: 'Україна',
      isLiving: false,
      generation: 1,
      branch: 'Лінія матері',
      profession: '[Вкажіть професію бабусі]',
      bio: 'Мати моєї мами. Натисніть «Редагувати», щоб заповнити дані бабусі.',
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
      firstName: 'Батько (Тато)',
      lastName: 'Малеєв',
      middleName: '[По батькові]',
      gender: 'male',
      birthDate: '1965',
      birthPlace: 'Україна',
      isLiving: true,
      generation: 2,
      branch: 'Основна гілка',
      profession: '[Професія батька]',
      bio: 'Мій батько. Натисніть «Редагувати», щоб вказати його ім’я, дату народження та цікаві факти.',
      fatherId: 'p-paternal-grandfather',
      motherId: 'p-paternal-grandmother',
      spouseIds: ['p-mother'],
      childrenIds: ['p-me', 'p-brother'],
      tags: ['Батько', 'Основна гілка']
    },

    // Мати
    {
      id: 'p-mother',
      firstName: 'Мати (Мама)',
      lastName: 'Малеєва',
      maidenName: '[Дівоче прізвище мами]',
      middleName: '[По батькові]',
      gender: 'female',
      birthDate: '1968',
      birthPlace: 'Україна',
      isLiving: true,
      generation: 2,
      branch: 'Основна гілка',
      profession: '[Професія матері]',
      bio: 'Моя мама. Натисніть «Редагувати», щоб вказати ім’я мами, дівоче прізвище та рід занять.',
      fatherId: 'p-maternal-grandfather',
      motherId: 'p-maternal-grandmother',
      spouseIds: ['p-father'],
      childrenIds: ['p-me', 'p-brother'],
      tags: ['Мати', 'Основна гілка']
    },

    // Брат тата (Дядько)
    {
      id: 'p-paternal-uncle',
      firstName: 'Брат тата (Дядько)',
      lastName: 'Малеєв',
      middleName: '[По батькові]',
      gender: 'male',
      birthDate: '1968',
      isLiving: true,
      generation: 2,
      branch: 'Лінія батька',
      profession: '[Професія дядька]',
      bio: 'Рідний брат мого батька. Вкажіть його ім’я та родину.',
      fatherId: 'p-paternal-grandfather',
      motherId: 'p-paternal-grandmother',
      spouseIds: [],
      childrenIds: [],
      tags: ['Дядько', 'Лінія батька']
    },

    // Сестра тата (Тітка)
    {
      id: 'p-paternal-aunt',
      firstName: 'Сестра тата (Тітка)',
      lastName: '[Прізвище після одруження]',
      maidenName: 'Малеєва',
      middleName: '[По батькові]',
      gender: 'female',
      birthDate: '1971',
      isLiving: true,
      generation: 2,
      branch: 'Лінія батька',
      profession: '[Професія тітки]',
      bio: 'Рідна сестра мого батька. Вкажіть її ім’я та родину.',
      fatherId: 'p-paternal-grandfather',
      motherId: 'p-paternal-grandmother',
      spouseIds: [],
      childrenIds: [],
      tags: ['Тітка', 'Лінія батька']
    },

    // Сестра мами (Тітка)
    {
      id: 'p-maternal-aunt',
      firstName: 'Сестра мами (Тітка)',
      lastName: '[Прізвище]',
      maidenName: '[Дівоче прізвище]',
      middleName: '[По батькові]',
      gender: 'female',
      birthDate: '1972',
      isLiving: true,
      generation: 2,
      branch: 'Лінія матері',
      profession: '[Професія тітки]',
      bio: 'Рідна сестра моєї мами. Вкажіть її ім’я та деталі.',
      fatherId: 'p-maternal-grandfather',
      motherId: 'p-maternal-grandmother',
      spouseIds: [],
      childrenIds: [],
      tags: ['Тітка', 'Лінія матері']
    },

    // Брат мами (Дядько)
    {
      id: 'p-maternal-uncle',
      firstName: 'Брат мами (Дядько)',
      lastName: '[Прізвище]',
      middleName: '[По батькові]',
      gender: 'male',
      birthDate: '1975',
      isLiving: true,
      generation: 2,
      branch: 'Лінія матері',
      profession: '[Професія дядька]',
      bio: 'Рідний брат моєї мами. Вкажіть його ім’я та родину.',
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
      firstName: 'Я',
      lastName: 'Малеєв',
      middleName: '[По батькові]',
      gender: 'male',
      birthDate: '1995',
      birthPlace: 'Україна',
      isLiving: true,
      generation: 3,
      branch: 'Основна гілка',
      profession: '[Ваша професія / рід занять]',
      bio: 'Творець та хранитель родинного дерева. Натисніть «Редагувати», щоб вказати своє повне ім’я, дату народження та біографію.',
      fatherId: 'p-father',
      motherId: 'p-mother',
      spouseIds: [],
      childrenIds: [],
      tags: ['Автор дерева', 'Основна гілка']
    },

    // Мій брат
    {
      id: 'p-brother',
      firstName: 'Мій брат',
      lastName: 'Малеєв',
      middleName: '[По батькові]',
      gender: 'male',
      birthDate: '1998',
      birthPlace: 'Україна',
      isLiving: true,
      generation: 3,
      branch: 'Основна гілка',
      profession: '[Професія брата]',
      bio: 'Мій рідний брат. Натисніть «Редагувати», щоб внести ім’я, роки та інформацію.',
      fatherId: 'p-father',
      motherId: 'p-mother',
      spouseIds: [],
      childrenIds: [],
      tags: ['Брат', 'Основна гілка']
    }
  ]
};
