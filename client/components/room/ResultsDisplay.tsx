// client/components/room/ResultsDisplay.tsx
'use client';

import { useState, useEffect } from 'react';
import AnimatedVoteBar from './AnimatedVoteBar';

interface ResultsDisplayProps {
    question: string;
    roomId: string;
    votes: { optionA: number; optionB: number };
    sendMessage: (message: object) => void;
    status: 'voting' | 'closed';
}

export default function ResultsDisplay({ question, roomId, votes, sendMessage, status }: ResultsDisplayProps) {
    const [hasVoted, setHasVoted] = useState(false);
    const totalVotes = votes.optionA + votes.optionB;

    useEffect(() => {
        const votedInRoom = localStorage.getItem(`voted_${roomId}`);
        if (votedInRoom) {
            setHasVoted(true);
        }
    }, [roomId]);

    const handleVote = (option: 'optionA' | 'optionB') => {
        if (hasVoted || status === 'closed') return;

        sendMessage({
            type: 'vote',
            payload: { roomId, option },
        });

        localStorage.setItem(`voted_${roomId}`, 'true');
        setHasVoted(true);
    };
    
    return (
        <div className="w-full max-w-lg">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                {question}
            </h2>
            <div className="space-y-6">
                <div 
                    onClick={() => handleVote('optionA')} 
                    className={`p-2 border-2 rounded-lg transition-all ${!hasVoted && status === 'voting' ? 'cursor-pointer border-transparent hover:border-blue-500' : 'cursor-not-allowed'}`}
                >
                    <AnimatedVoteBar label="Cats" voteCount={votes.optionA} totalVotes={totalVotes} color="#3b82f6" />
                </div>
                <div 
                    onClick={() => handleVote('optionB')} 
                    className={`p-2 border-2 rounded-lg transition-all ${!hasVoted && status === 'voting' ? 'cursor-pointer border-transparent hover:border-red-500' : 'cursor-not-allowed'}`}
                >
                    <AnimatedVoteBar label="Dogs" voteCount={votes.optionB} totalVotes={totalVotes} color="#ef4444" />
                </div>
            </div>
            {hasVoted && (
                <p className="text-center mt-6 text-lg text-green-600 font-semibold">
                    Thanks for voting!
                </p>
            )}
            {status === 'closed' && (
                 <p className="text-center mt-6 text-lg text-red-600 font-semibold">
                    Voting has ended.
                </p>
            )}
        </div>
    );
}