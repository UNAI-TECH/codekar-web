import React from 'react';
import './Prizes.css';

interface PrizeCardProps {
    place: number;
    rank: string;
    amount: string;
    perks: string[];
    type: 'gold' | 'silver' | 'bronze';
    elevated?: boolean;
}

const PrizeCard: React.FC<PrizeCardProps> = ({ place, rank, amount, perks, type, elevated }) => {
    const cardClass = `prize-card ${type}-card ${elevated ? 'elevated' : ''}`;
    const glowClass = `card-glow ${type}-glow`;
    const medalClass = `medal ${type}-medal`;
    const rankClass = `prize-rank ${type}-rank`;
    const amountClass = `prize-amount ${type}-amount`;
    const barClass = `podium-bar ${type}-bar`;

    return (
        <div className={cardClass} data-place={place}>
            <div className={glowClass}></div>

            <div className="medal-wrapper">
                <div className={medalClass}>
                    <div className="medal-laurel">
                        <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 30 Q5 10 25 8 Q15 30 25 52 Q5 50 10 30Z" fill="currentColor" opacity="0.6" />
                            <path d="M90 30 Q95 10 75 8 Q85 30 75 52 Q95 50 90 30Z" fill="currentColor" opacity="0.6" />
                        </svg>
                    </div>
                    <span className="medal-number">{place}</span>
                </div>
            </div>
            <div className="card-content">
                <p className={rankClass}>{rank}</p>
                <div className={amountClass}>
                    <span className="currency">₹</span>
                    <span className="amount">{amount}</span>
                </div>
                <p className="prize-label">CASH PRIZE</p>
                <ul className="prize-perks">
                    {perks.map((perk, index) => (
                        <li key={index}>
                            <span>{perk}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className={barClass}>
                <span>{type === 'gold' ? 'Champion' : `${place}${place === 2 ? 'nd' : 'rd'}`}</span>
            </div>
        </div>
    );
};

const Prizes: React.FC = () => {
    return (
        <section id="prizes" className="prizes-section">
            <div className="container">
                {/* Section Header */}
                <div className="section-header">
                    <div className="section-badge">
                        <span>Prizes & Rewards</span>
                    </div>
                    <h2 className="prizes-title">
                        <span className="mask"><span className="reveal-text">Compete to Win</span></span>
                    </h2>
                    <p className="prizes-subtitle">
                        Extraordinary rewards for extraordinary builders. Rise to the challenge and claim your prize.
                    </p>
                </div>

                {/* Podium Grid */}
                <div className="podium-grid">
                    {/* 2nd Place */}
                    <PrizeCard
                        place={2}
                        rank="SECOND PRIZE"
                        amount="20,000"
                        perks={['Silver Trophy', 'Award Ceremony Invite', 'Media Feature']}
                        type="silver"
                    />

                    {/* 1st Place */}
                    <PrizeCard
                        place={1}
                        rank="FIRST PRIZE"
                        amount="30,000"
                        perks={['Grand Trophy', 'Award Ceremony Invite', 'Media Feature']}
                        type="gold"
                        elevated
                    />

                    {/* 3rd Place */}
                    <PrizeCard
                        place={3}
                        rank="THIRD PRIZE"
                        amount="10,000"
                        perks={['Bronze Trophy', 'Award Ceremony Invite', 'Recognition']}
                        type="bronze"
                    />
                </div>

                {/* Awards Ceremony Footer */}
                <div className="ceremony-bar">
                    <div className="ceremony-inner">
                        <p className="ceremony-text">
                            <strong>AWARDS CEREMONY EVENT:</strong> Winners will be invited to a grand ceremony event for prize distribution.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Prizes;
