import React from 'react';
import './Hero.css';

const Hero: React.FC = () => {
    return (
        <section id="home" className="hero">
            <div className="hero-content">
                <p className="subtitle">UNAI TECH PRESENTS</p>
                <p className="subtitle subtitle-secondary">Co Presented by Story Seed Studio</p>
                <h1 className="hero-title">
                    <img src="/codekarX.png" alt="CODEKARX" className="hero-title-img" />
                </h1>
                <p className="tagline">Build. Innovate. Transform.</p>
            </div>
        </section>
    );
};

export default Hero;
