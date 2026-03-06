import React from 'react';
import './CoPresented.css';

const CoPresented: React.FC = () => {
    return (
        <section id="co-presented" className="co-presented">
            <div className="container">
                <div className="section-header">
                    <p className="subtitle">Supporting Innovation</p>
                    <h2 className="section-title">Co - Presented by </h2>
                </div>

                <div className="co-presenter-content">
                    <div className="logo-wrapper">
                        <img src="/logo.png" alt="Co-Presenter Logo" className="co-presenter-logo" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CoPresented;
