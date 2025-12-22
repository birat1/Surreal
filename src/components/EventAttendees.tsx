import { useEffect, useState } from "react";
import type { Attendee } from "@/types/types";

const EventAttendees = ({ eventId }: { eventId: number }) => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8000/events/${eventId}/attendees`)
      .then(res => res.json())
      .then(data => {
        setAttendees(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, [eventId]);

  if (loading) return <p>Loading attendees...</p>;

  return (
    <div className="mt-2">
      <p className="font-semibold text-sm">Attendees ({attendees.length})</p>

      <ul className="text-sm text-gray-700">
        {attendees.map(user => (
          <li key={user.id}>• {user.username}</li>
        ))}
      </ul>
    </div>
  );
};

export default EventAttendees;