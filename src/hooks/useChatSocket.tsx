import { useCallback, useEffect, useRef } from 'react';

import { getConversationId } from '@/lib/utils';
import type { Conversation, Message } from '@/types/types';

export function useChatSocket(
    url: string,
    token: string | null,
    currentUserId: string,
    recipientId: string,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>
) {
    const socketRef = useRef<WebSocket | null>(null);
    const recipientRef = useRef(recipientId);

    useEffect(() => {
        recipientRef.current = recipientId;
    }, [recipientId]);

    useEffect(() => {
        return () => {
            socketRef.current?.close();
        };
    }, []);

    useEffect(() => {
        if (!token || !currentUserId) return;

        const ws = new WebSocket(`${url}?token=${token}`);

        ws.onopen = () => {
            console.log('Connected to WebSocket as:', currentUserId);
        };

        ws.onclose = (event) => {
            if (event.code === 1008) {
                console.warn('Connection rejected: Invalid user.');
            } else if (event.code === 1006) {
                console.warn('Server unreachable. Is docker running?');
            } else {
                console.warn('Disconnected from server.');
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'error') {
                    console.error('WS Error:', data);
                    return;
                }

                const chattingWith =
                    data.sender_id === currentUserId
                        ? data.recipient_id
                        : data.sender_id;
                const isIncoming = data.sender_id !== currentUserId;

                //console.log(
                //`Msg from: ${chattingWith}, Current Ref: ${recipientRef.current}, Match? ${chattingWith === recipientRef.current}`
                //);

                // If the message is for the currently open chat, add it to messages immediately
                if (chattingWith === recipientRef.current) {
                    setMessages((prevMessages) => [...prevMessages, data]);
                }

                // Update conversations inbox
                setConversations((prevConversations) => {
                    // Check if conversation already exists
                    const existingIndex = prevConversations.findIndex(
                        (c) => c.recipient_id === chattingWith
                    );
                    const existingName =
                        existingIndex !== -1
                            ? prevConversations[existingIndex].recipient_name
                            : undefined;

                    let display_name = existingName;
                    if (!display_name && isIncoming) {
                        console.log('WS Message Received:', data);

                        if (!data.sender_name)
                            console.error(
                                'Sender name missing in WS message data'
                            );
                        display_name = data.sender_name;
                    }

                    // Create the updated conversation object
                    const updatedConversation: Conversation = {
                        id:
                            existingIndex !== -1
                                ? prevConversations[existingIndex].id
                                : getConversationId(
                                      currentUserId,
                                      chattingWith
                                  ),
                        recipient_id: chattingWith,
                        recipient_name: display_name,
                        last_message: data.body,
                        last_sender_id: data.sender_id,
                        updated_at: new Date().toISOString(),
                    };

                    const newConversations = [...prevConversations];
                    if (existingIndex !== -1) {
                        newConversations.splice(existingIndex, 1);
                    }

                    return [updatedConversation, ...newConversations];
                });
            } catch (error) {
                console.error('Error parsing WS message:', error);
            }
        };
        socketRef.current = ws;

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [url, token, currentUserId, setMessages, setConversations]);

    const sendMessage = useCallback((recipient: string, body: string) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(
                JSON.stringify({ recipient_id: recipient, body })
            );
        }
    }, []);

    return { sendMessage };
}
