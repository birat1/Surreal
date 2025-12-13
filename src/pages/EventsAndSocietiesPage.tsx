import { useEffect, useState } from "react";
import EventsCard from "@/components/EventsCard";
import type { Event } from "@/types/types";

const EventsAndSocietiesPage = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/events")
      .then((res) => res.json())
      .then((data: Event[]) => setEvents(data))
      .catch((err) => console.error(err));
  }, []);

//Show all the events avaliable
  return (
    <div className="flex flex-col items-center mt-10 px-6">
      <div className="grid grid-cols-4 gap-6">
        {events.map((event, index) => (
          <EventsCard key={index} event={event} />
        ))}
      </div>
    </div>
  );
};

export default EventsAndSocietiesPage;
