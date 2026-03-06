import React, { useEffect, useRef, useState } from 'react';
import './AboutParallax.css';

const AboutParallax: React.FC = () => {
    const [aboutActive, setAboutActive] = useState(false);
    const [missionActive, setMissionActive] = useState(false);
    const [visionActive, setVisionActive] = useState(false);

    const aboutRef = useRef<HTMLDivElement>(null);
    const missionRef = useRef<HTMLDivElement>(null);
    const visionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.2
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target === aboutRef.current) setAboutActive(true);
                    if (entry.target === missionRef.current) setMissionActive(true);
                    if (entry.target === visionRef.current) setVisionActive(true);
                }
            });
        }, observerOptions);

        if (aboutRef.current) observer.observe(aboutRef.current);
        if (missionRef.current) observer.observe(missionRef.current);
        if (visionRef.current) observer.observe(visionRef.current);

        return () => {
            if (aboutRef.current) observer.unobserve(aboutRef.current);
            if (missionRef.current) observer.unobserve(missionRef.current);
            if (visionRef.current) observer.unobserve(visionRef.current);
        };
    }, []);

    return (
        <section id="about" className="about-parallax-section">
            <div className="parallax-bg"></div>

            <div className="container content-layer">
                {/* About Block (Center Fade-in) */}
                <div
                    ref={aboutRef}
                    className={`about-block ${aboutActive ? 'active' : ''}`}
                >
                    <h2 className="section-title">About CODEKARX</h2>
                    <div className="about-text">
                        <p>
                            CodeKarX is a student-focused hackathon platform organized by UNAI TECH, dedicated to fostering
                            innovation through hands-on learning. UNAI TECH independently conducts hackathons and workshops
                            while collaborating with esteemed corporate companies and educational institutions to provide students
                            with industry exposure, mentorship, and growth opportunities. Our initiatives are designed to bridge
                            the gap between academic learning and real-world technology applications.
                        </p>
                    </div>
                </div>

                {/* Mission & Vision Container */}
                <div className="mv-container">
                    {/* Mission Block (Slides from Left) */}
                    <div
                        ref={missionRef}
                        className={`mv-block mission-block scroll-reveal-left ${missionActive ? 'active' : ''}`}
                    >
                        <div className="mv-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                                <path d="M2 12h20" />
                            </svg>
                        </div>
                        <h3>Our Mission</h3>
                        <p>
                            To build a future-ready student ecosystem that encourages innovation, skill
                            development, and real-world impact through technology and industry collaboration.
                        </p>
                    </div>

                    {/* Vision Block (Slides from Right) */}
                    <div
                        ref={visionRef}
                        className={`mv-block vision-block scroll-reveal-right ${visionActive ? 'active' : ''}`}
                    >
                        <div className="mv-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </div>
                        <h3>Our Vision</h3>
                        <p>
                            To create meaningful opportunities for students by offering hands-on practical
                            experience, real-world project exposure, and internship opportunities with reputed
                            corporate institutions—preparing them for industry-ready careers.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutParallax;
