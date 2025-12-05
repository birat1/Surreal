import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import type { Message, Conversation } from '@/types/types';
import MessageBubble from '@/components/MessageBubble';
import ConversationInbox from '@/components/ConversationInbox';
import { getConversationId } from '@/lib/utils';
import { AuthContext } from '@/context/AuthContext';

const WS_URL = 'ws://localhost:8001/ws';
const API_URL = 'http://localhost:8001';

export default function MessagesPage() {
    const { token, userId } = useContext(AuthContext);
    const currentUserId = userId || '';

    // Data
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [recipientId, setRecipientId] = useState('');
    const [inputMessage, setInputMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState('');

    // Refs
    const recipientRef = useRef('');
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

                // If the message is for the currently open chat, add it to messages immediately
                if (chattingWith === recipientRef.current) {
                    setMessages((prevMessages) => [...prevMessages, data]);
                }

                // Update conversations inbox
                setConversations((prevConversations) => {
                    // Check if conversation already exists
                    const existingIndex = prevConversations.findIndex(c => c.recipient_id === chattingWith);

                    // Create the updated conversation object
                    const updatedConversation: Conversation = {
                        id: existingIndex !== -1 ? prevConversations[existingIndex].id : Date.now().toString(),
                        recipient_id: chattingWith,
                        recipient_name: existingIndex !== -1 ? prevConversations[existingIndex].recipient_name : undefined,
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
        recipientRef.current = recipientId;

        if (!recipientId || !token || !currentUserId) {
            return;
        }

        // Fetch messages for this conversation
        const fetchMessages = async () => {
            const conversationId = getConversationId(currentUserId, recipientId);
            try {
                const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
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
    }, [recipientId, token, currentUserId]);

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

    const activeConversation = conversations.find(c => c.recipient_id === recipientId);
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
                    onSelect={setRecipientId}
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