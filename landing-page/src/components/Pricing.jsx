import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { Check, X, Zap, Star, Crown, ArrowRight } from 'lucide-react';
import { MagneticButton } from './ui/Button';

gsap.registerPlugin(ScrollTrigger);

const plans = [
    {
        name: 'Starter', badge: 'Digital Baseline', price: '$99', period: '/mo/site',
        desc: 'Basic digital visibility for small workshops.', icon: Zap, color: '#06B6D4',
        features: ['Real-time Dashboard', 'Standard CIS Scoring', '30-Day Retention', 'Email Alerts', 'Up to 25 Workers'],
        disabled: ['IoT Hardware Support', 'Edge Intelligence', 'E2EE Encryption'],
    },
    {
        name: 'Professional', badge: 'Most Popular', price: '$499', period: '/mo/site',
        desc: 'Full hazard prediction for connected fleets.', icon: Star, color: '#10B981', popular: true,
        features: ['Advanced Dashboards', 'Advanced CIS + PdM', '6-Month Retention', 'SMS/Push Alerts', 'Up to 100 Workers', 'Full IoT Support', 'Edge Intelligence (S3)'],
        disabled: ['Zero-Knowledge E2EE'],
    },
    {
        name: 'Enterprise', badge: 'Maximum Security', price: 'Custom', period: '',
        desc: 'Military-grade security for global operations.', icon: Crown, color: '#F59E0B',
        features: ['All Pro Features', 'Unlimited Retention', 'Priority 24/7 Support', 'Zero-Knowledge E2EE', 'Custom Hardware Auth', 'API + ERP Integration', 'Unlimited Scale'],
        disabled: [],
    },
];

const Pricing = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const text = new SplitType('.pricing-heading', { types: 'words, chars' });

        const ctx = gsap.context(() => {
            gsap.from(text.chars, {
                scrollTrigger: { trigger: containerRef.current, start: 'top 75%' },
                y: 50,
                opacity: 0,
                rotationX: -90,
                stagger: 0.02,
                duration: 0.8,
                ease: 'power3.out',
                transformOrigin: '50% 50% -50',
            });

            gsap.from('.pricing-card', {
                scrollTrigger: { trigger: containerRef.current, start: 'top 60%' },
                y: 40,
                opacity: 0,
                stagger: 0.15,
                duration: 0.8,
                ease: 'power3.out',
            });

            // Shimmer effect for popular card
            gsap.to('.popular-shimmer', {
                boxShadow: '0 0 80px rgba(16,185,129,0.15)',
                borderColor: 'rgba(16,185,129,0.6)',
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
        }, containerRef);

        return () => {
            ctx.revert();
            text.revert();
        }
    }, []);

    return (
        <section id="pricing" className="section" style={{ background: 'var(--bg-void)' }}>
            <div className="container" ref={containerRef}>
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 64 }}>
                    <div className="eyebrow" style={{ color: 'var(--amber)', justifyContent: 'center' }}>Plans & Pricing</div>
                    <h2 className="heading-lg pricing-heading" style={{ marginBottom: 16, maxWidth: 1100, perspective: 1000 }}>
                        Scale your safety protocol <span style={{ color: '#fff' }}>without limits.</span>
                    </h2>
                </div>

                {/* Cards Grid */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 24, maxWidth: 1100, margin: '0 auto', alignItems: 'start',
                }}>
                    {plans.map((p, i) => (
                        <div key={i} className={`glass-panel pricing-card ${p.popular ? 'popular-shimmer' : ''}`}
                            onMouseEnter={(e) => {
                                gsap.to(e.currentTarget.querySelector('.card-icon'), { scale: 1.15, rotation: 5, duration: 0.3, ease: 'back.out(2)' });
                                gsap.to(e.currentTarget.querySelectorAll('.feature-item'), { x: 5, stagger: 0.05, duration: 0.3, ease: 'power2.out' });
                                if (p.popular) {
                                    gsap.to(e.currentTarget.querySelector('.popular-badge'), { y: -3, boxShadow: '0 8px 30px rgba(16,185,129,0.6)', duration: 0.3 });
                                }
                            }}
                            onMouseLeave={(e) => {
                                gsap.to(e.currentTarget.querySelector('.card-icon'), { scale: 1, rotation: 0, duration: 0.3, ease: 'power2.out' });
                                gsap.to(e.currentTarget.querySelectorAll('.feature-item'), { x: 0, stagger: 0.02, duration: 0.3, ease: 'power2.out' });
                                if (p.popular) {
                                    gsap.to(e.currentTarget.querySelector('.popular-badge'), { y: 0, boxShadow: '0 4px 20px rgba(16,185,129,0.4)', duration: 0.3 });
                                }
                            }}
                            style={{
                                padding: 36, display: 'flex', flexDirection: 'column', position: 'relative',
                                borderColor: p.popular ? 'rgba(16,185,129,0.35)' : undefined,
                                boxShadow: p.popular ? '0 0 60px rgba(16,185,129,0.08)' : undefined,
                                transform: p.popular ? 'scale(1.02)' : undefined,
                                transition: 'transform 0.4s, box-shadow 0.4s',
                                cursor: 'pointer'
                            }}>
                            {/* Popular Badge */}
                            {p.popular && (
                                <div className="popular-badge" style={{
                                    position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                                    padding: '6px 20px', borderRadius: 100, background: '#10B981', color: '#fff',
                                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                                    whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(16,185,129,0.4)',
                                    zIndex: 10
                                }}>
                                    {p.badge}
                                </div>
                            )}

                            {/* Header */}
                            <div style={{ marginBottom: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                                    <div className="card-icon" style={{
                                        width: 44, height: 44, borderRadius: 12,
                                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'box-shadow 0.3s'
                                    }}>
                                        <p.icon size={20} color={p.color} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{p.name}</div>
                                        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                                            {!p.popular && p.badge}
                                        </div>
                                    </div>
                                </div>
                                <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 16, lineHeight: 1.6, minHeight: 40 }}>{p.desc}</p>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                    <span style={{ fontSize: 40, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff' }}>{p.price}</span>
                                    <span style={{ fontSize: 13, color: '#475569' }}>{p.period}</span>
                                </div>
                            </div>

                            {/* Features */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
                                {p.features.map(f => (
                                    <div key={f} className="feature-item" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <Check size={16} color="#10B981" style={{ flexShrink: 0 }} />
                                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{f}</span>
                                    </div>
                                ))}
                                {p.disabled.map(d => (
                                    <div key={d} className="feature-item" style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: 0.35 }}>
                                        <X size={16} color="#475569" style={{ flexShrink: 0 }} />
                                        <span style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'line-through' }}>{d}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA */}
                            <MagneticButton
                                primary={p.popular}
                                className={!p.popular ? 'w-full' : 'w-full'}
                            >
                                {p.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                                <ArrowRight size={16} />
                            </MagneticButton>
                        </div>
                    ))}
                </div>

                <p style={{
                    textAlign: 'center', marginTop: 48, fontSize: 13, color: '#475569',
                }}>
                    All plans include a <span style={{ color: '#10B981', fontWeight: 600 }}>14-day free trial</span>. No credit card required. Cancel anytime.
                </p>
            </div>
        </section>
    );
};

export default Pricing;
