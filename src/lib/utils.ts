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
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date) && !(obj instanceof RegExp)) {
    // Preserve Firestore FieldValue instances (e.g. serverTimestamp, deleteField)
    if ('_methodName' in (obj as any) || (obj as any)?.constructor?.name === 'FieldValue') {
      return obj;
    }
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = stripUndefined(value);
      }
      return acc;
    }, {} as any);
  }
  return obj;
}

export const callWithRetry = async <T>(fn: () => Promise<T>, maxRetries = 4, initialDelay = 1500): Promise<T> => {
  let retries = 0;
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      const errorMsg = String(error?.message || '');
      let errorStr = '';
      try {
        errorStr = JSON.stringify(error);
      } catch (e) {
        errorStr = errorMsg;
      }

      const isTransient = 
        error?.status === 429 || 
        error?.code === 429 ||
        error?.error?.code === 429 ||
        error?.status === 503 ||
        error?.code === 503 ||
        error?.error?.code === 503 ||
        error?.status === 500 ||
        error?.status === 502 ||
        error?.status === 504 ||
        errorMsg.includes('429') ||
        errorMsg.includes('503') ||
        errorMsg.includes('UNAVAILABLE') ||
        errorMsg.includes('high demand') ||
        errorMsg.includes('temporarily') ||
        errorMsg.includes('overloaded') ||
        errorMsg.includes('RESOURCE_EXHAUSTED') ||
        errorMsg.includes('quota') ||
        errorStr.includes('429') ||
        errorStr.includes('503') ||
        errorStr.includes('UNAVAILABLE') ||
        errorStr.includes('high demand') ||
        errorStr.includes('RESOURCE_EXHAUSTED') ||
        errorStr.includes('quota');

      if (isTransient && retries < maxRetries) {
        // Exponential backoff with random jitter
        const delay = (initialDelay * Math.pow(1.8, retries)) + (Math.random() * 800);
        console.warn(`[AI API] Transient demand/rate limit (503/429). Retrying in ${Math.round(delay)}ms... (Attempt ${retries + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
        continue;
      }
      throw error;
    }
  }
};
