// Skrypt konfiguracji kolekcji użytkowników w Appwrite
// Uruchom: node scripts/setup-users-appwrite.js

const { Client, Databases, Storage, Permission, Role, ID } = require('appwrite');

// Konfiguracja Appwrite
const client = new Client();
client
  .setEndpoint('https://fra.cloud.appwrite.io/v1') // Twój endpoint Appwrite
  .setProject('687abe96000d2d31f914') // Project ID z konfiguracji
  .setKey('YOUR_API_KEY'); // Zamień na swój API Key

const databases = new Databases(client);

const databaseId = 'votes'; // Istniejąca baza danych
const usersCollectionId = 'users';
const customColumnsCollectionId = 'user_custom_columns';

async function setupUsersCollection() {
  try {
    console.log('🏗️ Tworzenie kolekcji użytkowników...');

    // Utwórz kolekcję użytkowników
    const usersCollection = await databases.createCollection(
      databaseId,
      usersCollectionId,
      'Users',
      [
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    console.log('✅ Kolekcja użytkowników utworzona:', usersCollection.$id);

    // Dodaj atrybuty do kolekcji użytkowników
    const attributes = [
      { key: 'firstName', type: 'string', size: 255, required: true, label: 'Imię' },
      { key: 'lastName', type: 'string', size: 255, required: true, label: 'Nazwisko' },
      { key: 'function', type: 'string', size: 100, required: false, label: 'Funkcja' },
      { key: 'group', type: 'string', size: 100, required: true, label: 'Grupa' },
      { key: 'email', type: 'email', required: false, label: 'Email' },
      { key: 'phone', type: 'string', size: 20, required: false, label: 'Telefon' },
      { key: 'notes', type: 'string', size: 1000, required: false, label: 'Notatki' }
    ];

    for (const attr of attributes) {
      if (attr.type === 'string') {
        await databases.createStringAttribute(
          databaseId,
          usersCollectionId,
          attr.key,
          attr.size,
          attr.required
        );
      } else if (attr.type === 'email') {
        await databases.createEmailAttribute(
          databaseId,
          usersCollectionId,
          attr.key,
          attr.required
        );
      }
      console.log(`✅ Atrybut ${attr.key} dodany`);
    }

  } catch (error) {
    if (error.code === 409) {
      console.log('ℹ️ Kolekcja użytkowników już istnieje');
    } else {
      console.error('❌ Błąd podczas tworzenia kolekcji użytkowników:', error);
    }
  }
}

async function setupCustomColumnsCollection() {
  try {
    console.log('🏗️ Tworzenie kolekcji niestandardowych kolumn...');

    // Utwórz kolekcję niestandardowych kolumn
    const customColumnsCollection = await databases.createCollection(
      databaseId,
      customColumnsCollectionId,
      'User Custom Columns',
      [
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    console.log('✅ Kolekcja niestandardowych kolumn utworzona:', customColumnsCollection.$id);

    // Dodaj atrybuty
    await databases.createStringAttribute(
      databaseId,
      customColumnsCollectionId,
      'id',
      100,
      true
    );
    console.log('✅ Atrybut id dodany');

    await databases.createStringAttribute(
      databaseId,
      customColumnsCollectionId,
      'name',
      255,
      true
    );
    console.log('✅ Atrybut name dodany');

    await databases.createEnumAttribute(
      databaseId,
      customColumnsCollectionId,
      'type',
      ['text', 'checkbox', 'number'],
      true
    );
    console.log('✅ Atrybut type dodany');

    await databases.createStringAttribute(
      databaseId,
      customColumnsCollectionId,
      'values',
      10000,
      false
    );
    console.log('✅ Atrybut values dodany');

  } catch (error) {
    if (error.code === 409) {
      console.log('ℹ️ Kolekcja niestandardowych kolumn już istnieje');
    } else {
      console.error('❌ Błąd podczas tworzenia kolekcji niestandardowych kolumn:', error);
    }
  }
}

async function createSampleUsers() {
  try {
    console.log('👥 Tworzenie przykładowych użytkowników...');

    const sampleUsers = [
      {
        firstName: 'Jan',
        lastName: 'Kowalski',
        function: 'Kierownik',
        group: 'Kadra',
        email: 'jan.kowalski@zss.edu.pl',
        phone: '+48 123 456 789',
        notes: 'Kierownik ds. sportowych'
      },
      {
        firstName: 'Anna',
        lastName: 'Nowak',
        function: 'Instruktor',
        group: 'Kadra',
        email: 'anna.nowak@zss.edu.pl',
        phone: '+48 987 654 321',
        notes: 'Instruktor pływania'
      },
      {
        firstName: 'Piotr',
        lastName: 'Wiśniewski',
        function: 'Uczestnik',
        group: 'Grupa A',
        email: 'piotr.wisniewski@example.com',
        phone: '+48 555 123 456',
        notes: ''
      },
      {
        firstName: 'Maria',
        lastName: 'Dąbrowska',
        function: 'Uczestnik',
        group: 'Grupa B',
        email: 'maria.dabrowska@example.com',
        phone: '+48 666 789 012',
        notes: 'Specjalność: gimnastyka'
      }
    ];

    for (const user of sampleUsers) {
      try {
        await databases.createDocument(
          databaseId,
          usersCollectionId,
          ID.unique(),
          user
        );
        console.log(`✅ Użytkownik ${user.firstName} ${user.lastName} dodany`);
      } catch (error) {
        console.log(`⚠️ Użytkownik ${user.firstName} ${user.lastName} już istnieje lub błąd:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Błąd podczas tworzenia przykładowych użytkowników:', error);
  }
}

// Główna funkcja
async function main() {
  console.log('🚀 Rozpoczynanie konfiguracji Appwrite dla systemu użytkowników...\n');
  
  await setupUsersCollection();
  console.log('');
  
  await setupCustomColumnsCollection();
  console.log('');
  
  // Opcjonalnie - utworzenie przykładowych danych
  const createSamples = process.argv.includes('--samples');
  if (createSamples) {
    await createSampleUsers();
  }
  
  console.log('\n🎉 Konfiguracja Appwrite dla systemu użytkowników zakończona!');
  console.log('\n📚 Następne kroki:');
  console.log('1. Sprawdź utworzone kolekcje w konsoli Appwrite');
  console.log('2. Dostosuj uprawnienia według swoich potrzeb');
  console.log('3. Przetestuj dodawanie użytkowników w aplikacji');
  console.log('\n💡 Aby utworzyć przykładowych użytkowników, uruchom: node scripts/setup-users-appwrite.js --samples');
}

// Uruchomienie skryptu
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  setupUsersCollection,
  setupCustomColumnsCollection,
  createSampleUsers
};