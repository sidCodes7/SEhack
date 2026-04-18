import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { calendarService } from '../../services/calendar.service';
import { FONTS } from '../../constants/typography';
import { SPACING } from '../../constants/spacing';
import { Card } from '../../components/common/Card';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const EVENT_COLORS: Record<string, string> = {
  class: '#EAE7F8',
  event: '#D8EAE1',
  room_booking: '#F5F0D0',
};

export default function CalendarScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const today = new Date();

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await calendarService.getEvents({
          month: today.getMonth() + 1,
          year: today.getFullYear(),
        });
        setEvents(data);
      } catch {
        setEvents([
          { id: '1', title: 'Data Structures', type: 'class', time: '10:30 AM', room: '302', day: today.getDate() },
          { id: '2', title: 'Hackathon Meeting', type: 'event', time: '4:00 PM', room: '101', day: today.getDate() },
          { id: '3', title: 'AI Lab', type: 'class', time: '2:00 PM', room: 'Lab 201', day: today.getDate() + 1 },
        ]);
      }
    };
    fetch();
  }, []);

  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const dayEvents = events.filter((e) => e.day === selectedDay);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.monthTitle}>
          {today.toLocaleString('default', { month: 'long' })} {today.getFullYear()}
        </Text>

        {/* Calendar grid */}
        <Card style={styles.calendarCard}>
          <View style={styles.daysHeader}>
            {DAYS.map((d, i) => (
              <Text key={i} style={styles.dayHeader}>{d}</Text>
            ))}
          </View>
          <View style={styles.daysGrid}>
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.dayCell} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === today.getDate();
              const isSelected = day === selectedDay;
              const hasEvents = events.some((e) => e.day === day);
              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[styles.dayText, isToday && styles.dayTextToday, isSelected && styles.dayTextSelected]}>
                    {day}
                  </Text>
                  {hasEvents && <View style={[styles.eventDot, isSelected && styles.eventDotSelected]} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Events for selected day */}
        <Text style={styles.sectionTitle}>
          Events for {today.toLocaleString('default', { month: 'short' })} {selectedDay}
        </Text>
        {dayEvents.length === 0 ? (
          <Text style={styles.emptyText}>No events on this day</Text>
        ) : (
          dayEvents.map((event) => (
            <Card key={event.id} style={[styles.eventCard, { backgroundColor: EVENT_COLORS[event.type] || '#F4F4EF' }]}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDetails}>{event.time} · {event.room}</Text>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F5' },
  content: { padding: SPACING.lg, gap: 24, paddingTop: 60, paddingBottom: 100 },
  monthTitle: { fontFamily: FONTS.bold, fontSize: 28, color: '#1A1A1A' },
  calendarCard: { backgroundColor: '#FFFFFF', padding: SPACING.md },
  daysHeader: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  dayHeader: { fontFamily: FONTS.bold, fontSize: 12, color: '#6B6B6B', width: 40, textAlign: 'center' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 10 },
  dayCellSelected: { backgroundColor: '#1A1A1A', borderRadius: 20 },
  dayText: { fontFamily: FONTS.medium, fontSize: 14, color: '#1A1A1A' },
  dayTextToday: { color: '#D4A843', fontFamily: FONTS.bold },
  dayTextSelected: { color: '#FFFFFF' },
  eventDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#6C63FF', marginTop: 2 },
  eventDotSelected: { backgroundColor: '#FFFFFF' },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 18, color: '#1A1A1A' },
  emptyText: { fontFamily: FONTS.regular, fontSize: 14, color: '#6B6B6B' },
  eventCard: { padding: SPACING.lg, gap: 6 },
  eventTitle: { fontFamily: FONTS.bold, fontSize: 16, color: '#1A1A1A' },
  eventDetails: { fontFamily: FONTS.medium, fontSize: 13, color: '#5D605B' },
});
