# 📧 Konfiguracja Powiadomień Email - Appwrite Messaging z Mailgun

## Przewodnik Konfiguracji

### 1. Konfiguracja Mailgun Provider w Appwrite

1. **Zaloguj się do konsoli Appwrite**
   - Przejdź do: https://cloud.appwrite.io/console
   - Wybierz swój projekt ZSS

2. **Przejdź do sekcji Messaging**
   - W menu bocznym kliknij "Messaging"
   - Kliknij "Providers"
   - Kliknij "Add Provider"

3. **Skonfiguruj Provider Mailgun**
   - Wybierz "Email" jako typ
   - Wybierz "Mailgun" jako dostawcę
   - Podaj dane konfiguracyjne:
     ```
     Provider Name: zss-mailgun
     API Key: [Twój Mailgun API Key]
     Domain: [Twoja domena Mailgun]
     From Name: ZSS - Samorząd Uczniowski
     From Email: noreply@[twoja-domena]
     ```

4. **Skopiuj Provider ID**
   - Po utworzeniu provider'a skopiuj jego ID
   - Będzie to ciąg podobny do: `655f2a1b3d4e5f6789abc123`

### 2. Aktualizacja Kodu

1. **Otwórz plik `app/lib/notifications.ts`**
2. **Znajdź linię z Provider ID:**
   ```typescript
   private static readonly MAILGUN_PROVIDER_ID = 'YOUR_MAILGUN_PROVIDER_ID';
   ```
3. **Zamień na swoje Provider ID:**
   ```typescript
   private static readonly MAILGUN_PROVIDER_ID = '655f2a1b3d4e5f6789abc123'; // Twoje rzeczywiste ID
   ```

### 3. Testowanie Funkcjonalności

1. **Utwórz nowe głosowanie**
   - Przejdź do `/vote/new`
   - Stwórz testowe głosowanie
   - Sprawdź konsolę deweloperską pod kątem logów wysyłania

2. **Sprawdź logi Appwrite**
   - W konsoli Appwrite przejdź do "Functions" > "Logs"
   - Sprawdź czy nie ma błędów związanych z Messaging

3. **Zweryfikuj dostarczenie emaili**
   - Sprawdź skrzynki odbiorczą użytkowników
   - Sprawdź folder SPAM jeśli email nie dotarł

### 4. Dostępne Funkcje Powiadomień

#### Automatyczne Powiadomienia:
- ✅ **Nowe głosowanie** - wysyłane przy utworzeniu głosowania
- ✅ **Wyniki głosowania** - wysyłane po zakończeniu głosowania
- ✅ **Przypomnienia** - wysyłane 24h i 2h przed końcem

#### Manualne Funkcje:
```typescript
import { NotificationService } from '@/lib/notifications';

// Wyślij przypomnienie
await NotificationService.sendVoteReminderNotification(vote, 2);

// Wyślij wyniki
await NotificationService.sendVoteResultsNotification(vote);

// Uruchom scheduler przypomnień (w tle)
setupVoteReminders();
```

### 5. Struktura Email Templates

#### Template: Nowe Głosowanie
- **Temat:** `🗳️ Nowe głosowanie: [Tytuł]`
- **Zawiera:** Opis, termin, link do głosowania
- **Przycisk CTA:** "Głosuj teraz"

#### Template: Przypomnienie
- **Temat:** `⏰ Przypomnienie: Głosowanie kończy się za [X]h`
- **Zawiera:** Pilną informację o pozostałym czasie
- **Przycisk CTA:** "Głosuj teraz"

#### Template: Wyniki
- **Temat:** `📊 Wyniki głosowania: [Tytuł]`
- **Zawiera:** Szczegółowe wyniki z wykresami
- **Wizualizacja:** Paski postępu dla każdej opcji

### 6. Zarządzanie Użytkownikami

Powiadomienia są wysyłane tylko do:
- ✅ Zweryfikowanych użytkowników (`isVerified: true`)
- ✅ Użytkowników z adresem email
- ✅ Niepustych adresów email

**Aby dodać użytkowników do powiadomień:**
1. Przejdź do `/users`
2. Dodaj użytkowników z adresami email
3. Zweryfikuj ich konta

### 7. Monitoring i Debugowanie

#### Logi w Konsoli:
```javascript
// Sukces
✅ Powiadomienie wysłane pomyślnie: message_id_123

// Ostrzeżenia
⚠️ Brak użytkowników z emailami do powiadomienia

// Błędy
❌ Błąd podczas wysyłania powiadomienia: error_details
```

#### Sprawdzanie Statusu:
1. **Konsola Appwrite > Messaging > Messages**
   - Zobacz listę wysłanych wiadomości
   - Sprawdź status dostarczenia

2. **Mailgun Dashboard**
   - Monitoruj statystyki dostarczenia
   - Sprawdź bounce rate i skargi

### 8. Optymalizacja

#### Limity i Koszty:
- **Appwrite Free Tier:** 30,000 requests/miesiąc
- **Mailgun Free Tier:** 5,000 emaili/miesiąc
- **Rekomendacja:** Monitoruj użycie regularnie

#### Performance:
- Emaile są wysyłane asynchronicznie
- Błędy powiadomień nie blokują głównych funkcji
- Scheduler działa w tle co godzinę

### 9. Bezpieczeństwo

#### Ochrona Danych:
- Nie przechowujemy zewnętrznych danych email
- Używamy tylko zweryfikowanych adresów
- GDPR compliance przez opt-in system

#### Best Practices:
- Regularnie czyszczenie nieaktywnych adresów
- Monitoring bounce rate
- Szybka reakcja na skargi użytkowników

---

## Szybki Start

1. **Uzyskaj Provider ID z Appwrite Messaging**
2. **Wklej do `notifications.ts`**
3. **Deploy aplikacji**
4. **Utwórz testowe głosowanie**
5. **Sprawdź dostarczenie emaili**

## Wsparcie

W przypadku problemów sprawdź:
- Logi konsoli deweloperskiej
- Status Provider'a w Appwrite
- Konfigurację Mailgun
- Correctness adresów email użytkowników

**Gotowe! 🎉**
