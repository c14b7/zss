# ZSS - System Zarządzania Zespołem Szkolno-Sportowym

![ZSS Logo](https://via.placeholder.com/150x75/3b82f6/ffffff?text=ZSS)

## 📋 Opis projektu

ZSS to nowoczesny, kompleksowy system zarządzania dla zespołów szkolno-sportowych. Aplikacja umożliwia efektywne zarządzanie członkami, organizację głosowań, śledzenie budżetu, publikowanie ogłoszeń oraz wiele innych funkcjonalności niezbędnych w codziennej pracy organizacji sportowej.

### ✨ Główne funkcjonalności

- **👥 Zarządzanie użytkownikami** - Kompleksny system członków z niestandardowymi polami
- **🗳️ System głosowań** - Organizacja i przeprowadzanie głosowań online
- **💰 Zarządzanie budżetem** - Śledzenie przychodów, wydatków i transakcji
- **📢 Ogłoszenia** - Publikowanie i zarządzanie ogłoszeniami z systemem priorytetów
- **📊 Dashboard analityczny** - Przejrzysty przegląd kluczowych metryk
- **🔔 System powiadomień** - Automatyczne powiadomienia o ważnych wydarzeniach
- **📱 Aplikacja PWA** - Możliwość instalacji na urządzeniach mobilnych
- **🌙 Tryb ciemny/jasny** - Dostosowywalne motywy kolorystyczne

## 🚀 Technologie

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Appwrite (Database, Authentication, Storage)
- **Ikony**: Lucide React, Tabler Icons
- **Powiadomienia**: Appwrite Messaging
- **PWA**: Natywne wsparcie Next.js

## 📦 Instalacja i uruchomienie

### Wymagania wstępne

- Node.js 18+ 
- npm lub yarn
- Konto Appwrite (darmowe na [cloud.appwrite.io](https://cloud.appwrite.io))

### 1. Sklonowanie repozytorium

```bash
git clone https://github.com/c14b7/zss.git
cd zss/app
```

### 2. Instalacja zależności

```bash
npm install
```

### 3. Konfiguracja Appwrite

1. Utwórz nowy projekt w [Appwrite Console](https://cloud.appwrite.io)
2. Skopiuj Project ID i zaktualizuj w pliku `lib/appwrite.ts`
3. Uruchom skrypty konfiguracyjne:

```bash
# Podstawowa konfiguracja
node scripts/init-appwrite-data.js

# Konfiguracja systemu użytkowników
node scripts/setup-users-appwrite.js --samples

# Konfiguracja ogłoszeń
node scripts/setup-announcements-appwrite.js --samples
```

### 4. Uruchomienie aplikacji

```bash
# Środowisko deweloperskie
npm run dev

# Budowanie produkcyjne
npm run build
npm start
```

Aplikacja będzie dostępna pod adresem `http://localhost:3000`

## 📚 Struktura projektu

```
app/
├── app/                    # Główny kod aplikacji (App Router)
│   ├── api/               # API Routes (Next.js)
│   ├── dashboard/         # Strona główna dashboard
│   ├── users/             # Zarządzanie użytkownikami
│   ├── vote/              # System głosowań
│   ├── budget/            # Zarządzanie budżetem
│   ├── settings/          # Ustawienia aplikacji
│   └── ...
├── components/            # Komponenty wielokrotnego użytku
│   ├── ui/               # Podstawowe komponenty UI
│   ├── auth/             # Komponenty uwierzytelniania
│   └── ...
├── lib/                  # Biblioteki i konfiguracje
│   ├── appwrite.ts       # Konfiguracja Appwrite
│   └── utils.ts          # Funkcje pomocnicze
├── public/               # Zasoby statyczne
│   ├── icons/           # Ikony PWA
│   └── manifest.json     # Manifest PWA
└── scripts/              # Skrypty konfiguracyjne
```

## 🔧 Konfiguracja Appwrite

### Kolekcje w bazie danych

System wymaga następujących kolekcji w bazie `votes`:

1. **users** - Członkowie zespołu
2. **user_custom_columns** - Niestandardowe pola użytkowników
3. **projects** - Projekty i inicjatywy
4. **urgent_issues** - Pilne sprawy do załatwienia
5. **budget_transactions** - Transakcje budżetowe
6. **announcements** - Ogłoszenia systemowe

### Uprawnienia

Wszystkie kolekcje powinny mieć uprawnienia dla ról:
- **Users**: Read, Create, Update, Delete

Szczegółowe instrukcje konfiguracji znajdziesz w pliku [APPWRITE_SETUP.md](./APPWRITE_SETUP.md)

## 👤 System użytkowników

### Funkcjonalności

- **Lista członków** - Przejrzysty widok wszystkich członków
- **Dodawanie nowych członków** - Formularz z walidacją
- **Niestandardowe pola** - Możliwość dodawania własnych kolumn (tekst, liczba, checkbox)
- **Widoki** - Przełączanie między widokiem kart i tabeli
- **Grupy i funkcje** - Organizacja członków według ról

### Dodawanie nowego członka

1. Przejdź do sekcji "Użytkownicy"
2. Kliknij przycisk "Dodaj członka"
3. Wypełnij wymagane pola (imię, nazwisko, grupa)
4. Opcjonalnie dodaj funkcję, email, telefon i notatki
5. Zapisz nowego członka

## 🔔 System powiadomień

### Typy powiadomień

- **Email** - Powiadomienia na adres email
- **Push** - Powiadomienia w przeglądarce
- **Nowe ogłoszenia** - Automatyczne przy publikacji
- **Pilne sprawy** - Natychmiastowe dla krytycznych problemów
- **Alerty budżetowe** - Przy przekroczeniu limitów

### Konfiguracja

Powiadomienia konfiguruje się w sekcji "Ustawienia" > "Powiadomienia"

## 📱 Aplikacja PWA

### Instalacja na urządzeniu

1. Otwórz aplikację w przeglądarce
2. Przejdź do "Ustawienia"
3. Kliknij "Zainstaluj aplikację ZSS"
4. Postępuj zgodnie z instrukcjami przeglądarki

### Funkcjonalności offline

- Podstawowa nawigacja
- Cache kluczowych zasobów
- Lokalne przechowywanie ustawień

## 🎨 Personalizacja

### Motywy kolorystyczne

- **Jasny** - Domyślny jasny motyw
- **Ciemny** - Motyw dla pracy w nocy
- **Systemowy** - Automatyczne dostosowanie do ustawień systemu

### Ustawienia

Wszystkie preferencje użytkownika można skonfigurować w sekcji "Ustawienia"

## 🤝 Wsparcie i kontakt

### Dokumentacja

- [Instrukcja konfiguracji Appwrite](./APPWRITE_SETUP.md)
- [API Reference](./docs/api.md)
- [Przewodnik developera](./docs/development.md)

### Zgłaszanie problemów

Problemy i sugestie można zgłaszać przez [GitHub Issues](https://github.com/c14b7/zss/issues)

### Licencja

Projekt udostępniony na licencji MIT. Zobacz plik [LICENSE](./LICENSE) po szczegóły.

---

**ZSS - Zespół Szkolno-Sportowy** 🏆
*Nowoczesne zarządzanie dla nowoczesnych zespołów*