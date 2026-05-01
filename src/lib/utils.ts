import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isValid } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function safeFormat(dateStr: string | undefined | null, formatStr: string): string {
  if (!dateStr) return '';
  try {
    const date = parseISO(dateStr);
    return isValid(date) ? format(date, formatStr) : '';
  } catch (e) {
    return '';
  }
}

export function stripUndefined<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(v => stripUndefined(v)) as any;
  }
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = stripUndefined(value);
      }
      return acc;
    }, {} as any);
  }
  return obj;
}

export const callWithRetry = async <T>(fn: () => Promise<T>, maxRetries = 5, initialDelay = 5000): Promise<T> => {
  let retries = 0;
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      const errorStr = JSON.stringify(error);
      const isRateLimit = 
        error?.status === 429 || 
        error?.code === 429 ||
        error?.error?.code === 429 ||
        error?.message?.includes('429') ||
        errorStr.includes('429') ||
        errorStr.includes('RESOURCE_EXHAUSTED') ||
        errorStr.includes('quota');

      if (isRateLimit && retries < maxRetries) {
        // Exponential backoff with jitter
        const delay = (initialDelay * Math.pow(2, retries)) + (Math.random() * 1000);
        console.warn(`Rate limit hit. Retrying in ${Math.round(delay)}ms... (Attempt ${retries + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
        continue;
      }
      throw error;
    }
  }
};
