// Skrypt konfiguracji Appwrite dla systemu ogłoszeń
// Uruchom: node scripts/setup-announcements-appwrite.js

const { Client, Databases, Storage, Permission, Role, ID } = require('appwrite');

// Konfiguracja Appwrite
const client = new Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1') // Twój endpoint Appwrite
  .setProject('YOUR_PROJECT_ID') // Zamień na swój Project ID
  .setKey('YOUR_API_KEY'); // Zamień na swój API Key

const databases = new Databases(client);
const storage = new Storage(client);

const databaseId = 'votes'; // Istniejąca baza danych
const collectionId = 'announcements';
const bucketId = 'announcement-attachments';

async function setupAnnouncementsCollection() {
  try {
    console.log('🚀 Konfigurowanie kolekcji ogłoszeń w Appwrite...');

    // 1. Tworzenie kolekcji announcements
    try {
      await databases.createCollection(
        databaseId,
        collectionId,
        'Announcements',
        [
          // Permissions - dostosuj według potrzeb
          'read("any")',
          'write("users")',
          'update("users")',
          'delete("users")'
        ]
      );
      console.log('✅ Utworzono kolekcję announcements');
    } catch (error) {
      if (error.code === 409) {
        console.log('📋 Kolekcja announcements już istnieje');
      } else {
        throw error;
      }
    }

    // 2. Tworzenie atrybutów kolekcji
    const attributes = [
      {
        key: 'title',
        type: 'string',
        size: 255,
        required: true,
        array: false,
        description: 'Tytuł ogłoszenia'
      },
      {
        key: 'content',
        type: 'string',
        size: 50000,
        required: true,
        array: false,
        description: 'Treść ogłoszenia (markdown)'
      },
      {
        key: 'excerpt',
        type: 'string',
        size: 500,
        required: false,
        array: false,
        description: 'Krótki opis ogłoszenia'
      },
      {
        key: 'author',
        type: 'string',
        size: 255,
        required: true,
        array: false,
        description: 'Email autora ogłoszenia'
      },
      {
        key: 'authorName',
        type: 'string',
        size: 255,
        required: true,
        array: false,
        description: 'Imię i nazwisko autora'
      },
      {
        key: 'status',
        type: 'string',
        size: 50,
        required: true,
        array: false,
        description: 'Status: current, archived, draft, scheduled'
      },
      {
        key: 'category',
        type: 'string',
        size: 50,
        required: true,
        array: false,
        description: 'Kategoria: general, urgent, meeting, system, hr, finance'
      },
      {
        key: 'priority',
        type: 'string',
        size: 50,
        required: true,
        array: false,
        description: 'Priorytet: low, normal, high, urgent'
      },
      {
        key: 'viewCount',
        type: 'integer',
        min: 0,
        max: 999999999,
        required: true,
        array: false,
        description: 'Liczba wyświetleń'
      },
      {
        key: 'publishDate',
        type: 'datetime',
        required: true,
        array: false,
        description: 'Data publikacji'
      },
      {
        key: 'expirationDate',
        type: 'datetime',
        required: false,
        array: false,
        description: 'Data wygaśnięcia (opcjonalna)'
      },
      {
        key: 'tags',
        type: 'string',
        size: 100,
        required: false,
        array: true,
        description: 'Tagi ogłoszenia'
      },
      {
        key: 'attachmentIds',
        type: 'string',
        size: 36,
        required: false,
        array: true,
        description: 'ID załączników z Storage'
      },
      {
        key: 'isBookmarked',
        type: 'boolean',
        required: false,
        array: false,
        description: 'Czy ogłoszenie jest w zakładkach użytkownika'
      }
    ];

    // Dodawanie atrybutów
    for (const attr of attributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            databaseId,
            collectionId,
            attr.key,
            attr.size,
            attr.required,
            attr.array || false
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            databaseId,
            collectionId,
            attr.key,
            attr.required,
            attr.min,
            attr.max,
            attr.array || false
          );
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            databaseId,
            collectionId,
            attr.key,
            attr.required,
            attr.array || false
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            databaseId,
            collectionId,
            attr.key,
            attr.required,
            attr.array || false
          );
        }
        
        console.log(`✅ Utworzono atrybut: ${attr.key}`);
        
        // Pauza między tworzeniem atrybutów
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        if (error.code === 409) {
          console.log(`📋 Atrybut ${attr.key} już istnieje`);
        } else {
          console.error(`❌ Błąd przy tworzeniu atrybutu ${attr.key}:`, error.message);
        }
      }
    }

    // 3. Tworzenie indeksów
    console.log('🔍 Tworzenie indeksów...');
    
    const indexes = [
      {
        key: 'status_index',
        type: 'key',
        attributes: ['status'],
        orders: ['ASC']
      },
      {
        key: 'category_index',
        type: 'key',
        attributes: ['category'],
        orders: ['ASC']
      },
      {
        key: 'priority_index',
        type: 'key',
        attributes: ['priority'],
        orders: ['ASC']
      },
      {
        key: 'publish_date_index',
        type: 'key',
        attributes: ['publishDate'],
        orders: ['DESC']
      },
      {
        key: 'author_index',
        type: 'key',
        attributes: ['author'],
        orders: ['ASC']
      },
      {
        key: 'current_announcements',
        type: 'key',
        attributes: ['status', 'priority', 'publishDate'],
        orders: ['ASC', 'DESC', 'DESC']
      },
      {
        key: 'search_title',
        type: 'fulltext',
        attributes: ['title']
      },
      {
        key: 'search_content',
        type: 'fulltext',
        attributes: ['content']
      }
    ];

    for (const index of indexes) {
      try {
        await databases.createIndex(
          databaseId,
          collectionId,
          index.key,
          index.type,
          index.attributes,
          index.orders || []
        );
        console.log(`✅ Utworzono indeks: ${index.key}`);
        
        // Pauza między tworzeniem indeksów
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        if (error.code === 409) {
          console.log(`📋 Indeks ${index.key} już istnieje`);
        } else {
          console.error(`❌ Błąd przy tworzeniu indeksu ${index.key}:`, error.message);
        }
      }
    }

    console.log('✅ Konfiguracja kolekcji announcements zakończona!');

  } catch (error) {
    console.error('❌ Błąd podczas konfiguracji kolekcji:', error);
  }
}

async function setupAnnouncementsBucket() {
  try {
    console.log('📁 Konfigurowanie bucket dla załączników...');

    // Tworzenie bucket dla załączników
    try {
      await storage.createBucket(
        bucketId,
        'Announcement Attachments',
        [
          'read("any")', // Wszyscy mogą czytać załączniki
          'write("users")', // Tylko zalogowani użytkownicy mogą dodawać
          'update("users")',
          'delete("users")'
        ],
        false, // fileSecurity
        true,  // enabled
        10 * 1024 * 1024, // maksymalny rozmiar pliku: 10MB
        ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt', 'zip'], // dozwolone rozszerzenia
        'gzip', // kompresja
        false,  // encryption
        false   // antivirus
      );
      console.log('✅ Utworzono bucket announcement-attachments');
    } catch (error) {
      if (error.code === 409) {
        console.log('📋 Bucket announcement-attachments już istnieje');
      } else {
        throw error;
      }
    }

    console.log('✅ Konfiguracja bucket zakończona!');

  } catch (error) {
    console.error('❌ Błąd podczas konfiguracji bucket:', error);
  }
}

async function createSampleData() {
  try {
    console.log('📝 Tworzenie przykładowych danych...');

    const sampleAnnouncements = [
      {
        title: 'Witamy w nowym systemie ogłoszeń!',
        content: `# Nowy system ogłoszeń

Mamy przyjemność przedstawić nowy system ogłoszeń firmowych!

## Główne funkcje:
- Nowoczesny interfejs użytkownika
- Kategorie i priorytety ogłoszeń
- System tagów
- Załączniki do ogłoszeń
- Wyszukiwanie i filtrowanie

## Jak korzystać:
1. Przeglądaj aktualne ogłoszenia na głównej stronie
2. Kliknij w ogłoszenie, aby zobaczyć szczegóły
3. Używaj filtrów do szukania konkretnych informacji

Dziękujemy i życzymy produktywnej pracy!`,
        excerpt: 'Przedstawiamy nowy system ogłoszeń firmowych z nowoczesnymi funkcjami.',
        author: 'admin@example.com',
        authorName: 'Administrator systemu',
        status: 'current',
        category: 'system',
        priority: 'high',
        viewCount: 0,
        publishDate: new Date().toISOString(),
        expirationDate: null,
        tags: ['system', 'nowości', 'ogłoszenia'],
        attachmentIds: [],
        isBookmarked: false
      },
      {
        title: 'Spotkanie zespołu - Planning Q4',
        content: `# Spotkanie zespołu - Planowanie Q4

Zapraszamy na ważne spotkanie dotyczące planowania ostatniego kwartału roku.

**Data:** Piątek, 30 sierpnia 2025
**Godzina:** 14:00 - 16:00  
**Miejsce:** Sala konferencyjna B

## Agenda:
- Podsumowanie Q3
- Cele na Q4
- Budżet i zasoby
- Q&A

Prosimy o potwierdzenie uczestnictwa.`,
        excerpt: 'Spotkanie zespołu w piątek o 14:00 - planowanie Q4.',
        author: 'manager@example.com',
        authorName: 'Jan Kowalski',
        status: 'current',
        category: 'meeting',
        priority: 'normal',
        viewCount: 0,
        publishDate: new Date().toISOString(),
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['spotkanie', 'planowanie', 'Q4'],
        attachmentIds: [],
        isBookmarked: false
      }
    ];

    for (const announcement of sampleAnnouncements) {
      try {
        await databases.createDocument(
          databaseId,
          collectionId,
          'unique()',
          announcement
        );
        console.log(`✅ Utworzono przykładowe ogłoszenie: ${announcement.title}`);
      } catch (error) {
        console.error(`❌ Błąd przy tworzeniu ogłoszenia:`, error.message);
      }
    }

    console.log('✅ Przykładowe dane zostały utworzone!');

  } catch (error) {
    console.error('❌ Błąd podczas tworzenia przykładowych danych:', error);
  }
}

// Główna funkcja
async function main() {
  console.log('🚀 Rozpoczynanie konfiguracji Appwrite dla systemu ogłoszeń...\n');
  
  await setupAnnouncementsCollection();
  console.log('');
  
  await setupAnnouncementsBucket();
  console.log('');
  
  // Opcjonalnie - utworzenie przykładowych danych
  const createSamples = process.argv.includes('--samples');
  if (createSamples) {
    await createSampleData();
  }
  
  console.log('\n🎉 Konfiguracja Appwrite dla systemu ogłoszeń zakończona!');
  console.log('\n📚 Następne kroki:');
  console.log('1. Sprawdź utworzoną kolekcję w konsoli Appwrite');
  console.log('2. Dostosuj uprawnienia według swoich potrzeb');
  console.log('3. Przetestuj dodawanie ogłoszeń w aplikacji');
  console.log('\n💡 Aby utworzyć przykładowe dane, uruchom: node scripts/setup-announcements-appwrite.js --samples');
}

// Uruchomienie skryptu
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  setupAnnouncementsCollection,
  setupAnnouncementsBucket,
  createSampleData
};
