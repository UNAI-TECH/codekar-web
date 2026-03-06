import React from 'react';
import './FAQ.css';

interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    { question: "What is this hackathon about?", answer: "CODEKARX is a 24-hour hackathon fostering innovation in AI, Education, and Entertainment sectors." },
    { question: "Who can participate?", answer: "Open to all college students and early-stage developers." },
    { question: "Is this hackathon online or offline?", answer: "It is an offline event held at UNAI TECH campus." },
    { question: "Can I participate individually or as a team?", answer: "Both! You can participate solo or in a team of up to 4 members." },
    { question: "How many members are allowed in a team?", answer: "Minimum 2, Maximum 4 members." },
    { question: "Can team members be from different colleges?", answer: "Yes, cross-college teams are encouraged." },
    { question: "Will participants receive certificates?", answer: "Yes, all participants will receive a certificate of participation." },
    { question: "Is the registration fee refundable?", answer: "No, the registration fee is non-refundable." }
];

const FAQ: React.FC = () => {
    return (
        <section id="faq" className="faq-section">
            <div className="container">
                <h2 className="section-title">
                    <span className="mask">
                        <span className="reveal-text">FAQ</span>
                    </span>
                </h2>
                <div className="accordion">
                    {faqs.map((faq, index) => (
                        <details key={index} className="faq-item">
                            <summary>
                                {faq.question}
                                <span className="icon">+</span>
                            </summary>
                            <div className="faq-content">
                                <p>{faq.answer}</p>
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
