import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import ChatInput from '@/components/ChatInput';
import ConversationInbox from '@/components/ConversationInbox';
import MessageBubble from '@/components/MessageBubble';
import { useAuth } from '@/context/AuthContext';
import { useChatSocket } from '@/hooks/useChatSocket';
import type { Message, Conversation } from '@/types/types';

const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const WS_URL = `${protocol}://localhost:8080/messaging/ws`;

const API_URL = 'http://localhost:8080/messaging';

export default function MessagesPage() {
    const { isAuthenticated, userId, userName } = useAuth();
    const currentUserId = userId || '';
    const { conversationId } = useParams<{ conversationId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Redirect if trying to access a draft conversation that now exists
    useEffect(() => {
        if (conversationId === 'new' || conversationId?.startsWith('new-')) {
            let targetRecipientId = '';

            // Determine recipient ID from state or URL
            const locState = location.state as { recipientId: string } | null;
            if (locState?.recipientId) {
                targetRecipientId = locState.recipientId;
            } else if (conversationId.startsWith('new-')) {
                targetRecipientId = conversationId.replace('new-', '');
            }

            // Check if a real conversation now exists
            if (targetRecipientId) {
                const existingRealConv = conversations.find(
                    (c) =>
                        c.recipient_id === targetRecipientId &&
                        c.id !== 'new' &&
                        !c.id.startsWith('new-')
                );

                // If found, redirect to it
                if (existingRealConv) {
                    navigate(`/messages/${existingRealConv.id}`, {
                        replace: true,
                        state: location.state,
                    });
                }
            }
        }
    }, [conversationId, conversations, location.state, navigate]);

    // Optimistically add new conversation if from friends finder
    useEffect(() => {
        const state = location.state as {
            recipientId: string;
            recipientName: string;
        } | null;

        // If state has recipientId and recipientName, add new conversation
        if (state?.recipientId && state.recipientName && currentUserId) {
            setConversations((prevConversations) => {
                const exists = prevConversations.some(
                    (c) => c.recipient_id === state.recipientId
                );

                // If not exists, add new conversation
                if (!exists) {
                    const newConversation: Conversation = {
                        id: `new-${state.recipientId}`, // Temporary ID
                        recipient_id: state.recipientId,
                        recipient_name: state.recipientName,
                        last_message: '',
                        last_sender_id: '',
                        updated_at: new Date().toISOString(),
                    };
                    return [newConversation, ...prevConversations];
                }
                return prevConversations;
            });
        }
    }, [location.state, currentUserId]);

    // Active Conversation details
    const activeConversation = useMemo(() => {
        if (!conversationId) return null;

        // Handle draft conversations
        if (conversationId === 'new' || conversationId.startsWith('new-')) {
            const locState = location.state as {
                recipientId: string;
                recipientName: string;
            } | null;

            // If no state, cannot determine recipient
            if (locState?.recipientId) {
                return {
                    id: conversationId,
                    recipient_id: locState.recipientId,
                    recipient_name: locState.recipientName || 'Unknown',
                    last_message: '',
                    last_sender_id: '',
                    updated_at: new Date().toISOString(),
                } as Conversation;
            }
            return null;
        }

        // Find existing conversation
        const found = conversations.find((c) => c.id === conversationId);
        if (found) return found;

        return null;
    }, [conversationId, conversations, location.state]);

    const recipientId = activeConversation?.recipient_id || '';
    const activeRecipientName = activeConversation?.recipient_name || 'Unknown';

    const { sendMessage, sendReadReceipt, isReady } = useChatSocket(
        WS_URL,
        isAuthenticated,
        currentUserId,
        recipientId,
        activeRecipientName,
        setMessages,
        setConversations
    );

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Send read receipt on opening conversation
    useEffect(() => {
        if (recipientId && isAuthenticated && isReady) {
            sendReadReceipt(recipientId);
        }
    }, [recipientId, isAuthenticated, isReady, sendReadReceipt]);

    // Fetch conversations (Inbox)
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchConversations = async () => {
            try {
                const res = await fetch(`${API_URL}/inbox`, {
                    credentials: 'include',
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.conversations) {
                        setConversations((currentConv) => {
                            // Replace with fetched conversations
                            const convList =
                                data.conversations as Conversation[];

                            // Preserve drafts
                            const drafts = currentConv.filter(
                                (c) => c.id === 'new' || c.id.startsWith('new-')
                            );

                            // Merge drafts with fetched conversations
                            const uniqueDrafts = drafts.filter(
                                (draft) =>
                                    !convList.some(
                                        (convList) =>
                                            convList.recipient_id ===
                                            draft.recipient_id
                                    )
                            );

                            return [...uniqueDrafts, ...convList];
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching conversations:', error);
            }
        };
        fetchConversations();
    }, [isAuthenticated, conversationId]);

    // Fetch messages for selected conversation
    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        setMessages([]);

        // Ignore drafts or invalid conversation IDs
        if (
            !conversationId ||
            conversationId == 'new' ||
            conversationId.startsWith('new-') ||
            !isAuthenticated
        ) {
            return;
        }

        // Fetch messages for this conversation
        const fetchMessages = async () => {
            try {
                const res = await fetch(
                    `${API_URL}/conversations/${conversationId}/messages`,
                    {
                        credentials: 'include',
                        signal: signal,
                    }
                );

                if (res.status === 403 || res.status === 404) {
                    if (!signal.aborted) navigate('/messages');
                    return;
                }

                if (res.ok) {
                    const data = await res.json();
                    if (!signal.aborted && Array.isArray(data)) {
                        setMessages(data);
                    }
                }
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error('Error fetching messages:', error);
                }
            }
        };

        fetchMessages();

        return () => {
            controller.abort();
        };
    }, [conversationId, isAuthenticated, navigate]);

    // Send Message
    const handleSendMessage = useCallback(
        (message: string) => {
            if (recipientId) {
                sendMessage(recipientId, message);
            }
        },
        [recipientId, sendMessage]
    );

    // Handle selecting a conversation from inbox
    const handleSelectConversation = useCallback(
        (selectedRecipientId: string, recipientName?: string) => {
            const existingConv = conversations.find(
                (c) => c.recipient_id === selectedRecipientId
            );

            // If existing conversation found, navigate to it
            if (
                existingConv &&
                existingConv.id !== 'new' &&
                !existingConv.id.startsWith('new-')
            ) {
                navigate(`/messages/${existingConv.id}`, {
                    state: { recipientId: selectedRecipientId, recipientName },
                });
                return;
            }

            // If no existing conversation, optimistically add one
            if (!existingConv) {
                setConversations((prevConversations) => [
                    {
                        id: `new-${selectedRecipientId}`, // Temporary ID
                        recipient_id: selectedRecipientId,
                        recipient_name: recipientName || 'Unknown',
                        last_message: '',
                        last_sender_id: '',
                        updated_at: new Date().toISOString(),
                    } as Conversation,
                    ...prevConversations,
                ]);
            }

            // Redirect to new message route
            navigate(`/messages/new`, {
                state: { recipientId: selectedRecipientId, recipientName },
            });
        },
        [conversations, navigate]
    );

    // Chat UI
    return (
        <div className="max-w-6xl mx-auto p-4 h-[calc(100vh-64px)] pt-32">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden flex h-full border border-gray-200">
                {/* Conversation Inbox */}
                <ConversationInbox
                    conversations={conversations}
                    currentRecipientId={recipientId}
                    currentUserId={currentUserId}
                    currentUserName={userName || 'Me'}
                    onSelect={handleSelectConversation}
                    isAuthenticated={isAuthenticated}
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
