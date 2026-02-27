import React from 'react';
import { Lock, ShieldCheck, Eye, Key, Server, Fingerprint } from 'lucide-react';

const SecuritySection = () => {
    return (
        <section id="security" className="py-24 lg:py-32 relative">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Text */}
                    <div>
                        <div className="text-xs font-mono text-primary uppercase tracking-[0.2em] mb-4">
                            Privacy by Design
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-6">
                            Zero-Knowledge
                            <br />
                            <span className="gradient-text">Security Architecture</span>
                        </h2>
                        <p className="text-text-secondary mb-8 leading-relaxed">
                            Harmony Aura implements true End-to-End Encryption for all IoT communications.
                            Biometric data is encrypted at the sensor using AES-256-GCM and only decrypted
                            in the supervisor's browser. Not even our servers can read the data.
                        </p>

                        <div className="space-y-4">
                            {[
                                { icon: Key, text: 'AES-256-GCM with 128-bit authentication tags' },
                                { icon: Fingerprint, text: 'Unique 12-byte IV from hardware RNG per packet' },
                                { icon: ShieldCheck, text: 'Replay protection via monotonic packet counters' },
                                { icon: Eye, text: 'Tamper detection with real-time dashboard alerts' },
                            ].map(item => (
                                <div key={item.text} className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20
                                                    flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <item.icon size={16} className="text-primary" />
                                    </div>
                                    <span className="text-sm text-text-secondary">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Visual */}
                    <div className="glass rounded-3xl p-8 lg:p-10">
                        <div className="text-xs font-mono text-text-dim uppercase tracking-wider mb-6">
                            Encryption Pipeline
                        </div>

                        {/* Visual representation */}
                        <div className="space-y-6">
                            {/* Plaintext */}
                            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                                <div className="text-[10px] font-mono text-red-400 uppercase tracking-wider mb-2">
                                    ❌ Without Harmony Aura
                                </div>
                                <code className="text-xs text-red-300 font-mono block">
                                    {`{ "heart_rate": 142, "temp": 38.7, "gas": 850 }`}
                                </code>
                                <div className="text-[10px] text-red-400/60 mt-2">
                                    → Plaintext visible to anyone on the network
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="flex justify-center">
                                <div className="flex flex-col items-center gap-1">
                                    <Lock size={16} className="text-primary" />
                                    <div className="text-[9px] font-mono text-primary uppercase tracking-wider">
                                        AES-256-GCM
                                    </div>
                                </div>
                            </div>

                            {/* Ciphertext */}
                            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                                <div className="text-[10px] font-mono text-primary uppercase tracking-wider mb-2">
                                    ✅ With Harmony Aura E2EE
                                </div>
                                <code className="text-xs text-primary/80 font-mono block break-all">
                                    {`{ "s": { "v": 1, "iv": "x7Km9...", "ct": "aB3xQ...", "at": "Zp8w..." } }`}
                                </code>
                                <div className="text-[10px] text-primary/40 mt-2">
                                    → Firebase sees only encrypted gibberish
                                </div>
                            </div>
                        </div>

                        {/* Compliance Badges */}
                        <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap gap-3">
                            {['OSHA', 'ISO 27001', 'GDPR', 'SOC 2'].map(badge => (
                                <span key={badge}
                                    className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08]
                                                 text-[10px] font-mono text-text-dim uppercase tracking-wider">
                                    {badge}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SecuritySection;
