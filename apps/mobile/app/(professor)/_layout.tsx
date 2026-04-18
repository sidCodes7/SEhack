import { Text, View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { colors } from '../../constants/colors';

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
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeIcon : null}>
              <Text style={{ fontSize: 22, color: focused ? '#FFF' : '#6B6B6B' }}>⊞</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="attendance/index"
        options={{
          title: 'Attendance',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>📝</Text>,
        }}
      />
      <Tabs.Screen
        name="leave-approvals/index"
        options={{
          title: 'Approvals',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>✅</Text>,
        }}
      />
      <Tabs.Screen
        name="notices/index"
        options={{
          title: 'Notices',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>📢</Text>,
        }}
      />
      <Tabs.Screen name="follow-ups/index" options={{ tabBarButton: () => null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIcon: {
    backgroundColor: '#1A1A1A',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
