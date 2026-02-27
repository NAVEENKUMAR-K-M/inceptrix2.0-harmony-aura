import React from 'react';
import { Shield, ArrowRight, Github, Linkedin, Twitter } from 'lucide-react';
import { MagneticButton } from './ui/Button';

const Footer = () => (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'var(--bg-void)', paddingTop: 80, paddingBottom: 40 }}>
        <div className="container">
            {/* CTA Banner */}
            <div className="glass-panel" style={{
                marginBottom: 80, padding: '64px 48px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', textAlign: 'center', gap: 32,
                borderColor: 'rgba(16,185,129,0.15)',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.03) 0%, rgba(6,182,212,0.03) 100%)',
            }}>
                <h2 className="heading-md" style={{ color: '#fff' }}>Ready to secure the edge?</h2>
                <p style={{ color: '#94A3B8', maxWidth: 500, fontSize: 15 }}>
                    Deploy the Harmony Aura ecosystem in minutes. Hardware ships worldwide.
                </p>
                <MagneticButton primary={true}>
                    Request Access <ArrowRight size={16} />
                </MagneticButton>
            </div>

            {/* Links Grid */}
            <div style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
                gap: 40, marginBottom: 48,
            }}>
                {/* Brand */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Shield size={18} color="#10B981" />
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 800 }}>
                            Harmony<span style={{ color: '#10B981' }}>Aura</span>
                        </span>
                    </div>
                    <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, maxWidth: 280 }}>
                        The only industrial safety platform combining zero-knowledge E2EE with edge-computed hazard prediction.
                    </p>
                </div>

                {/* Columns */}
                {[
                    { title: 'Platform', links: ['Edge Engine', 'IoT Hardware', 'Dashboard UI', 'Security Docs'] },
                    { title: 'Company', links: ['About', 'Customers', 'Careers', 'Contact'] },
                    { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'SOC 2 Report', 'GDPR'] },
                ].map(col => (
                    <div key={col.title}>
                        <h4 style={{
                            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: '#475569',
                            textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 20,
                        }}>{col.title}</h4>
                        {col.links.map(l => (
                            <a key={l} href="#" style={{
                                display: 'block', fontSize: 13, color: '#94A3B8', marginBottom: 12,
                                transition: 'color 0.3s',
                            }}
                                onMouseEnter={e => e.target.style.color = '#fff'}
                                onMouseLeave={e => e.target.style.color = '#94A3B8'}
                            >{l}</a>
                        ))}
                    </div>
                ))}
            </div>

            {/* Bottom Bar */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.04)', flexWrap: 'wrap', gap: 16,
            }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#475569' }}>
                    © 2026 Harmony Aura. Engineered by Team OverClocked.
                </span>
                <div style={{ display: 'flex', gap: 20 }}>
                    {[
                        { icon: Twitter, label: 'Twitter' },
                        { icon: Github, label: 'GitHub' },
                        { icon: Linkedin, label: 'LinkedIn' },
                    ].map(s => (
                        <a key={s.label} href="#" style={{ color: '#475569', transition: 'color 0.3s' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                            onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                        >
                            <s.icon size={18} />
                        </a>
                    ))}
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;
