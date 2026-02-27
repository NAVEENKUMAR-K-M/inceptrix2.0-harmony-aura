import React from 'react';
import { Shield, Github, Linkedin, Twitter } from 'lucide-react';

const Footer = () => (
    <footer className="footer">
        <div className="container">
            <div className="footer-grid">
                <div className="footer-brand">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="navbar-logo-icon" style={{ width: '36px', height: '36px' }}>
                            <Shield size={18} color="#10b981" />
                        </div>
                        <span style={{ fontSize: '18px', fontWeight: 800 }}>
                            Harmony<span style={{ color: 'var(--primary)' }}>Aura</span>
                        </span>
                    </div>
                    <p>AI-powered industrial safety. Protecting workers through predictive edge intelligence and wearable IoT.</p>
                </div>

                <div className="footer-col">
                    <h4>Product</h4>
                    {['Features', 'Pricing', 'Security', 'IoT Hardware', 'Mobile Apps'].map(l => (
                        <a key={l} href="#">{l}</a>
                    ))}
                </div>

                <div className="footer-col">
                    <h4>Company</h4>
                    {['About Us', 'Careers', 'Contact', 'Press Kit', 'Partners'].map(l => (
                        <a key={l} href="#">{l}</a>
                    ))}
                </div>

                <div className="footer-col">
                    <h4>Legal</h4>
                    {['Privacy Policy', 'Terms of Service', 'Data Processing', 'Cookie Policy', 'GDPR Compliance'].map(l => (
                        <a key={l} href="#">{l}</a>
                    ))}
                </div>
            </div>

            <div className="footer-bottom">
                <span className="footer-bottom-text">
                    © 2026 Harmony Aura. All rights reserved. Built by Team OverClocked.
                </span>
                <div className="footer-socials">
                    <a href="#"><Github size={18} /></a>
                    <a href="#"><Linkedin size={18} /></a>
                    <a href="#"><Twitter size={18} /></a>
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;
