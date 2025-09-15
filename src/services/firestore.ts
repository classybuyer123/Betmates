// Firestore service functions

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  writeBatch,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import type { User, Bet, Group, Notification, BetType, BetStatus } from '../types';

// Collection references
export const usersCollection = collection(db, 'users');
export const betsCollection = collection(db, 'bets');
export const groupsCollection = collection(db, 'groups');
export const notificationsCollection = collection(db, 'notifications');

// User operations
export const createUser = async (userData: Omit<User, 'id'>) => {
  return await addDoc(usersCollection, {
    ...userData,
    createdAt: Date.now(),
    stats: {
      total: 0,
      wins: 0,
      losses: 0,
      owed: 0,
      owedToYou: 0,
    },
  });
};

export const updateUser = async (userId: string, updates: Partial<User>) => {
  const userDoc = doc(db, 'users', userId);
  return await updateDoc(userDoc, {
    ...updates,
    updatedAt: Date.now(),
  });
};

export const getUser = async (userId: string): Promise<User | null> => {
  const userDoc = doc(db, 'users', userId);
  const snapshot = await getDoc(userDoc);
  
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as User;
  }
  return null;
};

// Bet operations
export const createBet = async (betData: Omit<Bet, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'timeline' | 'confirmations'>) => {
  const confirmations = Object.fromEntries(
    betData.participantIds.map(uid => [
      uid, 
      uid === betData.creatorId ? 'accepted' : 'pending'
    ])
  );

  const newBet: Omit<Bet, 'id'> = {
    ...betData,
    status: 'pending' as BetStatus,
    confirmations,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    timeline: [{
      at: Date.now(),
      by: betData.creatorId,
      type: 'created',
    }],
  };

  return await addDoc(betsCollection, newBet);
};

export const updateBet = async (betId: string, updates: Partial<Bet>) => {
  const betDoc = doc(db, 'bets', betId);
  return await updateDoc(betDoc, {
    ...updates,
    updatedAt: Date.now(),
  });
};

export const getBet = async (betId: string): Promise<Bet | null> => {
  const betDoc = doc(db, 'bets', betId);
  const snapshot = await getDoc(betDoc);
  
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Bet;
  }
  return null;
};

export const getUserBets = async (userId: string): Promise<Bet[]> => {
  const q = query(
    betsCollection,
    where('participantIds', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bet));
};

export const getActiveBets = async (userId: string): Promise<Bet[]> => {
  const q = query(
    betsCollection,
    where('participantIds', 'array-contains', userId),
    where('status', 'in', ['pending', 'active', 'double_proposed']),
    orderBy('updatedAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bet));
};

export const getResolvedBets = async (userId: string): Promise<Bet[]> => {
  const q = query(
    betsCollection,
    where('participantIds', 'array-contains', userId),
    where('status', '==', 'resolved'),
    orderBy('resolvedAt', 'desc'),
    limit(50)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bet));
};

// Group operations
export const createGroup = async (groupData: Omit<Group, 'id'>) => {
  return await addDoc(groupsCollection, {
    ...groupData,
    createdAt: Date.now(),
  });
};

export const updateGroup = async (groupId: string, updates: Partial<Group>) => {
  const groupDoc = doc(db, 'groups', groupId);
  return await updateDoc(groupDoc, updates);
};

export const getUserGroups = async (userId: string): Promise<Group[]> => {
  const q = query(
    groupsCollection,
    where('memberIds', 'array-contains', userId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
};

export const getPublicGroups = async (): Promise<Group[]> => {
  const q = query(
    groupsCollection,
    where('isPublic', '==', true),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
};

// Notification operations
export const createNotification = async (notificationData: Omit<Notification, 'id'>) => {
  return await addDoc(notificationsCollection, {
    ...notificationData,
    createdAt: Date.now(),
    read: false,
  });
};

export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  const q = query(
    notificationsCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
};

export const markNotificationAsRead = async (notificationId: string) => {
  const notificationDoc = doc(db, 'notifications', notificationId);
  return await updateDoc(notificationDoc, { read: true });
};

// Real-time subscriptions
export const subscribeToUserBets = (userId: string, callback: (bets: Bet[]) => void) => {
  const q = query(
    betsCollection,
    where('participantIds', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const bets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bet));
    callback(bets);
  });
};

export const subscribeToUserNotifications = (userId: string, callback: (notifications: Notification[]) => void) => {
  const q = query(
    notificationsCollection,
    where('userId', '==', userId),
    where('read', '==', false),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
    callback(notifications);
  });
};
