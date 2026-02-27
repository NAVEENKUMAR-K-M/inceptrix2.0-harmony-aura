import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import {
  Shield, Cpu, Activity, Wifi, Eye, Lock,
  ArrowRight, CheckCircle2, Star, Zap, CircuitBoard,
  Heart, ThermometerSun, BarChart3, ChevronRight
} from 'lucide-react';
import InteractiveGlobe from './components/InteractiveGlobe';

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
      gsap.from('.hero-globe', { scale: 0.8, opacity: 0, duration: 1.2, delay: 0.3, ease: 'power3.out' });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-[120px]" />
        <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] rounded-full bg-accent/[0.03] blur-[100px]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-4">
          {/* Left Content */}
          <div className="flex-1 max-w-2xl">
            <div className="hero-badge inline-flex items-center gap-2 rounded-full border border-primary/20 glass-nav px-4 py-1.5 text-xs font-mono text-primary mb-8 glow-primary">
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

            <div className="hero-cta flex items-center gap-4 mb-12">
              <a href="#pricing" className="group flex items-center gap-3 px-8 py-4 rounded-xl bg-primary hover:bg-primaryDark text-white font-bold text-sm tracking-wide transition-all duration-300 glow-primary hover:shadow-[0_0_60px_rgba(16,185,129,0.25)]">
                Start Free Trial
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#features" className="flex items-center gap-2 px-6 py-4 rounded-xl border border-white/10 hover:border-white/20 text-textSecondary hover:text-white text-sm font-medium transition-all duration-300">
                See How It Works
              </a>
            </div>

            <div className="hero-stats flex items-center gap-8">
              {[
                { value: '73%', label: 'Fewer Incidents' },
                { value: '<50ms', label: 'Edge Latency' },
                { value: 'AES-256', label: 'Encryption' },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-2xl font-bold font-mono text-white">{stat.value}</p>
                  <p className="text-xs text-textDim font-mono uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
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
    glow: 'group-hover:shadow-[0_0_40px_rgba(248,113,113,0.1)]',
  },
  {
    icon: Cpu,
    title: 'Edge Intelligence',
    description: 'On-device CIS & PdM computation on ESP32-S3. Safety decisions in <1ms, no cloud dependency.',
    color: 'text-indigo-400',
    glow: 'group-hover:shadow-[0_0_40px_rgba(129,140,248,0.1)]',
  },
  {
    icon: Lock,
    title: 'AES-256 E2EE',
    description: 'Military-grade encryption from sensor to dashboard. Zero plaintext on the wire. Ever.',
    color: 'text-emerald-400',
    glow: 'group-hover:shadow-[0_0_40px_rgba(52,211,153,0.1)]',
  },
  {
    icon: Activity,
    title: 'Predictive Maintenance',
    description: 'Multi-factor machine health scoring. Know about failures weeks before they happen.',
    color: 'text-amber-400',
    glow: 'group-hover:shadow-[0_0_40px_rgba(251,191,36,0.1)]',
  },
  {
    icon: Eye,
    title: 'Real-Time Overwatch',
    description: 'Live dashboard with CIS gauges, PdM health bars, and workforce-wide threat mapping.',
    color: 'text-cyan-400',
    glow: 'group-hover:shadow-[0_0_40px_rgba(34,211,238,0.1)]',
  },
  {
    icon: Wifi,
    title: 'Digital Twin Simulation',
    description: 'Physics-based site simulation for war-gaming emergency scenarios before they happen.',
    color: 'text-violet-400',
    glow: 'group-hover:shadow-[0_0_40px_rgba(167,139,250,0.1)]',
  },
];

const FeaturesSection = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.feature-card', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        y: 50, opacity: 0, duration: 0.6, stagger: 0.1,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="features" ref={sectionRef} className="section-padding relative">
      <div className="container-width z-10 relative">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-mono text-textDim uppercase tracking-widest mb-6">
            <CircuitBoard size={12} className="text-primary" />
            The Technology
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-4">
            Built for the <span className="gradient-text">Edge</span>
          </h2>
          <p className="text-textSecondary max-w-xl mx-auto">
            Six pillars of industrial intelligence. Each one battle-tested, each one designed to save lives and prevent millions in downtime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className={`feature-card group glass rounded-3xl p-10 transition-all duration-500 hover:-translate-y-2 border border-white/5 hover:border-white/10 ${feature.glow}`}>
              <div className={`w-14 h-14 rounded-2xl glass flex items-center justify-center mb-8 ${feature.color}`}>
                <feature.icon size={26} />
              </div>
              <h3 className="text-xl font-display font-extrabold text-white mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-textSecondary leading-relaxed">{feature.description}</p>
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

const DataFlowSection = () => (
  <section className="section-padding relative overflow-hidden bg-surfaceLight/30 border-y border-white/[0.02]">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-primary/[0.02] blur-[120px]" />
    </div>

    <div className="container-width relative z-10">
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight mb-4">
          The Encrypted <span className="gradient-text">Data Pipeline</span>
        </h2>
        <p className="text-textSecondary max-w-lg mx-auto">
          From sensor to dashboard, your data is encrypted at every hop. Firebase never sees plaintext.
        </p>
      </div>

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 max-w-5xl mx-auto">
        {/* Connection Line (Desktop only) */}
        <div className="hidden md:block absolute top-[42px] left-[6%] right-[6%] h-[2px] bg-white/[0.05] z-0">
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-primary/50 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
        </div>

        {[
          { icon: ThermometerSun, label: 'ESP32 Wearable', sub: 'Sensors + Encrypt', color: 'text-cyan-400', border: 'border-cyan-500/20' },
          { icon: Lock, label: 'AES-256-GCM', sub: 'Encrypted Transit', color: 'text-emerald-400', border: 'border-emerald-500/20' },
          { icon: BarChart3, label: 'Firebase RTDB', sub: 'Ciphertext Only', color: 'text-amber-400', border: 'border-amber-500/20' },
          { icon: Lock, label: 'AES-256-GCM', sub: 'Encrypted Transit', color: 'text-emerald-400', border: 'border-emerald-500/20' },
          { icon: Cpu, label: 'ESP32-S3 Edge', sub: 'Decrypt + Compute', color: 'text-indigo-400', border: 'border-indigo-500/20' },
          { icon: Eye, label: 'Dashboard', sub: 'Decrypt + Display', color: 'text-primary', border: 'border-primary/20' },
        ].map((step, i) => (
          <div key={i} className="relative z-10 w-full md:w-auto flex flex-col items-center">
            <div className={`glass rounded-2xl p-6 text-center w-full md:w-[150px] border ${step.border} transition-transform hover:-translate-y-2`}>
              <step.icon size={28} className={`${step.color} mx-auto mb-4 drop-shadow-[0_0_8px_currentColor]`} />
              <p className="text-sm font-bold text-white tracking-tight">{step.label}</p>
              <p className="text-[10px] text-textDim font-mono mt-2 uppercase tracking-wide">{step.sub}</p>
            </div>
            {i < 5 && <ChevronRight size={20} className="text-white/20 mt-4 md:hidden" />}
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
    borderColor: 'border-white/10',
    ctaClass: 'bg-white/10 hover:bg-white/15 text-white',
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
    borderColor: 'border-primary/40',
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
    borderColor: 'border-accent/30',
    ctaClass: 'bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30',
  },
];

const PricingSection = () => (
  <section id="pricing" className="section-padding relative">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-primary/[0.03] blur-[150px]" />
    </div>

    <div className="container-width relative z-10">
      <div className="text-center mb-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-mono text-textDim uppercase tracking-widest mb-6">
          <Zap size={12} className="text-warning" />
          Pricing
        </div>
        <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-4">
          Scale Safety. <span className="gradient-text">Not Cost.</span>
        </h2>
        <p className="text-textSecondary max-w-xl mx-auto">
          Every plan includes the full Harmony Aura dashboard. Choose the depth of intelligence your site needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 max-w-6xl mx-auto">
        {plans.map((plan, i) => (
          <div key={i} className={`relative glass rounded-3xl p-10 border ${plan.borderColor} transition-all duration-500 hover:-translate-y-3 ${plan.popular ? 'glow-primary shadow-2xl shadow-primary/10' : ''}`}>
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-white text-[11px] font-extrabold uppercase tracking-widest shadow-lg shadow-primary/20 border border-white/20">
                <Star size={10} /> Most Popular
              </div>
            )}

            <div className="mb-8">
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

            <button className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 ${plan.ctaClass}`}>
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
  <footer className="border-t border-white/[0.05] py-20 bg-surface/50">
    <div className="container-width">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
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
//  NAVBAR
// ═══════════════════════════════════════════════════

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-white/[0.05]">
    <div className="container-width flex items-center justify-between h-20">
      <div className="flex items-center gap-2">
        <Shield size={20} className="text-primary" />
        <span className="font-display font-extrabold text-lg text-white tracking-tight">
          Harmony<span className="text-primary">Aura</span>
        </span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm text-textSecondary">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        <a href="#" className="hover:text-white transition-colors">Docs</a>
      </div>
      <a href="#pricing" className="px-5 py-2 rounded-lg bg-primary hover:bg-primaryDark text-white text-sm font-bold transition-all duration-300">
        Get Started
      </a>
    </div>
  </nav>
);

// ═══════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════

function App() {
  return (
    <div className="min-h-screen bg-background text-textMain font-sans selection:bg-primary/30">
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
