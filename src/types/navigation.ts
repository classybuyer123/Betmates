// Navigation type declarations

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// Stack param lists
export type RootStackParamList = {
  Tabs: undefined;
  BetDetail: { betId: string };
  Notifications: undefined;
  GroupEdit: { groupId?: string; mode: 'join' | 'create' };
  GroupChat: { groupId: string };
  Profile: undefined;
  Friends: undefined;
  Settings: undefined;
  Auth: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Create: undefined;
  Groups: undefined;
};

// Navigation prop types
export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type RootTabNavigationProp = BottomTabNavigationProp<RootTabParamList>;

// Declare global navigation types for React Navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
