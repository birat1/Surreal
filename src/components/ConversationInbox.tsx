import type { ConversationInboxProps } from '@/types/types';

export default function ConversationInbox({conversations, currentRecipient, currentUser, onSelect}: ConversationInboxProps) {
    const handleNewConversation = () => {
        const newLabel = prompt("Enter the username of the person you want to start a chat with:");

        if (newLabel) {
            const recipientName = newLabel.trim();

            // Validation
            if (!recipientName) {
                alert("Username cannot be empty.");
                return;
            }
            if (recipientName === currentUser) {
                alert("You cannot start a conversation with yourself.");
                return;
            }

            onSelect(recipientName);
        }
    };

    return (
        <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50 h-full">
            {/* Header */}
            <div className="p-4 border-b bg-white">
                <h3 className="font-bold text-gray-700">Chats</h3>
                <p className="text-xs text-gray-500">Logged in as: {currentUser}</p>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <p className="p-4 text-gray-400 text-sm text-center">No conversations yet. Start a new chat!</p>
                ) : (
                    conversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => onSelect(conv.recipient)}
                            className={`p-4 border-b cursor-pointer hover:bg-gray-100 transition ${
                                currentRecipient === conv.recipient ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                            }`}
                        >
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="font-semibold text-gray-800">{conv.recipient}</span>
                                <span className="text-xs text-gray-400">
                                    {new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                                <span className="font-medium text-gray-400 mr-1">
                                    {conv.last_sender === currentUser ? 'You:' : ''}
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