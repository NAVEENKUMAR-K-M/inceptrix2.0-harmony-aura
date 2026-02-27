import React, { useState, useEffect } from 'react';
import { Shield, Menu, X } from 'lucide-react';
import { MagneticButton } from './ui/Button';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', fn);
        return () => window.removeEventListener('scroll', fn);
    }, []);

    const links = [
        { label: 'Features', href: '#features' },
        { label: 'Architecture', href: '#architecture' },
        { label: 'Security', href: '#security' },
        { label: 'Pricing', href: '#pricing' },
    ];

    return (
        <nav
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                transition: 'all 0.5s ease',
                background: scrolled ? 'rgba(3, 5, 9, 0.85)' : 'transparent',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
                padding: scrolled ? '12px 0' : '20px 0',
            }}
        >
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Logo */}
                <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Shield size={20} color="#10B981" />
                    </div>
                    <div>
                        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>
                            Harmony<span style={{ color: '#10B981' }}>Aura</span>
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#475569', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                            Industrial Safety OS
                        </div>
                    </div>
                </a>

                {/* Desktop Links (Centered) */}
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }} className="hidden lg:flex">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 40, background: 'rgba(255,255,255,0.02)', padding: '8px 24px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.05)' }}>
                        {links.map(l => (
                            <a key={l.label} href={l.href} style={{
                                position: 'relative', fontSize: 13, fontWeight: 600, color: '#94A3B8', transition: 'color 0.3s',
                                letterSpacing: '0.02em'
                            }}
                                className="nav-link group"
                                onMouseEnter={e => e.target.style.color = '#fff'}
                                onMouseLeave={e => e.target.style.color = '#94A3B8'}
                            >
                                {l.label}
                                <span className="absolute -bottom-2 left-1/2 w-1 h-1 bg-[#10B981] rounded-full opacity-0 transition-opacity group-hover:opacity-100" style={{ transform: 'translateX(-50%)', boxShadow: '0 0 10px #10B981' }}></span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Desktop CTA */}
                <div className="hidden lg:block">
                    <MagneticButton>Get Started</MagneticButton>
                </div>

                {/* Mobile Toggle */}
                <button className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} style={{ color: 'white' }}>
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="lg:hidden" style={{
                    padding: '24px', display: 'flex', flexDirection: 'column', gap: 16,
                    background: 'rgba(3,5,9,0.95)', borderTop: '1px solid rgba(255,255,255,0.05)',
                }}>
                    {links.map(l => (
                        <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)}
                            style={{ fontSize: 16, fontWeight: 500, color: '#94A3B8', padding: '8px 0' }}>
                            {l.label}
                        </a>
                    ))}
                    <MagneticButton>Get Started</MagneticButton>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
