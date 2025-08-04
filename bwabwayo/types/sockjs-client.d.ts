declare module 'sockjs-client' {
  interface SockJSOptions {
    server?: string;
    path?: string;
    transports?: string[];
    timeout?: number;
    heartbeat?: number;
  }

  interface SockJS {
    readyState: number;
    url: string;
    protocol: string;
    onopen: ((event: Event) => void) | null;
    onclose: ((event: CloseEvent) => void) | null;
    onmessage: ((event: MessageEvent) => void) | null;
    onerror: ((event: Event) => void) | null;
    
    send(data: string | ArrayBuffer | Blob): void;
    close(code?: number, reason?: string): void;
  }

  class SockJS {
    constructor(url: string, protocols?: string | string[] | null, options?: SockJSOptions);
  }

  export = SockJS;
} 