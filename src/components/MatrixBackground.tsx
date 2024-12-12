import React, { useEffect, useRef } from 'react';

const MatrixBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // Set canvas size to window size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Matrix characters (including some blockchain-related symbols)
        const characters = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ₿Ξ♦∞∑∆πΣΨΩ'.split('');
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops: number[] = [];

        // Initialize drops
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.floor(Math.random() * canvas.height/fontSize) * -fontSize;
        }

        // Drawing function
        const draw = () => {
            // Semi-transparent black to create fade effect
            context.fillStyle = 'rgba(0, 0, 0, 0.05)';
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.fillStyle = '#0F0';
            context.font = `${fontSize}px monospace`;

            // Draw characters
            for (let i = 0; i < drops.length; i++) {
                // Random character
                const char = characters[Math.floor(Math.random() * characters.length)];
                
                // Draw the character
                const x = i * fontSize;
                const y = drops[i];
                
                // Add glow effect
                context.shadowBlur = 15;
                context.shadowColor = '#0F0';
                
                // Varying opacity for more dynamic effect
                context.fillStyle = `rgba(0, 255, 0, ${Math.random() * 0.5 + 0.5})`;
                context.fillText(char, x, y);
                
                // Reset shadow
                context.shadowBlur = 0;

                // Move drop
                drops[i] += fontSize;

                // Reset drop if it goes off screen or randomly
                if (drops[i] > canvas.height && Math.random() > 0.975) {
                    drops[i] = -fontSize;
                }
            }
        };

        // Animation loop
        const interval = setInterval(draw, 50);

        // Cleanup
        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="matrix-canvas"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                opacity: 0.8,
                background: 'black'
            }}
        />
    );
};

export default MatrixBackground;
