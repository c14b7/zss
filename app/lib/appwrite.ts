"use client";

import { Client, Databases, ID, Query, Messaging, type Models } from 'appwrite';

// Konfiguracja Appwrite
const endpoint = 'https://fra.cloud.appwrite.io/v1';
const projectId = '687abe96000d2d31f914';
const databaseId = 'votes'; // ID głównej bazy danych
const projectsCollectionId = 'projects'; // ID kolekcji projektów
const urgentIssuesCollectionId = 'urgent_issues'; // ID kolekcji pilnych spraw
const budgetTransactionsCollectionId = 'budget_transactions'; // ID kolekcji transakcji budżetowych
const announcementsCollectionId = 'announcements'; // ID kolekcji ogłoszeń
const votesCollectionId = 'votes'; // ID kolekcji głosowań
const usersCollectionId = 'users'; // ID kolekcji użytkowników

// Inicjalizacja klienta
const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

const databases = new Databases(client);
const messaging = new Messaging(client);

// Typy danych bazujące na Appwrite Models
export interface Project extends Models.Document {
  id: number; // Dodane dla kompatybilności z DataTable
  header: string;
  type: string;
  status: string;
  target: string;
  limit: string;
  reviewer: string;
}

export interface UrgentIssue extends Models.Document {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  reportedBy: string;
  assignedTo?: string;
  reportNumber: string;
  deadline?: string;
}

export interface BudgetTransaction extends Models.Document {
  title: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
  description?: string;
}

export interface Announcement extends Models.Document {
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'published' | 'archived';
  publishedBy: string;
  publishDate: string;
  expiryDate?: string;
  category: string;
}

export interface Vote extends Models.Document {
  title: string;
  description: string;
  category: string;
  options: string; // JSON string of VoteOption[]
  deadline: string;
  expirationTime?: string; // New: specific time for voting expiration
  totalVotes: number;
  results: string; // JSON string of Record<string, number>
  isAnonymous: boolean;
  voters: string; // JSON string of string[]
  isFinished: boolean; // New: manual end voting capability
  endedBy?: string; // New: who manually ended the voting
  endedAt?: string; // New: when it was manually ended
  createdBy: string;
}

export interface VoteOption {
  value: number;
  label: string;
  description: string;
  variant: "default" | "destructive" | "outline";
}

export interface AppUser extends Models.Document {
  firstName: string;
  lastName: string;
  function?: string;
  group: string;
  email?: string;
  phone?: string;
  notes?: string;
  isVerified: boolean; // New: verification status
  verifiedBy?: string; // New: who verified this user
  verifiedAt?: string; // New: when user was verified
}

export interface DashboardStats {
  budget: {
    total: number;
    spent: number;
    percentage: number;
  };
  cases: {
    total: number;
    avgTime: number;
    change: number;
  };
  projects: {
    active: number;
    totalValue: number;
    growth: number;
  };
}

// Service dla projektów
export class ProjectService {
  static async getAll(): Promise<Project[]> {
    try {
      const response = await databases.listDocuments(
        databaseId,
        projectsCollectionId,
        [Query.orderDesc('$createdAt')]
      );
      
      // Konwertuj dokumenty Appwrite na nasze typy i dodaj id dla DataTable
      return response.documents.map((doc, index) => ({
        ...(doc as unknown as Project),
        id: index + 1, // Dodajemy numeryczne id dla DataTable
      }));
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  static async create(project: Omit<Project, '$id' | 'id' | '$createdAt' | '$updatedAt' | '$permissions' | '$collectionId' | '$databaseId'>): Promise<Project | null> {
    try {
      const response = await databases.createDocument(
        databaseId,
        projectsCollectionId,
        ID.unique(),
        project as any
      );
      return { ...(response as unknown as Project), id: 1 };
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  }

  static async update(id: string, project: Partial<Omit<Project, '$id' | 'id' | '$createdAt' | '$updatedAt' | '$permissions' | '$collectionId' | '$databaseId'>>): Promise<Project | null> {
    try {
      const response = await databases.updateDocument(
        databaseId,
        projectsCollectionId,
        id,
        project as any
      );
      return { ...(response as unknown as Project), id: 1 };
    } catch (error) {
      console.error('Error updating project:', error);
      return null;
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      await databases.deleteDocument(databaseId, projectsCollectionId, id);
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }
}

// Service dla pilnych spraw
export class UrgentIssueService {
  static async getAll(): Promise<UrgentIssue[]> {
    try {
      const response = await databases.listDocuments(
        databaseId,
        urgentIssuesCollectionId,
        [Query.orderDesc('$createdAt')]
      );
      return response.documents as unknown as UrgentIssue[];
    } catch (error) {
      console.error('Error fetching urgent issues:', error);
      return [];
    }
  }

  static async getByStatus(status: string): Promise<UrgentIssue[]> {
    try {
      const response = await databases.listDocuments(
        databaseId,
        urgentIssuesCollectionId,
        [Query.equal('status', status), Query.orderDesc('$createdAt')]
      );
      return response.documents as unknown as UrgentIssue[];
    } catch (error) {
      console.error('Error fetching urgent issues by status:', error);
      return [];
    }
  }

  static async getByPriority(priority: string): Promise<UrgentIssue[]> {
    try {
      const response = await databases.listDocuments(
        databaseId,
        urgentIssuesCollectionId,
        [Query.equal('priority', priority), Query.orderDesc('$createdAt')]
      );
      return response.documents as unknown as UrgentIssue[];
    } catch (error) {
      console.error('Error fetching urgent issues by priority:', error);
      return [];
    }
  }

  static async create(issue: Omit<UrgentIssue, '$id' | '$createdAt' | '$updatedAt' | '$permissions' | '$collectionId' | '$databaseId' | '$sequence'>): Promise<UrgentIssue | null> {
    try {
      const response = await databases.createDocument(
        databaseId,
        urgentIssuesCollectionId,
        ID.unique(),
        issue as any
      );
      return response as unknown as UrgentIssue;
    } catch (error) {
      console.error('Error creating urgent issue:', error);
      return null;
    }
  }

  static async update(id: string, issue: Partial<Omit<UrgentIssue, '$id' | '$createdAt' | '$updatedAt' | '$permissions' | '$collectionId' | '$databaseId' | '$sequence'>>): Promise<UrgentIssue | null> {
    try {
      const response = await databases.updateDocument(
        databaseId,
        urgentIssuesCollectionId,
        id,
        issue as any
      );
      return response as unknown as UrgentIssue;
    } catch (error) {
      console.error('Error updating urgent issue:', error);
      return null;
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      await databases.deleteDocument(databaseId, urgentIssuesCollectionId, id);
      return true;
    } catch (error) {
      console.error('Error deleting urgent issue:', error);
      return false;
    }
  }

  // Generowanie numeru zgłoszenia
  static generateReportNumber(): string {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `${year}-${timestamp}`;
  }
}

// Service dla transakcji budżetowych
export class BudgetTransactionService {
  static async getAll(): Promise<BudgetTransaction[]> {
    try {
      const response = await databases.listDocuments(
        databaseId,
        budgetTransactionsCollectionId,
        [Query.orderDesc('date')]
      );
      
      return response.documents as unknown as BudgetTransaction[];
    } catch (error) {
      console.error('Error fetching budget transactions:', error);
      return [];
    }
  }

  static async create(transaction: Omit<BudgetTransaction, '$id' | '$createdAt' | '$updatedAt' | '$permissions' | '$collectionId' | '$databaseId'>): Promise<BudgetTransaction | null> {
    try {
      const response = await databases.createDocument(
        databaseId,
        budgetTransactionsCollectionId,
        ID.unique(),
        transaction as any
      );
      return response as unknown as BudgetTransaction;
    } catch (error) {
      console.error('Error creating budget transaction:', error);
      return null;
    }
  }

  static async getBudgetSummary(): Promise<{ total: number; spent: number; income: number; expenses: number }> {
    try {
      const transactions = await this.getAll();
      
      let income = 0;
      let expenses = 0;
      
      transactions.forEach(transaction => {
        if (transaction.type === 'income') {
          income += transaction.amount;
        } else {
          expenses += Math.abs(transaction.amount); // Upewniamy się że expenses są pozytywne
        }
      });
      
      const total = income;
      const spent = expenses;
      
      return { total, spent, income, expenses };
    } catch (error) {
      console.error('Error calculating budget summary:', error);
      return { total: 45200000, spent: 35256000, income: 45200000, expenses: 35256000 };
    }
  }
}

// Service dla statystyk dashboard
export class DashboardService {
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Pobieramy rzeczywiste dane z Appwrite
      const [projects, urgentIssues, budgetSummary] = await Promise.all([
        ProjectService.getAll(),
        UrgentIssueService.getAll(),
        BudgetTransactionService.getBudgetSummary()
      ]);

      // Konwertujemy limity projektów na liczby i sumujemy
      const totalProjectValue = projects.reduce((sum, project) => {
        // Próbujemy wyciągnąć liczbę z tekstu typu "45,2 mln zł"
        const limitMatch = project.limit.match(/(\d+[,.]?\d*)/);
        if (limitMatch) {
          const value = parseFloat(limitMatch[1].replace(',', '.'));
          // Jeśli w stringu jest "mln", mnożymy przez milion
          if (project.limit.includes('mln')) {
            return sum + (value * 1000000);
          }
          // Jeśli w stringu jest "tys", mnożymy przez tysiąc
          else if (project.limit.includes('tys')) {
            return sum + (value * 1000);
          }
          return sum + value;
        }
        return sum;
      }, 0);

      const activeProjects = projects.filter(p => 
        p.status.toLowerCase().includes('trakcie') || 
        p.status.toLowerCase().includes('realizacji') ||
        p.status.toLowerCase().includes('progress')
      ).length;

      const criticalIssues = urgentIssues.filter(issue => 
        issue.priority === 'critical' && issue.status === 'open'
      ).length;

      const budgetPercentage = budgetSummary.total > 0 
        ? Math.round((budgetSummary.spent / budgetSummary.total) * 100)
        : 0;

      return {
        budget: {
          total: budgetSummary.total,
          spent: budgetSummary.spent,
          percentage: budgetPercentage
        },
        cases: {
          total: urgentIssues.length,
          avgTime: 3.2, // Można rozszerzyć o kalkulację na podstawie dat
          change: criticalIssues > 0 ? criticalIssues : -5.3
        },
        projects: {
          active: activeProjects,
          totalValue: totalProjectValue,
          growth: activeProjects > 0 ? 15.8 : 0 // Pozytywny wzrost jeśli są aktywne projekty
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Fallback do statycznych danych
      return {
        budget: {
          total: 45200000,
          spent: 35256000,
          percentage: 78
        },
        cases: {
          total: 1247,
          avgTime: 3.2,
          change: -5.3
        },
        projects: {
          active: 0,
          totalValue: 0,
          growth: 0
        }
      };
    }
  }
}

// Service dla ogłoszeń
export class AnnouncementService {
  static async getAll(): Promise<Announcement[]> {
    try {
      const response = await databases.listDocuments(
        databaseId,
        announcementsCollectionId,
        [Query.orderDesc('publishDate')]
      );
      
      return response.documents as unknown as Announcement[];
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  }

  static async getPublished(): Promise<Announcement[]> {
    try {
      const response = await databases.listDocuments(
        databaseId,
        announcementsCollectionId,
        [
          Query.equal('status', 'published'),
          Query.orderDesc('publishDate')
        ]
      );
      
      return response.documents as unknown as Announcement[];
    } catch (error) {
      console.error('Error fetching published announcements:', error);
      return [];
    }
  }

  static async getByPriority(priority: 'low' | 'medium' | 'high' | 'urgent'): Promise<Announcement[]> {
    try {
      const response = await databases.listDocuments(
        databaseId,
        announcementsCollectionId,
        [
          Query.equal('priority', priority),
          Query.equal('status', 'published'),
          Query.orderDesc('publishDate')
        ]
      );
      
      return response.documents as unknown as Announcement[];
    } catch (error) {
      console.error(`Error fetching ${priority} announcements:`, error);
      return [];
    }
  }

  static async create(announcement: Omit<Announcement, keyof Models.Document>): Promise<Announcement | null> {
    try {
      const response = await databases.createDocument(
        databaseId,
        announcementsCollectionId,
        ID.unique(),
        announcement as any
      );
      return response as unknown as Announcement;
    } catch (error) {
      console.error('Error creating announcement:', error);
      return null;
    }
  }

  static async update(id: string, announcement: Partial<Omit<Announcement, keyof Models.Document>>): Promise<Announcement | null> {
    try {
      const response = await databases.updateDocument(
        databaseId,
        announcementsCollectionId,
        id,
        announcement as any
      );
      return response as unknown as Announcement;
    } catch (error) {
      console.error('Error updating announcement:', error);
      return null;
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      await databases.deleteDocument(databaseId, announcementsCollectionId, id);
      return true;
    } catch (error) {
      console.error('Error deleting announcement:', error);
      return false;
    }
  }
}

import { AnnouncementService } from './appwrite';
import { NotificationService } from './notifications';

// Extended Announcement Service with automatic notifications
export class AnnouncementServiceWithNotifications extends AnnouncementService {
  static async create(announcement: Parameters<typeof AnnouncementService.create>[0]) {
    const result = await super.create(announcement);
    
    if (result && announcement.status === 'published') {
      // Send automatic notification when announcement is published
      await NotificationService.notifyNewAnnouncement(
        announcement.title,
        announcement.content.substring(0, 200) + '...',
        announcement.priority,
        result.$id
      );
    }
    
    return result;
  }

  static async update(id: string, announcement: Parameters<typeof AnnouncementService.update>[1]) {
    const result = await super.update(id, announcement);
    
    // If status changed to published, send notification
    if (result && announcement.status === 'published') {
      await NotificationService.notifyNewAnnouncement(
        result.title,
        result.content.substring(0, 200) + '...',
        result.priority,
        result.$id
      );
    }
    
    return result;
  }
}

// Service dla głosowań
export class VoteService {
  static async getAll(): Promise<Vote[]> {
    try {
      const response = await databases.listDocuments(
        databaseId,
        votesCollectionId,
        [Query.orderDesc('$createdAt')]
      );
      return response.documents as unknown as Vote[];
    } catch (error) {
      console.error('Error fetching votes:', error);
      return [];
    }
  }

  static async getById(id: string): Promise<Vote | null> {
    try {
      const response = await databases.getDocument(
        databaseId,
        votesCollectionId,
        id
      );
      return response as unknown as Vote;
    } catch (error) {
      console.error('Error fetching vote:', error);
      return null;
    }
  }

  static async create(vote: Omit<Vote, keyof Models.Document>): Promise<Vote | null> {
    try {
      const response = await databases.createDocument(
        databaseId,
        votesCollectionId,
        ID.unique(),
        vote as any
      );
      
      const createdVote = response as unknown as Vote;
      
      // Automatycznie wyślij powiadomienie o nowym głosowaniu
      try {
        const { NotificationService } = await import('./notifications');
        await NotificationService.sendVoteNotification(createdVote);
        console.log('✅ Powiadomienie o głosowaniu wysłane');
      } catch (notificationError) {
        console.error('⚠️ Błąd podczas wysyłania powiadomienia:', notificationError);
        // Nie przerywamy procesu tworzenia głosowania jeśli powiadomienie się nie powiodło
      }
      
      return createdVote;
    } catch (error) {
      console.error('Error creating vote:', error);
      return null;
    }
  }

  static async update(id: string, vote: Partial<Omit<Vote, keyof Models.Document>>): Promise<Vote | null> {
    try {
      const response = await databases.updateDocument(
        databaseId,
        votesCollectionId,
        id,
        vote as any
      );
      return response as unknown as Vote;
    } catch (error) {
      console.error('Error updating vote:', error);
      return null;
    }
  }

  static async endVote(id: string, endedBy: string): Promise<Vote | null> {
    try {
      const response = await databases.updateDocument(
        databaseId,
        votesCollectionId,
        id,
        {
          isFinished: true,
          endedBy,
          endedAt: new Date().toISOString()
        }
      );
      
      const endedVote = response as unknown as Vote;
      
      // Automatycznie wyślij wyniki głosowania
      try {
        const { NotificationService } = await import('./notifications');
        await NotificationService.sendVoteResultsNotification(endedVote);
        console.log('✅ Wyniki głosowania wysłane');
      } catch (notificationError) {
        console.error('⚠️ Błąd podczas wysyłania wyników:', notificationError);
      }
      
      return endedVote;
    } catch (error) {
      console.error('Error ending vote:', error);
      return null;
    }
  }

  static async castVote(voteId: string, option: number, voterName: string): Promise<Vote | null> {
    try {
      const vote = await this.getById(voteId);
      if (!vote) return null;

      // Check if voting is still active
      const now = new Date();
      const deadline = new Date(vote.deadline);
      const expirationTime = vote.expirationTime ? new Date(vote.expirationTime) : null;
      
      if (vote.isFinished || deadline < now || (expirationTime && expirationTime < now)) {
        throw new Error('Voting has ended');
      }

      // Parse current data
      const results = JSON.parse(vote.results);
      const voters = JSON.parse(vote.voters);

      // Check if user already voted
      if (voters.includes(voterName)) {
        throw new Error('User has already voted');
      }

      // Update results
      results[option.toString()] = (results[option.toString()] || 0) + 1;
      voters.push(voterName);

      // Update vote
      return await this.update(voteId, {
        results: JSON.stringify(results),
        voters: JSON.stringify(voters),
        totalVotes: vote.totalVotes + 1
      });
    } catch (error) {
      console.error('Error casting vote:', error);
      return null;
    }
  }

  static isVoteActive(vote: Vote): boolean {
    if (vote.isFinished) return false;
    
    const now = new Date();
    const deadline = new Date(vote.deadline);
    const expirationTime = vote.expirationTime ? new Date(vote.expirationTime) : null;
    
    return deadline > now && (!expirationTime || expirationTime > now);
  }
}

// Service dla użytkowników aplikacji
export class AppUserService {
  static async getAll(): Promise<AppUser[]> {
    try {
      const response = await databases.listDocuments(
        databaseId,
        usersCollectionId,
        [Query.orderAsc('firstName')]
      );
      return response.documents as unknown as AppUser[];
    } catch (error) {
      console.error('Error fetching app users:', error);
      return [];
    }
  }

  static async getById(id: string): Promise<AppUser | null> {
    try {
      const response = await databases.getDocument(
        databaseId,
        usersCollectionId,
        id
      );
      return response as unknown as AppUser;
    } catch (error) {
      console.error('Error fetching app user:', error);
      return null;
    }
  }

  static async getByEmail(email: string): Promise<AppUser | null> {
    try {
      const response = await databases.listDocuments(
        databaseId,
        usersCollectionId,
        [Query.equal('email', email)]
      );
      
      if (response.documents.length > 0) {
        return response.documents[0] as unknown as AppUser;
      }
      return null;
    } catch (error) {
      console.error('Error fetching app user by email:', error);
      return null;
    }
  }

  static async create(user: Omit<AppUser, keyof Models.Document>): Promise<AppUser | null> {
    try {
      const response = await databases.createDocument(
        databaseId,
        usersCollectionId,
        ID.unique(),
        user as any
      );
      return response as unknown as AppUser;
    } catch (error) {
      console.error('Error creating app user:', error);
      return null;
    }
  }

  static async update(id: string, user: Partial<Omit<AppUser, keyof Models.Document>>): Promise<AppUser | null> {
    try {
      const response = await databases.updateDocument(
        databaseId,
        usersCollectionId,
        id,
        user as any
      );
      return response as unknown as AppUser;
    } catch (error) {
      console.error('Error updating app user:', error);
      return null;
    }
  }

  static async verifyUser(id: string, verifiedBy: string): Promise<AppUser | null> {
    try {
      return await this.update(id, {
        isVerified: true,
        verifiedBy,
        verifiedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error verifying user:', error);
      return null;
    }
  }

  static async getVerifiedUsers(): Promise<AppUser[]> {
    try {
      const response = await databases.listDocuments(
        databaseId,
        usersCollectionId,
        [Query.equal('isVerified', true), Query.orderAsc('firstName')]
      );
      return response.documents as unknown as AppUser[];
    } catch (error) {
      console.error('Error fetching verified users:', error);
      return [];
    }
  }

  /**
   * Pobiera zweryfikowanych użytkowników, którzy mają adres email
   */
  static async getVerifiedUsersWithEmail(): Promise<AppUser[]> {
    try {
      const response = await databases.listDocuments(
        databaseId,
        usersCollectionId,
        [
          Query.equal('isVerified', true), 
          Query.isNotNull('email'),
          Query.notEqual('email', ''),
          Query.orderAsc('firstName')
        ]
      );
      return response.documents.filter((doc: any) => doc.email && doc.email.trim() !== '') as unknown as AppUser[];
    } catch (error) {
      console.error('Error fetching verified users with email:', error);
      return [];
    }
  }
}

export { client, databases, messaging };
