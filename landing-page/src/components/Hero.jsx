import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import SplitType from 'split-type';
import { MagneticButton } from './ui/Button';

const Hero = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const text = new SplitType('.split-heading', { types: 'lines, words, chars' });

        const ctx = gsap.context(() => {
            gsap.fromTo('.ambient-glow',
                { scale: 0.8, opacity: 0 },
                { scale: 1, opacity: 0.3, duration: 2, ease: 'power2.out' }
            );

            gsap.from(text.chars, {
                y: 100,
                opacity: 0,
                rotationX: -90,
                stagger: 0.02,
                duration: 0.8,
                ease: 'power3.out',
                transformOrigin: '50% 50% -50',
            });

            gsap.from('.fade-up-element', {
                y: 40,
                opacity: 0,
                stagger: 0.2,
                duration: 1,
                ease: 'power3.out',
                delay: 0.6,
            });

            // Advanced Parallax Effect
            const handleMouseMove = (e) => {
                const x = (e.clientX / window.innerWidth - 0.5) * 40;
                const y = (e.clientY / window.innerHeight - 0.5) * 40;

                gsap.to('.hero-orb-1', { x: x, y: y, duration: 1, ease: 'power2.out' });
                gsap.to('.hero-orb-2', { x: -x * 1.5, y: -y * 1.5, duration: 1.5, ease: 'power2.out' });
            };

            window.addEventListener('mousemove', handleMouseMove);
            return () => window.removeEventListener('mousemove', handleMouseMove);

        }, containerRef);

        return () => {
            ctx.revert();
            text.revert();
        };
    }, []);

    return (
        <section ref={containerRef} style={{
            position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '100vh', paddingTop: 80, overflow: 'hidden',
        }}>
            <div className="grid-overlay" />

            {/* Ambient Glow Orbs */}
            <div className="ambient-glow hero-orb-1" style={{ background: '#10B981', top: '20%', left: '15%', width: 600, height: 600, opacity: 0 }} />
            <div className="ambient-glow hero-orb-2" style={{ background: '#06B6D4', bottom: '10%', right: '10%', width: 500, height: 500, opacity: 0 }} />

            <div className="container" style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: '100%', justifyContent: 'center' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    {/* Badge */}
                    <div className="fade-up-element badge" style={{ marginBottom: 32 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                        SYSTEM ONLINE • LATENCY &lt;1ms
                    </div>

                    {/* Headline */}
                    <h1 className="heading-xl split-heading" style={{ marginBottom: 24, maxWidth: 1000, perspective: 1000, textWrap: 'balance' }}>
                        Industrial Safety, <br />
                        <span className="gradient-text-primary">Engineered for the Edge.</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="subtitle fade-up-element" style={{ marginBottom: 48, maxWidth: 640, textWrap: 'balance' }}>
                        Predict hazards before they happen. Harmony Aura combines wearable AI biometrics,
                        hardware-accelerated edge computing, and zero-knowledge E2EE into a single impenetrable ecosystem.
                    </p>

                    {/* CTAs */}
                    <div className="fade-up-element" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', marginBottom: 64 }}>
                        <MagneticButton primary={true}>Deploy Harmony Aura</MagneticButton>
                        <MagneticButton primary={false}>View Architecture</MagneticButton>
                    </div>

                    {/* Stats - Now grouped securely */}
                    <div className="fade-up-element" style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', width: '100%', maxWidth: 800,
                        borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 40
                    }}>
                        {[
                            { value: '73%', label: 'Accident Reduction', color: '#10B981' },
                            { value: '<1ms', label: 'Edge Response', color: '#06B6D4' },
                            { value: 'AES-256', label: 'Military-Grade E2EE', color: '#F59E0B' },
                        ].map(s => (
                            <div key={s.label} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, fontFamily: 'var(--font-mono)', color: s.color, letterSpacing: '-0.02em' }}>
                                    {s.value}
                                </div>
                                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#475569', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 8 }}>
                                    {s.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scroll Indicator - Bottom Anchored */}
                <div className="fade-up-element" style={{
                    paddingTop: 48, paddingBottom: 24, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 12, fontSize: 10, fontFamily: 'var(--font-mono)',
                    color: '#475569', textTransform: 'uppercase', letterSpacing: '0.2em',
                }}>
                    <span className="shrink-anim" style={{ display: 'block', width: 1, height: 48, background: 'linear-gradient(to bottom, transparent, #10B981, transparent)' }} />
                    Scroll to explore
                </div>
            </div>
        </section>
    );
};

export default Hero;
