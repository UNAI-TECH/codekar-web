import React from 'react';
import './Hero.css';

const Hero: React.FC = () => {
    return (
        <section id="home" className="hero">
            <div className="hero-content">
                <p className="subtitle">UNAI TECH PRESENTS</p>
                <p className="subtitle subtitle-secondary">Co Presented by Story Seed Studio</p>
                <h1 className="hero-title">
                    <span className="hero-letter">C</span>
                    <span className="hero-letter">O</span>
                    <span className="hero-letter">D</span>
                    <span className="hero-letter">E</span>
                    <span className="hero-letter">K</span>
                    <span className="hero-letter">A</span>
                    <span className="hero-letter">R</span>
                    <span className="hero-logo-x">X</span>
                </h1>
                <p className="tagline">Build. Innovate. Transform.</p>
            </div>
        </section>
    );
};

export default Hero;
