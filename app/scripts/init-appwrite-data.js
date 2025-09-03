// Skrypt do inicjalizacji kolekcji i przykładowych danych w Appwrite
// Uruchom: node scripts/init-appwrite-data.js

const { Client, Databases, ID } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('687abe96000d2d31f914')
  .setKey('YOUR_API_KEY'); // Należy zastąpić prawdziwym kluczem API

const databases = new Databases(client);

const databaseId = 'votes';

async function initializeData() {
  try {
    console.log('🚀 Rozpoczynanie inicjalizacji danych...');

    // Przykładowe projekty
    const projects = [
      {
        header: "Budżet na rok 2025",
        type: "Finansowy",
        status: "Przyjęty",
        target: "31.12.2024",
        limit: "45,2 mln zł",
        reviewer: "Skarbnik"
      },
      {
        header: "Modernizacja oświetlenia ulicznego",
        type: "Infrastruktura",
        status: "W trakcie",
        target: "30.06.2025",
        limit: "2,8 mln zł",
        reviewer: "Wydział Infrastruktury"
      },
      {
        header: "Remont chodników ul. Główna",
        type: "Infrastruktura",
        status: "Planowane",
        target: "15.09.2025",
        limit: "850 tys. zł",
        reviewer: "Wydział Techniczny"
      },
      {
        header: "Program pomocy społecznej",
        type: "Społeczny",
        status: "Realizowane",
        target: "31.12.2025",
        limit: "1,5 mln zł",
        reviewer: "MOPS"
      },
      {
        header: "Modernizacja parku miejskiego",
        type: "Rekreacja",
        status: "W trakcie",
        target: "15.05.2025",
        limit: "950 tys. zł",
        reviewer: "Wydział Środowiska"
      }
    ];

    // Przykładowe transakcje budżetowe
    const budgetTransactions = [
      // Dochody
      {
        title: "Dotacja z budżetu państwa na infrastrukturę",
        amount: 15000000,
        category: "Dotacje",
        type: "income",
        date: "2025-01-01",
        description: "Roczna dotacja na rozwój infrastruktury drogowej i komunikacyjnej"
      },
      {
        title: "Podatek od nieruchomości",
        amount: 12500000,
        category: "Podatki",
        type: "income",
        date: "2025-01-15",
        description: "Wpływy z podatku od nieruchomości za pierwszy kwartał"
      },
      {
        title: "Subwencja oświatowa",
        amount: 8200000,
        category: "Subwencje",
        type: "income",
        date: "2025-01-10",
        description: "Subwencja na utrzymanie placówek oświatowych"
      },
      {
        title: "Opłaty za wodę i kanalizację",
        amount: 3800000,
        category: "Opłaty",
        type: "income",
        date: "2025-01-20",
        description: "Wpływy z opłat za dostarczenie wody i odprowadzanie ścieków"
      },
      {
        title: "Środki unijne - Program Rozwoju Wsi",
        amount: 5700000,
        category: "Fundusze UE",
        type: "income",
        date: "2025-01-12",
        description: "Dofinansowanie z Programu Rozwoju Obszarów Wiejskich"
      },
      
      // Wydatki
      {
        title: "Wynagrodzenia pracowników urzędu",
        amount: -2800000,
        category: "Wynagrodzenia",
        type: "expense",
        date: "2025-01-31",
        description: "Miesięczne wynagrodzenia oraz składki ZUS dla pracowników"
      },
      {
        title: "Zakup sprzętu IT dla urzędu",
        amount: -450000,
        category: "Technologia",
        type: "expense",
        date: "2025-01-15",
        description: "Komputery, drukarki i oprogramowanie dla pracowników"
      },
      {
        title: "Utrzymanie dróg gminnych",
        amount: -1200000,
        category: "Infrastruktura",
        type: "expense",
        date: "2025-01-18",
        description: "Naprawa powierzchni drogowych i czyszczenie"
      },
      {
        title: "Oświetlenie ulic - modernizacja LED",
        amount: -800000,
        category: "Infrastruktura",
        type: "expense",
        date: "2025-01-25",
        description: "Wymiana lamp na energooszczędne LED"
      },
      {
        title: "Dotacje dla organizacji pozarządowych",
        amount: -350000,
        category: "Dotacje",
        type: "expense",
        date: "2025-01-20",
        description: "Wsparcie dla lokalnych stowarzyszeń i fundacji"
      },
      {
        title: "Utrzymanie szkół podstawowych",
        amount: -2100000,
        category: "Edukacja",
        type: "expense",
        date: "2025-01-30",
        description: "Koszty utrzymania budynków szkolnych i wyposażenia"
      },
      {
        title: "Program pomocy społecznej",
        amount: -950000,
        category: "Pomoc społeczna",
        type: "expense",
        date: "2025-01-28",
        description: "Zasiłki i świadczenia dla potrzebujących mieszkańców"
      },
      {
        title: "Wywóz śmieci i utrzymanie czystości",
        amount: -650000,
        category: "Gospodarka odpadami",
        type: "expense",
        date: "2025-01-22",
        description: "Koszty wywozu śmieci i utrzymania porządku w gminie"
      }
    ];

    // Przykładowe ogłoszenia
    const announcements = [
      {
        title: "Zmiany w harmonogramie odbioru śmieci",
        content: JSON.stringify({
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Informujemy, że w związku z świętem, harmonogram odbioru śmieci ulegnie zmianie. Odpady będą odbierane o jeden dzień później niż zwykle.",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "root",
            version: 1,
          },
        }),
        priority: "high",
        status: "published",
        publishedBy: "Wydział Środowiska",
        publishDate: "2025-09-02",
        expiryDate: "2025-09-10",
        category: "Gospodarka odpadami"
      },
      {
        title: "Konsultacje budżetu obywatelskiego 2026",
        content: JSON.stringify({
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Zapraszamy wszystkich mieszkańców do udziału w konsultacjach dotyczących budżetu obywatelskiego na rok 2026. Spotkania odbędą się w sali konferencyjnej urzędu.",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "root",
            version: 1,
          },
        }),
        priority: "medium",
        status: "published",
        publishedBy: "Burmistrz",
        publishDate: "2025-09-01",
        expiryDate: "2025-09-30",
        category: "Budżet"
      },
      {
        title: "Nowe godziny pracy punktu obsługi mieszkańców",
        content: JSON.stringify({
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Od 1 września punkt obsługi mieszkańców będzie czynny w nowych godzinach: poniedziałek-piątek 7:30-15:30, sobota 8:00-12:00.",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "root",
            version: 1,
          },
        }),
        priority: "medium",
        status: "published",
        publishedBy: "Sekretarz",
        publishDate: "2025-08-31",
        category: "Administracja"
      },
      {
        title: "Festiwal Kultury Lokalnej - zapowiedź",
        content: JSON.stringify({
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "W październiku odbędzie się pierwsza edycja Festiwalu Kultury Lokalnej. Szczegóły wkrótce.",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "root",
            version: 1,
          },
        }),
        priority: "low",
        status: "draft",
        publishedBy: "Wydział Kultury",
        publishDate: "2025-09-02",
        category: "Kultura"
      }
    ];

    // Przykładowe pilne sprawy
    const urgentIssues = [
      {
        title: "Awaria oświetlenia ul. Parkowa",
        description: "Całkowita awaria oświetlenia na odcinku 200m. Mieszkańcy zgłaszają problemy z bezpieczeństwem podczas wieczornych spacerów.",
        priority: "critical",
        status: "open",
        reportedBy: "Anna Kowalska",
        assignedTo: "Wydział Infrastruktury",
        reportNumber: "2025-001234",
        deadline: "2025-01-10"
      },
      {
        title: "Uszkodzenie głównej rury wodociągowej",
        description: "Pęknięcie rury wodociągowej na skrzyżowaniu ul. Głównej i Sportowej. Konieczna natychmiastowa naprawa.",
        priority: "critical",
        status: "in_progress",
        reportedBy: "Jan Nowak",
        assignedTo: "Zakład Wodociągów",
        reportNumber: "2025-001235",
        deadline: "2025-01-08"
      },
      {
        title: "Dziura w jezdni ul. Szkolna",
        description: "Duża dziura w asfalcie powodująca zagrożenie dla kierowców. Wymaga pilnej naprawy.",
        priority: "high",
        status: "open",
        reportedBy: "Marek Wiśniewski",
        assignedTo: "Wydział Dróg",
        reportNumber: "2025-001236",
        deadline: "2025-01-15"
      }
    ];

    console.log('📊 Dodawanie projektów...');
    for (const project of projects) {
      try {
        await databases.createDocument(
          databaseId,
          'projects',
          ID.unique(),
          project
        );
        console.log(`✅ Dodano projekt: ${project.header}`);
      } catch (error) {
        console.log(`❌ Błąd przy dodawaniu projektu ${project.header}:`, error.message);
      }
    }

    console.log('🚨 Dodawanie pilnych spraw...');
    for (const issue of urgentIssues) {
      try {
        await databases.createDocument(
          databaseId,
          'urgent_issues',
          ID.unique(),
          issue
        );
        console.log(`✅ Dodano pilną sprawę: ${issue.title}`);
      } catch (error) {
        console.log(`❌ Błąd przy dodawaniu pilnej sprawy ${issue.title}:`, error.message);
      }
    }

    console.log('💰 Dodawanie transakcji budżetowych...');
    for (const transaction of budgetTransactions) {
      try {
        await databases.createDocument(
          databaseId,
          'budget_transactions',
          ID.unique(),
          transaction
        );
        console.log(`✅ Dodano transakcję: ${transaction.title}`);
      } catch (error) {
        console.log(`❌ Błąd przy dodawaniu transakcji ${transaction.title}:`, error.message);
      }
    }

    console.log('📢 Dodawanie ogłoszeń...');
    for (const announcement of announcements) {
      try {
        await databases.createDocument(
          databaseId,
          'announcements',
          ID.unique(),
          announcement
        );
        console.log(`✅ Dodano ogłoszenie: ${announcement.title}`);
      } catch (error) {
        console.log(`❌ Błąd przy dodawaniu ogłoszenia ${announcement.title}:`, error.message);
      }
    }

    console.log('📢 Dodawanie ogłoszeń...');
    for (const announcement of announcements) {
      try {
        await databases.createDocument(
          databaseId,
          'announcements',
          ID.unique(),
          announcement
        );
        console.log(`✅ Dodano ogłoszenie: ${announcement.title}`);
      } catch (error) {
        console.log(`❌ Błąd przy dodawaniu ogłoszenia ${announcement.title}:`, error.message);
      }
    }

    console.log('🎉 Inicjalizacja danych zakończona pomyślnie!');

  } catch (error) {
    console.error('❌ Błąd podczas inicjalizacji:', error);
  }
}

// Funkcja do tworzenia kolekcji (wymagane uprawnienia administratora)
async function createCollections() {
  try {
    console.log('🏗️ Tworzenie kolekcji...');

    // Kolekcja projektów
    console.log('Tworzenie kolekcji projektów...');
    // Ta operacja wymaga klucza API z uprawnieniami administratora
    // Kolekcje można utworzyć ręcznie w Appwrite Console

    console.log('📝 Instrukcje do ręcznego utworzenia kolekcji:');
    console.log('');
    console.log('1. Zaloguj się do Appwrite Console');
    console.log('2. Utwórz bazę danych o ID: "votes"');
    console.log('3. Utwórz kolekcję "projects" z następującymi atrybutami:');
    console.log('   - header (string, required)');
    console.log('   - type (string, required)');
    console.log('   - status (string, required)');
    console.log('   - target (string, required)');
    console.log('   - limit (string, required)');
    console.log('   - reviewer (string, required)');
    console.log('');
    console.log('4. Utwórz kolekcję "urgent_issues" z następującymi atrybutami:');
    console.log('   - title (string, required)');
    console.log('   - description (string, required)');
    console.log('   - priority (string, required) [low, medium, high, critical]');
    console.log('   - status (string, required) [open, in_progress, resolved, closed]');
    console.log('   - reportedBy (string, required)');
    console.log('   - assignedTo (string, optional)');
    console.log('   - reportNumber (string, required)');
    console.log('   - deadline (string, optional)');
    console.log('');
    console.log('5. Utwórz kolekcję "budget_transactions" z następującymi atrybutami:');
    console.log('   - title (string, required)');
    console.log('   - amount (float, required)');
    console.log('   - category (string, required)');
    console.log('   - type (string, required) [income, expense]');
    console.log('   - date (string, required)');
    console.log('   - description (string, optional)');
    console.log('');
    console.log('6. Utwórz kolekcję "announcements" z następującymi atrybutami:');
    console.log('   - title (string, required)');
    console.log('   - content (string, required)');
    console.log('   - priority (string, required) [low, medium, high, urgent]');
    console.log('   - status (string, required) [draft, published, archived]');
    console.log('   - publishedBy (string, required)');
    console.log('   - publishDate (string, required)');
    console.log('   - expiryDate (string, optional)');
    console.log('   - category (string, required)');
    console.log('');
    console.log('7. Ustaw uprawnienia dla wszystkich kolekcji na "users" (read, create, update, delete)');

  } catch (error) {
    console.error('❌ Błąd podczas tworzenia kolekcji:', error);
  }
}

// Sprawdź argumenty linii poleceń
if (process.argv.includes('--create-collections')) {
  createCollections();
} else if (process.argv.includes('--add-data')) {
  initializeData();
} else {
  console.log('🔧 Skrypt inicjalizacji Appwrite');
  console.log('');
  console.log('Użycie:');
  console.log('  node scripts/init-appwrite-data.js --create-collections  # Pokaż instrukcje tworzenia kolekcji');
  console.log('  node scripts/init-appwrite-data.js --add-data           # Dodaj przykładowe dane');
  console.log('');
  console.log('⚠️  Pamiętaj o ustawieniu prawidłowego klucza API w zmiennej YOUR_API_KEY');
}
