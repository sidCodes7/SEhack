import React from 'react';
import '../../styles/timeline.css';

export default function AutomationTimeline({ events }) {
  return (
    <div className="timeline" id="automation-timeline">
      {events.map((evt, i) => (
        <React.Fragment key={evt.id}>
          {i > 0 && <div className="timeline-connector" />}
          <div className="timeline-event">
            <div className="timeline-event-dot" style={{ background: evt.color }} />
            <span className="timeline-event-time">{evt.time}</span>
            <span>{evt.icon}</span>
            <span>{evt.text}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
