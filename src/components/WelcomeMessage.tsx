import React, { useState, useEffect } from 'react';

const WelcomeMessage: React.FC = () => {
    const [text, setText] = useState('');
    const [showCursor, setShowCursor] = useState(true);
    const [isTypingComplete, setIsTypingComplete] = useState(false);
    const agentNumber = Math.floor(Math.random() * 9000) + 1000; // Random 4-digit number
    const fullMessage = `> SYSTEM ACCESS GRANTED\n> Agent ${agentNumber} authenticated\n> Clearance level: ALPHA\n> Welcome to SRG20 Blockchain Interface\n> Please proceed with caution`;
    
    useEffect(() => {
        let currentIndex = 0;
        const typingInterval = setInterval(() => {
            if (currentIndex <= fullMessage.length) {
                setText(fullMessage.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(typingInterval);
                setIsTypingComplete(true);
            }
        }, 50); // Adjust typing speed here

        return () => clearInterval(typingInterval);
    }, []);

    // Separate cursor blinking effect
    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 500);

        return () => clearInterval(cursorInterval);
    }, []);

    return (
        <div className="welcome-message">
            <pre>
                {text}
                {(isTypingComplete || text.length > 0) && (
                    <span className={`cursor ${showCursor ? 'visible' : ''}`}>_</span>
                )}
            </pre>
        </div>
    );
};

export default WelcomeMessage;
