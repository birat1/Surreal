import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { CreateEventFormProps } from '@/types/types';

import { Button } from './ui/button';
import { Card, CardHeader, CardContent } from './ui/card';
import { Input } from './ui/input';

import { toast } from 'sonner';

//for create event feature: admins can create events

const CreateEventForm: React.FC<CreateEventFormProps> = ({
  formData,
  setFormData,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!formData.name_of_event)
      newErrors.name_of_event = 'Event name is required';
    if (!formData.event_date) {
      newErrors.event_date = 'Event date is required';
    } else {
      const selectedDate = new Date(formData.event_date);
      if (selectedDate < today) {
        newErrors.event_date = 'Event date cannot be in the past';
      }
    }
    if (!formData.event_time) newErrors.event_time = 'Event time is required';
    if (!formData.event_location)
      newErrors.event_location = 'Event location is required';
    if (!formData.event_organiser)
      newErrors.event_organiser = 'Event organiser is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      const res = await fetch(
        'http://localhost:8080/events-and-societies/events',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to create event');
      }

      toast.success('Event created successfully!');
      navigate('/events');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong while creating the event.');
    } finally {
      setLoading(false);
    }
  };
  //what the frontend will look like
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

      <CardContent className="flex flex-col gap-1">
        <div className="flex flex-col gap-1">
          <Input
            name="name_of_event"
            placeholder="Event Name"
            value={formData.name_of_event}
            onChange={handleChange}
            className={`${errors.name_of_event ? 'border-red-500' : 'border-blue-300'} text-blue-600`}
          />
          {errors.name_of_event && (
            <span className="text-red-500 text-xs">{errors.name_of_event}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Input
            name="event_date"
            placeholder="Event Date"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={formData.event_date}
            onChange={handleChange}
            className={`${errors.event_date ? 'border-red-500' : 'border-blue-300'} text-blue-600`}
          />
          {errors.event_date && (
            <span className="text-red-500 text-xs">{errors.event_date}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Input
            name="event_time"
            placeholder="Event Time (HH:MM)"
            type="time"
            value={formData.event_time}
            onChange={handleChange}
            className={`${errors.event_time ? 'border-red-500' : 'border-blue-300'} text-blue-600`}
          />
          {errors.event_time && (
            <span className="text-red-500 text-xs">{errors.event_time}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Input
            name="event_location"
            placeholder="Event Location"
            value={formData.event_location}
            onChange={handleChange}
            className={`${errors.event_location ? 'border-red-500' : 'border-blue-300'} text-blue-600`}
          />
          {errors.event_location && (
            <span className="text-red-500 text-xs">
              {errors.event_location}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Input
            name="event_organiser"
            placeholder="Event Organiser"
            value={formData.event_organiser}
            onChange={handleChange}
            className={`${errors.event_organiser ? 'border-red-500' : 'border-blue-300'} text-blue-600`}
          />
          {errors.event_organiser && (
            <span className="text-red-500 text-xs">
              {errors.event_organiser}
            </span>
          )}
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
