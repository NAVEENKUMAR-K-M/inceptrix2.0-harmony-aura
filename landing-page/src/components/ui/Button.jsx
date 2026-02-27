import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export const MagneticButton = ({ children, className = '', onClick, primary = true }) => {
    const buttonRef = useRef(null);

    useEffect(() => {
        const btn = buttonRef.current;
        if (!btn) return;

        const hoverConfig = { x: 0, y: 0, duration: 0.3, ease: 'power3.out' };

        const handleMouseMove = (e) => {
            const rect = btn.getBoundingClientRect();
            const h = rect.width / 2;
            const w = rect.height / 2;
            const x = e.clientX - rect.left - h;
            const y = e.clientY - rect.top - w;

            gsap.to(btn, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.3,
                ease: 'power3.out',
            });
        };

        const handleMouseLeave = () => {
            gsap.to(btn, hoverConfig);
        };

        btn.addEventListener('mousemove', handleMouseMove);
        btn.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            btn.removeEventListener('mousemove', handleMouseMove);
            btn.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <button
            ref={buttonRef}
            onClick={onClick}
            className={`mag-btn ${primary ? 'mag-primary' : 'mag-secondary'} ${className}`}
        >
            <span className="mag-bg"></span>
            <span className="mag-content">{children}</span>
        </button>
    );
};
