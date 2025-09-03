# Dokładna instrukcja konfiguracji Appwrite

## Krok 1: Logowanie do Appwrite Console

1. Otwórz [https://fra.cloud.appwrite.io/console](https://fra.cloud.appwrite.io/console)
2. Zaloguj się do swojego konta lub utwórz nowe

## Krok 2: Sprawdzenie/Utworzenie projektu

1. Sprawdź czy masz projekt o ID: `687abe96000d2d31f914`
2. Jeśli nie ma - utwórz nowy projekt i zmień ID w pliku `/lib/appwrite.ts`

## Krok 3: Tworzenie bazy danych

1. W lewym menu kliknij **"Databases"**
2. Kliknij **"Create database"**
3. Wpisz:
   - **Database ID**: `votes`
   - **Name**: `Votes Database`
4. Kliknij **"Create"**

## Krok 4: Tworzenie kolekcji "projects"

1. W bazie `votes` kliknij **"Create collection"**
2. Wpisz:
   - **Collection ID**: `projects`
   - **Name**: `Projects`
3. Kliknij **"Create"**

### Dodawanie atrybutów do kolekcji "projects":

**Atrybut 1:**
- Type: **String**
- Key: `header`
- Size: `255`
- Required: ✅ (zaznacz)
- Array: ❌

**Atrybut 2:**
- Type: **String** 
- Key: `type`
- Size: `100`
- Required: ✅
- Array: ❌

**Atrybut 3:**
- Type: **String**
- Key: `status`
- Size: `100`
- Required: ✅
- Array: ❌

**Atrybut 4:**
- Type: **String**
- Key: `target`
- Size: `50`
- Required: ✅
- Array: ❌

**Atrybut 5:**
- Type: **String**
- Key: `limit`
- Size: `100`
- Required: ✅
- Array: ❌

**Atrybut 6:**
- Type: **String**
- Key: `reviewer`
- Size: `255`
- Required: ✅
- Array: ❌

## Krok 5: Tworzenie kolekcji "urgent_issues"

1. W bazie `votes` kliknij **"Create collection"** ponownie
2. Wpisz:
   - **Collection ID**: `urgent_issues`
   - **Name**: `Urgent Issues`
3. Kliknij **"Create"**

### Dodawanie atrybutów do kolekcji "urgent_issues":

**Atrybut 1:**
- Type: **String**
- Key: `title`
- Size: `255`
- Required: ✅
- Array: ❌

**Atrybut 2:**
- Type: **String**
- Key: `description`
- Size: `1000`
- Required: ✅
- Array: ❌

**Atrybut 3:**
- Type: **String**
- Key: `priority`
- Size: `20`
- Required: ✅
- Array: ❌

**Atrybut 4:**
- Type: **String**
- Key: `status`
- Size: `20`
- Required: ✅
- Array: ❌

**Atrybut 5:**
- Type: **String**
- Key: `reportedBy`
- Size: `255`
- Required: ✅
- Array: ❌

**Atrybut 6:**
- Type: **String**
- Key: `assignedTo`
- Size: `255`
- Required: ❌ (nie zaznaczaj)
- Array: ❌

**Atrybut 7:**
- Type: **String**
- Key: `reportNumber`
- Size: `50`
- Required: ✅
- Array: ❌

**Atrybut 8:**
- Type: **String**
- Key: `deadline`
- Size: `20`
- Required: ❌
- Array: ❌

## Krok 6: Tworzenie kolekcji "budget_transactions"

1. W bazie `votes` kliknij **"Create collection"** ponownie
2. Wpisz:
   - **Collection ID**: `budget_transactions`
   - **Name**: `Budget Transactions`
3. Kliknij **"Create"**

### Dodawanie atrybutów do kolekcji "budget_transactions":

**Atrybut 1:**
- Type: **String**
- Key: `title`
- Size: `255`
- Required: ✅
- Array: ❌

**Atrybut 2:**
- Type: **Float**
- Key: `amount`
- Required: ✅
- Array: ❌

**Atrybut 3:**
- Type: **String**
- Key: `category`
- Size: `100`
- Required: ✅
- Array: ❌

**Atrybut 4:**
- Type: **String**
- Key: `type`
- Size: `20`
- Required: ✅
- Array: ❌

**Atrybut 5:**
- Type: **String**
- Key: `date`
- Size: `20`
- Required: ✅
- Array: ❌

**Atrybut 6:**
- Type: **String**
- Key: `description`
- Size: `500`
- Required: ❌
- Array: ❌

## Krok 7: Tworzenie kolekcji "announcements"

1. W bazie `votes` kliknij **"Create collection"** ponownie
2. Wpisz:
   - **Collection ID**: `announcements`
   - **Name**: `Announcements`
3. Kliknij **"Create"**

### Dodawanie atrybutów do kolekcji "announcements":

**Atrybut 1:**
- Type: **String**
- Key: `title`
- Size: `255`
- Required: ✅
- Array: ❌

**Atrybut 2:**
- Type: **String**
- Key: `content`
- Size: `10000`
- Required: ✅
- Array: ❌

**Atrybut 3:**
- Type: **String**
- Key: `priority`
- Size: `20`
- Required: ✅
- Array: ❌

**Atrybut 4:**
- Type: **String**
- Key: `status`
- Size: `20`
- Required: ✅
- Array: ❌

**Atrybut 5:**
- Type: **String**
- Key: `publishedBy`
- Size: `255`
- Required: ✅
- Array: ❌

**Atrybut 6:**
- Type: **String**
- Key: `publishDate`
- Size: `20`
- Required: ✅
- Array: ❌

**Atrybut 7:**
- Type: **String**
- Key: `expiryDate`
- Size: `20`
- Required: ❌
- Array: ❌

**Atrybut 8:**
- Type: **String**
- Key: `category`
- Size: `100`
- Required: ✅
- Array: ❌

## Krok 8: Konfiguracja uprawnień

### Dla kolekcji "projects":
1. Kliknij na kolekcję **"projects"**
2. Przejdź do zakładki **"Permissions"**
3. W sekcji **"Document permissions"** kliknij **"Add a role"**
4. Wybierz **"Users"** 
5. Zaznacz wszystkie uprawnienia: **Create**, **Read**, **Update**, **Delete**
6. Kliknij **"Update"**

### Powtórz to samo dla "urgent_issues", "budget_transactions" i "announcements"

## Krok 9: Konfiguracja uwierzytelniania

1. W lewym menu kliknij **"Auth"**
2. Przejdź do zakładki **"Settings"**
3. Upewnij się że:
   - **"Auth Service"** jest włączony (przełącznik na ON)
   - **"Email/Password"** jest włączony
4. W sekcji **"Security"** → **"Domains"**
5. Dodaj `localhost:3000` do listy dozwolonych domen

## Krok 10: Dodanie przykładowych danych

### Ręczne dodanie przez Console:

**W kolekcji "projects"** kliknij **"Create document"** i dodaj:

```json
{
  "header": "Budżet na rok 2025",
  "type": "Finansowy", 
  "status": "Przyjęty",
  "target": "31.12.2024",
  "limit": "45,2 mln zł",
  "reviewer": "Skarbnik"
}
```

```json
{
  "header": "Modernizacja oświetlenia ulicznego",
  "type": "Infrastruktura",
  "status": "W trakcie", 
  "target": "30.06.2025",
  "limit": "2,8 mln zł",
  "reviewer": "Wydział Infrastruktury"
}
```

**W kolekcji "urgent_issues"** dodaj:

```json
{
  "title": "Awaria oświetlenia ul. Parkowa",
  "description": "Całkowita awaria oświetlenia na odcinku 200m",
  "priority": "critical",
  "status": "open",
  "reportedBy": "Anna Kowalska",
  "assignedTo": "Wydział Infrastruktury", 
  "reportNumber": "2025-001234",
  "deadline": "2025-01-10"
}
```

**W kolekcji "budget_transactions"** dodaj:

```json
{
  "title": "Dotacja z budżetu państwa",
  "amount": 5000000,
  "category": "Dotacje",
  "type": "income",
  "date": "2025-01-01",
  "description": "Dotacja na infrastrukturę"
}
```

```json
{
  "title": "Zakup sprzętu IT",
  "amount": -250000,
  "category": "Technologia", 
  "type": "expense",
  "date": "2025-01-15",
  "description": "Komputery dla urzędu"
}
```

**W kolekcji "announcements"** dodaj:

```json
{
  "title": "Zmiany w harmonogramie odbioru śmieci",
  "content": "{\"root\":{\"children\":[{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Informujemy, że w związku z świętem, harmonogram odbioru śmieci ulegnie zmianie.\",\"type\":\"text\",\"version\":1}],\"direction\":\"ltr\",\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1}],\"direction\":\"ltr\",\"format\":\"\",\"indent\":0,\"type\":\"root\",\"version\":1}}",
  "priority": "high",
  "status": "published",
  "publishedBy": "Wydział Środowiska",
  "publishDate": "2025-09-02",
  "expiryDate": "2025-09-10",
  "category": "Gospodarka odpadami"
}
```

## Krok 11: Testowanie

1. Uruchom aplikację: `npm run dev`
2. Otwórz `http://localhost:3000`
3. Sprawdź konsolę przeglądarki - powinna pokazać:
   ```
   Appwrite client configured: {
     endpoint: 'https://fra.cloud.appwrite.io/v1',
     projectId: '687abe96000d2d31f914'
   }
   ```
4. Sprawdź czy dane się ładują na dashboardzie
5. Przetestuj dodawanie nowego projektu i pilnej sprawy

## Rozwiązywanie problemów

**Problem**: "Collection not found"
- Sprawdź czy ID kolekcji są dokładnie takie jak w instrukcji
- Sprawdź czy wszystkie atrybuty zostały dodane

**Problem**: "Unauthorized" 
- Sprawdź uprawnienia kolekcji
- Upewnij się że `localhost:3000` jest w dozwolonych domenach

**Problem**: "User missing scopes"
- Sprawdź czy Auth service jest włączony
- Sprawdź czy Email/Password auth jest włączony
