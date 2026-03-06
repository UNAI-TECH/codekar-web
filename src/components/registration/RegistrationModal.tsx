import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import './RegistrationModal.css';

interface Props {
    teamAmount: number;
    individualAmount: number;
    zohoAccountId: string;
    zohoApiKey: string;
}

const RegistrationModal: React.FC<Props> = ({
    teamAmount,
    individualAmount,
    zohoAccountId,
    zohoApiKey,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'new-registration' | 'already-registered'>('new-registration');
    const [step, setStep] = useState(0); // 0: Auth, 1: Type, 2: Form, 3: Payment
    const [registrationType, setRegistrationType] = useState<'individual' | 'team'>('individual');
    const [isLoading, setIsLoading] = useState(false);
    const [paymentState, setPaymentState] = useState<'idle' | 'generating' | 'details' | 'error' | 'success'>('idle');
    const [paymentSessionId, setPaymentSessionId] = useState('');
    const [registrationId, setRegistrationId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [userData, setUserData] = useState({ name: '', email: '' });
    const [lookupCode, setLookupCode] = useState('');
    const [lookupError, setLookupError] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        college: '',
        department: '',
        year: '',
        projectTrack: '',
        projectName: '',
        teamName: '',
        member2: '',
        member3: '',
        member4: '',
        declaration: false
    });

    // Handle outside triggers (for example from other components)
    useEffect(() => {
        // Listen for custom events to open modal
        const handleOpen = (e: any) => {
            setIsOpen(true);
            if (e.detail?.type) {
                setRegistrationType(e.detail.type);
                setStep(2);
            }
        };
        window.addEventListener('open-registration-modal', handleOpen);

        // Check URL params for auto-open
        const params = new URLSearchParams(window.location.search);
        if (params.get('openForm') === 'true' || params.get('auth') === 'success' || params.get('openModal') === 'true') {
            setIsOpen(true);
            if (params.get('registrationType')) {
                const type = params.get('registrationType') as 'individual' | 'team';
                setRegistrationType(type);
                setStep(2);
            }
            // Cleanup URL
            const newUrl = window.location.pathname + window.location.search
                .replace(/[?&]openForm=true/, '')
                .replace(/[?&]registrationType=[^&]+/, '')
                .replace(/[?&]auth=success/, '')
                .replace(/[?&]openModal=true/, '')
                .replace(/^&/, '?').replace(/\?$/, '');
            window.history.replaceState({}, '', newUrl);
        }

        return () => window.removeEventListener('open-registration-modal', handleOpen);
    }, []);

    // Check Auth Session
    useEffect(() => {
        const checkSession = async () => {
            if (supabase) {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUserData({
                        name: session.user.user_metadata.full_name || '',
                        email: session.user.email || ''
                    });
                    setFormData(prev => ({
                        ...prev,
                        name: session.user.user_metadata.full_name || '',
                        email: session.user.email || ''
                    }));
                    if (step === 0) setStep(1);
                }
            }
        };
        checkSession();
    }, [supabase, step]);

    // Scroll Lock
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('scroll-locked');
            // @ts-ignore
            if (window.lenis) window.lenis.stop();
        } else {
            document.body.classList.remove('scroll-locked');
            // @ts-ignore
            if (window.lenis) window.lenis.start();
        }
    }, [isOpen]);

    const handleGoogleSignIn = async () => {
        if (supabase) {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/type`
                }
            });
            if (error) console.error('OAuth Error:', error.message);
        }
    };

    const handleTypeSelect = (type: 'individual' | 'team') => {
        setRegistrationType(type);
        setStep(2);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const { id, value, type, checked } = target;

        const keyMap: Record<string, keyof typeof formData> = {
            'full-name': 'name',
            'email': 'email',
            'phone': 'phone',
            'college': 'college',
            'dept': 'department',
            'year': 'year',
            'track': 'projectTrack',
            'project-name': 'projectName',
            'team-name': 'teamName',
            'member-2': 'member2',
            'member-3': 'member3',
            'member-4': 'member4',
            'declaration': 'declaration'
        };

        const stateKey = keyMap[id];
        if (stateKey) {
            setFormData(prev => ({
                ...prev,
                [stateKey]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStep(3);
        setPaymentState('generating');

        const amount = registrationType === 'team' ? teamAmount : individualAmount;

        try {
            const response = await fetch(`${import.meta.env.PUBLIC_SUPABASE_URL}/functions/v1/zoho-payment-handler`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.PUBLIC_SUPABASE_ANON_KEY}`,
                    'apikey': import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
                },
                body: JSON.stringify({
                    action: 'create-session',
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    college: formData.college,
                    department: formData.department,
                    year: formData.year,
                    project_track: formData.projectTrack,
                    project_name: formData.projectName,
                    registration_type: registrationType,
                    team_name: registrationType === 'team' ? formData.teamName : null,
                    member_2: formData.member2 || null,
                    member_3: formData.member3 || null,
                    member_4: formData.member4 || null,
                    amount,
                }),
            });

            const result = await response.json();
            if (!response.ok || result.error) throw new Error(result.error || 'Backend error');

            setPaymentSessionId(result.payment_session_id);
            setRegistrationId(result.registration_id);
            setPaymentState('details');
        } catch (err: any) {
            setErrorMessage(err.message || 'Unable to create payment session.');
            setPaymentState('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayNow = async () => {
        if (!paymentSessionId) return;
        setIsLoading(true);

        const amount = registrationType === 'team' ? teamAmount : individualAmount;

        try {
            // @ts-ignore
            const instance = new window.ZPayments({
                account_id: zohoAccountId,
                domain: 'IN',
                otherOptions: { api_key: zohoApiKey }
            });

            const options = {
                amount: amount.toString(),
                currency_code: 'INR',
                currency_symbol: '₹',
                payment_session_id: paymentSessionId,
                payments_session_id: paymentSessionId,
                business: 'CODEKARX',
                description: `CodeKar 2026 Registration - ${registrationId}`,
                reference_number: registrationId,
                address: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone
                }
            };

            try {
                // @ts-ignore
                await instance.requestPaymentMethod(options);
                setPaymentState('success');
                window.location.href = `/payment-success?registration_id=${registrationId}`;
            } catch (err: any) {
                if (err.code !== 'widget_closed') {
                    setErrorMessage(err.message || 'Payment failed.');
                    setPaymentState('error');
                }
            } finally {
                // @ts-ignore
                await instance.close();
            }
        } catch (err) {
            setErrorMessage('Failed to initialize payment widget.');
            setPaymentState('error');
        } finally {
            setIsLoading(false);
        }
    };

    const closeModal = () => {
        setIsOpen(false);
        setTimeout(() => {
            setStep(userData.email ? 1 : 0);
            setPaymentState('idle');
            setFormData(prev => ({ ...prev, declaration: false }));
        }, 400);
    };

    return (
        <div id="registration-modal" className="modal" data-open={isOpen}>
            <div className="modal-overlay" onClick={closeModal}></div>
            <div className="modal-content" data-lenis-prevent>
                <button className="close-btn" aria-label="Close modal" onClick={closeModal}>&times;</button>

                <div className="modal-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'new-registration' ? 'active' : ''}`}
                        onClick={() => setActiveTab('new-registration')}
                    >
                        New Registration
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'already-registered' ? 'active' : ''}`}
                        onClick={() => setActiveTab('already-registered')}
                    >
                        Already Registered?
                    </button>
                </div>

                {activeTab === 'new-registration' ? (
                    <div className="tab-content active">
                        {step === 0 && (
                            <div className="step active">
                                <div className="auth-card">
                                    <div className="auth-icon">🔐</div>
                                    <h2>Authentication Required</h2>
                                    <p>Please sign in with Google to continue with your registration.</p>
                                    <button className="google-btn" onClick={handleGoogleSignIn}>
                                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="20" height="20" />
                                        Continue with Google
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 1 && (
                            <div className="step active">
                                <h2>Registration Type</h2>
                                <div className="options">
                                    <button className="type-btn" onClick={() => handleTypeSelect('individual')}>
                                        <span className="icon">👤</span>
                                        <h3>Individual</h3>
                                        <p>Register as a solo participant.</p>
                                    </button>
                                    <button className="type-btn" onClick={() => handleTypeSelect('team')}>
                                        <span className="icon">👥</span>
                                        <h3>Team</h3>
                                        <p>Register with your squad (2-4 members).</p>
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="step active">
                                <h2>{registrationType === 'individual' ? 'Individual Registration' : 'Team Registration'}</h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="form-grid">
                                        <div className="field">
                                            <label htmlFor="full-name">{registrationType === 'team' ? 'Team Lead Name' : 'Full Name'}</label>
                                            <input type="text" id="full-name" required value={formData.name} onChange={handleInputChange} />
                                        </div>
                                        {registrationType === 'team' && (
                                            <div className="field">
                                                <label htmlFor="team-name">Team Name</label>
                                                <input type="text" id="team-name" required value={formData.teamName} onChange={handleInputChange} />
                                            </div>
                                        )}
                                        {registrationType === 'team' && (
                                            <>
                                                <div className="field">
                                                    <label htmlFor="member-2">Team Member 2 Name</label>
                                                    <input type="text" id="member-2" value={formData.member2} onChange={handleInputChange} />
                                                </div>
                                                <div className="field">
                                                    <label htmlFor="member-3">Team Member 3 Name</label>
                                                    <input type="text" id="member-3" value={formData.member3} onChange={handleInputChange} />
                                                </div>
                                                <div className="field">
                                                    <label htmlFor="member-4">Team Member 4 Name</label>
                                                    <input type="text" id="member-4" value={formData.member4} onChange={handleInputChange} />
                                                </div>
                                            </>
                                        )}
                                        <div className="field">
                                            <label htmlFor="email">{registrationType === 'team' ? 'Team Lead Email (Main ID)' : 'Email ID'}</label>
                                            <input type="email" id="email" required value={formData.email} onChange={handleInputChange} />
                                        </div>
                                        <div className="field">
                                            <label htmlFor="phone">Phone Number</label>
                                            <input type="tel" id="phone" required value={formData.phone} onChange={handleInputChange} />
                                        </div>
                                        <div className="field">
                                            <label htmlFor="college">College Name</label>
                                            <input type="text" id="college" required value={formData.college} onChange={handleInputChange} />
                                        </div>
                                        <div className="field">
                                            <label htmlFor="dept">Department</label>
                                            <input type="text" id="dept" required value={formData.department} onChange={handleInputChange} />
                                        </div>
                                        <div className="field">
                                            <label htmlFor="year">Year of Study</label>
                                            <select id="year" required value={formData.year} onChange={handleInputChange}>
                                                <option value="">Select Year</option>
                                                <option value="1">1st Year</option>
                                                <option value="2">2nd Year</option>
                                                <option value="3">3rd Year</option>
                                                <option value="4">4th Year</option>
                                            </select>
                                        </div>
                                        <div className="field">
                                            <label htmlFor="track">Project Track</label>
                                            <select id="track" required value={formData.projectTrack} onChange={handleInputChange}>
                                                <option value="">Select Track</option>
                                                <option value="education">Education</option>
                                                <option value="entertainment">Entertainment</option>
                                                <option value="ai-agents">AI Agents &amp; Automations</option>
                                                <option value="core-ai">Core AI &amp; ML</option>
                                                <option value="big-data">Big Data</option>
                                                <option value="cutting-edge">Cutting-edge Agents</option>
                                            </select>
                                        </div>
                                        <div className="field full-width">
                                            <label htmlFor="project-name">Project Name (Idea)</label>
                                            <input type="text" id="project-name" required value={formData.projectName} onChange={handleInputChange} />
                                        </div>
                                        <div className="field full-width checkbox-field">
                                            <label className="checkbox-container">
                                                <input type="checkbox" id="declaration" required checked={formData.declaration} onChange={handleInputChange} />
                                                <span className="checkmark"></span>
                                                <span className="label-text">
                                                    I hereby declare that all my details are correct and I will follow all the rules and regulations by the organization. Any wrong behavior in the WhatsApp group will disqualify the team.
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="actions">
                                        <button type="button" className="back-btn" onClick={() => setStep(1)}>Back</button>
                                        <button type="submit" className="submit-btn" disabled={isLoading}>
                                            {isLoading ? 'Generating link...' : 'Proceed to Payment'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="step active">
                                {paymentState === 'generating' && (
                                    <div className="payment-state-card">
                                        <div className="payment-spinner"></div>
                                        <h2 style={{ marginTop: '1.5rem' }}>Generating Payment Session…</h2>
                                    </div>
                                )}

                                {paymentState === 'details' && (
                                    <div className="payment-state-card">
                                        <div className="payment-header">
                                            <div className="payment-logo">💳</div>
                                            <h2>Payment Details</h2>
                                            <span className={`reg-badge ${registrationType === 'team' ? 'team-badge' : 'ind-badge'}`}>
                                                {registrationType === 'team' ? 'Team' : 'Individual'}
                                            </span>
                                        </div>
                                        <div className="payment-summary">
                                            <div className="summary-row">
                                                <span className="summary-label">Name</span>
                                                <span className="summary-value">{formData.teamName || formData.name}</span>
                                            </div>
                                            <div className="summary-row">
                                                <span className="summary-label">Email</span>
                                                <span className="summary-value">{formData.email}</span>
                                            </div>
                                        </div>
                                        <div className="amount-box">
                                            <div className="amount-label">Registration Fee</div>
                                            <div className="amount-value">
                                                <span id="pay-amount">₹{registrationType === 'team' ? teamAmount : individualAmount}.00</span>
                                            </div>
                                        </div>
                                        <button className="pay-btn" onClick={handlePayNow} disabled={isLoading}>
                                            {isLoading ? (
                                                <span className="pay-spinner"></span>
                                            ) : (
                                                `Pay ₹${registrationType === 'team' ? teamAmount : individualAmount} →`
                                            )}
                                        </button>
                                        <p className="secure-note">🔒 Secured by Zoho Payment Gateway</p>
                                        <button type="button" className="back-to-form-btn" onClick={() => setStep(2)}>← Back to form</button>
                                    </div>
                                )}

                                {paymentState === 'error' && (
                                    <div className="payment-state-card">
                                        <div style={{ fontSize: '3rem' }}>⚠️</div>
                                        <h2 style={{ color: '#ef4444', marginTop: '1rem' }}>Payment Link Failed</h2>
                                        <p style={{ color: '#64748b', margin: '0.75rem 0 1.5rem' }}>{errorMessage}</p>
                                        <button className="retry-btn" onClick={() => setStep(2)}>← Go Back & Retry</button>
                                    </div>
                                )}

                                {paymentState === 'success' && (
                                    <div className="payment-state-card">
                                        <div style={{ fontSize: '3rem' }}>✅</div>
                                        <h2 style={{ color: '#22c55e', marginTop: '1rem' }}>Payment Successful!</h2>
                                        <p>Redirecting you...</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="tab-content active">
                        <div className="lookup-section">
                            <h2>Find Your Registration</h2>
                            <p>Enter your unique code to view your details.</p>
                            <div className="lookup-form">
                                <input
                                    type="text"
                                    className="lookup-input"
                                    value={lookupCode}
                                    onChange={(e) => setLookupCode(e.target.value.toUpperCase())}
                                />
                                <button className="submit-btn" style={{ width: 'auto' }} onClick={() => setLookupError(true)}>Search</button>
                            </div>
                            {lookupError && <p style={{ color: '#ef4444', marginTop: '1rem' }}>Invalid Code. Please check and try again.</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegistrationModal;
