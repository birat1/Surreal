import { Card, CardContent } from "@/components/ui/card";

const EventsAndSocietiesPage = () => {
  // array for 8 cards
  const dummyCards = Array.from({ length: 8 });

  return (
    <div className="p-8">
      <div className="grid grid-cols-4 gap-6">
        {dummyCards.map((_, idx) => (
          <Card key={idx} className="h-40">
            <CardContent className="flex items-center justify-center text-gray-400">
              User Card
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EventsAndSocietiesPage;
