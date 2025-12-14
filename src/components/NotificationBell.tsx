import { Bell, CheckCheck, MessagesSquare, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { useNotifications, Notification } from '../context/NotificationContext';

import { Button } from './ui/button';

export default function NotificationBell() {
    const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                className={`hover:bg-gray-300 hover:cursor-pointer rounded-full p-1.5 
                    ${open && "bg-gray-300"}`}
                onClick={() => setOpen(!open)}
            >
                <Bell className="text-gray-700" />
                {unreadCount > 0 && (
                    <span className="
                        absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full min-w-[18px] h-[18px]
                        flex items-center justify-center
                    ">
                        {unreadCount > 50 ? "50+" : unreadCount}
                    </span>
                )}
            </div>
            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-md rounded-lg z-50">
                    <div className="flex justify-between items-center p-2 border-b border-gray-200">
                        <span className="font-semibold text-lg">Notifications</span>
                        <Button
                            className='text-white bg-blue-600 rounded-lg hover:cursor-pointer hover:bg-blue-700'
                            size={"sm"}
                            onClick={markAllRead}
                        >
                            Clear All
                        </Button>
                    </div>

                    <div className="flex flex-col h-80 max-h-80 overflow-y-auto pt-2 gap-2">
                        {notifications.length === 0 ? (
                            <div className='flex flex-col justify-center items-center my-auto'>
                                <CheckCheck  size={50} className='text-gray-400' />
                                <p className="p-1 text-gray-500 text-sm">No new notifications</p>
                            </div>
                        ) : (
                            notifications.map((notif: Notification) => (
                                <div
                                    key={notif.id}
                                    className="flex justify-between items-center gap-4 bg-gray-100 hover:bg-gray-200 hover:cursor-pointer min-h-20 w-[95%] mx-auto rounded-xl p-3"
                                >   
                                    <div className='flex items-center gap-4'>
                                        <MessagesSquare className="text-gray-500"/>
                                        <p className="text-sm">{notif.message}</p>
                                    </div>
                                    <X
                                        className="text-gray-500 hover:text-gray-700 hover:cursor-pointer"
                                        onClick={() => markRead(notif.id)}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>

    );
}
