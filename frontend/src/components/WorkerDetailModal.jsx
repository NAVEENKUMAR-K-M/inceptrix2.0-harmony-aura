import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { X, User, Activity, Brain, HeartPulse, Clock, BarChart2, Truck, AlertOctagon, Cpu } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import StatusBadge from './StatusBadge';
import MachineSummary from './MachineSummary';
import { getWorkerName, getMachineName } from '../utils/mappings';

const MetricCard = ({ icon: Icon, label, value, unit, color = "text-white", delay = 0 }) => {
    const elRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(elRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, delay: 0.2 + delay, ease: "back.out(1.2)" }
        );
    }, [delay]);

    return (
        <div ref={elRef} className="bg-surface/50 rounded-xl p-4 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={48} />
            </div>
            <div className="flex items-start justify-between mb-2 relative z-10">
                <span className="text-xs text-textSecondary font-medium uppercase tracking-wider">{label}</span>
                <Icon size={16} className="text-textSecondary/50" />
            </div>
            <div className="flex items-baseline gap-1 relative z-10">
                <span className={`text-3xl font-display font-bold ${color}`}>{value}</span>
                <span className="text-xs text-textDim font-mono">{unit}</span>
            </div>
        </div>
    );
};

const WorkerDetailModal = ({ worker, machine, onClose }) => {
    const modalRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        // Modal Entry Animation
        const tl = gsap.timeline();

        tl.fromTo(modalRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.3 }
        )
            .fromTo(contentRef.current,
                { y: 50, scale: 0.95, opacity: 0 },
                { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: "power3.out" },
                "-=0.1"
            );

        return () => {
            tl.kill();
        };
    }, []);

    const handleClose = () => {
        const tl = gsap.timeline({ onComplete: onClose });

        tl.to(contentRef.current,
            { y: 20, opacity: 0, scale: 0.95, duration: 0.3, ease: "power2.in" }
        )
            .to(modalRef.current,
                { opacity: 0, duration: 0.2 },
                "-=0.1"
            );
    };

    if (!worker) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8">
            {/* Backdrop */}
            <div
                ref={modalRef}
                onClick={handleClose}
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <div
                ref={contentRef}
                className="w-full max-w-6xl h-full max-h-[85vh] glass-panel rounded-2xl flex flex-col relative z-10 overflow-hidden shadow-2xl shadow-black/50"
            >
                {/* Header */}
                <div className="h-20 border-b border-white/5 flex justify-between items-center px-8 bg-surface/30 shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-white/10 shadow-glow">
                            <span className="font-display font-bold text-xl text-white">{worker.worker_id.replace('W', '')}</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="font-display font-bold text-2xl text-white tracking-tight">{getWorkerName(worker.worker_id)}</h2>
                                <StatusBadge status={worker.cis_risk_level} />
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                                <span className="text-xs text-textSecondary flex items-center gap-1.5 font-mono">
                                    <Cpu size={12} className="text-accent" />
                                    {machine ? getMachineName(machine.machine_id) : 'UNASSIGNED'}
                                </span>
                                <span className="text-xs text-textSecondary flex items-center gap-1.5 font-mono">
                                    <Clock size={12} className="text-primary" />
                                    SHIFT: 04:12:33
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleClose}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 text-textSecondary hover:text-white transition-all duration-200"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content Logic */}
                <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Vitals (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        <h3 className="text-sm font-mono text-textDim uppercase tracking-widest pl-1">Live Biometrics</h3>

                        {/* Metrics Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <MetricCard
                                icon={HeartPulse}
                                label="Heart Rate"
                                value={worker.heart_rate_bpm}
                                unit="BPM"
                                color={worker.heart_rate_bpm > 110 ? "text-critical" : "text-primary"}
                                delay={0}
                            />
                            <MetricCard
                                icon={Activity}
                                label="HRV"
                                value={worker.hrv_ms}
                                unit="ms"
                                delay={0.1}
                            />
                            <MetricCard
                                icon={Brain}
                                label="Stress"
                                value={worker.stress_percent}
                                unit="%"
                                color={worker.stress_percent > 70 ? "text-warning" : "text-white"}
                                delay={0.2}
                            />
                            <MetricCard
                                icon={AlertOctagon}
                                label="Fatigue"
                                value={worker.fatigue_percent}
                                unit="%"
                                color={worker.fatigue_percent > 80 ? "text-critical" : "text-white"}
                                delay={0.3}
                            />
                        </div>

                        {/* Chart Section */}
                        <div className="flex-1 bg-surfaceHighlight/30 rounded-2xl border border-white/5 p-6 relative overflow-hidden min-h-[300px]">
                            <div className="absolute top-0 right-0 p-6 flex gap-4">
                                <span className="flex items-center gap-2 text-xs font-mono text-textDim">
                                    <div className="w-2 h-2 rounded-full bg-primary" /> Heart Rate
                                </span>
                                <span className="flex items-center gap-2 text-xs font-mono text-textDim">
                                    <div className="w-2 h-2 rounded-full bg-accent" /> Stress Load
                                </span>
                            </div>

                            <h4 className="text-sm font-display font-medium text-white mb-6">Real-time Stress Correlation</h4>

                            <ResponsiveContainer width="100%" height="85%">
                                <AreaChart data={Array.from({ length: 20 }, (_, i) => ({
                                    time: i,
                                    hr: worker.heart_rate_bpm + Math.random() * 10 - 5,
                                    stress: worker.stress_percent + Math.random() * 5 - 2
                                }))}>
                                    <defs>
                                        <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#252830" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#12141A', borderColor: '#252830', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff', fontSize: '12px' }}
                                    />
                                    <Area type="monotone" dataKey="hr" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorHr)" />
                                    <Area type="monotone" dataKey="stress" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorStress)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Right Column: CIS & Machine (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <h3 className="text-sm font-mono text-textDim uppercase tracking-widest pl-1">Risk Intelligence</h3>

                        {/* CIS Score Large Card */}
                        <div className="bg-gradient-to-b from-surfaceHighlight to-surface rounded-2xl p-8 border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
                                <Brain size={180} />
                            </div>

                            <div className="relative z-10 text-center">
                                <div className="text-sm font-bold text-textSecondary uppercase tracking-widest mb-4">Composite Score</div>
                                <div className="text-7xl font-display font-bold text-white mb-2 tracking-tight">
                                    {worker.cis_score}
                                </div>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-8
                                    ${worker.cis_risk_level === 'Critical' ? 'bg-critical/20 text-critical' :
                                        worker.cis_risk_level === 'Warning' ? 'bg-warning/20 text-warning' : 'bg-primary/20 text-primary'}`}>
                                    {worker.cis_risk_level} Risk
                                </div>

                                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${worker.cis_score > 0.7 ? 'bg-critical shadow-[0_0_15px_rgba(239,68,68,0.6)]' :
                                            worker.cis_score > 0.3 ? 'bg-warning' : 'bg-primary'
                                            }`}
                                        style={{ width: `${worker.cis_score * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <h3 className="text-sm font-mono text-textDim uppercase tracking-widest pl-1 mt-4">Assigned Asset</h3>
                        <MachineSummary machine={machine} />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default WorkerDetailModal;
