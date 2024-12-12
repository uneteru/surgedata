import React, { useState, useEffect } from 'react';

const SystemMessages: React.FC = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const systemMessages = [
        "Initializing blockchain connection protocols...",
        "Establishing secure connection to node network...",
        "Decrypting SRG20 smart contract data...",
        "Bypassing mainnet security layers...",
        "Checking liquidity pool status...",
        "Calculating price impact scenarios...",
        "Indexing holder distribution data...",
        "System ready for blockchain analysis..."
    ];

    useEffect(() => {
        let currentIndex = 0;
        const messageInterval = setInterval(() => {
            if (currentIndex < systemMessages.length) {
                setMessages(prev => [...prev, systemMessages[currentIndex]]);
                currentIndex++;
            } else {
                clearInterval(messageInterval);
            }
        }, 1000);

        return () => clearInterval(messageInterval);
    }, []);

    return (
        <div className="system-messages">
            {messages.map((message, index) => (
                <div key={index} className="system-message">
                    <span className="timestamp">
                        [{new Date().toLocaleTimeString()}]
                    </span>
                    <span className="message-content">
                        {message}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default SystemMessages;
