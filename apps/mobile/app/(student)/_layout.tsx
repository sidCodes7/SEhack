import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { colors } from '../../constants/colors';

export default function StudentLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 0,
          height: 80,
          paddingBottom: 24,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22 }}>{focused ? '🏠' : '🏡'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar/index"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22 }}>{focused ? '📅' : '🗓'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="karma"
        options={{
          title: 'Karma',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22 }}>{focused ? '✨' : '⭐'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="bookings/status"
        options={{
          title: 'Requests',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22 }}>{focused ? '💬' : '📋'}</Text>
          ),
        }}
      />

      {/* Hidden screens — accessible via push but not shown in tab bar */}
      <Tabs.Screen name="finance/index" options={{ tabBarButton: () => null }} />
      <Tabs.Screen name="finance/payment" options={{ tabBarButton: () => null }} />
      <Tabs.Screen name="issues/report" options={{ tabBarButton: () => null }} />
      <Tabs.Screen name="issues/heatmap" options={{ tabBarButton: () => null }} />
      <Tabs.Screen name="copilot/index" options={{ tabBarButton: () => null }} />
      <Tabs.Screen name="bookings/request" options={{ tabBarButton: () => null }} />
      <Tabs.Screen name="pyq/index" options={{ tabBarButton: () => null }} />
    </Tabs>
  );
}
