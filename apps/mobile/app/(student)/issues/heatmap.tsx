import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity,
  Animated, Modal, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_W = SCREEN_WIDTH - 48;
const MAP_H = 420;

const CATEGORY_COLORS: Record<string, string> = {
  Electrical: '#FFD700',
  Plumbing: '#6C63FF',
  Infrastructure: '#FF6584',
  Cleanliness: '#2CB67D',
  Safety: '#FF8906',
  Other: '#A7A9BE',
};

const BUILDINGS = [
  { label: 'Main Block', x: 0.08, y: 0.08, w: 0.35, h: 0.25 },
  { label: 'Library', x: 0.55, y: 0.08, w: 0.38, h: 0.2 },
  { label: 'Lab Complex', x: 0.08, y: 0.42, w: 0.4, h: 0.22 },
  { label: 'Canteen', x: 0.55, y: 0.38, w: 0.38, h: 0.15 },
  { label: 'Hostel', x: 0.08, y: 0.72, w: 0.35, h: 0.22 },
  { label: 'Sports Ground', x: 0.55, y: 0.62, w: 0.38, h: 0.3 },
];

interface HeatDot {
  id: string;
  x: number;
  y: number;
  category: string;
  count: number;
  title?: string;
  time?: string;
}

export default function HeatmapScreen() {
  const router = useRouter();
  const [dots, setDots] = useState<HeatDot[]>([]);
  const [selectedDot, setSelectedDot] = useState<HeatDot | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const pulseAnims = useRef<Animated.Value[]>([]);
  const fadeIn = useRef(new Animated.Value(0)).current;

  const MOCK_DOTS: HeatDot[] = [
    { id: '1', x: 0.2, y: 0.15, category: 'Electrical', count: 5, title: 'Flickering lights - 3rd floor', time: '2h ago' },
    { id: '2', x: 0.65, y: 0.14, category: 'Infrastructure', count: 3, title: 'Broken window - Reading hall', time: '5h ago' },
    { id: '3', x: 0.25, y: 0.5, category: 'Plumbing', count: 8, title: 'Water leak - Lab 201', time: '1h ago' },
    { id: '4', x: 0.7, y: 0.42, category: 'Cleanliness', count: 2, title: 'Unclean tables - Canteen', time: '30m ago' },
    { id: '5', x: 0.15, y: 0.8, category: 'Safety', count: 4, title: 'Broken lock - Room 105', time: '4h ago' },
    { id: '6', x: 0.35, y: 0.2, category: 'Electrical', count: 6, title: 'AC not working - Room 302', time: '3h ago' },
    { id: '7', x: 0.12, y: 0.55, category: 'Plumbing', count: 3, title: 'Clogged drain - Washroom', time: '6h ago' },
    { id: '8', x: 0.8, y: 0.72, category: 'Infrastructure', count: 7, title: 'Damaged bench - Ground', time: '1d ago' },
    { id: '9', x: 0.6, y: 0.68, category: 'Safety', count: 2, title: 'Poor lighting - Parking lot', time: '12h ago' },
    { id: '10', x: 0.42, y: 0.45, category: 'Cleanliness', count: 4, title: 'Overflowing bin - Corridor', time: '2h ago' },
    { id: '11', x: 0.78, y: 0.18, category: 'Electrical', count: 3, title: 'Power outlet broken - Library', time: '8h ago' },
    { id: '12', x: 0.3, y: 0.75, category: 'Other', count: 2, title: 'Graffiti on wall', time: '2d ago' },
  ];

  const fetchHeatmap = async () => {
    try {
      const data = (await api.get("/issues?view=heatmap")).data.data;
      setDots(data);
    } catch {
      setDots(MOCK_DOTS);
    }
  };

  useEffect(() => { fetchHeatmap(); }, []);

  // Animate dots pulsing
  useEffect(() => {
    if (dots.length === 0) return;
    pulseAnims.current = dots.map(() => new Animated.Value(1));
    dots.forEach((_, i) => {
      const delay = Math.random() * 2000;
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnims.current[i], { toValue: 1.6, duration: 1200 + Math.random() * 800, useNativeDriver: true }),
            Animated.timing(pulseAnims.current[i], { toValue: 1, duration: 1200 + Math.random() * 800, useNativeDriver: true }),
          ])
        ).start();
      }, delay);
    });

    // Fade in map
    Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [dots]);

  const filteredDots = filter ? dots.filter(d => d.category === filter) : dots;
  const totalIssues = dots.reduce((s, d) => s + d.count, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Campus Heatmap</Text>
          <Text style={styles.subtitle}>{totalIssues} active issues tracked</Text>
        </View>
      </View>

      {/* Category filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}>
        <TouchableOpacity
          style={[styles.filterChip, !filter && styles.filterChipActive]}
          onPress={() => setFilter(null)}
        >
          <Text style={[styles.filterText, !filter && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, filter === cat && { backgroundColor: color }]}
            onPress={() => setFilter(filter === cat ? null : cat)}
          >
            <View style={[styles.filterDot, { backgroundColor: color }]} />
            <Text style={[styles.filterText, filter === cat && { color: '#fff' }]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map */}
      <Animated.View style={[styles.mapContainer, { opacity: fadeIn }]}>
        {/* Building outlines */}
        {BUILDINGS.map((b, i) => (
          <View key={i} style={[styles.building, {
            left: b.x * MAP_W, top: b.y * MAP_H,
            width: b.w * MAP_W, height: b.h * MAP_H,
          }]}>
            <Text style={styles.buildingLabel}>{b.label}</Text>
          </View>
        ))}

        {/* Grid lines */}
        {[0.2, 0.4, 0.6, 0.8].map((pos) => (
          <React.Fragment key={pos}>
            <View style={[styles.gridLineH, { top: `${pos * 100}%` }]} />
            <View style={[styles.gridLineV, { left: `${pos * 100}%` }]} />
          </React.Fragment>
        ))}

        {/* Heat glow zones (underneath dots) */}
        {filteredDots.filter(d => d.count >= 5).map((dot) => (
          <View key={`glow-${dot.id}`} style={[styles.heatGlow, {
            left: dot.x * MAP_W - 30, top: dot.y * MAP_H - 30,
            backgroundColor: CATEGORY_COLORS[dot.category] || '#A7A9BE',
          }]} />
        ))}

        {/* Issue dots with pulse animation */}
        {filteredDots.map((dot, i) => {
          const size = 14 + dot.count * 3;
          const dotIndex = dots.indexOf(dot);
          const scale = pulseAnims.current[dotIndex] || new Animated.Value(1);
          return (
            <TouchableOpacity
              key={dot.id}
              activeOpacity={0.7}
              onPress={() => setSelectedDot(dot)}
              style={{ position: 'absolute', left: dot.x * MAP_W - size / 2, top: dot.y * MAP_H - size / 2 }}
            >
              <Animated.View style={[styles.dot, {
                width: size, height: size, borderRadius: size / 2,
                backgroundColor: CATEGORY_COLORS[dot.category] || '#A7A9BE',
                transform: [{ scale }],
              }]}>
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>{dot.count}</Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        {Object.entries(CATEGORY_COLORS).slice(0, 4).map(([cat, color]) => {
          const count = dots.filter(d => d.category === cat).reduce((s, d) => s + d.count, 0);
          return (
            <View key={cat} style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: color }]} />
              <Text style={styles.statCount}>{count}</Text>
              <Text style={styles.statLabel}>{cat}</Text>
            </View>
          );
        })}
      </View>

      {/* Report FAB */}
      <TouchableOpacity style={styles.reportFab} onPress={() => router.push('/(student)/issues/report')}>
        <Text style={{ color: '#FFF', fontSize: 24 }}>+</Text>
        <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '700' }}>REPORT</Text>
      </TouchableOpacity>

      {/* Detail Modal */}
      <Modal visible={!!selectedDot} transparent animationType="slide" onRequestClose={() => setSelectedDot(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedDot(null)}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            {selectedDot && (
              <>
                <View style={styles.modalHeader}>
                  <View style={[styles.modalCategoryDot, { backgroundColor: CATEGORY_COLORS[selectedDot.category] }]} />
                  <Text style={styles.modalCategory}>{selectedDot.category}</Text>
                  <Text style={styles.modalTime}>{selectedDot.time || 'Recently'}</Text>
                </View>
                <Text style={styles.modalTitle}>{selectedDot.title || 'Campus Issue'}</Text>
                <View style={styles.modalStats}>
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatNum}>{selectedDot.count}</Text>
                    <Text style={styles.modalStatLabel}>Reports</Text>
                  </View>
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatNum}>In Progress</Text>
                    <Text style={styles.modalStatLabel}>Status</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.modalBtn} onPress={() => setSelectedDot(null)}>
                  <Text style={styles.modalBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F5' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 8 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontWeight: '800', fontSize: 28, color: '#1A1A1A' },
  subtitle: { fontSize: 13, color: '#6B6B6B', fontWeight: '500', marginTop: 2 },

  filterRow: { maxHeight: 48, marginBottom: 12 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F4F4EF' },
  filterChipActive: { backgroundColor: '#1A1A1A' },
  filterDot: { width: 8, height: 8, borderRadius: 4 },
  filterText: { fontWeight: '700', fontSize: 12, color: '#6B6B6B' },
  filterTextActive: { color: '#fff' },

  mapContainer: { flex: 1, marginHorizontal: 24, borderRadius: 20, backgroundColor: '#EEEEE9', overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: 'rgba(26,26,26,0.06)' },

  building: { position: 'absolute', borderWidth: 1.5, borderColor: 'rgba(26,26,26,0.12)', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.4)', padding: 6 },
  buildingLabel: { fontSize: 10, fontWeight: '700', color: '#999', letterSpacing: 0.5, textTransform: 'uppercase' },

  gridLineH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(26,26,26,0.04)' },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(26,26,26,0.04)' },

  heatGlow: { position: 'absolute', width: 60, height: 60, borderRadius: 30, opacity: 0.15 },

  dot: { justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },

  statsBar: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 24, paddingVertical: 12, marginBottom: 80 },
  statItem: { alignItems: 'center', gap: 2 },
  statDot: { width: 10, height: 10, borderRadius: 5 },
  statCount: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  statLabel: { fontSize: 10, fontWeight: '600', color: '#999' },

  reportFab: { position: 'absolute', bottom: 100, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  modalCategoryDot: { width: 12, height: 12, borderRadius: 6 },
  modalCategory: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', flex: 1 },
  modalTime: { fontSize: 12, color: '#999' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 16 },
  modalStats: { flexDirection: 'row', gap: 24, marginBottom: 20 },
  modalStat: { gap: 2 },
  modalStatNum: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  modalStatLabel: { fontSize: 11, color: '#999', fontWeight: '600' },
  modalBtn: { backgroundColor: '#1A1A1A', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  modalBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
