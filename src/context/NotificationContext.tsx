import { createContext, useContext, useEffect, useState } from "react";

const baseUrl = 'http://localhost:8081';

export interface NotificationGroup {
  id: string;
  senderId: string;
  conversationId: string;
  unreadCount: number;
  lastMessagePreview: string;
  lastMessageAt: number;
}

interface NotificationState {
  notifications: NotificationGroup[];
  unreadCount: number;
  connected: boolean;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}


const NotificationContext = createContext<NotificationState>({
    notifications: [],
    unreadCount: 0,
    connected: false,
    markAllRead: async () => {},
    markRead: async () => {}
});

export const  NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {

    const [notifications, setNotifications] = useState<NotificationGroup[]>([]);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const fetchUnreadNotifications = async () => {

            try {
                const res = await fetch(`${baseUrl}/notifications/unread`, {credentials: "include"});

                if (!res.ok) throw new Error('Failed to fetch notifications');

                const data: NotificationGroup[] = await res.json();

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
            const incoming: NotificationGroup = JSON.parse(event.data);

            setNotifications(prev => {
                const updated = prev
                    .filter(n => n.id !== incoming.id)
                    .concat(incoming)
                    .filter(n => n.unreadCount > 0)
                    .sort((a, b) => b.lastMessageAt - a.lastMessageAt);
                return updated
            });


        }

        eventSource.onerror = () => {
            setConnected(false);
            eventSource.close();
        }

        return () => eventSource.close()
    }, []);

    const unreadCount = notifications.reduce(
        (sum, n) => sum + n.unreadCount, 0
    );
    
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
            console.error("Failed to mark notification group as read:", err);
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