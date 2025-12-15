import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getConversationId(userA: string, userB: string): string {
    const [a, b] = [userA, userB].sort();
    return `${a}-${b}`;
}

export function formatDate(dateString?: string | null): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();

    // Check if the date is today
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    // Otherwise, return the date in DD/MM/YY format
    return date.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'numeric',
        year: '2-digit',
    });
}
