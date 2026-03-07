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

                <div className="logo-slider">
                    <div className="logo-track">
                        <div className="logo-slide">
                            <img src="/3.png" alt="Co-Presenter Logo 2" className="co-presenter-logo" />
                        </div>
                        <div className="logo-slide">
                            <img src="/2.png" alt="Co-Presenter Logo 3" className="co-presenter-logo" />
                        </div>
                        <div className="logo-slide">
                            <img src="/3.png" alt="Co-Presenter Logo 2" className="co-presenter-logo" />
                        </div>
                        <div className="logo-slide">
                            <img src="/2.png" alt="Co-Presenter Logo 3" className="co-presenter-logo" />
                        </div>
                        <div className="logo-slide">
                            <img src="/3.png" alt="Co-Presenter Logo 2" className="co-presenter-logo" />
                        </div>
                        <div className="logo-slide">
                            <img src="/2.png" alt="Co-Presenter Logo 3" className="co-presenter-logo" />
                        </div>
                        <div className="logo-slide">
                            <img src="/3.png" alt="Co-Presenter Logo 2" className="co-presenter-logo" />
                        </div>
                        <div className="logo-slide">
                            <img src="/2.png" alt="Co-Presenter Logo 3" className="co-presenter-logo" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CoPresented;
