import React, { useEffect, useRef, useState } from 'react';
import './MissionVision.css';

interface MVCardProps {
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    speed: number;
}

const MVCard: React.FC<MVCardProps> = ({ title, subtitle, description, icon, speed }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            if (!cardRef.current) return;
            const rect = cardRef.current.getBoundingClientRect();
            const scrollProgress = (window.innerHeight - rect.top) / window.innerHeight;

            if (scrollProgress > 0 && scrollProgress < 1.5) {
                const newOffset = (scrollProgress - 0.5) * 30 * speed;
                setOffset(newOffset);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [speed]);

    return (
        <div
            ref={cardRef}
            className="mv-card parallax-mv"
            style={{ transform: `translateY(${offset}px)` }}
        >
            <div className="mv-icon">
                {icon}
            </div>
            <h4>{subtitle}</h4>
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
};

const MissionVision: React.FC = () => {
    return (
        <section className="mission-vision-section">
            <div className="container">
                <div className="mv-grid">
                    {/* Vision Card */}
                    <MVCard
                        title="Our Vision"
                        subtitle="VISION"
                        speed={0.3}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        }
                        description="To create meaningful opportunities for students by offering hands-on practical experience, real-world project exposure, and internship opportunities with reputed corporate institutions—preparing them for industry-ready careers."
                    />

                    {/* Mission Card */}
                    <MVCard
                        title="Our Mission"
                        subtitle="MISSION"
                        speed={0.5}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                                <path d="M2 12h20" />
                            </svg>
                        }
                        description="To build a future-ready student ecosystem that encourages innovation, skill development, and real-world impact through technology and industry collaboration."
                    />
                </div>
            </div>
        </section>
    );
};

export default MissionVision;
