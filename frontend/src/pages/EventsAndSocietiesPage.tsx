import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import EventAttendees from '@/components/EventAttendees';
import EventsCard from '@/components/EventsCard';
import { useAuth } from '@/context/AuthContext';
import type { Event } from '@/types/types';

const EventsAndSocietiesPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const navigate = useNavigate();
  const [userAttendance, setUserAttendance] = useState<Record<number, boolean>>(
    {}
  );
  const [organiserFilter, setOrganiserFilter] = useState('');
  const {
    isAdmin,
  } = useAuth();

  // Only update attendance status when it changes (Avoiding unnecessary re-renders)
  const handleAttendanceCheck = useCallback(
    (eventId: number, isAttending: boolean) => {
      setUserAttendance((prev) => {
        if (prev[eventId] === isAttending) return prev;
        return { ...prev, [eventId]: isAttending };
      });
    },
    []
  );

  //filter by organiser
  const fetchEvents = async () => {
    const params = new URLSearchParams();

    if (organiserFilter) {
      params.append('organiser', organiserFilter);
    }

    const res = await fetch(
      `http://localhost:8080/events-and-societies/events?${params.toString()}`,
      {
        credentials: 'include',
      }
    );
    const data = await res.json();
    setEvents(data);
  };

  useEffect(() => {
    fetchEvents();
  }, [organiserFilter]);

  const rsvp = async (eventId: number) => {
    const res = await fetch(
      `http://localhost:8080/events-and-societies/events/${eventId}/rsvp`,
      {
        method: 'POST',
        credentials: 'include',
      }
    );

    if (!res.ok) {
      alert('Failed to RSVP');
      return;
    }

    const attendeesRes = await fetch(
      `http://localhost:8080/events-and-societies/events/${eventId}/attendees`,
      {
        credentials: 'include',
      }
    );
    const updatedAttendees = await attendeesRes.json();

    setEvents((prevEvents) => {
      return prevEvents.map((event) =>
        event.id === eventId ? { ...event, attendees: updatedAttendees } : event
      );
    });

    console.log('RSVP clicked', eventId);
    handleAttendanceCheck(eventId, true);
  };

  //Show all the events avaliable
  return (
    <div className="mt-10 px-6 pt-32">
      <input
        type="text"
        placeholder="Filter by organiser"
        value={organiserFilter}
        onChange={(e) => setOrganiserFilter(e.target.value)}
        className="border px-3 py-2 rounded w-64 mb-6"
      />
      <div className="grid grid-cols-4 gap-6">
        {events.map((event) => (
          <EventsCard
            key={event.id}
            event={event}
            onRsvp={rsvp}
            isAttending={userAttendance[event.id] || false}
          >
            <EventAttendees
              eventId={event.id}
              attendees={event.attendees || []}
              onAttendanceCheck={(isAttending) =>
                handleAttendanceCheck(event.id, isAttending)
              }
            />
          </EventsCard>
        ))}
      </div>
      {isAdmin && (
        <button
          onClick={() => navigate('/events/create')}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded mb-6 cursor-pointer"
        >
          Create Event
        </button>
      )}
    </div>
  );
};

export default EventsAndSocietiesPage;
