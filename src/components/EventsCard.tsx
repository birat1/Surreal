import { Card, CardContent, CardHeader } from "./ui/card";
import { EventsCardProps } from "@/types/types";

const EventsCard = ({ event }: EventsCardProps) => {
  return (
    <Card className="bg-blue-50 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-col items-center gap-2 pb-1 pt-3">
        <h2 className="text-lg font-semibold">{event.name_of_event}</h2>
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-0 space-y-1">
        <p>Date: {event.event_date}</p>
        <p>Time: {event.event_time}</p>
        <p>Location: {event.event_location}</p>
        <p>Organiser: {event.event_organiser}</p>
      </CardContent>
    </Card>
  );
};

export default EventsCard;
