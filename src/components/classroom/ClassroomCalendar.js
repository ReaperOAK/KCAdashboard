import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ApiService from '../../utils/api';

const ClassroomCalendar = ({ 
  classroomId, 
  onEventClick, 
  onDateSelect,
  refreshTrigger = 0 
}) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchEvents = useCallback(async (info) => {
    try {
      setLoading(true);
      setError(null);
      
      const startDate = info?.startStr || new Date().toISOString().split('T')[0];
      const endDate = info?.endStr || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const params = {
        start: startDate,
        end: endDate
      };
      
      if (classroomId) {
        params.classroom_id = classroomId;
      }
      
      const response = await ApiService.get('/classroom/get-sessions.php', { params });
      
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
  
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents, refreshTrigger]);
  
  const handleDateClick = (info) => {
    if (onDateSelect) {
      onDateSelect(info);
    }
  };
  
  const handleEventClick = (info) => {
    if (onEventClick) {
      const eventId = Number(info.event.id);
      const eventObj = events.find(e => e.id === eventId);
      onEventClick(eventObj, info.event);
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-[#461fa3]" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        height="auto"
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short'
        }}
      />
    </div>
  );
};

export default ClassroomCalendar;
