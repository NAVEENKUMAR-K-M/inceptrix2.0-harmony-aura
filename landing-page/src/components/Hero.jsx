import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, Shield, Cpu, Radio } from 'lucide-react';

const Hero = () => {
    const heroRef = useRef(null);
    const counterRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Title stagger
            gsap.from('.hero-line', {
                y: 60, opacity: 0, duration: 0.8,
                stagger: 0.15, ease: 'power3.out', delay: 0.3,
            });

            // Stats counter
            gsap.from('.stat-item', {
                y: 30, opacity: 0, duration: 0.6,
                stagger: 0.1, ease: 'power2.out', delay: 1.0,
            });

            // CTA button
            gsap.from('.hero-cta', {
                y: 20, opacity: 0, duration: 0.5,
                ease: 'power2.out', delay: 1.4,
            });
        }, heroRef);

        return () => ctx.revert();
    }, []);

    const stats = [
        { value: '73%', label: 'Accident Reduction', color: 'text-primary' },
        { value: '<1ms', label: 'Edge Response Time', color: 'text-cyan' },
        { value: 'AES-256', label: 'Military-Grade E2EE', color: 'text-amber' },
    ];

    return (
        <section ref={heroRef} className="relative min-h-screen flex items-center pt-20 grid-bg overflow-hidden">
            {/* Background glow */}
            <div className="hero-glow top-1/4 left-1/4" />
            <div className="hero-glow bottom-0 right-0" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)' }} />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32 w-full">
                <div className="max-w-4xl">
                    {/* Eyebrow */}
                    <div className="hero-line flex items-center gap-3 mb-8">
                        <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-semibold uppercase tracking-wider">
                            Next-Gen Industrial Safety
                        </div>
                    </div>

                    {/* Headline */}
                    <h1 className="hero-line text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
                        Predict Hazards.
                        <br />
                        <span className="gradient-text">Protect Workers.</span>
                        <br />
                        Prevent Downtime.
                    </h1>

                    {/* Subtitle */}
                    <p className="hero-line text-lg md:text-xl text-text-secondary max-w-2xl mb-10 leading-relaxed">
                        Harmony Aura is an AI-powered industrial safety ecosystem that combines
                        wearable IoT biometrics, edge-computed intelligence, and military-grade
                        encryption to keep your workforce safe — before accidents happen.
                    </p>

                    {/* CTAs */}
                    <div className="hero-cta flex flex-wrap gap-4 mb-16">
                        <a href="#pricing"
                            className="group inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-2xl
                                      hover:bg-primary-dim transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.2)]
                                      hover:shadow-[0_0_50px_rgba(16,185,129,0.3)] pulse-glow">
                            Start Free Trial
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </a>
                        <a href="#dataflow"
                            className="inline-flex items-center gap-2 px-8 py-4 glass text-white font-bold rounded-2xl
                                      hover:bg-white/10 transition-all duration-300">
                            See How It Works
                        </a>
                    </div>

                    {/* Stats Row */}
                    <div ref={counterRef} className="flex flex-wrap gap-8 lg:gap-12">
                        {stats.map(s => (
                            <div key={s.label} className="stat-item">
                                <div className={`text-3xl lg:text-4xl font-extrabold font-mono ${s.color}`}>
                                    {s.value}
                                </div>
                                <div className="text-xs text-text-dim font-medium uppercase tracking-wider mt-1">
                                    {s.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Floating hardware icons (right side, decorative) */}
                <div className="hidden lg:block absolute right-16 top-1/3 space-y-8 opacity-20">
                    <div className="animate-float">
                        <Radio size={40} className="text-cyan" />
                    </div>
                    <div className="animate-float" style={{ animationDelay: '1s' }}>
                        <Shield size={48} className="text-primary" />
                    </div>
                    <div className="animate-float" style={{ animationDelay: '2s' }}>
                        <Cpu size={36} className="text-amber" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
