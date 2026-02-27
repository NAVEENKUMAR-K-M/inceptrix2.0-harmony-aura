import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Activity, Shield, Cpu, Zap, Wifi } from 'lucide-react';
import { TiltCard } from './ui/Card';

gsap.registerPlugin(ScrollTrigger);

const featuresList = [
    { title: 'Edge AI Intelligence', desc: 'CIS & PdM calculated on-device at sub-millisecond speeds. No cloud dependency for critical safety logic.', icon: Cpu, color: '#06B6D4', wide: true },
    { title: 'Zero-Knowledge E2EE', desc: 'AES-256-GCM encryption at the sensor level. Firebase stores only ciphertext.', icon: Shield, color: '#10B981' },
    { title: 'Real-Time Biometrics', desc: 'Continuous worker heart rate, fatigue level, and environmental quality tracking.', icon: Activity, color: '#EF4444' },
    { title: 'Robust IoT Mesh', desc: 'Low-latency continuous telemetry via ESP32-S3 custom hardware.', icon: Wifi, color: '#F59E0B' },
    { title: 'Predictive Maintenance', desc: 'Multi-factor machine health scoring prevents catastrophic mechanical failures.', icon: Zap, color: '#818CF8' },
];

const Features = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.bento-card', {
                scrollTrigger: { trigger: containerRef.current, start: 'top 75%' },
                y: 60,
                opacity: 0,
                stagger: 0.12,
                duration: 0.9,
                ease: 'power3.out',
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section id="features" className="section" style={{ background: 'var(--bg-void)' }}>
            <div className="container" ref={containerRef}>
                <div style={{ marginBottom: 64 }}>
                    <div className="eyebrow">Capabilities</div>
                    <h2 className="heading-lg" style={{ maxWidth: 700, marginBottom: 16 }}>
                        A comprehensive shield for <br />
                        <span style={{ color: '#fff' }}>modern industrial environments.</span>
                    </h2>
                </div>

                {/* Bento Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 20,
                }}>
                    {featuresList.map((f, i) => (
                        <TiltCard
                            key={i}
                            className="bento-card"
                            glowColor={`${f.color}25`}
                            style={f.wide ? { gridColumn: 'span 2' } : {}}
                        >
                            <div style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                                <div>
                                    <div style={{
                                        width: 56, height: 56, borderRadius: 16,
                                        background: `${f.color}12`, border: `1px solid ${f.color}30`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        marginBottom: 24,
                                    }}>
                                        <f.icon size={26} color={f.color} />
                                    </div>
                                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, color: '#fff', letterSpacing: '-0.01em' }}>{f.title}</h3>
                                    <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7 }}>{f.desc}</p>
                                </div>

                                {/* Decorative bar */}
                                <div style={{ marginTop: 32, height: 3, width: '100%', borderRadius: 4, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', borderRadius: 4,
                                        width: `${30 + i * 12}%`,
                                        background: f.color,
                                        boxShadow: `0 0 12px ${f.color}`,
                                    }} />
                                </div>
                            </div>
                        </TiltCard>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
