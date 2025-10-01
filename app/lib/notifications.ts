"use client";

import { Client, Messaging, ID } from 'appwrite';

// Konfiguracja Appwrite Messaging
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('687abe96000d2d31f914');

const messaging = new Messaging(client);

// Import typów z głównego pliku appwrite
import type { Vote, VoteOption, AppUser } from './appwrite';

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  announcements: boolean;
  urgentIssues: boolean;
  budgetAlerts: boolean;
}

export class NotificationService {
  // Konfiguracja - Provider ID z Appwrite Messaging
  private static readonly MAILGUN_PROVIDER_ID = '68dd06d5001532cb38db'; // Twoje Provider ID

  /**
   * Wysyła powiadomienie email o nowym głosowaniu do wszystkich zarejestrowanych użytkowników
   */
  static async sendVoteNotification(vote: Vote): Promise<boolean> {
    try {
      console.log('📧 Rozpoczynam wysyłanie powiadomień o głosowaniu:', vote.title);
      
      // Import AppUserService dynamically to avoid circular dependency
      const { AppUserService } = await import('./appwrite');
      
      // Pobierz wszystkich zweryfikowanych użytkowników z emailami
      const users = await AppUserService.getVerifiedUsersWithEmail();
      
      if (users.length === 0) {
        console.warn('⚠️ Brak użytkowników z emailami do powiadomienia');
        return false;
      }

      // Przygotuj listę emaili
      const emails = users.map(user => user.email!);
      const targets = emails.map(email => ({ 
        userId: '', // Opcjonalnie można dodać userId jeśli masz połączenie z Appwrite Auth
        email: email 
      }));

      // Przygotuj treść emaila
      const subject = `🗳️ Nowe głosowanie: ${vote.title}`;
      const content = this.generateVoteEmailContent(vote);

      // Wyślij email przez Appwrite Messaging
      const message = await messaging.createEmail(
        ID.unique(),
        subject,
        content,
        targets,
        [], // cc  
        [], // bcc
        [], // attachments
        false, // draft
        true, // html
        new Date(Date.now() + 5000).toISOString(), // scheduledAt - wyślij za 5 sekund
        this.MAILGUN_PROVIDER_ID // Provider ID
      );

      console.log('✅ Powiadomienie wysłane pomyślnie:', message.$id);
      return true;

    } catch (error) {
      console.error('❌ Błąd podczas wysyłania powiadomienia:', error);
      return false;
    }
  }

  /**
   * Wysyła przypomnienie o końcowym terminie głosowania
   */
  static async sendVoteReminderNotification(vote: Vote, hoursLeft: number): Promise<boolean> {
    try {
      const { AppUserService } = await import('./appwrite');
      const users = await AppUserService.getVerifiedUsersWithEmail();
      const emails = users.map(user => user.email!);
      const targets = emails.map(email => ({ userId: '', email: email }));

      const subject = `⏰ Przypomnienie: Głosowanie kończy się za ${hoursLeft}h`;
      const content = this.generateVoteReminderEmailContent(vote, hoursLeft);

      const message = await messaging.createEmail(
        ID.unique(),
        subject,
        content,
        targets,
        [], // cc
        [], // bcc
        [], // attachments
        false, // draft
        true, // html
        undefined, // scheduledAt - wyślij od razu
        this.MAILGUN_PROVIDER_ID // Provider ID
      );

      console.log('✅ Przypomnienie wysłane pomyślnie:', message.$id);
      return true;
    } catch (error) {
      console.error('❌ Błąd podczas wysyłania przypomnienia:', error);
      return false;
    }
  }

  /**
   * Wysyła powiadomienie o zakończeniu głosowania z wynikami
   */
  static async sendVoteResultsNotification(vote: Vote): Promise<boolean> {
    try {
      const { AppUserService } = await import('./appwrite');
      const users = await AppUserService.getVerifiedUsersWithEmail();
      const emails = users.map(user => user.email!);
      const targets = emails.map(email => ({ userId: '', email: email }));

      const subject = `📊 Wyniki głosowania: ${vote.title}`;
      const content = this.generateVoteResultsEmailContent(vote);

      const message = await messaging.createEmail(
        ID.unique(),
        subject,
        content,
        targets,
        [], // cc
        [], // bcc
        [], // attachments
        false, // draft
        true, // html
        undefined, // scheduledAt - wyślij od razu
        this.MAILGUN_PROVIDER_ID // Provider ID
      );

      console.log('✅ Wyniki głosowania wysłane pomyślnie:', message.$id);
      return true;
    } catch (error) {
      console.error('❌ Błąd podczas wysyłania wyników:', error);
      return false;
    }
  }

  /**
   * Planuje wysyłanie przypomnień o głosowaniu
   * Wywoła to funkcja CRON lub scheduler
   */
  static async scheduleVoteReminders(): Promise<void> {
    try {
      const { VoteService } = await import('./appwrite');
      const votes = await VoteService.getAll();
      
      const now = new Date();
      
      for (const vote of votes) {
        if (VoteService.isVoteActive(vote)) {
          const deadline = new Date(vote.deadline);
          const hoursLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
          
          // Wyślij przypomnienie 24h przed końcem głosowania
          if (hoursLeft === 24) {
            await this.sendVoteReminderNotification(vote, hoursLeft);
          }
          
          // Wyślij przypomnienie 2h przed końcem głosowania
          if (hoursLeft === 2) {
            await this.sendVoteReminderNotification(vote, hoursLeft);
          }
        }
      }
    } catch (error) {
      console.error('❌ Błąd podczas planowania przypomnień:', error);
    }
  }

  /**
   * Generuje treść HTML dla powiadomienia o nowym głosowaniu
   */
  private static generateVoteEmailContent(vote: Vote): string {
    const deadline = new Date(vote.deadline).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; color: #3b82f6; margin-bottom: 30px; }
            .content { color: #333; line-height: 1.6; }
            .vote-info { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
            .deadline { color: #dc2626; font-weight: bold; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🗳️ Nowe Głosowanie</h1>
            </div>
            
            <div class="content">
              <p>Witaj!</p>
              <p>Informujemy o rozpoczęciu nowego głosowania w samorządzie uczniowskim:</p>
              
              <div class="vote-info">
                <h2>${vote.title}</h2>
                <p><strong>Kategoria:</strong> ${vote.category}</p>
                <p><strong>Opis:</strong> ${vote.description}</p>
                <p class="deadline"><strong>Termin zakończenia:</strong> ${deadline}</p>
                ${vote.isAnonymous ? '<p><em>🔒 Głosowanie anonimowe</em></p>' : ''}
              </div>
              
              <p>Aby oddać swój głos, zaloguj się do systemu ZSS:</p>
              <a href="https://zssr.vercel.app/vote/${(vote as any).$id}" class="button">
                Głosuj teraz
              </a>
              
              <p>Twój udział w głosowaniu jest ważny dla naszej społeczności szkolnej!</p>
            </div>
            
            <div class="footer">
              <p>Wiadomość została wysłana automatycznie przez system ZSS - Samorząd Uczniowski</p>
              <p>Jeśli masz pytania, skontaktuj się z samorządem uczniowskim.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generuje treść HTML dla przypomnienia o głosowaniu
   */
  private static generateVoteReminderEmailContent(vote: Vote, hoursLeft: number): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; color: #f59e0b; margin-bottom: 30px; }
            .urgent { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
            .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Przypomnienie o Głosowaniu</h1>
            </div>
            
            <div class="urgent">
              <h2>${vote.title}</h2>
              <p><strong>🚨 Uwaga!</strong> Głosowanie kończy się za <strong>${hoursLeft} godzin${hoursLeft === 1 ? 'ę' : hoursLeft < 5 ? 'y' : ''}</strong>!</p>
            </div>
            
            <p>Jeśli jeszcze nie oddałeś swojego głosu, zrób to teraz:</p>
            <a href="https://zssr.vercel.app/vote/${(vote as any).$id}" class="button">
              Głosuj teraz
            </a>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generuje treść HTML dla wyników głosowania
   */
  private static generateVoteResultsEmailContent(vote: Vote): string {
    const results = JSON.parse(vote.results);
    const options = JSON.parse(vote.options) as VoteOption[];
    
    let resultsHtml = '';
    options.forEach(option => {
      const count = results[option.value.toString()] || 0;
      const percentage = vote.totalVotes > 0 ? Math.round((count / vote.totalVotes) * 100) : 0;
      resultsHtml += `
        <div style="margin: 10px 0; padding: 10px; background: #f8fafc; border-radius: 6px;">
          <strong>${option.label}:</strong> ${count} głosów (${percentage}%)
          <div style="background: #e5e7eb; height: 8px; border-radius: 4px; margin-top: 5px;">
            <div style="background: #3b82f6; height: 8px; width: ${percentage}%; border-radius: 4px;"></div>
          </div>
        </div>
      `;
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; color: #059669; margin-bottom: 30px; }
            .results { background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #059669; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Wyniki Głosowania</h1>
            </div>
            
            <h2>${vote.title}</h2>
            <p><strong>Łączna liczba głosów:</strong> ${vote.totalVotes}</p>
            
            <div class="results">
              <h3>Wyniki:</h3>
              ${resultsHtml}
            </div>
            
            <p>Dziękujemy wszystkim za udział w głosowaniu!</p>
          </div>
        </body>
      </html>
    `;
  }
  private static getSettings(): NotificationSettings {
    if (typeof window === 'undefined') {
      return {
        emailNotifications: true,
        pushNotifications: false,
        announcements: true,
        urgentIssues: true,
        budgetAlerts: false,
      };
    }

    const stored = localStorage.getItem('zss-settings');
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        return settings.notifications || {
          emailNotifications: true,
          pushNotifications: false,
          announcements: true,
          urgentIssues: true,
          budgetAlerts: false,
        };
      } catch {
        return {
          emailNotifications: true,
          pushNotifications: false,
          announcements: true,
          urgentIssues: true,
          budgetAlerts: false,
        };
      }
    }

    return {
      emailNotifications: true,
      pushNotifications: false,
      announcements: true,
      urgentIssues: true,
      budgetAlerts: false,
    };
  }

  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Powiadomienia nie są obsługiwane w tej przeglądarce');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  static async sendBrowserNotification(
    title: string, 
    body: string, 
    options?: {
      icon?: string;
      badge?: string;
      tag?: string;
      data?: any;
    }
  ) {
    const settings = this.getSettings();
    
    if (!settings.pushNotifications) {
      console.log('Powiadomienia push są wyłączone w ustawieniach');
      return;
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.log('Brak uprawnień do powiadomień');
      return;
    }

    const notification = new Notification(title, {
      body,
      icon: options?.icon || '/favicon.ico',
      badge: options?.badge || '/favicon.ico',
      tag: options?.tag,
      data: options?.data,
      requireInteraction: false,
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    notification.onclick = () => {
      window.focus();
      notification.close();
      
      // Navigate to specific page if data contains URL
      if (options?.data?.url) {
        window.location.href = options.data.url;
      }
    };

    return notification;
  }

  static async sendEmailNotification(
    recipients: string[],
    subject: string,
    content: string,
    type: 'announcement' | 'urgent_issue' | 'budget_alert' = 'announcement'
  ) {
    const settings = this.getSettings();
    
    // Check if email notifications are enabled for this type
    if (!settings.emailNotifications) {
      console.log('Powiadomienia email są wyłączone');
      return;
    }

    if (type === 'announcement' && !settings.announcements) {
      console.log('Powiadomienia o ogłoszeniach są wyłączone');
      return;
    }

    if (type === 'urgent_issue' && !settings.urgentIssues) {
      console.log('Powiadomienia o pilnych sprawach są wyłączone');
      return;
    }

    if (type === 'budget_alert' && !settings.budgetAlerts) {
      console.log('Alerty budżetowe są wyłączone');
      return;
    }

    try {
      // W rzeczywistej implementacji użyj Appwrite Messaging
      // await messaging.createEmail(
      //   'email_template_id',
      //   subject,
      //   content,
      //   recipients
      // );
      
      console.log('📧 Email notification would be sent:', {
        recipients,
        subject,
        content,
        type
      });
      
      return true;
    } catch (error) {
      console.error('Błąd podczas wysyłania powiadomienia email:', error);
      return false;
    }
  }

  static async notifyNewAnnouncement(
    title: string,
    excerpt: string,
    priority: 'low' | 'medium' | 'high' | 'urgent',
    announcementId: string
  ) {
    const settings = this.getSettings();
    
    if (!settings.announcements) {
      return;
    }

    // Browser notification
    if (settings.pushNotifications) {
      const urgentText = priority === 'urgent' ? '🚨 PILNE: ' : '';
      await this.sendBrowserNotification(
        `${urgentText}Nowe ogłoszenie`,
        `${title}\n\n${excerpt}`,
        {
          tag: `announcement-${announcementId}`,
          data: {
            url: `/inbox`,
            type: 'announcement',
            id: announcementId
          }
        }
      );
    }

    // Email notification (przykład - w rzeczywistości pobrałbyś listę użytkowników z bazy)
    if (settings.emailNotifications) {
      const recipients = ['admin@example.com']; // Pobierz z bazy danych
      await this.sendEmailNotification(
        recipients,
        `Nowe ogłoszenie: ${title}`,
        `Zostało opublikowane nowe ogłoszenie:\n\n${title}\n\n${excerpt}\n\nZaloguj się do systemu, aby przeczytać pełną treść.`,
        'announcement'
      );
    }
  }

  static async notifyUrgentIssue(
    title: string,
    description: string,
    priority: 'low' | 'medium' | 'high' | 'critical',
    issueId: string
  ) {
    const settings = this.getSettings();
    
    if (!settings.urgentIssues) {
      return;
    }

    const isCritical = priority === 'critical';

    // Browser notification
    if (settings.pushNotifications) {
      const urgentText = isCritical ? '🚨 KRYTYCZNE: ' : '⚠️ ';
      await this.sendBrowserNotification(
        `${urgentText}Pilna sprawa`,
        `${title}\n\n${description}`,
        {
          tag: `urgent-issue-${issueId}`,
          data: {
            url: `/urgent`,
            type: 'urgent_issue',
            id: issueId
          }
        }
      );
    }

    // Email notification for critical issues
    if (settings.emailNotifications && isCritical) {
      const recipients = ['admin@example.com']; // Pobierz z bazy danych
      await this.sendEmailNotification(
        recipients,
        `🚨 KRYTYCZNA SPRAWA: ${title}`,
        `Zgłoszono krytyczną sprawę wymagającą natychmiastowej uwagi:\n\n${title}\n\n${description}\n\nZaloguj się do systemu, aby zarządzać sprawą.`,
        'urgent_issue'
      );
    }
  }

  static async notifyBudgetAlert(
    type: 'overspend' | 'limit_warning',
    amount: number,
    limit: number,
    category?: string
  ) {
    const settings = this.getSettings();
    
    if (!settings.budgetAlerts) {
      return;
    }

    const percentage = Math.round((amount / limit) * 100);
    const isOverspend = type === 'overspend';

    // Browser notification
    if (settings.pushNotifications) {
      const icon = isOverspend ? '🔴' : '⚠️';
      const title = isOverspend 
        ? `${icon} Przekroczenie budżetu`
        : `${icon} Ostrzeżenie budżetowe`;
      
      const body = category
        ? `Kategoria: ${category}\nWydano: ${amount.toLocaleString('pl-PL')} zł\nLimit: ${limit.toLocaleString('pl-PL')} zł\nProcentowo: ${percentage}%`
        : `Wydano: ${amount.toLocaleString('pl-PL')} zł\nLimit: ${limit.toLocaleString('pl-PL')} zł\nProcentowo: ${percentage}%`;

      await this.sendBrowserNotification(title, body, {
        tag: `budget-alert-${Date.now()}`,
        data: {
          url: '/budget',
          type: 'budget_alert'
        }
      });
    }

    // Email notification for overspend
    if (settings.emailNotifications && isOverspend) {
      const recipients = ['admin@example.com']; // Pobierz z bazy danych
      await this.sendEmailNotification(
        recipients,
        `🔴 Przekroczenie budżetu${category ? ` - ${category}` : ''}`,
        `Wykryto przekroczenie budżetu:\n\n${category ? `Kategoria: ${category}\n` : ''}Wydano: ${amount.toLocaleString('pl-PL')} zł\nLimit: ${limit.toLocaleString('pl-PL')} zł\nPrzekreczenie: ${percentage - 100}%\n\nZaloguj się do systemu, aby przejrzeć szczegóły.`,
        'budget_alert'
      );
    }
  }

  static async testNotification() {
    await this.sendBrowserNotification(
      'Test powiadomienia ZSS',
      'To jest testowe powiadomienie z systemu ZSS. Jeśli je widzisz, powiadomienia działają poprawnie!',
      {
        tag: 'test-notification',
        data: {
          url: '/settings',
          type: 'test'
        }
      }
    );
  }
}

/**
 * Hook do automatycznego wysyłania przypomnień
 * Można to wywołać w CRON job lub schedulerze
 */
export const setupVoteReminders = () => {
  // Sprawdzaj co godzinę
  setInterval(async () => {
    await NotificationService.scheduleVoteReminders();
  }, 60 * 60 * 1000); // 1 godzina
};