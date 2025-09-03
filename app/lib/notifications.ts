"use client";

import { Client, Messaging } from 'appwrite';

// Konfiguracja Appwrite Messaging
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('687abe96000d2d31f914');

const messaging = new Messaging(client);

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  announcements: boolean;
  urgentIssues: boolean;
  budgetAlerts: boolean;
}

export class NotificationService {
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