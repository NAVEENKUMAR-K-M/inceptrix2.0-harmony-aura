import React from 'react';
import { Heart, Cpu, Shield, Activity, BarChart3, Radio } from 'lucide-react';

const features = [
    { icon: Heart, title: 'Real-Time Biometrics', desc: 'Continuous heart rate, body temperature, and fatigue tracking through lightweight wearable sensors.', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
    { icon: Cpu, title: 'Edge AI Intelligence', desc: 'CIS and PdM calculations happen on-device at the ESP32-S3 — sub-millisecond safety decisions without cloud dependency.', color: '#818cf8', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.2)' },
    { icon: Shield, title: 'E2EE Security', desc: 'AES-256-GCM encryption from sensor to dashboard. Firebase never sees plaintext biometric data.', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
    { icon: Activity, title: 'Predictive Maintenance', desc: 'Multi-factor machine health scoring predicts failures days before they happen, preventing catastrophic downtime.', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
    { icon: BarChart3, title: 'Live Analytics', desc: 'Real-time dashboards with sparklines, CIS gauges, and PdM health bars — built for supervisors who need answers fast.', color: '#06b6d4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)' },
    { icon: Radio, title: 'IoT Wearable Ecosystem', desc: 'Purpose-built ESP32 wearables with DHT22, pulse sensor, gas detector, and gyroscope — all in one compact module.', color: '#a855f7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.2)' },
];

const Features = () => (
    <section id="features" className="section">
        <div className="container" style={{ textAlign: 'center' }}>
            <div className="section-eyebrow" style={{ color: 'var(--primary)' }}>Capabilities</div>
            <h2 className="section-title" style={{ margin: '0 auto 16px' }}>
                Everything You Need to<br /><span className="gradient-text">Protect Your Workforce</span>
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
                From physical sensors on the floor to predictive algorithms in the cloud —
                Harmony Aura covers every layer of industrial safety.
            </p>

            <div className="features-grid">
                {features.map(f => (
                    <div key={f.title} className="feature-card">
                        <div className="feature-icon" style={{ background: f.bg, border: `1px solid ${f.border}` }}>
                            <f.icon size={22} color={f.color} />
                        </div>
                        <h3>{f.title}</h3>
                        <p>{f.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default Features;
