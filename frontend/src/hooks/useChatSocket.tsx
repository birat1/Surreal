import { useCallback, useEffect, useRef, useState } from 'react';

import type { Conversation, Message } from '@/types/types';

export function useChatSocket(
  url: string,
  isAuthenticated: boolean,
  currentUserId: string,
  recipientId: string,
  recipientName: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>
) {
  const [isReady, setIsReady] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const recipientRef = useRef(recipientId);
  const nameRef = useRef(recipientName);

  useEffect(() => {
    recipientRef.current = recipientId;
    nameRef.current = recipientName;
  }, [recipientId, recipientName]);

  useEffect(() => {
    return () => {
      socketRef.current?.close();
    };
  }, []);

  const sendReadReceipt = useCallback((senderId: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({ type: 'read_receipt', sender_id: senderId })
      );
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !currentUserId) return;

    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('Connected to WebSocket as:', currentUserId);
      setIsReady(true);
    };

    ws.onclose = (event) => {
      setIsReady(false);
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

        // Handle read receipt
        if (data.type === 'read_receipt') {
          setMessages((prevMessages) =>
            prevMessages.map((msg) => {
              if (msg.recipient_id === data.reader_id && !msg.read_at) {
                return { ...msg, read_at: data.read_at };
              }
              return msg;
            })
          );
          return;
        }

        // Determine who the message is for
        const chattingWith =
          data.sender_id === currentUserId ? data.recipient_id : data.sender_id;
        const isIncoming = data.sender_id !== currentUserId;

        //console.log(
        //`Msg from: ${chattingWith}, Current Ref: ${recipientRef.current}, Match? ${chattingWith === recipientRef.current}`
        //);

        // If the message is for the currently open chat, add it to messages immediately
        if (chattingWith === recipientRef.current) {
          setMessages((prevMessages) => [...prevMessages, data]);

          // Send read receipt if incoming
          if (isIncoming) {
            sendReadReceipt(data.sender_id);
          }
        }

        // Update conversations inbox
        setConversations((prevConversations) => {
          // Check if conversation already exists
          const existingIndex = prevConversations.findIndex(
            (c) => c.recipient_id === chattingWith
          );
          const existing = prevConversations[existingIndex];

          // Determine display name
          let display_name = existing?.recipient_name;
          if (!display_name) {
            if (isIncoming) {
              display_name = data.sender_name;
            } else if (chattingWith === recipientRef.current) {
              display_name = nameRef.current;
            }
          }

          // Create the updated conversation object
          const updatedConversation: Conversation = {
            id: data.conversation_id || (existing ? existing.id : 'new'),
            recipient_id: chattingWith,
            recipient_name: display_name || 'Unknown',
            last_message: data.body,
            last_sender_id: data.sender_id,
            updated_at: new Date().toISOString(),
          };

          // Reorder conversations: updated one goes to top
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
      ws.close();
    };
  }, [
    url,
    isAuthenticated,
    currentUserId,
    setMessages,
    setConversations,
    sendReadReceipt,
  ]);

  const sendMessage = useCallback((recipient: string, body: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ recipient_id: recipient, body }));
    }
  }, []);

  return { sendMessage, sendReadReceipt, isReady };
}
