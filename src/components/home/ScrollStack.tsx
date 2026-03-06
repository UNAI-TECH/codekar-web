import React, { useEffect, useRef } from 'react';
import './ScrollStack.css';

interface ScrollStackProps {
    children: React.ReactNode;
}

const ScrollStack: React.FC<ScrollStackProps> = ({ children }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            const cards = containerRef.current?.querySelectorAll('.scroll-stack-card');
            if (!cards) return;

            cards.forEach((card) => {
                const rect = card.getBoundingClientRect();
                const topOffset = 150;

                if (rect.top <= topOffset + 10) {
                    // Optional: Scale effect can be added here if needed
                }
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="scroll-stack-wrapper">
            <div ref={containerRef} className="scroll-stack-inner">
                {children}
            </div>
        </div>
    );
};

export default ScrollStack;
