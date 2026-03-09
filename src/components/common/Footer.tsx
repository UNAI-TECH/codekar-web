import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
    const year = new Date().getFullYear();

    return (
        <footer>
            <div className="container footer-content">
                {/* Brand Column */}
                <div className="footer-brand">
                    <img src="/Untitled design (6).png" alt="UNAI" className="footer-logo" />
                    <p>Join India's premier student hackathon and build solutions that matter. 48 hours of innovation.</p>
                    <div className="social-links">
                        <a href="https://www.instagram.com/unai.tech?igsh=YmwwMTk1cW1xeHl0" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                            </svg>
                        </a>
                        <a href="https://www.linkedin.com/company/unai-tech/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="social-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                <rect width="4" height="12" x="2" y="9" />
                                <circle cx="4" cy="4" r="2" />
                            </svg>
                        </a>
                        <a href="https://x.com/UnaiTech74505?s=20" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="social-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Quick Links Column */}
                <div className="footer-links">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="/#about">About</a></li>
                        <li><a href="/#tracks">Tracks</a></li>
                        <li><a href="/#prizes">Prizes</a></li>
                        <li><a href="/#sponsors">Sponsors</a></li>
                        <li><a href="/#docs">Docs</a></li>
                    </ul>
                </div>

                {/* Contact Us Column */}
                <div className="footer-contact">
                    <h4>Contact Us</h4>
                    <ul>
                        <li>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="20" height="16" x="2" y="4" rx="2" />
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                            <a href="mailto:contact@unaitech.com">contact@unaitech.com</a>
                        </li>
                        <li>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            +91 9043988697
                        </li>
                        <li>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            UNAI TECH, chennai, Tamil nadu
                        </li>
                    </ul>
                </div>
            </div>

            {/* Copyright Bar */}
            <div className="footer-bottom">
                <div className="container">
                    <p>&copy; {year} UNAI. All rights reserved.</p>
                    <div className="footer-legal-links">
                        <a href="/privacy-policy">Privacy Policy</a>
                        <span className="legal-divider">|</span>
                        <a href="/terms-and-conditions">Terms & Conditions</a>
                    </div>
                    <p className="unai-credit">UNAI Curated</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
