"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client, Account, Models } from 'appwrite';

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
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
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      setLoading(true);
      console.log('Checking authentication...');
      const currentUser = await account.get();
      console.log('User found:', currentUser);
      setUser(currentUser);
    } catch (error: any) {
      console.log('No authenticated user:', error?.message || error);
      setUser(null);
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
      return await login(email, password);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
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