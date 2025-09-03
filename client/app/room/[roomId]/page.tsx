// client/app/room/[roomId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSocket } from '@/context/WebSocketContext';
import UserList from '@/components/room/UserList';
import ResultsDisplay from '@/components/room/ResultsDisplay';

interface RoomState {
    id: string;
    question: string;
    users: { username: string }[];
    votes: { optionA: number; optionB: number };
    timer: number;
    status: 'voting' | 'closed';
}

export default function RoomPage() {
    const params = useParams();
    const roomId = params.roomId as string;
    const { lastMessage, isConnected, sendMessage } = useSocket();
    const [roomState, setRoomState] = useState<RoomState | null>(null);

    useEffect(() => {
        if (isConnected && roomId) {
            sendMessage({ type: 'get_room_state', payload: { roomId } });
        }
    }, [isConnected, roomId, sendMessage]);

    useEffect(() => {
        if (lastMessage) {
            const messageData = JSON.parse(lastMessage.data);
            if (messageData.type === 'room_update' && messageData.payload.id === roomId) {
                setRoomState(messageData.payload);
            }
        }
    }, [lastMessage, roomId]);

    if (!roomState) {
        return (
            <main className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold">Connecting to Room...</h2>
                    <p className="text-gray-500">Please wait a moment.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="grid grid-cols-1 md:grid-cols-3 min-h-screen gap-8 p-8">
            {/* Main Poll Area */}
            <div className="md:col-span-2 flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-lg">
                <ResultsDisplay 
                    question={roomState.question}
                    roomId={roomState.id}
                    sendMessage={sendMessage}
                    votes={roomState.votes}
                    status={roomState.status}
                />
            </div>

            {/* Sidebar */}
            <aside className="w-full flex flex-col gap-8">
                <div className="p-6 bg-white rounded-2xl shadow-lg text-center">
                    <h3 className="text-lg font-semibold text-gray-500 mb-1">Time Remaining</h3>
                    <p className={`text-7xl font-bold ${roomState.timer <= 10 ? 'text-red-500' : 'text-gray-800'}`}>
                        {roomState.timer}
                    </p>
                </div>
                <div className="p-6 bg-white rounded-2xl shadow-lg flex-grow">
                    <UserList users={roomState.users} />
                </div>
                 <div className="p-4 bg-white rounded-2xl shadow-lg text-center">
                    <p className="text-sm text-gray-500">Room Code</p>
                    <p className="text-2xl font-mono tracking-widest text-purple-600">
                        {roomState.id.toUpperCase()}
                    </p>
                </div>
            </aside>
        </main>
    );
}