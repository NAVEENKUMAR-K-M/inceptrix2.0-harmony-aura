import React from 'react';
import { Shield, Github, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="border-t border-white/[0.06] py-16">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                                <Shield size={18} className="text-primary" />
                            </div>
                            <span className="text-lg font-bold text-white">
                                Harmony<span className="text-primary">Aura</span>
                            </span>
                        </div>
                        <p className="text-sm text-text-dim leading-relaxed">
                            AI-powered industrial safety.
                            Protecting workers through predictive
                            edge intelligence and wearable IoT.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="text-xs font-mono text-text-dim uppercase tracking-widest mb-4">Product</h4>
                        <div className="space-y-2.5">
                            {['Features', 'Pricing', 'Security', 'IoT Hardware', 'Mobile Apps'].map(l => (
                                <a key={l} href="#" className="block text-sm text-text-secondary hover:text-white transition-colors">
                                    {l}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-xs font-mono text-text-dim uppercase tracking-widest mb-4">Company</h4>
                        <div className="space-y-2.5">
                            {['About Us', 'Careers', 'Contact', 'Press Kit', 'Partners'].map(l => (
                                <a key={l} href="#" className="block text-sm text-text-secondary hover:text-white transition-colors">
                                    {l}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-xs font-mono text-text-dim uppercase tracking-widest mb-4">Legal</h4>
                        <div className="space-y-2.5">
                            {['Privacy Policy', 'Terms of Service', 'Data Processing', 'Cookie Policy', 'GDPR Compliance'].map(l => (
                                <a key={l} href="#" className="block text-sm text-text-secondary hover:text-white transition-colors">
                                    {l}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
                    <span className="text-xs text-text-dim font-mono">
                        © 2026 Harmony Aura. All rights reserved. Built by Team OverClocked.
                    </span>
                    <div className="flex items-center gap-4">
                        {[Github, Linkedin, Twitter].map((Icon, i) => (
                            <a key={i} href="#" className="text-text-dim hover:text-white transition-colors">
                                <Icon size={18} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
