declare module 'event-source-polyfill' {
    export class EventSourcePolyfill {
        constructor(url: string, options?: { headers?: Record<string, string> });
        addEventListener(type: string, listener: (event: Event) => void): void;
        onmessage: ((event: Event) => void) | null;
        onerror: ((error: Event) => void) | null;
        close(): void;
    }
}
