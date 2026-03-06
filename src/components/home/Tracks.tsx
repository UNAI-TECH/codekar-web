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
        title: "Education",
        description: "Revolutionize learning with ed-tech tools, LMS innovations, and accessible knowledge platforms.",
        icon: "/Gemini_Generated_Image_gzmwk6gzmwk6gzmw.png",
        extendedDesc: "Transform the way people learn and teach. Build platforms that make education accessible, engaging, and effective for everyone.",
        examples: ["AI-powered tutoring systems", "Interactive learning platforms", "Virtual classrooms", "Gamified education apps"],
        technologies: ["React", "Python", "TensorFlow", "WebRTC"]
    },
    {
        title: "Entertainment",
        description: "Build immersive experiences, gaming solutions, or content streaming innovations.",
        icon: "/Gemini_Generated_Image_mstg9gmstg9gmstg.png",
        extendedDesc: "Create the next generation of entertainment. From gaming to streaming, build experiences that captivate and engage audiences worldwide.",
        examples: ["Multiplayer gaming platforms", "Streaming services", "AR/VR experiences", "Content recommendation engines"],
        technologies: ["Unity", "WebGL", "Node.js", "AWS Media Services"]
    },
    {
        title: "AI Agents & Automations",
        description: "Develop intelligent agents that automate workflows and solve complex tasks autonomously.",
        icon: "/Gemini_Generated_Image_rgmtbergmtbergmt.png",
        extendedDesc: "Build autonomous systems that can think, learn, and act. Create intelligent agents that transform how work gets done.",
        examples: ["Chatbots & virtual assistants", "Workflow automation tools", "Smart email assistants", "Code generation agents"],
        technologies: ["LangChain", "OpenAI API", "Python", "AutoGen"]
    },
    {
        title: "Core AI & ML",
        description: "Push boundaries with Deep Learning, NLP, Computer Vision, and predictive models.",
        icon: "/Gemini_Generated_Image_t2c0vht2c0vht2c0.png",
        extendedDesc: "Dive deep into machine learning and artificial intelligence. Build models that can see, understand, and predict.",
        examples: ["Image recognition systems", "Natural language processors", "Predictive analytics", "Recommendation systems"],
        technologies: ["PyTorch", "TensorFlow", "scikit-learn", "Hugging Face"]
    },
    {
        title: "Big Data & Mass Communication",
        description: "Harness data at scale for insights, journalism, or social connection platforms.",
        icon: "/Gemini_Generated_Image_v8yrntv8yrntv8yr.png",
        extendedDesc: "Process and analyze massive datasets to uncover insights. Build platforms that connect people and disseminate information at scale.",
        examples: ["Data visualization dashboards", "Real-time analytics platforms", "Social media tools", "News aggregators"],
        technologies: ["Apache Spark", "Kafka", "PostgreSQL", "D3.js"]
    },
    {
        title: "Cutting-edge Agents",
        description: "Experimental agentic workflows next-gen autonomous systems.",
        icon: "/Gemini_Generated_Image_wg6h6swg6h6swg6h.png",
        extendedDesc: "Pioneer the future of autonomous systems. Experiment with cutting-edge technologies and build the next generation of intelligent agents.",
        examples: ["Multi-agent systems", "Autonomous research assistants", "Complex task planners", "Self-improving agents"],
        technologies: ["CrewAI", "LangGraph", "Vector DBs", "Reinforcement Learning"]
    }
];

const Tracks: React.FC = () => {
    const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (track: Track) => {
        setSelectedTrack(track);
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden';
        // @ts-ignore
        if (window.lenis) window.lenis.stop();
    };

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        document.body.style.overflow = '';
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
