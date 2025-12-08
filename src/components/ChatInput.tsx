import { useState } from 'react';

import { ChatInputProps } from '@/types/types';

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim()) {
            onSend(message.trim());
            setMessage('');
        }
    };

    return (
        <div className="p-4 bg-white border-t">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
                <button
                    onClick={handleSend}
                    disabled={disabled || !message.trim()}
                    className="bg-blue-600 text-white px-6 rounded-full hover:bg-blue-700 disabled:opacity-50 font-medium transition"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
