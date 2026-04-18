import React from 'react';
import { Tabs } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';

export default function StudentLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1A1A1A',
        tabBarInactiveTintColor: '#6B6B6B',
        tabBarStyle: {
          backgroundColor: '#F7F6F2',
          borderTopWidth: 0,
          height: 90,
          paddingBottom: 30,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontFamily: FONTS.medium,
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 24, color }}>{focused ? '🏠' : '🏠'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar/index"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>📅</Text>,
        }}
      />
      <Tabs.Screen
        name="karma"
        options={{
          title: 'Karma',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>✨</Text>,
        }}
      />
      <Tabs.Screen
        name="bookings/status"
        options={{
          title: 'Requests',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>💬</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}

import { Text } from 'react-native';
