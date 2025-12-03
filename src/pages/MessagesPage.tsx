import { useState, useEffect, useRef } from 'react';
import type { Message, Conversation } from '@/types/types';
import MessageBubble from '@/components/MessageBubble';
import ConversationInbox from '@/components/ConversationInbox';
import { getConversationId } from '@/lib/utils';

const WS_URL = 'ws://localhost:8001/ws';
const API_URL = 'http://localhost:8001';

export default function MessagesPage() {
    const [username, setUsername] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);

    const [recipient, setRecipient] = useState('');
    const [inputMessage, setInputMessage] = useState('');
    const [connectionError, setConnectionError] = useState('');

    const recipientRef = useRef('');
    const socketRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, []);

    // Fetch conversations for user
    const fetchConversations = async () => {
        try {
            const res = await fetch(`${API_URL}/${username}/inbox`);
            const data = await res.json();
            if (data.conversations) {
                setConversations(data.conversations);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    useEffect(() => {
        if (isConnected && username) {
            fetchConversations();
        }
    }, [isConnected, username]);

    // Fetch messages for a conversation
    const fetchMessages = async (conversationId: string) => {
        try {
            const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`);
            const data = await res.json();

            if (Array.isArray(data)) {
                setMessages(data);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    useEffect(() => {
        recipientRef.current = recipient;

        if (recipient && username) {
            // Generate conversation ID
            const conversationId = getConversationId(username, recipient);

            // Fetch messages for this conversation
            fetchMessages(conversationId);
        }
    }, [recipient, username]);

    const handleConnect = () => {
        if (!username.trim()) return;

        if (socketRef.current) {
            socketRef.current.close();
        }

        const ws = new WebSocket(`${WS_URL}/${username}`);

        ws.onopen = () => {
            setIsConnected(true);
            setConnectionError('');
            console.log('Connected to WebSocket as:', username);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'error') {
                    alert(`Error: ${data.message || 'Unknown error'}`);
                    return;
                }

                const currentRecipient = recipientRef.current;
                // Determine who the message is from/to
                const chattingWith = data.sender === username ? data.recipient : data.sender;

                // If the message is for the currently open chat, add it to messages immediately
                if (data.sender === currentRecipient || data.recipient === currentRecipient) {
                    setMessages((prevMessages) => [...prevMessages, data]);
                }

                // Update conversations inbox
                setConversations((prevConversations) => {
                    // Check if conversation already exists
                    const existingIndex = prevConversations.findIndex(c => c.recipient === chattingWith);

                    // Create the updated conversation object
                    const updatedConversation: Conversation = {
                        id: existingIndex !== -1 ? prevConversations[existingIndex].id : Date.now().toString(),
                        recipient: chattingWith,
                        last_message: data.body,
                        last_sender: data.sender,
                        updated_at: new Date().toISOString(),
                    };

                    const newConversations = [...prevConversations];
                    if (existingIndex !== -1) {
                        newConversations.splice(existingIndex, 1);
                    }

                    return [updatedConversation, ...newConversations];
                });
            } catch (error) {
                console.error('Error parsing message:', error);
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
    };

    const handleSendMessage = () => {
        if (!socketRef.current || !recipient || !inputMessage.trim()) return;

        const payload = {
            recipient: recipient,
            body: inputMessage,
        };

        socketRef.current.send(JSON.stringify(payload));
        setInputMessage('');
    };
    
    // Login as Placeholder Users
    // Haven't implemented using user auth service yet
    if (!isConnected) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md w-96">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Join Chat</h2>

                    {connectionError && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded">
                            {connectionError}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                className="w-full border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 p-1"
                            />
                        </div>
                        <button
                            onClick={handleConnect}
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                        >
                            Connect
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Chat UI
    return ( 
        <div className="max-w-6xl mx-auto p-4 h-[calc(100vh-64px)]">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden flex h-full border border-gray-200">
                
                {/* Conversation Inbox */}
                <ConversationInbox
                    conversations={conversations}
                    currentRecipient={recipient}
                    currentUser={username}
                    onSelect={setRecipient}
                />

                {/* Chat Area */}
                <div className="w-2/3 flex flex-col bg-white">
                    {recipient ? (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b shadow-sm flex justify-between items-center bg-white z-10">
                                <span className="font-bold text-lg text-gray-800">{recipient}</span>
                            </div>

                            {/* Messages List */}
                            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
                                {messages.map((msg, index) => (
                                    <MessageBubble 
                                        key={index} 
                                        msg={msg} 
                                        isMe={msg.sender === username} 
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