import { useState, useEffect, useRef } from 'react';
import type { Message } from '@/types/types';

const WS_URL = 'ws://localhost:8001/ws';

export default function MessagesPage() {
    const [username, setUsername] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);

    const [recipient, setRecipient] = useState('');
    const [inputMessage, setInputMessage] = useState('');
    const [connectionError, setConnectionError] = useState('');

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

                setMessages((prevMessages) => [...prevMessages, data]);
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

    const handleDisconnect = () => {
        if (socketRef.current) {
            socketRef.current.close();
        }
        setIsConnected(false);
        setMessages([]);
    };

    const handleSendMessage = () => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
        if (!recipient.trim() || !inputMessage.trim()) return;

        const payload = {
            recipient: recipient,
            body: inputMessage,
        };

        socketRef.current.send(JSON.stringify(payload));
        setInputMessage('');
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') handleSendMessage();
    };

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

    return ( 
        <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-64px)] flex flex-col">
            <div className="bg-white shadow rounded-t-lg p-4 flex justify-between items-center border-b">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-700">Logged in as: {username}</span>
                </div>
                <button
                    onClick={handleDisconnect}
                    className="text-sm text-red-600 hover:text-red-800 underline"
                >
                    Disconnect
                </button>
            </div>

            <div className="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-4 border-x border-gray-200">
                {messages.length === 0 && (
                    <p className="text-center text-gray-400 mt-10">No messages yet. Start a conversation!</p>
                )}

                {messages.map((msg, index) => {
                    const isMe = msg.sender === username;

                    return (
                        <div 
                            key={index}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                            <div
                                className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${
                                    isMe
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                }`}
                            >
                                <p>{msg.body}</p>
                            </div>
                            <span className="text-xs text-gray-400 mt-1 px-1">
                                {isMe ? 'You' : msg.sender}
                            </span>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="bg-white p-4 rounded-b-lg shadow border-t">
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={recipient}
                        onChange={(event) => setRecipient(event.target.value)}
                        placeholder="Recipient (e.g. user2)"
                        className="w-1/3 p-2 border border-gray-400 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(event) => setInputMessage(event.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder='Type a message...'
                        className="flex-1 p-2 border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleSendMessage}
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition font-medium disabled:opacity-50"
                        disabled={!recipient || !inputMessage}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}