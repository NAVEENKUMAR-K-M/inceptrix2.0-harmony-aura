import React, { useState, useEffect } from 'react';
import { Shield, Menu, X } from 'lucide-react';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const links = [
        { label: 'Features', href: '#features' },
        { label: 'How It Works', href: '#dataflow' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Security', href: '#security' },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
            ${scrolled ? 'glass shadow-lg' : 'bg-transparent'}`}>
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <a href="#" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center
                                        group-hover:bg-primary/20 transition-colors">
                            <Shield size={20} className="text-primary" />
                        </div>
                        <div>
                            <span className="text-xl font-bold text-white tracking-tight">
                                Harmony<span className="text-primary">Aura</span>
                            </span>
                            <div className="text-[8px] font-mono text-text-dim uppercase tracking-[0.2em] -mt-0.5">
                                Industrial Safety OS
                            </div>
                        </div>
                    </a>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8">
                        {links.map(l => (
                            <a key={l.label} href={l.href}
                                className="text-sm text-text-secondary hover:text-white transition-colors font-medium">
                                {l.label}
                            </a>
                        ))}
                        <a href="#pricing"
                            className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl
                                      hover:bg-primary-dim transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                            Get Started
                        </a>
                    </div>

                    {/* Mobile Toggle */}
                    <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="md:hidden pb-6 space-y-3">
                        {links.map(l => (
                            <a key={l.label} href={l.href}
                                onClick={() => setMobileOpen(false)}
                                className="block text-text-secondary hover:text-white py-2 text-sm font-medium">
                                {l.label}
                            </a>
                        ))}
                        <a href="#pricing"
                            className="block w-full text-center px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl mt-4">
                            Get Started
                        </a>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
