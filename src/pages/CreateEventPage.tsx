// This page contains the Create Event form

import { useState } from 'react';

// import { useNavigate } from "react-router-dom";
import type { CreateEventFormData } from '@/types/types';
import CreateEventForm from '@/components/CreateEventForm';

const CreateEventPage = () => {
    const [formData, setFormData] = useState<CreateEventFormData>({
        name_of_event: '',
        event_date: '',
        event_time: '',
        event_location: '',
        event_organiser: '',
    });

    return (
        <div className="min-h-screen flex justify-center pt-10 bg-gray-50">
            <div className="min-h-0 bg-white rounded-xl shadow p-4 ">
                <CreateEventForm
                    formData={formData}
                    setFormData={setFormData}
                />
            </div>
        </div>
    );
};

export default CreateEventPage;
