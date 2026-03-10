import React, { useState, useEffect, useCallback } from 'react';
import './Tracks.css';

interface Track {
    title: string;
    subtitle: string;
    description: string;
    icon: string;
    overview: string;
    problemStatement: string;
    scopeOfWork: string[];
    expectedDeliverables: string[];
    useCases: string[];
    judgingCriteria: string[];
}

const tracks: Track[] = [
    {
        title: "Core AI / ML",
        subtitle: "Language Intelligence — AI Systems for Indian Languages",
        description: "Push the limits of AI with Deep Learning, NLP, Computer Vision, and predictive models.",
        icon: "/Gemini_Generated_Image_t2c0vht2c0vht2c0.png",
        overview: "Millions of learners across India struggle to master regional languages due to the absence of intelligent digital tools. Existing systems fall short in understanding grammatical nuance, literary context, and real conversational usage.\n\nThis track challenges participants to build AI-powered systems that deeply understand low-resource Indian languages — not just translate them, but truly comprehend conversational usage, grammar structures, and cultural context.",
        problemStatement: "Build an Intelligent Language Model capable of deeply understanding low-resource Indian languages. The system should support everyday conversational language, grammar validation, contextual explanations, and AI-powered conversational assistance.\n\nThe platform must help learners at different proficiency levels and provide accurate, context-aware, real-time language support.",
        scopeOfWork: [
            "Grammar validation and real-time error correction for learner-submitted regional language text",
            "Contextual explanation of classical and modern literary passages",
            "Conversational tutoring agent with dialect-aware multi-turn Q&A",
            "Sentence-level feedback with difficulty-aware explanations",
            "Optional support for voice or script-based input for accessibility"
        ],
        expectedDeliverables: [
            "Working prototype (web app, API, or mobile application)",
            "Fine-tuned or prompted language model with evaluation results",
            "System documentation and architecture diagram",
            "Demo video or live walkthrough (maximum 5 minutes)"
        ],
        useCases: [
            "Grammar correction for regional language student essays",
            "AI-powered literary analysis for school curriculum texts",
            "Conversational language practice chatbot for self-learners",
            "Interactive access to classical Indian literature archives"
        ],
        judgingCriteria: [
            "Linguistic Accuracy & Grammar Understanding — 30%",
            "Educational Utility & User Experience — 25%",
            "Scalability & Model Efficiency — 25%",
            "Innovation & Novelty of Approach — 20%"
        ]
    },
    {
        title: "Education 3.0",
        subtitle: "Gamification · AR/VR · Personalized AI Tutor",
        description: "Reimagine learning with AI-powered, personalized, and immersive education experiences.",
        icon: "/Gemini_Generated_Image_gzmwk6gzmwk6gzmw.png",
        overview: "Traditional education systems follow a one-size-fits-all model that leaves many learners behind. With advances in AI, AR/VR, and gamification, there is an opportunity to build hyper-personalized and immersive learning environments.\n\nThis track invites participants to redesign how education works — making it adaptive, engaging, and outcome-driven.",
        problemStatement: "Build a gamified and AI-powered adaptive learning platform that personalizes educational pathways for learners of different age groups.\n\nThe platform should include a Personalized AI Tutor, track learner progress intelligently, dynamically adjust difficulty, and motivate learners through game-based engagement mechanics.",
        scopeOfWork: [
            "AI-powered personalized learning path generation",
            "Skill tree system with adaptive difficulty progression",
            "Gamification features such as XP, levels, badges, and streaks",
            "Personalized AI Tutor with contextual explanation capability",
            "Optional AR/VR immersive classroom or lab experience",
            "Learning analytics dashboard for students and instructors"
        ],
        expectedDeliverables: [
            "Functional prototype with at least one full learning module",
            "Documented gamification system and adaptive AI logic",
            "Analytics dashboard with sample learner data",
            "Demo video or live walkthrough (maximum 5 minutes)"
        ],
        useCases: [
            "STEM learning platform for school students",
            "Skill development platform for college students",
            "AI mentor-driven coding bootcamp",
            "Gamified regional language learning system"
        ],
        judgingCriteria: [
            "Personalization & Adaptive Intelligence — 30%",
            "Gamification Design & Engagement — 25%",
            "Usability Across Age Groups — 25%",
            "Learning Outcome Measurement & Analytics — 20%"
        ]
    },
    {
        title: "Entertainment & Media",
        subtitle: "Human vs AI Detection · Verified Audiences · Trust-Intact Media",
        description: "Build the future of trusted digital media and AI-powered content platforms.",
        icon: "/Gemini_Generated_Image_mstg9gmstg9gmstg.png",
        overview: "Digital media faces a growing crisis where audiences struggle to distinguish human-created content from AI-generated media.\n\nThis track challenges participants to build intelligent systems that verify authenticity, detect AI-generated content, and ensure trusted audience distribution.",
        problemStatement: "Develop an AI-powered content verification and media intelligence system capable of detecting human vs AI-generated content across multiple formats such as text, images, audio, or video.\n\nThe system should also verify audience authenticity and optimize media distribution to trusted audiences.",
        scopeOfWork: [
            "AI detection system for identifying human vs AI-generated content",
            "Content credibility scoring and source verification",
            "Verified audience segmentation with authenticity metrics",
            "Distribution optimization engine for media campaigns",
            "Editorial analytics dashboard showing trust scores and reach"
        ],
        expectedDeliverables: [
            "Functional prototype supporting at least two media formats",
            "Content verification module with explainable results",
            "Analytics dashboard prototype",
            "Demo video or live walkthrough (maximum 5 minutes)"
        ],
        useCases: [
            "News organizations verifying authentic journalism",
            "Brand safety systems for advertisers",
            "OTT platforms labeling content authenticity",
            "Civic media platforms maintaining public trust"
        ],
        judgingCriteria: [
            "Verification Accuracy & Trust Signal Quality — 30%",
            "Processing Speed & Detection Architecture — 25%",
            "Audience Intelligence & Distribution Logic — 25%",
            "Scalability & Media Type Coverage — 20%"
        ]
    },
    {
        title: "AI Agents & Automation",
        subtitle: "Complete Business Automation · Multi-Agent Orchestration",
        description: "Automate entire workflows using intelligent AI agents and autonomous systems.",
        icon: "/Gemini_Generated_Image_rgmtbergmtbergmt.png",
        overview: "Many businesses spend enormous time managing repetitive workflows across departments such as sales, operations, customer support, and HR.\n\nThis track challenges participants to build AI agent systems that automate entire business workflows using multi-agent coordination.",
        problemStatement: "Design intelligent automation agents capable of orchestrating complete business operations with minimal human intervention.\n\nThe system should use context awareness, persistent memory, multi-agent coordination, and feedback-driven improvement.",
        scopeOfWork: [
            "Multi-agent orchestration across business departments",
            "Context-aware conversational interface with persistent memory",
            "Automated notifications and workflow escalation",
            "Business analytics and reporting automation",
            "Feedback-driven system improvement"
        ],
        expectedDeliverables: [
            "Agent system capable of automating at least three workflows",
            "Documentation of role-based permissions and agent actions",
            "Integration example with a business workflow",
            "Demo video or live walkthrough (maximum 5 minutes)"
        ],
        useCases: [
            "AI automation for small business operations",
            "HR automation (onboarding, attendance, payroll)",
            "Customer support and logistics management agents",
            "School or college administration automation"
        ],
        judgingCriteria: [
            "Workflow Complexity & Orchestration Depth — 30%",
            "Context Retention & Memory Accuracy — 25%",
            "Practical Business Applicability — 25%",
            "Self-Improvement & Feedback Handling — 20%"
        ]
    },
    {
        title: "Mass Communication & Big Data",
        subtitle: "Large-Scale Campaigns · Verified Leads · Real-Time Data Pipelines",
        description: "Reach millions with scalable communication platforms powered by data intelligence.",
        icon: "/Gemini_Generated_Image_v8yrntv8yrntv8yr.png",
        overview: "Large-scale communication campaigns require reliable infrastructure for data verification, audience segmentation, and scalable delivery.\n\nThis track focuses on building systems that enable mass communication with verified audience data and measurable campaign outcomes.",
        problemStatement: "Build a mass communication platform capable of reaching millions of users with verified leads, supported by real-time data pipelines and campaign intelligence tools.",
        scopeOfWork: [
            "Real-time audience data pipeline for ingestion and segmentation",
            "Lead verification and quality scoring systems",
            "Multi-channel campaign delivery (SMS, email, WhatsApp, push notifications)",
            "Analytics dashboard for campaign performance and reach",
            "Compliance and consent management systems"
        ],
        expectedDeliverables: [
            "Functional campaign platform prototype",
            "Lead verification and quality scoring module",
            "Campaign analytics dashboard",
            "Demo video or live walkthrough (maximum 5 minutes)"
        ],
        useCases: [
            "Civic outreach campaigns",
            "EdTech enrollment drives",
            "Healthcare awareness programs",
            "Government scheme awareness campaigns"
        ],
        judgingCriteria: [
            "Data Pipeline Quality & Processing Speed — 30%",
            "Lead Verification Accuracy — 25%",
            "Campaign Distribution Intelligence — 25%",
            "Compliance & Scalability — 20%"
        ]
    },
    {
        title: "Cutting Edge Technologies",
        subtitle: "Blockchain (Data Security) · AgriTech (Agricultural Automation)",
        description: "Explore breakthrough innovations in Blockchain and AgriTech solutions.",
        icon: "/Gemini_Generated_Image_wg6h6swg6h6swg6h.png",
        overview: "This supporting track focuses on two frontier technologies: Blockchain and AgriTech.\n\nBlockchain enables secure, transparent, and decentralized data systems, while AgriTech focuses on improving agricultural productivity using intelligent automation.",
        problemStatement: "Participants can choose between two domains:\n\nBlockchain: Build a secure decentralized system for data integrity, transactions, or trust infrastructure.\n\nAgriTech: Develop intelligent systems that automate or optimize agricultural workflows such as crop monitoring, irrigation, and market linkage.",
        scopeOfWork: [
            "Blockchain-based secure data storage and transaction systems",
            "Smart contract automation and trust verification",
            "AI-based crop monitoring and yield prediction",
            "Agricultural supply chain optimization systems"
        ],
        expectedDeliverables: [
            "Functional prototype for Blockchain or AgriTech system",
            "System architecture documentation",
            "Security or reliability analysis",
            "Demo video or live walkthrough (maximum 5 minutes)"
        ],
        useCases: [
            "Blockchain-based credential verification",
            "Transparent government fund tracking",
            "AI-powered crop health monitoring",
            "Digital farm-to-market supply chains"
        ],
        judgingCriteria: [
            "Technical Innovation & Architecture — 30%",
            "Real-World Impact — 25%",
            "Security / Farmer Usability — 25%",
            "Scalability & Deployment Readiness — 20%"
        ]
    }
];

const Tracks: React.FC = () => {
    const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (track: Track) => {
        setSelectedTrack(track);
        setIsModalOpen(true);
        document.body.classList.add('scroll-locked');
        // @ts-ignore
        if (window.lenis) window.lenis.stop();
    };

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        document.body.classList.remove('scroll-locked');
        // @ts-ignore
        if (window.lenis) window.lenis.start();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeModal();
        };
        if (isModalOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, closeModal]);

    return (
        <section id="tracks" className="section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Tracks</h2>
                    <p className="section-subtitle">Choose your path and build the future</p>
                </div>

                <div className="tracks-grid">
                    {tracks.map((track, index) => (
                        <div
                            key={index}
                            className="track-card clickable-card"
                            onClick={() => openModal(track)}
                        >
                            <div className="card-inner">
                                <div className="photo-container">
                                    <img src={track.icon} alt={track.title} className="track-icon" />
                                    <div className="photo-overlay"></div>
                                </div>
                                <div className="track-info">
                                    <h3 className="track-title">{track.title}</h3>
                                    <p className="track-desc">{track.subtitle}</p>
                                    <div className="action-hint">
                                        <span className="view-text">View Details</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 12h14"></path>
                                            <path d="M12 5l7 7-7 7"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Track Modal */}
            <div
                id="track-modal"
                className={`modal-overlay ${isModalOpen ? 'open' : ''}`}
                onClick={(e) => e.target === e.currentTarget && closeModal()}
            >
                <div className="modal-content" data-lenis-prevent>
                    <button className="close-btn" onClick={closeModal}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>

                    {selectedTrack && (
                        <div className="modal-body">
                            <div className="modal-header-section">
                                <div className="modal-icon">
                                    <img src={selectedTrack.icon} alt={selectedTrack.title} />
                                </div>
                                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{selectedTrack.title}</h2>
                                <p className="modal-subtitle" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{selectedTrack.subtitle}</p>
                            </div>

                            <div className="modal-details">
                                <div className="detail-card">
                                    <div className="card-header">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <path d="M12 16v-4"></path>
                                            <path d="M12 8h.01"></path>
                                        </svg>
                                        <h3>Overview</h3>
                                    </div>
                                    <div className="content-text">
                                        {selectedTrack.overview.split('\n\n').map((para, i) => (
                                            <p key={i} style={{ marginBottom: i === 0 ? '1rem' : '0' }}>{para}</p>
                                        ))}
                                    </div>
                                </div>

                                <div className="detail-card">
                                    <div className="card-header">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                            <line x1="12" y1="9" x2="12" y2="13"></line>
                                            <line x1="12" y1="17" x2="12" y2="17.01"></line>
                                        </svg>
                                        <h3>Problem Statement</h3>
                                    </div>
                                    <div className="content-text">
                                        {selectedTrack.problemStatement.split('\n\n').map((para, i) => (
                                            <p key={i} style={{ marginBottom: i === 0 ? '1rem' : '0' }}>{para}</p>
                                        ))}
                                    </div>
                                </div>

                                <div className="detail-card">
                                    <div className="card-header">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                                        </svg>
                                        <h3>Scope of Work</h3>
                                    </div>
                                    <ul>
                                        {selectedTrack.scopeOfWork.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="detail-card">
                                    <div className="card-header">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        <h3>Expected Deliverables</h3>
                                    </div>
                                    <ul>
                                        {selectedTrack.expectedDeliverables.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="detail-card">
                                    <div className="card-header">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                        </svg>
                                        <h3>Use Cases</h3>
                                    </div>
                                    <ul>
                                        {selectedTrack.useCases.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="detail-card">
                                    <div className="card-header">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                        </svg>
                                        <h3>Judging Criteria</h3>
                                    </div>
                                    <ul>
                                        {selectedTrack.judgingCriteria.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <button
                                    className="register-cta-btn"
                                    onClick={() => {
                                        closeModal();
                                        window.dispatchEvent(new CustomEvent('open-registration-modal'));
                                    }}
                                >
                                    Register Now for this Track
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Tracks;
