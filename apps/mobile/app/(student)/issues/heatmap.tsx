import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../../services/api';
import { useWebSocket } from '../../../hooks/useWebSocket';



const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORY_COLORS: Record<string, string> = {
  Electrical: '#FFD700',
  Plumbing: '#6C63FF',
  Infrastructure: '#FF6584',
  Cleanliness: '#2CB67D',
  Safety: '#FF8906',
  Other: '#A7A9BE',
};

export default function HeatmapScreen() {
  const router = useRouter();
  const [dots, setDots] = useState<any[]>([]);
  const { socket } = useWebSocket();

  const fetchHeatmap = async () => {
    try {
      const data = (await api.get("/issues?view=heatmap")).data.data;
      setDots(data);
    } catch {
      // Mock heatmap data
      setDots([
        { id: '1', x: 0.3, y: 0.4, category: 'Electrical', count: 5 },
        { id: '2', x: 0.6, y: 0.3, category: 'Plumbing', count: 3 },
        { id: '3', x: 0.45, y: 0.65, category: 'Infrastructure', count: 8 },
        { id: '4', x: 0.7, y: 0.55, category: 'Cleanliness', count: 2 },
        { id: '5', x: 0.2, y: 0.7, category: 'Safety', count: 4 },
      ]);
    }
  };

  useEffect(() => {
    fetchHeatmap();
    if (socket) {
      socket.on('heatmap:update', fetchHeatmap);
      socket.on('issue:created', fetchHeatmap);
      return () => {
        socket.off('heatmap:update', fetchHeatmap);
        socket.off('issue:created', fetchHeatmap);
      };
    }
  }, [socket]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.back}>â†</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Campus Heatmap</Text>
      </View>

      {/* Map area */}
      <View style={styles.mapContainer}>
        <View style={styles.mapGrid}>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((pos) => (
            <React.Fragment key={pos}>
              <View style={[styles.gridLineH, { top: `${pos * 100}%` }]} />
              <View style={[styles.gridLineV, { left: `${pos * 100}%` }]} />
            </React.Fragment>
          ))}

          {/* Building labels */}
          <Text style={[styles.buildingLabel, { top: '15%', left: '10%' }]}>Main Block</Text>
          <Text style={[styles.buildingLabel, { top: '50%', left: '55%' }]}>Lab Complex</Text>
          <Text style={[styles.buildingLabel, { top: '75%', left: '15%' }]}>Hostel</Text>
          <Text style={[styles.buildingLabel, { top: '25%', left: '60%' }]}>Library</Text>

          {/* Issue dots */}
          {dots.map((dot) => (
            <View
              key={dot.id}
              style={[
                styles.dot,
                {
                  left: `${dot.x * 100}%`,
                  top: `${dot.y * 100}%`,
                  backgroundColor: CATEGORY_COLORS[dot.category] || '#A7A9BE',
                  width: 16 + dot.count * 3,
                  height: 16 + dot.count * 3,
                  borderRadius: (16 + dot.count * 3) / 2,
                  opacity: 0.7,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <View key={cat} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{cat}</Text>
          </View>
        ))}
      </View>

      {/* Report FAB */}
      <TouchableOpacity style={styles.reportFab} onPress={() => router.push('/(student)/issues/report')}>
        <Text style={styles.reportIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F5' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  back: { fontSize: 24, color: '#1A1A1A' },
  title: { fontWeight: '700', fontSize: 28, color: '#1A1A1A' },
  mapContainer: { flex: 1, margin: 24, borderRadius: 20, backgroundColor: '#EEEEE9', overflow: 'hidden' },
  mapGrid: { flex: 1, position: 'relative' },
  gridLineH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(26,26,26,0.06)' },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(26,26,26,0.06)' },
  buildingLabel: { position: 'absolute', fontWeight: '500', fontSize: 11, color: '#6B6B6B', letterSpacing: 0.5 },
  dot: { position: 'absolute' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, gap: 12, paddingBottom: 100 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontWeight: '500', fontSize: 11, color: '#6B6B6B' },
  reportFab: { position: 'absolute', bottom: 40, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', elevation: 8 },
  reportIcon: { color: '#FFFFFF', fontSize: 28 },
});




