import React, { useState, useEffect, useRef } from 'react';
import './FloatingBrand.css';

const FloatingBrand: React.FC = () => {
    const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());
    const [isComponentVisible, setIsComponentVisible] = useState(true);
    const lastScrollY = useRef(0);
    const isTransitioning = useRef(false);

    const letters = ['U', 'N', 'A', 'I', ' ', 'T', 'E', 'C', 'H'];

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollDirection = currentScrollY > lastScrollY.current ? 'down' : 'up';

            const aboutSection = document.getElementById('about');
            let triggerPoint = 500;

            if (aboutSection) {
                const aboutRect = aboutSection.getBoundingClientRect();
                const aboutTop = aboutRect.top + currentScrollY;
                triggerPoint = aboutTop - window.innerHeight * 0.3;
            }

            const footer = document.querySelector('footer');
            if (footer) {
                const footerRect = footer.getBoundingClientRect();
                if (footerRect.top < window.innerHeight) {
                    setIsComponentVisible(false);
                    lastScrollY.current = currentScrollY;
                    return;
                } else {
                    setIsComponentVisible(true);
                }
            }

            // Scroll UP - reveal letters
            if (scrollDirection === 'up' && currentScrollY > triggerPoint && visibleIndices.size === 0 && !isTransitioning.current) {
                isTransitioning.current = true;
                letters.forEach((_, index) => {
                    if (letters[index] === ' ') return;
                    setTimeout(() => {
                        setVisibleIndices(prev => {
                            const next = new Set(prev);
                            next.add(index);
                            return next;
                        });
                        if (index === letters.length - 1) isTransitioning.current = false;
                    }, index * 80);
                });
            }

            // Scroll DOWN - hide letters
            if (scrollDirection === 'down' && visibleIndices.size > 0 && !isTransitioning.current) {
                isTransitioning.current = true;
                const indicesToHide = Array.from(visibleIndices).sort((a, b) => b - a);
                indicesToHide.forEach((index, i) => {
                    setTimeout(() => {
                        setVisibleIndices(prev => {
                            const next = new Set(prev);
                            next.delete(index);
                            return next;
                        });
                        if (i === indicesToHide.length - 1) isTransitioning.current = false;
                    }, i * 40);
                });
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check

        return () => window.removeEventListener('scroll', handleScroll);
    }, [visibleIndices]);

    return (
        <div className="floating-brand" style={{ opacity: isComponentVisible ? 1 : 0, pointerEvents: isComponentVisible ? 'auto' : 'none' }}>
            <div className="brand-text">
                {letters.map((letter, index) => (
                    letter === ' ' ? (
                        <span key={index} className="brand-space"></span>
                    ) : (
                        <span
                            key={index}
                            className={visibleIndices.has(index) ? 'visible' : ''}
                            data-letter
                        >
                            {letter}
                        </span>
                    )
                ))}
            </div>
        </div>
    );
};

export default FloatingBrand;
