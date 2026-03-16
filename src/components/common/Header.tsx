import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import './Header.css';

interface HeaderProps {
    hideCTA?: boolean;
}

const Header: React.FC<HeaderProps> = ({ hideCTA = false }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeHash, setActiveHash] = useState('');

    // Handle scroll for sticky header
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Check auth session
    useEffect(() => {
        const checkSession = async () => {
            if (supabase) {
                const { data: { session } } = await supabase.auth.getSession();
                setIsLoggedIn(!!session);
            }
        };
        checkSession();

        if (supabase) {
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setIsLoggedIn(!!session);
            });
            return () => subscription.unsubscribe();
        }
    }, []);

    // Handle Hash/Active Link & Mount Scroll
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            setActiveHash(hash);
            if (hash && window.location.pathname === '/') {
                scrollToSection(hash.replace('#', ''));
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        
        // Handle mount scroll if landing on home with a hash
        if (window.location.hash && window.location.pathname === '/') {
            // Short delay to ensure sections are rendered and stable
            setTimeout(() => {
                scrollToSection(window.location.hash.replace('#', ''));
            }, 500);
        }

        handleHashChange(); // Initial check

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const closeMobileNav = useCallback(() => {
        setIsMenuOpen(false);
        document.body.classList.remove('scroll-locked');
        // @ts-ignore
        if (window.lenis) window.lenis.start();
    }, []);

    const openMobileNav = () => {
        setIsMenuOpen(true);
        document.body.classList.add('scroll-locked');
        // @ts-ignore
        if (window.lenis) window.lenis.stop();
    };

    const toggleMobileNav = () => {
        if (isMenuOpen) closeMobileNav();
        else openMobileNav();
    };

    const scrollToSection = (sectionId: string) => {
        // Ensure Lenis is started before scrolling
        // @ts-ignore
        const lenis = window.lenis;
        if (lenis) lenis.start();

        // Special case for Home to ensure it goes to the very top
        if (sectionId === 'home') {
            if (lenis) {
                lenis.scrollTo(0, { duration: 1.2 });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            setActiveHash('#home');
            return;
        }

        const element = document.getElementById(sectionId);
        if (!element) return;

        const offset = 80; // navbar height

        if (lenis) {
            // Let lenis handle the calculation for better reliability with its own easing
            lenis.scrollTo(element, { offset: -offset, duration: 1.2 });
        } else {
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }

        setActiveHash(`#${sectionId}`);
    };

    const handleNavLinkClick = (sectionId: string) => {
        const isHomePage = window.location.pathname === '/';

        if (isHomePage) {
            closeMobileNav();
            // Increase timeout to 400ms for mobile reliability
            requestAnimationFrame(() => {
                setTimeout(() => {
                    scrollToSection(sectionId);
                }, 400);
            });
        } else {
            // If on external page, navigate to home with hash
            window.location.href = `/#${sectionId}`;
        }
    };

    const handleApplyClick = () => {
        window.dispatchEvent(new CustomEvent('open-registration-modal'));
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeMobileNav();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [closeMobileNav]);

    const navLinks = [
        { name: 'Home', section: 'home' },
        { name: 'Tracks', section: 'tracks' },
        { name: 'About', section: 'about' },
        { name: 'Docs', section: 'docs' },
    ];

    return (
        <>
            <header id="main-header" className={isScrolled ? 'scrolled' : ''}>
                <div className="container header-content">
                    <div className="logo">
                        <a href="/">
                            <img src="/codekarx png.png" alt="CODEKARX" className="logo-img" />
                        </a>
                    </div>

                    <button
                        id="hamburger-btn"
                        className={`hamburger ${isMenuOpen ? 'active' : ''}`}
                        aria-label="Toggle navigation"
                        aria-expanded={isMenuOpen}
                        onClick={toggleMobileNav}
                    >
                        <span className="hamburger-line"></span>
                        <span className="hamburger-line"></span>
                        <span className="hamburger-line"></span>
                    </button>

                    <nav id="nav-menu" className={isMenuOpen ? 'open' : ''}>
                        <ul>
                            {navLinks.map((link) => (
                                <li key={link.section}>
                                    <button
                                        className={`nav-link ${activeHash === `#${link.section}` ? 'active' : ''}`}
                                        onClick={() => handleNavLinkClick(link.section)}
                                    >
                                        {link.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {!hideCTA && (
                        <div className="cta-wrapper">
                            <button id="apply-btn" className="cta-button" onClick={handleApplyClick}>
                                {isLoggedIn ? 'Register Now' : 'Apply Now'}
                            </button>
                        </div>
                    )}
                </div>
                <div
                    id="nav-backdrop"
                    className={`nav-backdrop ${isMenuOpen ? 'active' : ''}`}
                    onClick={closeMobileNav}
                ></div>
            </header>
        </>
    );
};

export default Header;
