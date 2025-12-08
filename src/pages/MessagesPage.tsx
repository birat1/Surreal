import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Message, Conversation } from '@/types/types';
import MessageBubble from '@/components/MessageBubble';
import ConversationInbox from '@/components/ConversationInbox';
import { getConversationId } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const WS_URL = 'ws://localhost:8001/ws';
const API_URL = 'http://localhost:8001';

export default function MessagesPage() {
    const { token, userId, userName } = useAuth();
    const currentUserId = userId || '';

    const { conversationId } = useParams<{ conversationId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // Data
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState('');

    const activeConversation = useMemo(() => {
        if (!conversationId) return null;
        
        const found = conversations.find(c => c.id === conversationId || getConversationId(currentUserId, c.recipient_id) === conversationId);
        if (found) return found;

        const locState = location.state as { recipientId: string; recipientName?: string } | null;
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

    // Refs
    const recipientRef = useRef('');
    useEffect(() => {
        recipientRef.current = recipientId;
    }, [recipientId]);

    const socketRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        return () => {
            socketRef.current?.close();
        };
    }, []);

    // WebSocket Connection
    useEffect(() => {
        if (!token || !currentUserId) return;

        const ws = new WebSocket(`${WS_URL}?token=${token}`);

        ws.onopen = () => {
            console.log('Connected to WebSocket as:', currentUserId);
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'error') {
                    console.error('WS Error:', data);
                    return;
                }

                const chattingWith = data.sender_id === currentUserId ? data.recipient_id : data.sender_id;
                const isIncoming = data.sender_id !== currentUserId;

                // If the message is for the currently open chat, add it to messages immediately
                if (chattingWith === recipientRef.current) {
                    setMessages((prevMessages) => [...prevMessages, data]);
                }

                // Update conversations inbox
                setConversations((prevConversations) => {
                    // Check if conversation already exists
                    const existingIndex = prevConversations.findIndex(c => c.recipient_id === chattingWith);
                    const existingName = existingIndex !== -1 ? prevConversations[existingIndex].recipient_name : undefined;

                    let display_name = existingName;
                    if (!display_name && isIncoming) {
                        console.log("WS Message Received:", data);

                        if (!data.sender_name) console.error("Sender name missing in WS message data");
                        display_name = data.sender_name;
                    }

                    // Create the updated conversation object
                    const updatedConversation: Conversation = {
                        id: existingIndex !== -1 ? prevConversations[existingIndex].id : getConversationId(currentUserId, chattingWith),
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

        ws.onclose = (event) => {
            setIsConnected(false);
            if (event.code === 1008) {
                setConnectionError('Connection rejected: Invalid user.');
            } else if (event.code === 1006) {
                setConnectionError("Server unreachable. Is docker running?");
            } else {
                setConnectionError('Disconnected from server.');
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
        socketRef.current = ws;

        return () => {
            ws.close();
        };
    }, [token, currentUserId]);

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
                const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

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
        }
    }, [conversationId, token, navigate]);

    // Send Message
    const handleSendMessage = useCallback(() => {
        if (!socketRef.current || !recipientId || !inputMessage.trim()) return;

        const payload = {
            recipient_id: recipientId,
            body: inputMessage,
        };

        socketRef.current.send(JSON.stringify(payload));
        setInputMessage('');
    }, [recipientId, inputMessage]);

    const handleSelectConversation = (selectedRecipientId: string, recipientName?: string) => {
        const targetConversationId = getConversationId(currentUserId, selectedRecipientId);

        navigate(`/messages/${targetConversationId}`, { 
            state: { 
                recipientId: selectedRecipientId, 
                recipientName: recipientName 
            } 
        });

        if (recipientName) {
            setConversations((prevConversations) => {
                const exists = prevConversations.some(c => c.recipient_id === selectedRecipientId);
                if (!exists) {
                    const newConversation: Conversation = {
                        id: targetConversationId,
                        recipient_id: selectedRecipientId,
                        recipient_name: recipientName,
                        last_message: '',
                        last_sender_id: '',
                        updated_at: new Date().toISOString(),
                    };
                    return [newConversation, ...prevConversations];
                }
                return prevConversations;
            });
        }
    };

    const activeRecipientName = activeConversation?.recipient_name || activeConversation?.recipient_id.slice(0, 8) + '...' || 'Unknown';

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
                                <span className="font-bold text-lg text-gray-800 truncate">{activeRecipientName}</span>
                            </div>

                            {/* Messages List */}
                            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
                                {messages.map((msg, index) => (
                                    <MessageBubble 
                                        key={msg.id || index} 
                                        msg={msg} 
                                        isMe={msg.sender_id === currentUserId}
                                        senderName={msg.sender_id === currentUserId ? 'You' : activeRecipientName}
                                    />
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white border-t">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Type a message..."
                                        className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    />
                                    <button 
                                        onClick={handleSendMessage}
                                        disabled={!inputMessage.trim()}
                                        className="bg-blue-600 text-white px-6 rounded-full hover:bg-blue-700 disabled:opacity-50 font-medium transition"
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <p className="text-xl font-semibold">Select a conversation</p>
                            <p className="text-sm">or click "+ New Message" to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}