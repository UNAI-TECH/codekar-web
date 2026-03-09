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

    // Handle Hash/Active Link
    useEffect(() => {
        const handleHashChange = () => {
            setActiveHash(window.location.hash);
        };
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange(); // Initial check

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const closeMobileNav = useCallback(() => {
        setIsMenuOpen(false);
        document.body.classList.remove('scroll-locked');
    }, []);

    const openMobileNav = () => {
        setIsMenuOpen(true);
        document.body.classList.add('scroll-locked');
    };

    const toggleMobileNav = () => {
        if (isMenuOpen) closeMobileNav();
        else openMobileNav();
    };

    const smoothScrollTo = (hash: string) => {
        const targetId = hash.replace('#', '');
        const targetEl = document.getElementById(targetId);
        if (!targetEl) return false;

        // @ts-ignore
        const lenis = window.lenis;
        if (lenis) {
            lenis.scrollTo(targetEl, { offset: -80 });
        } else {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        history.pushState(null, '', hash);
        setActiveHash(hash);
        return true;
    };

    const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        const hash = href.includes('#') ? '#' + href.split('#')[1] : '';
        const isHomePage = window.location.pathname === '/' ||
            window.location.pathname === '/index.html' ||
            window.location.pathname.endsWith('/');

        closeMobileNav();

        if (isHomePage && hash && hash !== '#') {
            const targetEl = document.querySelector(hash);
            if (targetEl) {
                e.preventDefault();
                smoothScrollTo(hash);
            }
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
        { name: 'Home', href: '/home' },
        { name: 'Tracks', href: '/#tracks' },
        { name: 'About', href: '/#about' },
        { name: 'Sponsors', href: '/#sponsors' },
        { name: 'Docs', href: '/#docs' },
    ];

    return (
        <>
            <header id="main-header" className={isScrolled ? 'scrolled' : ''}>
                <div className="container header-content">
                    <div className="logo">
                        <a href="/">
                            <img src="/codekarX.png" alt="CODEKARX" className="logo-img" />
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
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        className={`nav-link ${activeHash === (link.href.includes('#') ? '#' + link.href.split('#')[1] : '') ? 'active' : ''}`}
                                        onClick={(e) => handleNavLinkClick(e, link.href)}
                                    >
                                        {link.name}
                                    </a>
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
