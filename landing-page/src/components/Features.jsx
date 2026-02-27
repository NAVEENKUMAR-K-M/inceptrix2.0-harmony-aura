import React from 'react';
import { Heart, Cpu, Shield, Activity, BarChart3, Radio } from 'lucide-react';

const features = [
    {
        icon: Heart,
        title: 'Real-Time Biometrics',
        description: 'Continuous heart rate, body temperature, and fatigue tracking through lightweight wearable sensors.',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
    },
    {
        icon: Cpu,
        title: 'Edge AI Intelligence',
        description: 'CIS and PdM calculations happen on-device at the ESP32-S3 — sub-millisecond safety decisions without cloud dependency.',
        color: 'text-indigo-400',
        bgColor: 'bg-indigo-500/10',
        borderColor: 'border-indigo-500/20',
    },
    {
        icon: Shield,
        title: 'E2EE Security',
        description: 'AES-256-GCM encryption from sensor to dashboard. Firebase never sees plaintext biometric data.',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/20',
    },
    {
        icon: Activity,
        title: 'Predictive Maintenance',
        description: 'Multi-factor machine health scoring predicts failures days before they happen, preventing catastrophic downtime.',
        color: 'text-amber',
        bgColor: 'bg-amber/10',
        borderColor: 'border-amber/20',
    },
    {
        icon: BarChart3,
        title: 'Live Analytics',
        description: 'Real-time dashboards with sparklines, CIS gauges, and PdM health bars — built for supervisors who need answers fast.',
        color: 'text-cyan',
        bgColor: 'bg-cyan/10',
        borderColor: 'border-cyan/20',
    },
    {
        icon: Radio,
        title: 'IoT Wearable Ecosystem',
        description: 'Purpose-built ESP32 wearables with DHT22, pulse sensor, gas detector, and gyroscope — all in one compact module.',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20',
    },
];

const Features = () => {
    return (
        <section id="features" className="py-24 lg:py-32 relative">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <div className="text-xs font-mono text-primary uppercase tracking-[0.2em] mb-4">
                        Capabilities
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
                        Everything You Need to
                        <br />
                        <span className="gradient-text">Protect Your Workforce</span>
                    </h2>
                    <p className="text-text-secondary">
                        From physical sensors on the floor to predictive algorithms in the cloud —
                        Harmony Aura covers every layer of industrial safety.
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map(f => (
                        <div key={f.title}
                            className="glass rounded-2xl p-7 hover:bg-white/[0.04] transition-all duration-300 group cursor-default">
                            <div className={`w-12 h-12 rounded-xl ${f.bgColor} border ${f.borderColor}
                                            flex items-center justify-center mb-5
                                            group-hover:scale-110 transition-transform duration-300`}>
                                <f.icon size={22} className={f.color} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">{f.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
