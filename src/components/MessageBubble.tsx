import { memo } from 'react';
import type { MessageBubbleProps } from '@/types/types';

const MessageBubble = memo(({ msg, isMe }: MessageBubbleProps) => {
    const timestamp = msg.created_at
        ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

    return (
        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
            <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${
                    isMe
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                }`}
            >
                <p>{msg.body}</p>
            </div>
            <div className="text-xs text-gray-400 mt-1 px-1 flex gap-2">
                <span>{isMe ? 'You' : msg.sender}</span>
                {timestamp && <span>{timestamp}</span>}
            </div>
        </div>
    );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;