import React from 'react';
import { Radio, Lock, Server, Cpu, BarChart3, ChevronRight } from 'lucide-react';

const steps = [
    { icon: Radio, label: 'ESP32 Wearable', sub: 'Reads 5 sensors', color: '#06b6d4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)' },
    { icon: Lock, label: 'AES-256 Encrypt', sub: 'On-device E2EE', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
    { icon: Server, label: 'Firebase RTDB', sub: 'Ciphertext only', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
    { icon: Cpu, label: 'ESP32-S3 Edge', sub: 'CIS + PdM on-device', color: '#818cf8', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.2)' },
    { icon: BarChart3, label: 'Web Dashboard', sub: 'Browser decrypts', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
];

const DataFlow = () => (
    <section id="dataflow" className="section">
        <div className="container" style={{ textAlign: 'center' }}>
            <div className="section-eyebrow" style={{ color: 'var(--cyan)' }}>Architecture</div>
            <h2 className="section-title">How Harmony Aura Works</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
                End-to-end encrypted data flows from physical sensors through edge AI computation
                to your dashboard — Firebase never sees plaintext.
            </p>

            <div className="flow-container">
                <div className="flow-steps">
                    {steps.map((s, i) => (
                        <React.Fragment key={s.label}>
                            <div className="flow-step">
                                <div className="flow-icon" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                                    <s.icon size={24} color={s.color} />
                                </div>
                                <div className="flow-step-label">{s.label}</div>
                                <div className="flow-step-sub">{s.sub}</div>
                            </div>
                            {i < steps.length - 1 && (
                                <div className="flow-arrow">
                                    <ChevronRight size={18} />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <div className="flow-footer">
                    <Lock size={14} color="#10b981" />
                    <span>AES-256-GCM Authenticated Encryption • Unique 12-byte IV per packet • Replay Protection via Packet Counter</span>
                </div>
            </div>
        </div>
    </section>
);

export default DataFlow;
