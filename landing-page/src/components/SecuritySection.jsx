import React from 'react';
import { Lock, ShieldCheck, Eye, Key, Fingerprint } from 'lucide-react';

const SecuritySection = () => (
    <section id="security" className="section">
        <div className="container">
            <div className="security-grid">
                <div>
                    <div className="section-eyebrow" style={{ color: 'var(--primary)' }}>Privacy by Design</div>
                    <h2 className="section-title">
                        Zero-Knowledge<br /><span className="gradient-text">Security Architecture</span>
                    </h2>
                    <p className="section-subtitle">
                        Harmony Aura implements true End-to-End Encryption for all IoT communications.
                        Biometric data is encrypted at the sensor using AES-256-GCM and only decrypted
                        in the supervisor's browser. Not even our servers can read the data.
                    </p>

                    <div className="security-features">
                        {[
                            { icon: Key, text: 'AES-256-GCM with 128-bit authentication tags' },
                            { icon: Fingerprint, text: 'Unique 12-byte IV from hardware RNG per packet' },
                            { icon: ShieldCheck, text: 'Replay protection via monotonic packet counters' },
                            { icon: Eye, text: 'Tamper detection with real-time dashboard alerts' },
                        ].map(item => (
                            <div key={item.text} className="security-feature">
                                <div className="security-feature-icon">
                                    <item.icon size={16} color="#10b981" />
                                </div>
                                <span>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="security-visual">
                    <div className="security-visual-label">Encryption Pipeline</div>

                    <div className="code-block code-block-bad">
                        <div className="code-block-label" style={{ color: '#ef4444' }}>❌ Without Harmony Aura</div>
                        <code style={{ color: '#fca5a5' }}>
                            {'{ "heart_rate": 142, "temp": 38.7, "gas": 850 }'}
                        </code>
                        <div className="code-block-note" style={{ color: 'rgba(239,68,68,0.5)' }}>
                            → Plaintext visible to anyone on the network
                        </div>
                    </div>

                    <div className="encrypt-arrow">
                        <Lock size={16} color="#10b981" />
                        <span>AES-256-GCM</span>
                    </div>

                    <div className="code-block code-block-good">
                        <div className="code-block-label" style={{ color: '#10b981' }}>✅ With Harmony Aura E2EE</div>
                        <code style={{ color: 'rgba(16,185,129,0.7)' }}>
                            {'{ "s": { "v": 1, "iv": "x7Km9...", "ct": "aB3xQ...", "at": "Zp8w..." } }'}
                        </code>
                        <div className="code-block-note" style={{ color: 'rgba(16,185,129,0.4)' }}>
                            → Firebase sees only encrypted gibberish
                        </div>
                    </div>

                    <div className="compliance-badges">
                        {['OSHA', 'ISO 27001', 'GDPR', 'SOC 2'].map(b => (
                            <span key={b} className="compliance-badge">{b}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default SecuritySection;
