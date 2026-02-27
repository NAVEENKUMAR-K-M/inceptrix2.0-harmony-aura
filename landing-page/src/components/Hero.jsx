import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, Shield, Cpu, Radio } from 'lucide-react';

const Hero = () => {
    const ref = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.hero-anim', { y: 50, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out', delay: 0.2 });
        }, ref);
        return () => ctx.revert();
    }, []);

    return (
        <section className="hero grid-bg" ref={ref}>
            <div className="hero-glow hero-glow-1" />
            <div className="hero-glow hero-glow-2" />

            <div className="container" style={{ width: '100%' }}>
                <div className="hero-content">
                    <div className="hero-anim hero-badge">Next-Gen Industrial Safety</div>

                    <h1 className="hero-anim">
                        Predict Hazards.<br />
                        <span className="gradient-text">Protect Workers.</span><br />
                        Prevent Downtime.
                    </h1>

                    <p className="hero-anim hero-sub">
                        Harmony Aura is an AI-powered industrial safety ecosystem that combines
                        wearable IoT biometrics, edge-computed intelligence, and military-grade
                        encryption to keep your workforce safe — before accidents happen.
                    </p>

                    <div className="hero-anim hero-ctas">
                        <a href="#pricing" className="btn-primary animate-pulse-glow" style={{ padding: '14px 32px', borderRadius: '16px', fontSize: '15px' }}>
                            Start Free Trial <ArrowRight size={18} />
                        </a>
                        <a href="#dataflow" className="btn-secondary">
                            See How It Works
                        </a>
                    </div>

                    <div className="hero-anim hero-stats">
                        <div>
                            <div className="hero-stat-value" style={{ color: 'var(--primary)' }}>73%</div>
                            <div className="hero-stat-label">Accident Reduction</div>
                        </div>
                        <div>
                            <div className="hero-stat-value" style={{ color: 'var(--cyan)' }}>&lt;1ms</div>
                            <div className="hero-stat-label">Edge Response Time</div>
                        </div>
                        <div>
                            <div className="hero-stat-value" style={{ color: 'var(--amber)' }}>AES-256</div>
                            <div className="hero-stat-label">Military-Grade E2EE</div>
                        </div>
                    </div>
                </div>

                <div className="hero-floats">
                    <div className="animate-float"><Radio size={44} color="#06b6d4" /></div>
                    <div className="animate-float" style={{ animationDelay: '1.2s' }}><Shield size={52} color="#10b981" /></div>
                    <div className="animate-float" style={{ animationDelay: '2.4s' }}><Cpu size={40} color="#f59e0b" /></div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
