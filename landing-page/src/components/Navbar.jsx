import React, { useState, useEffect } from 'react';
import { Shield, Menu, X } from 'lucide-react';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', fn);
        return () => window.removeEventListener('scroll', fn);
    }, []);

    const links = [
        { label: 'Features', href: '#features' },
        { label: 'How It Works', href: '#dataflow' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Security', href: '#security' },
    ];

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container navbar-inner">
                <a href="#" className="navbar-logo">
                    <div className="navbar-logo-icon">
                        <Shield size={20} color="#10b981" />
                    </div>
                    <div>
                        <div className="navbar-brand">Harmony<span>Aura</span></div>
                        <div className="navbar-tag">Industrial Safety OS</div>
                    </div>
                </a>

                <div className="navbar-links" style={{ display: open ? 'flex' : '' }}>
                    {links.map(l => (
                        <a key={l.label} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
                    ))}
                    <a href="#pricing" className="btn-primary">Get Started</a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
