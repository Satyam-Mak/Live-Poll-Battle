// client/context/WebSocketContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const WEBSOCKET_URL = 'wss://live-poll-battle-8pff.onrender.com';

interface WebSocketContextType {
    isConnected: boolean;
    lastMessage: MessageEvent | null;
    sendMessage: (message: object) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket(WEBSOCKET_URL);
        ws.current = socket;

        socket.onopen = () => setIsConnected(true);
        socket.onclose = () => setIsConnected(false);
        socket.onmessage = (event) => setLastMessage(event);

        return () => {
            socket.close();
        };
    }, []);

    const sendMessage = useCallback((message: object) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not connected.');
        }
    }, []);

    return (
        <WebSocketContext.Provider value={{ isConnected, lastMessage, sendMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a WebSocketProvider');
    }
    return context;
}