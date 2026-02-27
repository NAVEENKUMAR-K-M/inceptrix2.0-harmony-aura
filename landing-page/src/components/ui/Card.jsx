import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export const TiltCard = ({ children, className = '', glowColor = 'rgba(16, 185, 129, 0.15)', style = {} }) => {
    const cardRef = useRef(null);
    const glowRef = useRef(null);

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const handleMouseMove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;

            gsap.to(card, {
                rotateX,
                rotateY,
                transformPerspective: 1000,
                ease: 'power2.out',
                duration: 0.4,
            });

            if (glowRef.current) {
                gsap.to(glowRef.current, {
                    x: x - rect.width,
                    y: y - rect.width,
                    opacity: 1,
                    duration: 0.1,
                });
            }
        };

        const handleMouseLeave = () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                ease: 'power3.out',
                duration: 0.8,
            });

            if (glowRef.current) {
                gsap.to(glowRef.current, {
                    opacity: 0,
                    duration: 0.5,
                });
            }
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <div
            ref={cardRef}
            className={`glass-panel relative overflow-hidden transition-colors duration-500 hover:border-[rgba(255,255,255,0.15)] ${className}`}
            style={{ transformStyle: 'preserve-3d' }}
        >
            <div
                ref={glowRef}
                className="pointer-events-none absolute left-0 top-0 h-[200%] w-[200%] rounded-full opacity-0 mix-blend-screen"
                style={{
                    background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 40%)`,
                }}
            />
            <div className="relative z-10 h-full w-full" style={{ transform: 'translateZ(20px)' }}>
                {children}
            </div>
        </div>
    );
};
