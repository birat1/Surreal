import { useState } from 'react';
import type { ConversationInboxProps } from '@/types/types';

export default function ConversationInbox({conversations, currentRecipientId, currentUserId, onSelect, token}: ConversationInboxProps) {
    const [isSearching, setIsSearching] = useState(false);

    const handleNewConversation = async () => {
        const username = prompt("Enter the nickname of the person you want to start a chat with:");
        if (!username) return;

        setIsSearching(true);
        try {
            const response = await fetch(`http://localhost:8000/users/search?nickname=${username}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    alert("User not found.");
                } else {
                    alert("Error searching for user.");
                }
                return;
            }

            const data = await response.json();

            if (data.user_id === currentUserId) {
                alert("You cannot start a conversation with yourself.");
                return;
            }

            onSelect(data.user_id);
        } catch (error) {
            console.error("Error searching for user:", error);
            alert("An error occurred while searching for the user.");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50 h-full">
            {/* Header */}
            <div className="p-4 border-b bg-white">
                <h3 className="font-bold text-gray-700">Chats</h3>
                <p className="text-xs text-gray-500">Logged in as: {currentUserId}</p>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <p className="p-4 text-gray-400 text-sm text-center">No conversations yet. Start a new chat!</p>
                ) : (
                    conversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => onSelect(conv.recipient_id)}
                            className={`p-4 border-b cursor-pointer hover:bg-gray-100 transition ${
                                currentRecipientId === conv.recipient_id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                            }`}
                        >
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="font-semibold text-gray-800 truncate">
                                    {conv.recipient_name || conv.recipient_id.slice(0, 8) + '...'}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                                <span className="font-medium text-gray-400 mr-1">
                                    {conv.last_sender_id === currentUserId ? 'You:' : `${conv.recipient_name}:`}
                                </span>
                                {conv.last_message}
                            </p>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t bg-white">
                <button
                    onClick={handleNewConversation}
                    className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-7y00 text-sm transition"
                >
                    + New Message
                </button>
            </div>
        </div>
    );
}