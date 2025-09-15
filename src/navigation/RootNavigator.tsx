// Root stack navigator

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors, textStyles } from '../theme';
import { useTranslation } from '../services/i18n';
import { useAuth } from '../hooks/useAuth';
import type { RootStackParamList } from '../types';

import { TabNavigator } from './TabNavigator';
// Import modal/overlay screens (we'll create these next)
import { BetDetailScreen } from '../screens/BetDetailScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { GroupEditScreen } from '../screens/GroupEditScreen';
import { GroupChatScreen } from '../screens/GroupChatScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AuthScreen } from '../screens/AuthScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading or auth screen if not authenticated
  if (isLoading) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthScreen} />
      </Stack.Navigator>
    );
  }

  if (!isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthScreen} />
      </Stack.Navigator>
    );
  }

  // Show main app if authenticated
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          ...textStyles.h2,
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="Tabs" 
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      
      <Stack.Screen 
        name="BetDetail" 
        component={BetDetailScreen}
        options={{
          title: t('navigation.betDetail'),
          presentation: 'modal',
        }}
      />
      
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          title: t('navigation.notifications'),
          presentation: 'modal',
        }}
      />
      
      <Stack.Screen 
        name="GroupEdit" 
        component={GroupEditScreen}
        options={({ route }) => ({
          title: route.params?.mode === 'create' 
            ? t('groups.newGroup') 
            : t('groups.joinGroup'),
          presentation: 'modal',
        })}
      />
      
      <Stack.Screen 
        name="GroupChat" 
        component={GroupChatScreen}
        options={{
          headerShown: false,
        }}
      />
      
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: t('navigation.profile'),
          presentation: 'modal',
        }}
      />
      
      <Stack.Screen 
        name="Friends" 
        component={FriendsScreen}
        options={{
          headerShown: false,
        }}
      />
      
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
