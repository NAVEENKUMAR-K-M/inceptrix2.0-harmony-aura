import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { Lock, Radio, Cpu, Network, ShieldCheck, ChevronRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const nodes = [
    { icon: Radio, label: 'Sensor Data', sub: 'Reads 5 sensors', color: '#06B6D4' },
    { icon: Lock, label: 'AES-256-GCM', sub: 'On-device encrypt', color: '#10B981' },
    { icon: Network, label: 'Encrypted Transit', sub: 'Ciphertext only', color: '#F59E0B' },
    { icon: Cpu, label: 'Edge Compute', sub: 'CIS + PdM on-device', color: '#818CF8' },
    { icon: ShieldCheck, label: 'Secure Dashboard', sub: 'Browser decrypts', color: '#10B981' },
];

const DataFlow = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const text = new SplitType('.dataflow-heading', { types: 'words, chars' });

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

            gsap.from('.flow-node', {
                scrollTrigger: { trigger: containerRef.current, start: 'top 65%' },
                y: 40,
                opacity: 0,
                scale: 0.9,
                stagger: 0.15,
                duration: 0.8,
                ease: 'back.out(1.5)',
            });

            // Node Continuous Pulse Pulse
            gsap.to('.node-icon-bg', {
                scale: 1.05,
                boxShadow: '0 0 40px rgba(16,185,129,0.25)',
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                stagger: 0.2
            });

        }, containerRef);
        return () => {
            ctx.revert();
            text.revert();
        }
    }, []);

    return (
        <section id="architecture" className="section" style={{
            background: 'var(--bg-surface)',
            borderTop: '1px solid rgba(255,255,255,0.04)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
            <div className="container" ref={containerRef}>
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 64 }}>
                    <div className="eyebrow" style={{ color: 'var(--cyan)', justifyContent: 'center' }}>
                        Zero-Knowledge Pipeline
                    </div>
                    <h2 className="heading-lg dataflow-heading" style={{ marginBottom: 20, maxWidth: 700, perspective: 1000 }}>
                        Military-Grade Encryption, <br />
                        <span style={{ color: '#fff' }}>Invisible to the User.</span>
                    </h2>
                    <p className="subtitle" style={{ maxWidth: 600 }}>
                        Biometric telemetry is encrypted at the source using hardware RNGs.
                        It remains encrypted through transit and storage, only decipherable
                        by the supervisor's dashboard.
                    </p>
                </div>

                {/* Pipeline Container */}
                <div className="glass-panel" style={{ padding: '48px 32px', maxWidth: 1000, margin: '0 auto' }}>
                    {/* Flow Nodes */}
                    <div style={{
                        display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
                        alignItems: 'center', justifyContent: 'space-between', gap: 16,
                    }}>
                        {nodes.map((n, i) => (
                            <React.Fragment key={i}>
                                <div className="flow-node" style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: '1 0 120px',
                                }}>
                                    <div className="node-icon-bg" style={{
                                        width: 72, height: 72, borderRadius: 20,
                                        background: 'var(--bg-void)',
                                        border: `1px solid ${n.color}40`,
                                        boxShadow: `0 0 20px ${n.color}10`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        marginBottom: 14, transition: 'transform 0.3s, box-shadow 0.3s',
                                    }}>
                                        <n.icon size={28} color={n.color} />
                                    </div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{n.label}</div>
                                    <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#475569' }}>{n.sub}</div>
                                </div>

                                {i < nodes.length - 1 && (
                                    <div style={{ color: 'rgba(255,255,255,0.15)', flexShrink: 0 }}>
                                        <ChevronRight size={20} />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Footer Note */}
                    <div style={{
                        marginTop: 40, paddingTop: 24,
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    }}>
                        <Lock size={14} color="#10B981" />
                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#475569' }}>
                            AES-256-GCM • Unique 12-byte IV per packet • Hardware Root of Trust
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DataFlow;
