import React, { useState, useEffect } from 'react';

const WelcomeMessage: React.FC = () => {
    const [text, setText] = useState('');
    const [showCursor, setShowCursor] = useState(true);
    const agentNumber = Math.floor(Math.random() * 9000) + 1000; // Random 4-digit number
    const fullMessage = `> SYSTEM ACCESS GRANTED\n> Agent ${agentNumber} authenticated\n> Clearance level: ALPHA\n> Welcome to SRG20 Blockchain Interface\n> Please proceed with caution...`;
    
    useEffect(() => {
        let currentIndex = 0;
        const typingInterval = setInterval(() => {
            if (currentIndex <= fullMessage.length) {
                setText(fullMessage.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(typingInterval);
            }
        }, 50); // Adjust typing speed here

        // Cursor blinking effect
        const cursorInterval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 500);

        return () => {
            clearInterval(typingInterval);
            clearInterval(cursorInterval);
        };
    }, []);

    return (
        <div className="welcome-message">
            <pre>{text}</pre>
            <span className={`cursor ${showCursor ? 'visible' : ''}`}>_</span>
        </div>
    );
};

export default WelcomeMessage;
