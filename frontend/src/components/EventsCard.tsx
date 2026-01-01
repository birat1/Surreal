import { EventsPageProps } from '@/types/types';

import { Card, CardContent, CardHeader } from './ui/card';

//view events: event card layout
const EventsCard = ({
  event,
  children,
  onRsvp,
  isAttending,
}: EventsPageProps & { isAttending: boolean }) => {
  return (
    <Card className="bg-blue-50 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-col items-center gap-2 pb-1 pt-3">
        <h2 className="text-lg font-semibold">{event.name_of_event}</h2>
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-0 space-y-1">
        <p>
          Date:{' '}
          {new Date(event.event_date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </p>
        <p>Time: {event.event_time}</p>
        <p>Location: {event.event_location}</p>
        <p>Organiser: {event.event_organiser}</p>

        <div className="flex justify-center mt-4">
          {!isAttending ? (
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded cursor-pointer"
              onClick={() => onRsvp(event.id)}
            >
              I'm going
            </button>
          ) : (
            <span className="text-green-600 font-semibold py-1">
              You're going!
            </span>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  );
};

export default EventsCard;
