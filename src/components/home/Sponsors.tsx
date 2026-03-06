import React from 'react';
import './Sponsors.css';

interface Sponsor {
    name: string;
    tier: string;
}

const Sponsors: React.FC = () => {
    // const sponsors: Sponsor[] = Array(4).fill({ name: "Sponsor Name", tier: "Gold" });

    return (
        <section id="sponsors" className="sponsors-section">
            <div className="container">
                <h2 className="section-title">Our Sponsors</h2>

                {/* Sponsors List (Hidden until sponsors are confirmed) */}
                {/*
        <div className="sponsors-grid">
          {sponsors.map((sponsor, index) => (
            <div key={index} className="sponsor-card">
              <div className="placeholder-logo">LOGO</div>
              <h3 className="sponsor-name">{sponsor.name}</h3>
            </div>
          ))}
        </div>
        */}
            </div>
        </section>
    );
};

export default Sponsors;
