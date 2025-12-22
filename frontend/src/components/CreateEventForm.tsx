import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type {CreateEventFormProps} from '@/types/types';

import { Button } from './ui/button';
import { Card, CardHeader, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';


const CreateEventForm: React.FC<CreateEventFormProps> = ({
  formData,
  setFormData,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8080/events-and-societies/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to create event');
      }

      alert('Event created successfully!');
      navigate('/events-and-societies');
    } catch (err) {
      console.error(err);
      alert('Something went wrong while creating the event.');
    } finally {
      setLoading(false);
    }
  };

    return (
        <Card className="w-full h-full shadow-lg p-4 bg-white overflow-y-auto border border-blue-700">
            <CardHeader>
                <h2 className="text-blue-600 text-2xl font-bold text-center">
                    Create an Event
                </h2>
                <p className="text-blue-700 text-center text-sm mt-2">
                    Please populate the fields with your event's corresponding details
                </p>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
                    <Input
                        name="name_of_event"
                        placeholder="Event Name"
                        value={formData.name_of_event}
                        onChange={handleChange}
                        className="border-blue-300 text-blue-600 focus:ring-blue-500"
                    />

                    <Input
                        name="event_date"
                        placeholder="Event Date"
                        value={formData.event_date}
                        onChange={handleChange}
                        className="border-blue-300 text-blue-600 focus:ring-blue-500"
                    />

                    <div className="flex flex-col gap-1">
                        <Input
                            name="event_time"
                            placeholder="Event Time"
                            value={formData.event_time}
                            onChange={handleChange}
                            className="border-blue-300 text-blue-600 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Input
                            name="event_location"
                            placeholder="Event Location"
                            value={formData.event_location}
                            onChange={handleChange}
                            className="border-blue-300 text-blue-600 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Input
                            name="event_organiser"
                            placeholder="Event Organiser"
                            value={formData.event_organiser}
                            onChange={handleChange}
                            className="border-blue-300 text-blue-600 focus:ring-blue-500"
                        />
                    </div>

                <Button
                    className=" mt-4 border-blue-300 text-blue-600"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save and Continue'}
                </Button>
            </CardContent>
        </Card>
    );
};

export default CreateEventForm;
