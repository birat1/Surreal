import * as Dialog from '@radix-ui/react-dialog';
import { Search, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { formatDate } from '@/lib/utils';
import type { ConversationInboxProps } from '@/types/types';

export default function ConversationInbox({
    conversations,
    currentRecipientId,
    currentUserId,
    currentUserName,
    onSelect,
    isAuthenticated,
}: ConversationInboxProps) {
    const [isOpen, setIsOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState('');

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setTimeout(() => {
                setSearchQuery('');
                setError('');
            }, 200);
        }
    };

    const handleSearchSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setError('');

        try {
            const response = await fetch(
                `http://localhost:8080/auth/users/search?username=${searchQuery.trim()}`,
                {
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    setError('User not found.');
                } else {
                    setError('Error searching for user.');
                }
                return;
            }

            const data = await response.json();

            if (data.user_id === currentUserId) {
                setError('You cannot message yourself.');
                return;
            }

            onSelect(data.user_id, data.display_name);
            setIsOpen(false);
        } catch (error) {
            console.error('Error searching for user:', error);
            setError('An error occurred. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50 h-full">
            {/* Radix Dialog */}
            <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl">
                        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                                New Message
                            </Dialog.Title>
                            <Dialog.Description className="text-sm text-gray-500">
                                Enter a username to find a friend and start
                                chatting.
                            </Dialog.Description>
                        </div>

                        <form
                            onSubmit={handleSearchSubmit}
                            className="grid gap-4 py-4"
                        >
                            <div className="relative">
                                <input
                                    id="username"
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="Enter a username..."
                                    autoComplete="off"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    autoFocus
                                />
                                <Search
                                    className="absolute left-3 top-2.5 text-gray-400"
                                    size={18}
                                />
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm flex items-center gap-1">
                                    • {error}
                                </p>
                            )}

                            <div className="flex justify-end gap-2">
                                {/* Close Button */}
                                <Dialog.Close asChild>
                                    <button
                                        type="button"
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition"
                                    >
                                        Cancel
                                    </button>
                                </Dialog.Close>

                                <button
                                    type="submit"
                                    disabled={
                                        isSearching || !searchQuery.trim()
                                    }
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition flex items-center gap-2"
                                >
                                    {isSearching && (
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />
                                    )}
                                    {isSearching
                                        ? 'Searching...'
                                        : 'Start Chat'}
                                </button>
                            </div>
                        </form>
                    </Dialog.Content>
                </Dialog.Portal>

                {/* Side Header */}
                <div className="p-4 border-b bg-white">
                    <h3 className="font-bold text-gray-700">Chats</h3>
                    <p className="text-xs text-gray-500">
                        Logged in as:{' '}
                        <span className="font-semibold">{currentUserName}</span>
                    </p>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <p className="p-4 text-gray-400 text-sm text-center">
                            No conversations yet. Start a new chat!
                        </p>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv.id}
                                onClick={() => onSelect(conv.recipient_id)}
                                className={`p-4 border-b cursor-pointer hover:bg-gray-100 transition ${
                                    currentRecipientId === conv.recipient_id
                                        ? 'bg-blue-50 border-l-4 border-l-blue-600'
                                        : ''
                                }`}
                            >
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="font-semibold text-gray-800 truncate">
                                        {conv.recipient_name ||
                                            conv.recipient_id.slice(0, 8) +
                                                '...'}
                                    </span>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                        {formatDate(conv.updated_at)}
                                    </span>
                                </div>
                                {conv.last_message ? (
                                    <p className="text-sm text-gray-600 truncate">
                                        <span className="font-medium text-gray-400 mr-1">
                                            {conv.last_sender_id ===
                                            currentUserId
                                                ? 'You:'
                                                : conv.recipient_name
                                                  ? `${conv.recipient_name}:`
                                                  : `${conv.recipient_id.slice(0, 8)}...:`}
                                        </span>
                                        {conv.last_message}
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">
                                        Send them a message!
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t bg-white">
                    <Dialog.Trigger asChild>
                        <button className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition shadow-sm flex items-center justify-center gap-2">
                            + New Message
                        </button>
                    </Dialog.Trigger>
                </div>
            </Dialog.Root>
        </div>
    );
}
