import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Attendee } from '@/types/types';
import { useAuth } from '@/context/AuthContext';

interface EventAttendeesProps {
  eventId: number;
  attendees: Attendee[];
  onAttendanceCheck?: (isAttending: boolean) => void;
}

//match events feature: list of users who have rsvp'd to the event and a button to dm them
const EventAttendees = ({
  eventId,
  attendees,
  onAttendanceCheck,
}: EventAttendeesProps) => {
  const { userId: currentUserId } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the current user is in the attendees list
    const isAttending = attendees.some(
      (a: Attendee) => String(a.user_id) === String(currentUserId)
    );

    if (onAttendanceCheck) {
      onAttendanceCheck(isAttending);
    }
  }, [attendees, currentUserId, onAttendanceCheck]);

  const handleSendMessage = (e: React.MouseEvent, attendee: Attendee) => {
    e.stopPropagation();
    console.log('The link was clicked.');

    if (!currentUserId || String(attendee.user_id) === String(currentUserId)) {
      return;
    }

    navigate('/messages/new', {
      state: {
        recipientId: attendee.user_id,
        recipientName: attendee.username,
      },
    });
  };

  //how it will look on the frontend
  return (
    <div className="mt-2">
      <p className="font-semibold text-sm">Attendees ({attendees.length})</p>
      <ul className="text-sm text-gray-700">
        {attendees.map((attendee) => (
          <li
            key={attendee.user_id}
            className="flex items-center justify-between"
          >
            <span>• {attendee.username}</span>

            {/* Only show message button if the attendee is not the current user */}
            {String(attendee.user_id) !== currentUserId && (
              <button
                onClick={(e) => handleSendMessage(e, attendee)}
                className="text-blue-600 text-xs hover:underline disabled:opacity-50 cursor-pointer"
                disabled={String(attendee.user_id) === currentUserId}
              >
                Message
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventAttendees;
