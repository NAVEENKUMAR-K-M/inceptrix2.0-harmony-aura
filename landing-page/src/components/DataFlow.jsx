import React from 'react';
import { Radio, Lock, Server, Cpu, BarChart3, ChevronRight } from 'lucide-react';

const steps = [
    {
        icon: Radio,
        label: 'ESP32 Wearable',
        sublabel: 'Reads 5 sensors',
        color: 'text-cyan',
        bgColor: 'bg-cyan/10',
        borderColor: 'border-cyan/30',
    },
    {
        icon: Lock,
        label: 'AES-256 Encrypt',
        sublabel: 'On-device E2EE',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/30',
    },
    {
        icon: Server,
        label: 'Firebase RTDB',
        sublabel: 'Ciphertext only',
        color: 'text-amber',
        bgColor: 'bg-amber/10',
        borderColor: 'border-amber/30',
    },
    {
        icon: Cpu,
        label: 'ESP32-S3 Edge',
        sublabel: 'CIS + PdM on-device',
        color: 'text-indigo-400',
        bgColor: 'bg-indigo-500/10',
        borderColor: 'border-indigo-500/30',
    },
    {
        icon: BarChart3,
        label: 'Web Dashboard',
        sublabel: 'Browser decrypts',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/30',
    },
];

const DataFlow = () => {
    return (
        <section id="dataflow" className="py-24 lg:py-32 relative">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <div className="text-xs font-mono text-cyan uppercase tracking-[0.2em] mb-4">
                        Architecture
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
                        How Harmony Aura Works
                    </h2>
                    <p className="text-text-secondary">
                        End-to-end encrypted data flows from physical sensors through edge AI
                        computation to your dashboard — Firebase never sees plaintext.
                    </p>
                </div>

                {/* Flow Diagram */}
                <div className="glass rounded-3xl p-8 lg:p-12">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        {steps.map((step, i) => (
                            <React.Fragment key={step.label}>
                                <div className="flex flex-col items-center text-center group cursor-default">
                                    <div className={`w-16 h-16 rounded-2xl ${step.bgColor} border ${step.borderColor}
                                                    flex items-center justify-center mb-3
                                                    group-hover:scale-110 transition-transform duration-300`}>
                                        <step.icon size={26} className={step.color} />
                                    </div>
                                    <span className="text-sm font-bold text-white">{step.label}</span>
                                    <span className="text-[11px] text-text-dim font-mono mt-0.5">{step.sublabel}</span>
                                </div>
                                {i < steps.length - 1 && (
                                    <div className="hidden lg:flex items-center gap-1">
                                        <div className="w-8 h-px bg-gradient-to-r from-white/10 to-white/20" />
                                        <ChevronRight size={14} className="text-white/20" />
                                        <div className="w-8 h-px bg-gradient-to-r from-white/20 to-white/10" />
                                    </div>
                                )}
                                {i < steps.length - 1 && (
                                    <div className="lg:hidden flex flex-col items-center gap-1">
                                        <div className="w-px h-6 bg-gradient-to-b from-white/10 to-white/20" />
                                        <ChevronRight size={14} className="text-white/20 rotate-90" />
                                        <div className="w-px h-6 bg-gradient-to-b from-white/20 to-white/10" />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Security note */}
                    <div className="mt-10 pt-6 border-t border-white/[0.06] flex items-center justify-center gap-3">
                        <Lock size={14} className="text-primary" />
                        <span className="text-xs text-text-dim font-mono">
                            AES-256-GCM Authenticated Encryption • Unique 12-byte IV per packet • Replay Protection via Packet Counter
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DataFlow;
