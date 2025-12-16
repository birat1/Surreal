import { useEffect, useState } from "react";
import EventsCard from "@/components/EventsCard";
import type { Event } from "@/types/types";
import { useNavigate } from 'react-router-dom';

const EventsAndSocietiesPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const navigate = useNavigate();
  const [organiserFilter, setOrganiserFilter] = useState('');

  useEffect(() => {
    fetch("http://localhost:8000/events")
      .then((res) => res.json())
      .then((data: Event[]) => setEvents(data))
      .catch((err) => console.error(err));
  }, []);

//filter by organiser
 const fetchEvents = async () => {
  const params = new URLSearchParams();

  if (organiserFilter) {
    params.append('organiser', organiserFilter);
  }

  const res = await fetch(`http://localhost:8000/events?${params.toString()}`);
  const data = await res.json();
  setEvents(data);
};

useEffect(() => {
  fetchEvents();
}, [organiserFilter]);

//Show all the events avaliable
  return (
    <div className="mt-10 px-6">
      <input
        type="text"
        placeholder="Filter by organiser"
        value={organiserFilter}
        onChange={(e) => setOrganiserFilter(e.target.value)}
        className="border px-3 py-2 rounded w-64 mb-6"
      />
      <div className="grid grid-cols-4 gap-6">
        {events.map((event, index) => (
          <EventsCard key={index} event={event} />
        ))}
      </div>
      <button
          onClick={() => navigate('/create-event')}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded">
          Create Event
        </button>
    </div>
  );
};

export default EventsAndSocietiesPage;
