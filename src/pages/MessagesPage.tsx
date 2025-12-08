import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import ChatInput from '@/components/ChatInput';
import ConversationInbox from '@/components/ConversationInbox';
import MessageBubble from '@/components/MessageBubble';
import { useAuth } from '@/context/AuthContext';
import { useChatSocket } from '@/hooks/useChatSocket';
import { getConversationId } from '@/lib/utils';
import type { Message, Conversation } from '@/types/types';

const WS_URL = 'ws://localhost:8001/ws';
const API_URL = 'http://localhost:8001';

export default function MessagesPage() {
    const { token, userId, userName } = useAuth();
    const currentUserId = userId || '';
    const { conversationId } = useParams<{ conversationId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const activeConversation = useMemo(() => {
        if (!conversationId) return null;

        const found = conversations.find(
            (c) =>
                c.id === conversationId ||
                getConversationId(currentUserId, c.recipient_id) ===
                    conversationId
        );
        if (found) return found;

        const locState = location.state as {
            recipientId: string;
            recipientName?: string;
        } | null;
        if (locState?.recipientId) {
            return {
                id: conversationId,
                recipient_id: locState.recipientId,
                recipient_name: locState.recipientName,
                last_message: '',
                last_sender_id: '',
                updated_at: new Date().toISOString(),
            } as Conversation;
        }

        return null;
    }, [conversationId, conversations, currentUserId, location.state]);

    const recipientId = activeConversation?.recipient_id || '';
    const activeRecipientName = activeConversation?.recipient_name || 'Unknown';

    const { sendMessage } = useChatSocket(
        WS_URL,
        token,
        currentUserId,
        recipientId,
        setMessages,
        setConversations
    );

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Fetch conversations (Inbox)
    useEffect(() => {
        if (!token) return;

        const fetchConversations = async () => {
            try {
                const res = await fetch(`${API_URL}/inbox`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.conversations) {
                        setConversations(data.conversations);
                    }
                }
            } catch (error) {
                console.error('Error fetching conversations:', error);
            }
        };
        fetchConversations();
    }, [token]);

    // Fetch messages for selected conversation
    useEffect(() => {
        let active = true;

        if (!conversationId || !token) {
            setMessages([]);
            return;
        }

        // Fetch messages for this conversation
        const fetchMessages = async () => {
            try {
                const res = await fetch(
                    `${API_URL}/conversations/${conversationId}/messages`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (res.status === 403 || res.status === 404) {
                    navigate('/messages');
                    return;
                }

                if (res.ok) {
                    const data = await res.json();
                    if (active && Array.isArray(data)) {
                        setMessages(data);
                    }
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();

        return () => {
            active = false;
        };
    }, [conversationId, token, navigate]);

    // Send Message
    const handleSendMessage = useCallback(
        (message: string) => {
            if (recipientId) {
                sendMessage(recipientId, message);
            }
        },
        [recipientId, sendMessage]
    );

    const handleSelectConversation = useCallback(
        (selectedRecipientId: string, recipientName?: string) => {
            const targetId = getConversationId(
                currentUserId,
                selectedRecipientId
            );

            if (recipientName) {
                setConversations((prevConversations) => {
                    if (
                        prevConversations.some(
                            (c) => c.recipient_id === selectedRecipientId
                        )
                    )
                        return prevConversations;
                    return [
                        {
                            id: targetId,
                            recipient_id: selectedRecipientId,
                            recipient_name: recipientName,
                            last_message: '',
                            last_sender_id: '',
                            updated_at: new Date().toISOString(),
                        } as Conversation,
                        ...prevConversations,
                    ];
                });
            }

            navigate(`/messages/${targetId}`, {
                state: { recipientId: selectedRecipientId, recipientName },
            });
        },
        [currentUserId, navigate]
    );

    // Chat UI
    return (
        <div className="max-w-6xl mx-auto p-4 h-[calc(100vh-64px)]">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden flex h-full border border-gray-200">
                {/* Conversation Inbox */}
                <ConversationInbox
                    conversations={conversations}
                    currentRecipientId={recipientId}
                    currentUserId={currentUserId}
                    currentUserName={userName || 'Me'}
                    onSelect={handleSelectConversation}
                    token={token || ''}
                />

                {/* Chat Area */}
                <div className="w-2/3 flex flex-col bg-white">
                    {recipientId ? (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b shadow-sm flex justify-between items-center bg-white z-10">
                                <span className="font-bold text-lg text-gray-800 truncate">
                                    {activeRecipientName}
                                </span>
                            </div>

                            {/* Messages List */}
                            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
                                {messages.map((msg, index) => (
                                    <MessageBubble
                                        key={msg.id || index}
                                        msg={msg}
                                        isMe={msg.sender_id === currentUserId}
                                        senderName={
                                            msg.sender_id === currentUserId
                                                ? 'You'
                                                : activeRecipientName
                                        }
                                    />
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <ChatInput onSend={handleSendMessage} />
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <p className="text-xl font-semibold">
                                Select a conversation
                            </p>
                            <p className="text-sm">
                                or click "+ New Message" to start chatting
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
