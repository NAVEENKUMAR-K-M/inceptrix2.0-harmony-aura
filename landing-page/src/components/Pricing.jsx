import React, { useState } from 'react';
import { Check, X, Zap, Star, Crown, ArrowRight } from 'lucide-react';

const plans = [
    {
        name: 'Aura Basic',
        subtitle: 'Digital Visibility',
        price: 99,
        description: 'Perfect for small sites beginning their digital safety transformation.',
        icon: Zap,
        color: 'text-cyan',
        borderColor: 'border-cyan/20',
        glowColor: '',
        popular: false,
        features: [
            { text: 'Real-time Dashboard Access', included: true },
            { text: 'Standard CIS Scoring', included: true },
            { text: '30-Day Data Retention', included: true },
            { text: 'Email Threshold Alerts', included: true },
            { text: 'Up to 25 Workers', included: true },
            { text: 'IoT Hardware Support', included: false },
            { text: 'Edge Intelligence (S3)', included: false },
            { text: 'E2EE Encryption', included: false },
            { text: 'Custom API Access', included: false },
        ],
    },
    {
        name: 'Aura Professional',
        subtitle: 'Active Shield',
        price: 499,
        description: 'For factories deploying IoT wearables and active hazard mitigation.',
        icon: Star,
        color: 'text-primary',
        borderColor: 'border-primary/30',
        glowColor: 'shadow-[0_0_40px_rgba(16,185,129,0.1)]',
        popular: true,
        features: [
            { text: 'Real-time Dashboard Access', included: true },
            { text: 'Advanced CIS Scoring', included: true },
            { text: '6-Month Data Retention', included: true },
            { text: 'SMS & Push Critical Alerts', included: true },
            { text: 'Up to 100 Workers', included: true },
            { text: 'Full IoT Wearable Support', included: true },
            { text: 'Edge Intelligence (S3)', included: true },
            { text: 'E2EE Encryption', included: false },
            { text: 'Custom API Access', included: false },
        ],
    },
    {
        name: 'Aura Elite',
        subtitle: 'Edge Intelligence',
        price: 1999,
        description: 'Enterprise-grade for multi-site plants requiring maximum security.',
        icon: Crown,
        color: 'text-amber',
        borderColor: 'border-amber/20',
        glowColor: '',
        popular: false,
        features: [
            { text: 'Real-time Dashboard Access', included: true },
            { text: 'AI-Powered CIS + Analytics', included: true },
            { text: 'Unlimited Data Retention', included: true },
            { text: 'Priority 24/7 Escalation', included: true },
            { text: 'Unlimited Workers & Sites', included: true },
            { text: 'Full IoT Wearable Support', included: true },
            { text: 'Edge Intelligence (S3)', included: true },
            { text: 'AES-256-GCM E2EE', included: true },
            { text: 'Custom API + ERP Integration', included: true },
        ],
    },
];

const PricingCard = ({ plan }) => {
    const Icon = plan.icon;

    return (
        <div className={`relative glass rounded-3xl p-8 flex flex-col transition-all duration-500
                        hover:shadow-[0_0_50px_rgba(16,185,129,0.08)] ${plan.glowColor}
                        ${plan.popular ? 'border-primary/30 scale-[1.02] lg:scale-105' : ''}`}>
            {/* Popular Badge */}
            {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary rounded-full
                                text-xs font-bold text-white uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    Most Popular
                </div>
            )}

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-white/[0.03] border ${plan.borderColor}
                                    flex items-center justify-center`}>
                        <Icon size={20} className={plan.color} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                        <span className="text-[10px] font-mono text-text-dim uppercase tracking-wider">
                            {plan.subtitle}
                        </span>
                    </div>
                </div>
                <p className="text-sm text-text-secondary mb-4">{plan.description}</p>

                {/* Price */}
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white font-mono">${plan.price}</span>
                    <span className="text-sm text-text-dim">/month/site</span>
                </div>
            </div>

            {/* Features */}
            <div className="flex-1 space-y-3 mb-8">
                {plan.features.map(f => (
                    <div key={f.text} className="flex items-center gap-3">
                        {f.included ? (
                            <Check size={16} className="text-primary flex-shrink-0" />
                        ) : (
                            <X size={16} className="text-text-dim/40 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${f.included ? 'text-text-secondary' : 'text-text-dim/40'}`}>
                            {f.text}
                        </span>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <a href="#"
                className={`group w-full py-3.5 rounded-xl font-bold text-sm text-center transition-all duration-300 flex items-center justify-center gap-2
                   ${plan.popular
                        ? 'bg-primary text-white hover:bg-primary-dim shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        : 'glass text-white hover:bg-white/10'}`}>
                Get Started
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
        </div>
    );
};

const Pricing = () => {
    return (
        <section id="pricing" className="py-24 lg:py-32 relative">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <div className="text-xs font-mono text-amber uppercase tracking-[0.2em] mb-4">
                        Pricing
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
                        Built for Every Scale
                    </h2>
                    <p className="text-text-secondary">
                        From a single workshop to a global fleet operation. Choose the tier
                        that matches your safety ambition.
                    </p>
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                    {plans.map(p => (
                        <PricingCard key={p.name} plan={p} />
                    ))}
                </div>

                {/* Bottom Note */}
                <div className="text-center mt-12">
                    <p className="text-sm text-text-dim">
                        All plans include a <span className="text-primary font-semibold">14-day free trial</span>.
                        No credit card required. Cancel anytime.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Pricing;
