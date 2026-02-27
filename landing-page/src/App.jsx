import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import {
  Shield, Cpu, Activity, Wifi, Eye, Lock,
  ArrowRight, CheckCircle2, Star, Zap, CircuitBoard,
  Heart, ThermometerSun, BarChart3, ChevronRight
} from 'lucide-react';
import InteractiveGlobe from './components/InteractiveGlobe';

// ═══════════════════════════════════════════════════
//  NAVBAR
// ═══════════════════════════════════════════════════

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
    <div className="max-w-[1400px] mx-auto px-6 lg:px-16 flex items-center justify-between h-20">
      <div className="flex items-center gap-2.5">
        <Shield size={22} className="text-primary" />
        <span className="font-display font-extrabold text-xl text-white tracking-tight">
          Harmony<span className="text-primary">Aura</span>
        </span>
      </div>
      <div className="hidden md:flex items-center gap-10 text-sm text-textSecondary font-medium">
        <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
        <a href="#pricing" className="hover:text-white transition-colors duration-200">Pricing</a>
        <a href="#" className="hover:text-white transition-colors duration-200">Docs</a>
      </div>
      <a href="#pricing" className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primaryDark text-white text-sm font-bold transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]">
        Get Started
      </a>
    </div>
  </nav>
);

// ═══════════════════════════════════════════════════
//  HERO SECTION
// ═══════════════════════════════════════════════════

const HeroSection = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-badge', { y: 20, opacity: 0, duration: 0.6, delay: 0.2 });
      gsap.from('.hero-title', { y: 40, opacity: 0, duration: 0.8, delay: 0.4 });
      gsap.from('.hero-subtitle', { y: 30, opacity: 0, duration: 0.7, delay: 0.6 });
      gsap.from('.hero-cta', { y: 20, opacity: 0, duration: 0.6, delay: 0.8 });
      gsap.from('.hero-stats > div', { y: 30, opacity: 0, duration: 0.5, stagger: 0.1, delay: 1.0 });
      gsap.from('.hero-globe', { scale: 0.85, opacity: 0, duration: 1.2, delay: 0.3, ease: 'power3.out' });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-[120px]" />
        <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] rounded-full bg-accent/[0.03] blur-[100px]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-12">
          {/* Left Content */}
          <div className="flex-1 max-w-2xl lg:pr-8">
            <div className="hero-badge inline-flex items-center gap-2 rounded-full border border-primary/20 glass px-4 py-1.5 text-xs font-mono text-primary mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Edge AI · AES-256 Encrypted · Real-Time
            </div>

            <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-white tracking-tight leading-[1.05] mb-6">
              Predict.{' '}
              <span className="gradient-text">Protect.</span>
              <br />
              Prevent.
            </h1>

            <p className="hero-subtitle text-lg md:text-xl text-textSecondary leading-relaxed mb-10 max-w-lg">
              Harmony Aura fuses <strong className="text-white">IoT wearables</strong>, <strong className="text-white">Edge AI</strong>,
              and <strong className="text-white">military-grade encryption</strong> to create a predictive safety overwatch
              for industrial workforces. Every heartbeat. Every machine pulse. Secured.
            </p>

            <div className="hero-cta flex flex-wrap items-center gap-4 mb-12">
              <a href="#pricing" className="group flex items-center gap-3 px-8 py-4 rounded-xl bg-primary hover:bg-primaryDark text-white font-bold text-sm tracking-wide transition-all duration-300 glow-primary hover:shadow-[0_0_60px_rgba(16,185,129,0.25)]">
                Start Free Trial
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#features" className="flex items-center gap-2 px-6 py-4 rounded-xl border border-white/10 hover:border-white/20 text-textSecondary hover:text-white text-sm font-medium transition-all duration-300">
                See How It Works
              </a>
            </div>

            <div className="hero-stats flex items-center gap-10">
              {[
                { value: '73%', label: 'Fewer Incidents' },
                { value: '<50ms', label: 'Edge Latency' },
                { value: 'AES-256', label: 'Encryption' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col">
                  <p className="text-2xl font-bold font-mono text-white">{stat.value}</p>
                  <p className="text-[10px] text-textDim font-mono uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Interactive Globe */}
          <div className="hero-globe flex-1 flex items-center justify-center w-full max-w-[560px]">
            <InteractiveGlobe size={520} />
          </div>
        </div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════
//  FEATURES SECTION
// ═══════════════════════════════════════════════════

const features = [
  {
    icon: Heart,
    title: 'Wearable Biometrics',
    description: 'Real-time heart rate, body temperature, and impact detection from ESP32 wearables.',
    color: 'text-red-400',
  },
  {
    icon: Cpu,
    title: 'Edge Intelligence',
    description: 'On-device CIS & PdM computation on ESP32-S3. Safety decisions in <1ms, no cloud dependency.',
    color: 'text-indigo-400',
  },
  {
    icon: Lock,
    title: 'AES-256 E2EE',
    description: 'Military-grade encryption from sensor to dashboard. Zero plaintext on the wire. Ever.',
    color: 'text-emerald-400',
  },
  {
    icon: Activity,
    title: 'Predictive Maintenance',
    description: 'Multi-factor machine health scoring. Know about failures weeks before they happen.',
    color: 'text-amber-400',
  },
  {
    icon: Eye,
    title: 'Real-Time Overwatch',
    description: 'Live dashboard with CIS gauges, PdM health bars, and workforce-wide threat mapping.',
    color: 'text-cyan-400',
  },
  {
    icon: Wifi,
    title: 'Digital Twin Simulation',
    description: 'Physics-based site simulation for war-gaming emergency scenarios before they happen.',
    color: 'text-violet-400',
  },
];

const FeaturesSection = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.feature-card', {
        y: 40, opacity: 0, duration: 0.5, stagger: 0.08,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="features" ref={sectionRef} className="py-32 md:py-40 relative">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-primary/[0.02] blur-[120px]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 glass px-4 py-1.5 text-xs font-mono text-textDim uppercase tracking-widest mb-6">
            <CircuitBoard size={12} className="text-primary" />
            The Technology
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-5">
            Built for the <span className="gradient-text">Edge</span>
          </h2>
          <p className="text-textSecondary max-w-xl mx-auto leading-relaxed">
            Six pillars of industrial intelligence. Each one battle-tested, each one designed to save lives and prevent millions in downtime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <div key={i} className="feature-card group glass rounded-2xl p-8 lg:p-10 transition-all duration-400 hover:-translate-y-1.5 hover:border-white/10">
              <div className={`w-12 h-12 rounded-xl glass flex items-center justify-center mb-6 ${feature.color}`}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
              <p className="text-sm text-textSecondary leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════
//  DATA FLOW SECTION
// ═══════════════════════════════════════════════════

const pipelineSteps = [
  { icon: ThermometerSun, label: 'ESP32 Wearable', sub: 'Sensors + Encrypt', color: 'text-cyan-400', border: 'border-cyan-500/20' },
  { icon: Lock, label: 'AES-256-GCM', sub: 'Encrypted Transit', color: 'text-emerald-400', border: 'border-emerald-500/20' },
  { icon: BarChart3, label: 'Firebase RTDB', sub: 'Ciphertext Only', color: 'text-amber-400', border: 'border-amber-500/20' },
  { icon: Cpu, label: 'ESP32-S3 Edge', sub: 'Decrypt + Compute', color: 'text-indigo-400', border: 'border-indigo-500/20' },
  { icon: Eye, label: 'Dashboard', sub: 'Decrypt + Display', color: 'text-primary', border: 'border-primary/20' },
];

const DataFlowSection = () => (
  <section className="py-32 md:py-40 relative overflow-hidden">
    {/* Background */}
    <div className="absolute inset-0 pointer-events-none bg-surfaceLight/20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-primary/[0.02] blur-[120px]" />
    </div>

    <div className="max-w-[1400px] mx-auto px-6 lg:px-16 relative z-10">
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight mb-4">
          The Encrypted <span className="gradient-text">Data Pipeline</span>
        </h2>
        <p className="text-textSecondary max-w-lg mx-auto leading-relaxed">
          From sensor to dashboard, your data is encrypted at every hop. Firebase never sees plaintext.
        </p>
      </div>

      {/* Pipeline — Desktop: horizontal row, Mobile: vertical stack */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-0">
        {pipelineSteps.map((step, i) => (
          <div key={i} className="flex flex-col md:flex-row items-center">
            <div className={`glass rounded-2xl p-6 text-center w-full max-w-[200px] md:w-[160px] border ${step.border} transition-all duration-300 hover:-translate-y-1`}>
              <step.icon size={28} className={`${step.color} mx-auto mb-3`} />
              <p className="text-sm font-bold text-white tracking-tight">{step.label}</p>
              <p className="text-[10px] text-textDim font-mono mt-1.5 uppercase tracking-wide">{step.sub}</p>
            </div>
            {i < pipelineSteps.length - 1 && (
              <ChevronRight size={20} className="text-white/20 my-2 md:my-0 md:mx-2 rotate-90 md:rotate-0 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════
//  PRICING SECTION
// ═══════════════════════════════════════════════════

const plans = [
  {
    name: 'Aura Basic',
    tagline: 'Digital Visibility',
    price: 99,
    period: '/mo per site',
    popular: false,
    features: [
      'Real-time dashboard access',
      'Standard CIS safety scoring',
      '30-day data retention',
      'Email threshold alerts',
      'Up to 25 workers',
      'Community support',
    ],
    cta: 'Start Basic',
    borderColor: 'border-white/[0.06]',
    ctaClass: 'bg-white/[0.08] hover:bg-white/[0.12] text-white',
  },
  {
    name: 'Aura Professional',
    tagline: 'Active Shield',
    price: 499,
    period: '/mo per site',
    popular: true,
    features: [
      'Full IoT wearable integration',
      'Live biometrics (HR, tilt, impact)',
      'Edge CIS computation',
      'Predictive Maintenance (PdM)',
      'SMS & push critical alerts',
      '6-month data retention',
      'Up to 100 workers',
      'Priority email support',
    ],
    cta: 'Start Professional',
    borderColor: 'border-primary/30',
    ctaClass: 'bg-primary hover:bg-primaryDark text-white glow-primary',
  },
  {
    name: 'Aura Elite',
    tagline: 'Edge Intelligence',
    price: 1999,
    period: '/mo per site',
    popular: false,
    features: [
      'AES-256-GCM E2EE security',
      'S3 Edge on-device AI (<1ms)',
      'Advanced PdM engine',
      'Multi-site global overwatch',
      'Custom API & ERP integration',
      'Unlimited data retention',
      'Unlimited workers',
      '24/7 dedicated support',
    ],
    cta: 'Contact Sales',
    borderColor: 'border-accent/20',
    ctaClass: 'bg-accent/[0.15] hover:bg-accent/[0.25] text-accent border border-accent/30',
  },
];

const PricingSection = () => (
  <section id="pricing" className="py-32 md:py-40 relative">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-primary/[0.03] blur-[150px]" />
    </div>

    <div className="max-w-[1200px] mx-auto px-6 lg:px-16 relative z-10">
      <div className="text-center mb-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 glass px-4 py-1.5 text-xs font-mono text-textDim uppercase tracking-widest mb-6">
          <Zap size={12} className="text-warning" />
          Pricing
        </div>
        <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-5">
          Scale Safety. <span className="gradient-text">Not Cost.</span>
        </h2>
        <p className="text-textSecondary max-w-xl mx-auto leading-relaxed">
          Every plan includes the full Harmony Aura dashboard. Choose the depth of intelligence your site needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {plans.map((plan, i) => (
          <div key={i} className={`relative glass rounded-2xl p-8 lg:p-10 border ${plan.borderColor} transition-all duration-500 hover:-translate-y-2 ${plan.popular ? 'glow-primary' : ''}`}>
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-white text-[11px] font-bold uppercase tracking-wider whitespace-nowrap shadow-lg shadow-primary/20">
                <Star size={10} /> Most Popular
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-display font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-xs font-mono text-textDim uppercase tracking-wider">{plan.tagline}</p>
            </div>

            <div className="mb-8">
              <span className="text-5xl font-display font-extrabold text-white">${plan.price}</span>
              <span className="text-sm text-textDim ml-2">{plan.period}</span>
            </div>

            <ul className="space-y-3 mb-10">
              {plan.features.map((feature, j) => (
                <li key={j} className="flex items-start gap-3 text-sm text-textSecondary">
                  <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <button className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 cursor-pointer ${plan.ctaClass}`}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════
//  FOOTER
// ═══════════════════════════════════════════════════

const Footer = () => (
  <footer className="border-t border-white/[0.05] py-16 lg:py-20">
    <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-center md:text-left">
          <h3 className="font-display font-extrabold text-2xl text-white tracking-tight">
            Harmony<span className="text-primary">Aura</span>
          </h3>
          <p className="text-xs text-textDim font-mono mt-1">Predictive Industrial Safety · Powered by Edge AI</p>
        </div>
        <div className="flex items-center gap-8 text-sm text-textSecondary">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#" className="hover:text-white transition-colors">Documentation</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </div>
      <div className="mt-10 pt-8 border-t border-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-textDim">&copy; 2026 Harmony Aura · OverClocked Technologies. All rights reserved.</p>
        <div className="flex items-center gap-2 text-xs text-textDim font-mono">
          <Shield size={12} className="text-primary" />
          <span>AES-256 Secured · SOC 2 Compliant</span>
        </div>
      </div>
    </div>
  </footer>
);

// ═══════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════

function App() {
  return (
    <div className="min-h-screen bg-background text-textMain font-sans">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <DataFlowSection />
      <PricingSection />
      <Footer />
    </div>
  );
}

export default App;
