import React from 'react';
import { Tabs } from 'expo-router';
import { Disc, Compass, Users, MessageSquare, User } from 'lucide-react-native';
import { colors, typography } from '../../src/theme/tokens';

export default function TabLayout() {
  const palette = colors.light;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.textPrimary,
        tabBarInactiveTintColor: palette.textTertiary,
        tabBarStyle: {
          backgroundColor: palette.background,
          borderTopColor: palette.borderSubtle,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: typography.sizes.xs,
          fontWeight: typography.weights.medium,
          letterSpacing: typography.letterSpacing.tight,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Disc size={20} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <Compass size={20} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ color }) => <Users size={20} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <MessageSquare size={20} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={20} color={color} strokeWidth={1.8} />,
        }}
      />
    </Tabs>
  );
}
