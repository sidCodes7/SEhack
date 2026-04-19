import { Text, View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { colors } from '../../constants/colors';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <Text style={[styles.iconText, focused && styles.iconTextActive]}>{label}</Text>
    </View>
  );
}

export default function ProfessorLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.textWhite,
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
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon label="⊞" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="attendance/index"
        options={{
          title: 'Attend.',
          tabBarIcon: ({ focused }) => <TabIcon label="☰" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="leave-approvals/index"
        options={{
          title: 'Approvals',
          tabBarIcon: ({ focused }) => <TabIcon label="◉" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="notices/index"
        options={{
          title: 'Notices',
          tabBarIcon: ({ focused }) => <TabIcon label="◈" focused={focused} />,
        }}
      />
      <Tabs.Screen name="follow-ups/index" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: '#1A1A1A',
  },
  iconText: {
    fontSize: 20,
    color: '#6B6B6B',
    fontWeight: '600',
  },
  iconTextActive: {
    color: '#FFFFFF',
  },
});
