import React from 'react';
import './DockNav.css';

const DockNav: React.FC = () => {
    const scrollToSection = (sectionId: string) => {
        const isHomePage = window.location.pathname === '/';

        if (!isHomePage) {
            window.location.href = `/#${sectionId}`;
            return;
        }

        if (sectionId === 'home') {
            // @ts-ignore
            const lenis = window.lenis;
            if (lenis) {
                lenis.scrollTo(0, { duration: 1.2 });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            return;
        }

        const element = document.getElementById(sectionId);
        if (!element) return;

        const offset = 80;
        // @ts-ignore
        const lenis = window.lenis;
        if (lenis) {
            lenis.scrollTo(element, { offset: -offset, duration: 1.2 });
        } else {
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    };

    const navItems = [
        {
            name: 'Home',
            section: 'home',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            )
        },
        {
            name: 'About',
            section: 'about',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                </svg>
            )
        },
        {
            name: 'Tracks',
            section: 'tracks',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="7" height="7" x="3" y="3" rx="1" />
                    <rect width="7" height="7" x="14" y="3" rx="1" />
                    <rect width="7" height="7" x="14" y="14" rx="1" />
                    <rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
            )
        },
        {
            name: 'Docs',
            section: 'docs',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                </svg>
            )
        }
    ];

    return (
        <nav className="dock-nav" id="dock-nav">
            {navItems.map((item) => (
                <button
                    key={item.name}
                    className="dock-item"
                    title={item.name}
                    onClick={() => scrollToSection(item.section)}
                >
                    {item.icon}
                    <span className="dock-label">{item.name}</span>
                </button>
            ))}

            <div className="dock-divider"></div>

            <a href="/sponsor-challenges" className="dock-item dock-special" title="Sponsor Challenges">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
                    <circle cx="12" cy="8" r="6" />
                </svg>
                <span className="dock-label">Challenges</span>
            </a>
        </nav>
    );
};

export default DockNav;
