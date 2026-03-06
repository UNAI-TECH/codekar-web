import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './UNAIReveal.css';

const UNAIReveal: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const aboutSection = document.querySelector('#about');
        const letters = containerRef.current?.querySelectorAll('.letter');

        if (aboutSection && letters && letters.length > 0) {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: aboutSection,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    scrub: 1,
                }
            });

            tl.fromTo(
                letters,
                {
                    opacity: 0,
                    y: 20,
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    stagger: 0.15,
                    ease: 'power3.out',
                }
            );

            return () => {
                ScrollTrigger.getAll().forEach(t => t.kill());
            };
        }
    }, []);

    return (
        <div className="codekar-container" ref={containerRef}>
            <div className="letter-group">
                <span className="letter letter-dark">C</span>
                <span className="letter letter-dark">O</span>
                <span className="letter letter-dark">D</span>
                <span className="letter letter-dark">E</span>
            </div>
            <div className="letter-group kar-group">
                <span className="letter letter-gradient">K</span>
                <span className="letter letter-gradient">A</span>
                <span className="letter letter-gradient">R</span>
            </div>
        </div>
    );
};

export default UNAIReveal;
