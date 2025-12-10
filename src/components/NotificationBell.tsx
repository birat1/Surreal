import { Bell } from 'lucide-react';

export default function NotificationBell() {
    return (
        <div className='hover:bg-gray-300 hover:cursor-pointer rounded-full p-1.5'>
            <Bell className='text-gray-700'/>
        </div>
    )
}