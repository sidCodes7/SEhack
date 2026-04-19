import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing } from '../../../constants/spacing';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const MOCK_EVENTS: Record<number, { color: string }[]> = {
  6: [{ color: colors.info }],
  9: [{ color: '#8B6FC0' }, { color: colors.cardPink }],
  14: [{ color: colors.info }],
  18: [{ color: colors.info }, { color: '#8B6FC0' }, { color: colors.cardPink }],
  23: [{ color: colors.info }],
};

const MOCK_SCHEDULE = [
  { id: 1, time: '10:30 AM', title: 'Data Structures', detail: 'Room 302', icon: '◫' },
  { id: 2, time: '2:00 PM', title: 'Room Booking: Lab 201', detail: '2 hrs', icon: '◎' },
  { id: 3, time: '4:00 PM', title: 'Hackathon Meetup', detail: 'Room 101', icon: '◫' },
];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function CalendarScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const today = now.getDate();

  const cells = getCalendarDays(year, month);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const getDayName = (y: number, m: number, d: number) => {
    const day = DAYS[(new Date(y, m, d).getDay() + 6) % 7];
    return day ? day.charAt(0) + day.slice(1).toLowerCase() + 'day' : 'Monday';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <Text style={styles.navIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{MONTHS[month]} {year}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <Text style={styles.navIcon}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Grid Card */}
        <View style={styles.gridCard}>
          <View style={styles.daysHeader}>
            {DAYS.map(d => (
              <View key={d} style={styles.dayLabelWrap}>
                <Text style={styles.dayLabel}>{d}</Text>
              </View>
            ))}
          </View>
          <View style={styles.grid}>
            {cells.map((day, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.cell,
                  day === today && styles.cellToday,
                  day === selectedDay && styles.cellSelected,
                ]}
                onPress={() => day && setSelectedDay(day)}
                disabled={!day}
              >
                {day && (
                  <>
                    <Text style={[
                      styles.cellDate,
                      (day === today || day === selectedDay) && styles.cellDateWhite
                    ]}>{day}</Text>
                    {MOCK_EVENTS[day] && (
                      <View style={styles.dots}>
                        {MOCK_EVENTS[day].map((e, j) => (
                          <View key={j} style={[styles.dot, { backgroundColor: day === selectedDay ? '#FFF' : e.color }]} />
                        ))}
                      </View>
                    )}
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Schedule list */}
        <View style={styles.scheduleCard}>
          <Text style={styles.scheduleTitle}>
            {getDayName(year, month, selectedDay)}, {MONTHS[month].slice(0, 3)} {selectedDay}
          </Text>

          {MOCK_SCHEDULE.map(evt => (
            <View key={evt.id} style={styles.eventItem}>
              <View style={styles.eventLine} />
              <View style={styles.eventContent}>
                <Text style={styles.eventTime}>{evt.time}</Text>
                <Text style={styles.eventTitle}>{evt.title}</Text>
                <View style={styles.eventDetailRow}>
                  <Text style={styles.eventIcon}>{evt.icon}</Text>
                  <Text style={styles.eventDetail}>{evt.detail}</Text>
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.bookBtn}>
            <Text style={styles.bookBtnText}>+ Book a Room</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.screenPadding, paddingTop: 60 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  navBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width:0, height:2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  navIcon: { fontSize: 20, color: colors.textPrimary },
  monthTitle: { fontSize: 24, fontWeight: '800', color: colors.textPrimary },

  gridCard: { backgroundColor: colors.surface, borderRadius: spacing.cardRadius, padding: 16, marginBottom: spacing.xl },
  daysHeader: { flexDirection: 'row', marginBottom: 12 },
  dayLabelWrap: { flex: 1, alignItems: 'center' },
  dayLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.28%', height: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 4, borderRadius: 24 },
  cellToday: { backgroundColor: colors.textMuted },
  cellSelected: { backgroundColor: colors.accent },
  cellDate: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  cellDateWhite: { color: colors.textWhite },
  dots: { flexDirection: 'row', gap: 2, marginTop: 4, position: 'absolute', bottom: 6 },
  dot: { width: 4, height: 4, borderRadius: 2 },

  scheduleCard: { backgroundColor: colors.cardLavender, borderRadius: spacing.cardRadius, padding: spacing.cardPadding },
  scheduleTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 20 },
  
  eventItem: { flexDirection: 'row', marginBottom: 16 },
  eventLine: { width: 2, backgroundColor: colors.info, marginRight: 16, opacity: 0.3, borderRadius: 1 },
  eventContent: { flex: 1, backgroundColor: colors.surface, padding: 16, borderRadius: 16 },
  eventTime: { fontSize: 13, fontWeight: '700', color: colors.info, marginBottom: 4 },
  eventTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  eventDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eventIcon: { fontSize: 14, color: colors.textSecondary },
  eventDetail: { fontSize: 13, color: colors.textSecondary },

  bookBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 24, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  bookBtnText: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
});
