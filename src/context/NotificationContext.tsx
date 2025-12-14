import { createContext, useContext, useEffect, useState } from "react";

const baseUrl = 'http://localhost:8081';

export interface Notification {
  id: string;
  message: string;
  type: string;
  timeStamp: number;
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  connected: boolean;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}


const NotificationContext = createContext<NotificationState | null>(null);

export const  NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const fetchUnreadNotifications = async () => {

            try {
                const res = await fetch(`${baseUrl}/notifications/unread`, {credentials: "include"});

                if (!res.ok) throw new Error('Failed to fetch notifications');

                const data: Notification[] = await res.json();

                setNotifications(data);
            } catch (err) {
                console.error('Error fetching unread notifications:', err);
            }
        };
        fetchUnreadNotifications();
    }, []);
    

    useEffect(() => {
        const eventSource = new EventSource(`${baseUrl}/stream`, {withCredentials: true});

        eventSource.onopen = () => setConnected(true);

        eventSource.onmessage = (event) => {
            const notification = JSON.parse(event.data);

            if (notification.type == "system") return;

            setNotifications(prev => [notification, ...prev]);
        }

        eventSource.onerror = () => {
            setConnected(false);
            eventSource.close();
        }

        return () => eventSource.close()
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;
    
    const markAllRead = async () => {

        setNotifications([]);

        await fetch(`${baseUrl}/notifications/mark-read`, {
            method: "PATCH",
            credentials: "include"
        });
    };

    const markRead = async (id: string) => {
        setNotifications(prev =>
            prev.filter(notification => notification.id !== id)
        );

        try {
            await fetch(`${baseUrl}/notifications/${id}/mark-read`, {
                method: "PATCH",
                credentials: "include"
            });
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    };
    
    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                connected,
                markAllRead,
                markRead
            }}
        >
            {children}
        </NotificationContext.Provider>
    )
};

export const useNotifications = () => useContext(NotificationContext);