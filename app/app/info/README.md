# 📢 System Ogłoszeń - Dokumentacja

Nowoczesny system zarządzania ogłoszeniami firmowymi zbudowany w Next.js z integracją Appwrite.

## 🚀 Funkcje

### ✨ Główne możliwości:
- **Tablica ogłoszeń** - Przejrzysta lista wszystkich ogłoszeń z filtrowaniem
- **Aktualne ogłoszenia** - Specjalne wyróżnienie ważnych komunikatów
- **Kategorie i priorytety** - Organizacja według typu i ważności
- **Szczegółowy widok** - Pełna treść z załącznikami i metadanymi
- **Tworzenie ogłoszeń** - Intuicyjny edytor z podglądem na żywo
- **System tagów** - Łatwe kategoryzowanie i wyszukiwanie
- **Załączniki** - Wsparcie dla plików PDF, obrazów, dokumentów
- **Data wygaśnięcia** - Automatyczne archiwizowanie starych ogłoszeń

### 🎯 Funkcje zaawansowane:
- **Responsywny design** - Działa na wszystkich urządzeniach
- **Dark mode** - Automatyczne przełączanie motywów
- **Wyszukiwanie** - Pełnotekstowe wyszukiwanie w tytułach i treści
- **Filtrowanie** - Według kategorii, statusu, daty
- **Sortowanie** - Aktualne pierwsze, potem według priorytetu i daty
- **Podgląd na żywo** - Zobacz jak będzie wyglądać ogłoszenie
- **Markdown** - Proste formatowanie treści

## 📁 Struktura plików

```
/app/info/
├── page.tsx              # Lista ogłoszeń (tablica)
├── [id]/page.tsx         # Szczegóły ogłoszenia  
├── new/page.tsx          # Tworzenie nowego ogłoszenia
└── README.md             # Ta dokumentacja

/scripts/
└── setup-announcements-appwrite.js  # Konfiguracja Appwrite
```

## 🛠️ Konfiguracja Appwrite

### Krok 1: Przygotowanie
1. Upewnij się, że masz projekt Appwrite
2. Skopiuj Project ID i API Key
3. Zaktualizuj dane w `scripts/setup-announcements-appwrite.js`

### Krok 2: Instalacja zależności
```bash
cd /workspaces/zseil/app
npm install appwrite
```

### Krok 3: Uruchomienie skryptu konfiguracji
```bash
# Podstawowa konfiguracja
node scripts/setup-announcements-appwrite.js

# Z przykładowymi danymi
node scripts/setup-announcements-appwrite.js --samples
```

### Krok 4: Weryfikacja
Sprawdź w konsoli Appwrite czy zostały utworzone:
- ✅ Kolekcja `announcements` z wszystkimi atrybutami
- ✅ Indeksy dla wydajnego wyszukiwania
- ✅ Bucket `announcement-attachments` dla plików
- ✅ (Opcjonalnie) Przykładowe ogłoszenia

## 📊 Schemat danych

### Kolekcja `announcements`

| Pole | Typ | Opis |
|------|-----|------|
| `title` | String(255) | Tytuł ogłoszenia |
| `content` | String(50000) | Treść (Markdown) |
| `excerpt` | String(500) | Krótki opis |
| `author` | String(255) | Email autora |
| `authorName` | String(255) | Imię i nazwisko |
| `status` | String(50) | `current`, `archived`, `draft`, `scheduled` |
| `category` | String(50) | `general`, `urgent`, `meeting`, `system`, `hr`, `finance` |
| `priority` | String(50) | `low`, `normal`, `high`, `urgent` |
| `viewCount` | Integer | Liczba wyświetleń |
| `publishDate` | DateTime | Data publikacji |
| `expirationDate` | DateTime | Data wygaśnięcia (opcjonalna) |
| `tags` | String[] | Tagi (tablica) |
| `attachmentIds` | String[] | ID załączników |
| `isBookmarked` | Boolean | Czy w zakładkach |

### Bucket `announcement-attachments`

Przechowuje załączniki z ograniczeniami:
- **Maksymalny rozmiar**: 10MB
- **Dozwolone formaty**: JPG, PNG, PDF, DOC, DOCX, TXT, ZIP
- **Kompresja**: GZIP
- **Dostęp**: Publiczne odczyty, autoryzowani zapisywać

## 🎨 Design System

### Statusy ogłoszeń:
- **`current`** - Aktualne (wyróżnione na górze z kolorową obwódką)
- **`archived`** - Archiwalne (szare, na dole listy)
- **`draft`** - Szkice (nie wyświetlane publicznie)
- **`scheduled`** - Zaplanowane (publikacja w przyszłości)

### Priorytety z kolorami:
- **`urgent`** - Czerwony (pilne, krytyczne)
- **`high`** - Pomarańczowy (wysokie, ważne) 
- **`normal`** - Niebieski (standardowe)
- **`low`** - Szary (informacyjne)

### Kategorie z ikonami:
- **`general`** - Info (📋)
- **`urgent`** - AlertCircle (⚠️)
- **`meeting`** - Users (👥)
- **`system`** - Building (🏢)
- **`hr`** - User (👤)
- **`finance`** - Building (💼)

## 🔧 Konfiguracja uprawnień

### Domyślne uprawnienia:
```javascript
// Kolekcja announcements
"read("any")"        // Wszyscy mogą czytać
"write("users")"     // Zalogowani mogą tworzyć
"update("users")"    // Zalogowani mogą edytować
"delete("users")"    // Zalogowani mogą usuwać

// Bucket załączników  
"read("any")"        // Publiczne pobieranie załączników
"write("users")"     // Tylko zalogowani mogą dodawać
"update("users")"    // Tylko zalogowani mogą modyfikować
"delete("users")"    // Tylko zalogowani mogą usuwać
```

### Dostosowanie uprawnień:
Możesz ograniczyć uprawnienia do konkretnych ról:
```javascript
"read("any")"                    // Publiczny dostęp
"write("role:admin")"           // Tylko admini mogą tworzyć
"update("role:admin")"          // Tylko admini mogą edytować  
"delete("role:admin")"          // Tylko admini mogą usuwać
"write("role:moderator")"       // Moderatorzy też mogą tworzyć
```

## 📱 Responsywność

System jest w pełni responsywny:
- **Desktop**: Siatka 3-kolumnowa
- **Tablet**: Siatka 2-kolumnowa  
- **Mobile**: Pojedyncza kolumna
- **Dark mode**: Automatyczne przełączanie
- **Touch friendly**: Optymalizowane dla dotykowych urządzeń

## 🔍 Wyszukiwanie i filtrowanie

### Dostępne filtry:
1. **Wyszukiwanie tekstowe** - Tytuł, treść, autor, tagi
2. **Kategoria** - Wszystkie lub konkretna kategoria
3. **Status** - Aktualne, archiwalne lub wszystkie
4. **Sortowanie** - Aktualne pierwsze → priorytet → data

### Indeksy Appwrite:
- `status_index` - Szybkie filtrowanie po statusie
- `category_index` - Filtrowanie po kategorii  
- `priority_index` - Sortowanie po priorytecie
- `publish_date_index` - Sortowanie chronologiczne
- `current_announcements` - Złożony indeks dla aktualnych
- `search_title` - Pełnotekstowe wyszukiwanie w tytułach
- `search_content` - Pełnotekstowe wyszukiwanie w treści

## 🚀 Rozwój i rozbudowa

### Planowane funkcje:
- [ ] Powiadomienia push o nowych ogłoszeniach
- [ ] System komentarzy pod ogłoszeniami  
- [ ] Reakcje (👍/👎) na ogłoszenia
- [ ] Newsletter z podsumowaniem tygodnia
- [ ] API dla integracji z innymi systemami
- [ ] Analytics - statystyki wyświetleń i zaangażowania
- [ ] Szablony ogłoszeń dla częstych typów komunikatów
- [ ] Multi-język - wsparcie dla wielu języków
- [ ] Zaawansowane uprawnienia per-ogłoszenie

### Integracje:
- **Email** - Automatyczne wysyłanie ważnych ogłoszeń
- **Slack/Teams** - Powiadomienia w kanałach firmowych
- **Calendar** - Dodawanie wydarzeń ze spotkań
- **HR System** - Synchronizacja z systemem kadrowym

## 📞 Wsparcie

Jeśli masz pytania lub problemy:
1. Sprawdź logi w konsoli przeglądarki
2. Zweryfikuj konfigurację Appwrite
3. Sprawdź uprawnienia kolekcji i bucket
4. Upewnij się, że wszystkie indeksy zostały utworzone

## 📈 Monitorowanie

Zalecane metryki do śledzenia:
- **Liczba aktywnych ogłoszeń** - Ile komunikatów jest aktualnych
- **Średnia liczba wyświetleń** - Jak często użytkownicy czytają ogłoszenia  
- **Najpopularniejsze kategorie** - Jakie tematy są najczęściej poruszane
- **Czas życia ogłoszeń** - Jak długo komunikaty pozostają aktualne
- **Aktywność użytkowników** - Kto najczęściej tworzy ogłoszenia

---

*Ostatnia aktualizacja: 19 sierpnia 2025*
