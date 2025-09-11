"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client, Account, Models } from 'appwrite';
import { AppUserService, AppUser } from '@/lib/appwrite';

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  appUser: AppUser | null;
  isVerified: boolean;
  loading: boolean; 
  login: (email: string, password: string) => Promise<Models.User<Models.Preferences>>;
  register: (email: string, password: string, name: string) => Promise<Models.User<Models.Preferences>>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const endpoint = 'https://fra.cloud.appwrite.io/v1';
const projectId = '687abe96000d2d31f914';

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

console.log('Appwrite client configured:', { endpoint, projectId });

const account = new Account(client);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadAppUser = async (email: string) => {
    try {
      const userData = await AppUserService.getByEmail(email);
      setAppUser(userData);
      setIsVerified(userData?.isVerified || false);
    } catch (error) {
      console.error('Error loading app user:', error);
      setAppUser(null);
      setIsVerified(false);
    }
  };

  const checkAuth = async () => {
    try {
      setLoading(true);
      console.log('Checking authentication...');
      const currentUser = await account.get();
      console.log('User found:', currentUser);
      setUser(currentUser);
      
      // Load additional user data
      if (currentUser.email) {
        await loadAppUser(currentUser.email);
      }
    } catch (error: any) {
      console.log('No authenticated user:', error?.message || error);
      setUser(null);
      setAppUser(null);
      setIsVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', { email, endpoint, projectId });
      await account.createEmailPasswordSession(email, password);
      const currentUser = await account.get();
      setUser(currentUser);
      
      // Load additional user data
      if (currentUser.email) {
        await loadAppUser(currentUser.email);
      }
      
      return currentUser;
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        type: error?.type
      });
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      await account.create('unique()', email, password, name);
      const user = await login(email, password);
      
      // Create app user profile
      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ') || '';
      
      const newAppUser = await AppUserService.create({
        firstName,
        lastName,
        email,
        group: 'Członek',
        isVerified: false
      });
      
      if (newAppUser) {
        setAppUser(newAppUser);
        setIsVerified(false);
      }
      
      return user;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      setAppUser(null);
      setIsVerified(false);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Test connection to Appwrite
    const testConnection = async () => {
      try {
        console.log('Testing Appwrite connection...');
        // Try to get account info (will fail if not logged in, but should not give scope error)
        await account.get();
      } catch (error: any) {
        console.log('Connection test result:', {
          message: error?.message,
          code: error?.code,
          type: error?.type
        });
      }
    };
    
    testConnection();
    checkAuth();
  }, []);

  const value = {
    user,
    appUser,
    isVerified,
    loading,
    login,
    register,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}