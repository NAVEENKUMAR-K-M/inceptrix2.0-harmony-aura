import React from 'react';
import { Check, X, Zap, Star, Crown, ArrowRight } from 'lucide-react';

const plans = [
    {
        name: 'Aura Basic', subtitle: 'Digital Visibility', price: 99, icon: Zap,
        iconColor: '#06b6d4', popular: false,
        desc: 'Perfect for small sites beginning their digital safety transformation.',
        features: [
            { t: 'Real-time Dashboard Access', ok: true },
            { t: 'Standard CIS Scoring', ok: true },
            { t: '30-Day Data Retention', ok: true },
            { t: 'Email Threshold Alerts', ok: true },
            { t: 'Up to 25 Workers', ok: true },
            { t: 'IoT Hardware Support', ok: false },
            { t: 'Edge Intelligence (S3)', ok: false },
            { t: 'E2EE Encryption', ok: false },
            { t: 'Custom API Access', ok: false },
        ],
    },
    {
        name: 'Aura Professional', subtitle: 'Active Shield', price: 499, icon: Star,
        iconColor: '#10b981', popular: true,
        desc: 'For factories deploying IoT wearables and active hazard mitigation.',
        features: [
            { t: 'Real-time Dashboard Access', ok: true },
            { t: 'Advanced CIS Scoring', ok: true },
            { t: '6-Month Data Retention', ok: true },
            { t: 'SMS & Push Critical Alerts', ok: true },
            { t: 'Up to 100 Workers', ok: true },
            { t: 'Full IoT Wearable Support', ok: true },
            { t: 'Edge Intelligence (S3)', ok: true },
            { t: 'E2EE Encryption', ok: false },
            { t: 'Custom API Access', ok: false },
        ],
    },
    {
        name: 'Aura Elite', subtitle: 'Edge Intelligence', price: 1999, icon: Crown,
        iconColor: '#f59e0b', popular: false,
        desc: 'Enterprise-grade for multi-site plants requiring maximum security.',
        features: [
            { t: 'Real-time Dashboard Access', ok: true },
            { t: 'AI-Powered CIS + Analytics', ok: true },
            { t: 'Unlimited Data Retention', ok: true },
            { t: 'Priority 24/7 Escalation', ok: true },
            { t: 'Unlimited Workers & Sites', ok: true },
            { t: 'Full IoT Wearable Support', ok: true },
            { t: 'Edge Intelligence (S3)', ok: true },
            { t: 'AES-256-GCM E2EE', ok: true },
            { t: 'Custom API + ERP Integration', ok: true },
        ],
    },
];

const Pricing = () => (
    <section id="pricing" className="section">
        <div className="container" style={{ textAlign: 'center' }}>
            <div className="section-eyebrow" style={{ color: 'var(--amber)' }}>Pricing</div>
            <h2 className="section-title">Built for Every Scale</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
                From a single workshop to a global fleet operation. Choose the tier
                that matches your safety ambition.
            </p>

            <div className="pricing-grid">
                {plans.map(p => {
                    const Icon = p.icon;
                    return (
                        <div key={p.name} className={`pricing-card ${p.popular ? 'popular' : ''}`}>
                            {p.popular && <div className="pricing-popular-badge">Most Popular</div>}

                            <div className="pricing-header">
                                <div className="pricing-header-top">
                                    <div className="pricing-icon">
                                        <Icon size={20} color={p.iconColor} />
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <div className="pricing-name">{p.name}</div>
                                        <div className="pricing-subtitle">{p.subtitle}</div>
                                    </div>
                                </div>
                                <p className="pricing-desc" style={{ textAlign: 'left' }}>{p.desc}</p>
                                <div className="pricing-price" style={{ justifyContent: p.popular ? 'flex-start' : 'flex-start' }}>
                                    <span className="pricing-amount">${p.price}</span>
                                    <span className="pricing-period">/month/site</span>
                                </div>
                            </div>

                            <div className="pricing-features">
                                {p.features.map(f => (
                                    <div key={f.t} className={`pricing-feature ${!f.ok ? 'disabled' : ''}`}
                                        style={{ textAlign: 'left' }}>
                                        {f.ok
                                            ? <Check size={16} color="#10b981" style={{ flexShrink: 0 }} />
                                            : <X size={16} color="#475569" style={{ flexShrink: 0, opacity: 0.4 }} />}
                                        <span>{f.t}</span>
                                    </div>
                                ))}
                            </div>

                            <button className={`pricing-cta ${p.popular ? 'primary-cta' : 'secondary-cta'}`}>
                                Get Started <ArrowRight size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>

            <p className="pricing-note">
                All plans include a <span>14-day free trial</span>. No credit card required. Cancel anytime.
            </p>
        </div>
    </section>
);

export default Pricing;
