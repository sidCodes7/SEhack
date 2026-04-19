// ──────────────────────────────────────────────
// CalendarView — Matches calendar_view wireframe
// Monthly grid + Day schedule with colored event bars
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import './CalendarView.css';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const MOCK_EVENTS = {
  6: [{ color: '#6C63FF' }],
  9: [{ color: '#8B6FC0' }, { color: '#FF6584' }],
  14: [{ color: '#6C63FF' }],
  18: [{ color: '#6C63FF' }, { color: '#8B6FC0' }, { color: '#FF6584' }],
  23: [{ color: '#6C63FF' }],
};

const MOCK_SCHEDULE = [
  { id: 1, time: '10:30 AM', title: 'Data Structures', detail: 'Room 302', color: '#EAE7F8', icon: 'location_on' },
  { id: 2, time: '2:00 PM', title: 'Room Booking: Lab 201', detail: '2 hrs', color: '#EAE7F8', icon: 'schedule' },
  { id: 3, time: '4:00 PM', title: 'Hackathon Meetup', detail: 'Room 101', color: '#EAE7F8', icon: 'location_on' },
];

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function CalendarView({ user, apiBase, headers }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [schedule, setSchedule] = useState(MOCK_SCHEDULE);
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

  useEffect(() => {
    fetch(`${apiBase}/calendar/events?month=${month + 1}&year=${year}`, { headers })
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data?.length) {
          // Map real events to our calendar structure
        }
      })
      .catch(() => {});
  }, [apiBase, headers, month, year]);

  return (
    <div className="calendar-view animate-in">
      {/* Header */}
      <div className="cal-header">
        <button className="cal-nav-btn" onClick={prevMonth}>
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <h2 className="cal-month">{MONTHS[month]} {year}</h2>
        <button className="cal-nav-btn" onClick={nextMonth}>
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      {/* Calendar grid */}
      <div className="cal-grid-card card">
        <div className="cal-days-header">
          {DAYS.map(d => <span key={d} className="cal-day-label">{d}</span>)}
        </div>
        <div className="cal-grid">
          {cells.map((day, i) => (
            <button
              key={i}
              className={`cal-cell ${day === today ? 'today' : ''} ${day === selectedDay ? 'selected' : ''} ${!day ? 'empty' : ''}`}
              onClick={() => day && setSelectedDay(day)}
              disabled={!day}
            >
              {day && (
                <>
                  <span className="cal-date">{day}</span>
                  {events[day] && (
                    <div className="cal-dots">
                      {events[day].map((e, j) => (
                        <span key={j} className="cal-dot" style={{ background: e.color }} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Day schedule */}
      <div className="cal-schedule card-lavender">
        <h3 className="cal-schedule-title">
          {DAYS[(new Date(year, month, selectedDay).getDay() + 6) % 7]?.charAt(0) + DAYS[(new Date(year, month, selectedDay).getDay() + 6) % 7]?.slice(1).toLowerCase()+'day'}, {MONTHS[month].slice(0, 3)} {selectedDay}
        </h3>

        <div className="cal-events">
          {schedule.map(evt => (
            <div key={evt.id} className="cal-event-item">
              <div className="cal-event-bar" />
              <div className="cal-event-card card">
                <p className="cal-event-time">{evt.time}</p>
                <p className="cal-event-title">{evt.title}</p>
                <p className="cal-event-detail">
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{evt.icon}</span>
                  {evt.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button className="cal-book-btn btn-outline-pill" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
          + Book a Room
        </button>
      </div>
    </div>
  );
}
