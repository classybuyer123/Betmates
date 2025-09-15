// Authentication hook

import { useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInAnonymously, 
  signOut as firebaseSignOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { getUser, createUser } from '../services/firestore';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types';

export const useAuth = () => {
  const { 
    user, 
    isAuthenticated, 
    isGuest, 
    isLoading, 
    setUser, 
    setLoading, 
    signOut: storeSignOut,
    setGuest 
  } = useAuthStore();

  useEffect(() => {
    // Initialize auth state - for now just set loading to false
    // TODO: Re-enable Firebase auth listener when Firebase is properly configured
    console.log('Initializing auth state...');
    setLoading(false);
  }, [setLoading]);

  const signInAsGuest = async () => {
    try {
      setLoading(true);
      
      // Always use demo mode for now (bypass Firebase entirely)
      console.log('Creating demo user...');
      
      const demoUser: User = {
        id: 'demo-user-' + Date.now(),
        displayName: 'Demo User',
        createdAt: Date.now(),
        locale: 'en',
        stats: {
          total: 0,
          wins: 0,
          losses: 0,
          owed: 0,
          owedToYou: 0,
        },
      };
      
      setUser(demoUser);
      setGuest(true);
      setLoading(false);
      
      console.log('Demo user created successfully:', demoUser);
    } catch (error) {
      console.error('Demo user creation error:', error);
      setLoading(false);
      throw error;
    }
  };

  const updateProfile = async (updatedUser: Partial<User>) => {
    try {
      if (!user) throw new Error('No user to update');
      
      const newUser = { ...user, ...updatedUser };
      setUser(newUser);
      
      console.log('Profile updated:', newUser);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // For demo mode, just clear the local state
      storeSignOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return {
    user,
    isAuthenticated,
    isGuest,
    isLoading,
    signInAsGuest,
    updateProfile,
    signOut,
  };
};
