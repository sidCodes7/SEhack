import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { FONTS } from '../../constants/typography';

export default function ProfessorLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#6B6B6B',
        tabBarStyle: {
          backgroundColor: '#F7F6F2',
          borderTopWidth: 0,
          height: 100,
          paddingBottom: 40,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeContainer : null}>
              <Text style={{ fontSize: 24, color: focused ? '#FFFFFF' : '#6B6B6B' }}>⊞</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="attendance/index"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>📝</Text>,
        }}
      />
      <Tabs.Screen
        name="leave-approvals/index"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>✅</Text>,
        }}
      />
      <Tabs.Screen
        name="notices/index"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>📢</Text>,
        }}
      />
    </Tabs>
  );
}

import { View, StyleSheet } from 'react-native';
const styles = StyleSheet.create({
  activeContainer: {
    backgroundColor: '#1A1A1A',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
