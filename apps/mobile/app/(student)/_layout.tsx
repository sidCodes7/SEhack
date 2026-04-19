import { View, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { colors } from '../../constants/colors';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <Text style={[styles.iconText, focused && styles.iconTextActive]}>{label}</Text>
    </View>
  );
}

export default function StudentLayout() {
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
          tabBarIcon: ({ focused }) => <TabIcon label="⊞" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="calendar/index"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ focused }) => <TabIcon label="◫" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="karma"
        options={{
          title: 'Karma',
          tabBarIcon: ({ focused }) => <TabIcon label="◇" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="copilot/index"
        options={{
          title: 'Copilot',
          tabBarIcon: ({ focused }) => <TabIcon label="✦" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="bookings/status"
        options={{
          title: 'Requests',
          tabBarIcon: ({ focused }) => <TabIcon label="▢" focused={focused} />,
        }}
      />

      {/* Hidden screens — accessible via push but not shown in tab bar */}
      <Tabs.Screen name="finance/index" options={{ href: null }} />
      <Tabs.Screen name="finance/payment" options={{ href: null }} />
      <Tabs.Screen name="issues/report" options={{ href: null }} />
      <Tabs.Screen name="issues/heatmap" options={{ href: null }} />
      <Tabs.Screen name="bookings/request" options={{ href: null }} />
      <Tabs.Screen name="pyq/index" options={{ href: null }} />
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
