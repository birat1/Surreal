/* import { Card, CardContent } from "@/components/ui/card";

const EventsAndSocietiesPage = () => {
  // array for 8 cards
  const dummyCards = Array.from({ length: 8 });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Events & Societies</h1>
      <div className="grid grid-cols-4 gap-6">
        {dummyCards.map((_, idx) => (
          <Card key={idx} className="h-40">
            <CardContent className="flex items-center justify-center text-gray-400">
              fetch("http://localhost:8000/events")
                .then(response => response.json())
                .then(data => {
                  console.log(data); // Array of events
                  // Render this data in your UI
                })
                .catch(error => console.error(error));
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EventsAndSocietiesPage; */

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

const EventsAndSocietiesPage = () => {
  const [events, setEvents] = useState([]);

  // Fetch events from backend on component mount
  useEffect(() => {
    fetch("http://localhost:8000/events")
      .then((response) => response.json())
      .then((data) => setEvents(data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="p-8">
      {/* Title */}
      <h1 className="text-3xl font-bold mb-6">Events & Societies</h1>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-6">
        {events.length === 0 ? (
          <p className="text-gray-500 col-span-4">Loading events...</p>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="h-40">
              <CardContent className="flex flex-col justify-center items-center text-gray-700">
                <h2 className="font-bold">{event.name_of_event}</h2>
                <p>{event.event_date} at {event.event_time}</p>
                <p>{event.event_location}</p>
                <p>Organiser: {event.event_organiser}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default EventsAndSocietiesPage;
