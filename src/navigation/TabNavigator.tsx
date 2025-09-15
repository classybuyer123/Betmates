// Bottom tab navigator

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, textStyles } from '../theme';
import { useTranslation } from '../services/i18n';
import type { RootTabParamList } from '../types';

// Import screens (we'll create these next)
import { HomeScreen } from '../screens/HomeScreen';
import { CreateBetScreen } from '../screens/CreateBetScreen';
import { GroupsScreen } from '../screens/GroupsScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();

export const TabNavigator: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Feather.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Create':
              iconName = 'plus-circle';
              break;
            case 'Groups':
              iconName = 'users';
              break;
            default:
              iconName = 'circle';
          }

          return <Feather name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          height: Platform.OS === 'ios' ? 83 : 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          ...textStyles.h2,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: t('navigation.home'),
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Create" 
        component={CreateBetScreen}
        options={{
          title: t('navigation.create'),
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Groups" 
        component={GroupsScreen}
        options={{
          title: t('navigation.groups'),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};
