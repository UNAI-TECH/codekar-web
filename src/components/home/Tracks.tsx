import React, { useState, useEffect, useCallback } from 'react';
import './Tracks.css';

interface Track {
    title: string;
    description: string;
    icon: string;
    extendedDesc: string;
    examples: string[];
    technologies: string[];
}

const tracks: Track[] = [
    {
        title: "T01 – Core AI / ML",
        description: "Push the limits of AI with Deep Learning, NLP, Computer Vision, and predictive models.",
        icon: "/Gemini_Generated_Image_t2c0vht2c0vht2c0.png",
        extendedDesc: "Build intelligent systems that can understand and process low-resource Indian languages. Focus on AI that captures grammar, context, and conversation to enable smarter communication and accessibility.",
        examples: [
            "Language understanding models",
            "AI chatbots & conversational agents",
            "Speech recognition systems",
            "AI translation tools",
            "Smart recommendation systems"
        ],
        technologies: ["PyTorch", "TensorFlow", "Hugging Face", "Scikit-learn", "Transformers", "NLP Tools"]
    },
    {
        title: "T02 – Education 3.0",
        description: "Reimagine learning with AI-powered, personalized, and immersive education experiences.",
        icon: "/Gemini_Generated_Image_gzmwk6gzmwk6gzmw.png",
        extendedDesc: "Create the next generation of learning platforms using AI, gamification, and AR/VR. Build systems that adapt to each learner’s pace and deliver smart tutoring and interactive learning environments.",
        examples: [
            "AI personalized learning platforms",
            "Smart tutoring assistants",
            "Gamified learning apps",
            "AR/VR education experiences",
            "Adaptive testing systems"
        ],
        technologies: ["AI/ML", "AR/VR", "Web Apps", "Mobile Apps", "Learning Analytics", "NLP"]
    },
    {
        title: "T03 – Entertainment & Media",
        description: "Build the future of trusted digital media and AI-powered content platforms.",
        icon: "/Gemini_Generated_Image_mstg9gmstg9gmstg.png",
        extendedDesc: "Design solutions that help verify human vs AI-generated content, improve media authenticity, and deliver the right content to the right audience with transparency and trust.",
        examples: [
            "AI content detection tools",
            "Media recommendation systems",
            "Deepfake detection platforms",
            "Smart content moderation tools",
            "AI-powered creative platforms"
        ],
        technologies: ["AI/ML", "Computer Vision", "NLP", "Recommendation Systems", "Media APIs"]
    },
    {
        title: "T04 – AI Agents & Automation",
        description: "Automate entire workflows using intelligent AI agents and autonomous systems.",
        icon: "/Gemini_Generated_Image_rgmtbergmtbergmt.png",
        extendedDesc: "Build AI-powered agents that can perform tasks, make decisions, and manage business workflows automatically. Think of systems that reduce manual work and improve productivity.",
        examples: [
            "Autonomous AI agents",
            "Business process automation tools",
            "AI customer support assistants",
            "Smart workflow orchestration systems",
            "Task automation platforms"
        ],
        technologies: ["LangChain", "OpenAI APIs", "Automation Tools", "Python", "AI Agent Frameworks"]
    },
    {
        title: "T05 – Mass Communication & Big Data",
        description: "Reach millions with scalable communication platforms powered by data intelligence.",
        icon: "/Gemini_Generated_Image_v8yrntv8yrntv8yr.png",
        extendedDesc: "Develop platforms that enable large-scale communication, lead verification, and campaign optimization using big data analytics and intelligent automation.",
        examples: [
            "Mass messaging platforms",
            "Lead verification systems",
            "Data-driven campaign tools",
            "Customer engagement analytics",
            "Large-scale notification systems"
        ],
        technologies: ["Big Data Tools", "Cloud Platforms", "Data Analytics", "APIs", "AI/ML"]
    },
    {
        title: "T06 – Cutting Edge Tech",
        description: "Explore breakthrough innovations in Blockchain and AgriTech solutions.",
        icon: "/Gemini_Generated_Image_wg6h6swg6h6swg6h.png",
        extendedDesc: "Create impactful technologies that improve data transparency, security, and agricultural automation. Focus on solutions that bring real-world innovation to emerging industries.",
        examples: [
            "Blockchain transparency platforms",
            "Secure digital record systems",
            "Smart farming solutions",
            "Agriculture automation tools",
            "Supply chain tracking systems"
        ],
        technologies: ["Blockchain", "IoT", "Smart Contracts", "Data Platforms", "Automation Tools"]
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
                                    <p className="track-desc">{track.description}</p>
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
                                <h2>{selectedTrack.title}</h2>
                                <p className="modal-subtitle">{selectedTrack.description}</p>
                            </div>

                            <div className="modal-details">
                                <div className="detail-card">
                                    <div className="card-header">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <path d="M12 16v-4"></path>
                                            <path d="M12 8h.01"></path>
                                        </svg>
                                        <h3>About This Track</h3>
                                    </div>
                                    <p>{selectedTrack.extendedDesc}</p>
                                </div>

                                <div className="detail-card">
                                    <div className="card-header">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 20h9"></path>
                                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                        </svg>
                                        <h3>What You Can Build</h3>
                                    </div>
                                    <ul>
                                        {selectedTrack.examples.map((ex, i) => (
                                            <li key={i}>{ex}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="detail-card">
                                    <div className="card-header">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="16 18 22 12 16 6"></polyline>
                                            <polyline points="8 6 2 12 8 18"></polyline>
                                        </svg>
                                        <h3>Technologies</h3>
                                    </div>
                                    <div className="tech-tags">
                                        {selectedTrack.technologies.map((tech, i) => (
                                            <span key={i} className="tech-tag">{tech}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Tracks;
