import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getConversationId(userA: string, userB: string): string {
  const [a, b] = [userA, userB].sort();
  return `${a}-${b}`;
}