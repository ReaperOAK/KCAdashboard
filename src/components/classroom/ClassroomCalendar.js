
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ClassroomApi } from '../../api/classroom';

// --- Loading Skeleton ---
const CalendarLoadingSkeleton = React.memo(() => (
  <div className="flex flex-col items-center justify-center py-8 animate-fade-in" aria-busy="true" aria-label="Loading calendar">
    <div className="h-6 w-1/3 bg-gray-light rounded mb-4 animate-pulse" />
    <div className="h-4 w-1/2 bg-gray-light rounded animate-pulse" />
  </div>
));

// --- Error Alert ---
const CalendarErrorAlert = React.memo(({ message }) => (
  <div className="bg-red-700 border border-red-800 text-white rounded-lg px-4 py-3 mb-4 animate-fade-in" role="alert" aria-live="polite">
    <span className="font-semibold">Error:</span> {message}
  </div>
));

function ClassroomCalendar({ classroomId, onEventClick, onDateSelect, refreshTrigger = 0 }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async (info) => {
    setLoading(true);
    setError(null);
    try {
      // ClassroomApi.getClassroomSessions only takes classroomId, so we use params directly
      let response;
      if (classroomId) {
        response = await ClassroomApi.getClassroomSessions(classroomId);
      } else {
        // fallback: fetch all sessions (if endpoint exists)
        response = { success: false, events: [] };
      }
      if (response.success) {
        setEvents(response.events);
      } else {
        setError('Failed to load events');
      }
    } catch (err) {
      setError('Error fetching calendar events: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  // Only fetch on mount and when classroomId/refreshTrigger changes
  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchEvents, refreshTrigger]);

  // Memoize event handlers for calendar
  const handleDateClick = useCallback((info) => {
    if (onDateSelect) onDateSelect(info);
  }, [onDateSelect]);

  const handleEventClick = useCallback((info) => {
    if (onEventClick) {
      const eventId = Number(info.event.id);
      const eventObj = events.find(e => e.id === eventId);
      onEventClick(eventObj, info.event);
    }
  }, [onEventClick, events]);

  // Memoize calendar plugins and options
  const calendarPlugins = useMemo(() => [dayGridPlugin, timeGridPlugin, interactionPlugin], []);
  const headerToolbar = useMemo(() => ({
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  }), []);
  const eventTimeFormat = useMemo(() => ({
    hour: 'numeric',
    minute: '2-digit',
    meridiem: 'short',
  }), []);

  return (
    <section className="bg-background-light dark:bg-background-dark border border-gray-light shadow-md rounded-2xl p-2 sm:p-4 overflow-x-auto animate-fade-in w-full max-w-4xl mx-auto">
      {loading && <CalendarLoadingSkeleton />}
      {error && <CalendarErrorAlert message={error} />}
      <div className="min-w-[320px] sm:min-w-0">
        <FullCalendar
          plugins={calendarPlugins}
          initialView="dayGridMonth"
          headerToolbar={headerToolbar}
          events={events}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          height="auto"
          selectable
          selectMirror
          dayMaxEvents
          weekends
          eventTimeFormat={eventTimeFormat}
        />
      </div>
    </section>
  );
}

export default React.memo(ClassroomCalendar);
