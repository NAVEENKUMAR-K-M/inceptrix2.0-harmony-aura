import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Heart, Activity, Cpu, AlertTriangle, Zap } from 'lucide-react';
import StatusBadge from './StatusBadge';
import CISGauge from './CISGauge';
import { getWorkerName, getMachineName } from '../utils/mappings';

const WorkerCard = ({ worker, machine, onClick, index }) => {
    const cardRef = useRef(null);
    const { worker_id, cis_score, cis_risk_level, heart_rate_bpm, fatigue_percent } = worker;

    // GSAP Entry Animation
    useEffect(() => {
        gsap.fromTo(cardRef.current,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.6, delay: index * 0.05, ease: "power3.out" }
        );
    }, [index]);

    // Hover Animation
    const handleMouseEnter = () => {
        gsap.to(cardRef.current, { scale: 1.02, y: -5, duration: 0.3, ease: "power2.out" });
    };

    const handleMouseLeave = () => {
        gsap.to(cardRef.current, { scale: 1, y: 0, duration: 0.3, ease: "power2.out" });
    };

    // Determine styles based on risk
    const isCritical = cis_risk_level === 'Critical';
    const isWarning = cis_risk_level === 'Warning';

    let borderClass = 'border-white/5 hover:border-primary/50';
    let glowEffect = '';

    if (isCritical) {
        borderClass = 'border-critical/50 hover:border-critical';
        glowEffect = 'shadow-[0_0_30px_rgba(239,68,68,0.15)]';
    } else if (isWarning) {
        borderClass = 'border-warning/30 hover:border-warning';
    }

    return (
        <div
            ref={cardRef}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`cursor-pointer glass-panel rounded-[var(--radius-card)] p-6 relative overflow-hidden group transition-colors duration-300 ${borderClass} ${glowEffect}`}
        >
            {/* Background Mesh Gradient (Subtle) */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-lg 
                        ${isCritical ? 'bg-critical/20 text-critical shadow-[0_0_15px_rgba(239,68,68,0.4)]' :
                            isWarning ? 'bg-warning/20 text-warning' : 'bg-primary/20 text-primary'}`}>
                        {worker_id.replace('W', '')}
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-white tracking-tight leading-none text-lg">
                            {getWorkerName(worker_id)}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-textSecondary font-mono max-w-[150px] truncate">
                            <Cpu size={10} />
                            <span>{machine ? getMachineName(machine.machine_id) : 'IDLE'}</span>
                        </div>
                    </div>
                </div>
                <StatusBadge status={cis_risk_level} />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                {/* Heart Rate */}
                <div className="bg-surface/50 rounded-xl p-3 border border-white/5 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                        <Heart size={14} className={heart_rate_bpm > 110 ? "text-critical animate-pulse" : "text-primary"} />
                        <span className="text-[10px] text-textSecondary uppercase tracking-wider">Heart Rate</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-display font-bold text-white">{heart_rate_bpm}</span>
                        <span className="text-xs text-textDim">BPM</span>
                    </div>
                </div>

                {/* Fatigue */}
                <div className="bg-surface/50 rounded-xl p-3 border border-white/5 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                        <Activity size={14} className={fatigue_percent > 80 ? "text-critical" : "text-warning"} />
                        <span className="text-[10px] text-textSecondary uppercase tracking-wider">Fatigue</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-display font-bold text-white">{fatigue_percent}</span>
                        <span className="text-xs text-textDim">%</span>
                    </div>
                </div>
            </div>

            {/* Footer / CIS Score */}
            <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex flex-col">
                    <span className="text-[10px] text-textDim uppercase tracking-widest mb-1">CIS Risk Score</span>
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-surfaceHighlight rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${isCritical ? 'bg-critical' : isWarning ? 'bg-warning' : 'bg-primary'}`}
                                style={{ width: `${cis_score * 100}%` }}
                            />
                        </div>
                        <span className={`font-mono text-sm font-bold ${isCritical ? 'text-critical' : isWarning ? 'text-warning' : 'text-primary'}`}>
                            {cis_score.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Machine Load Mini-Indicator */}
                <div className="text-right">
                    <div className="flex items-center gap-1 justify-end text-[10px] text-textDim uppercase tracking-widest mb-1">
                        <Zap size={10} /> Load
                    </div>
                    <span className="font-mono text-sm text-white">{machine?.engine_load || 0}%</span>
                </div>
            </div>

            {/* Critical Alert Overlay */}
            {isCritical && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-critical/20 to-transparent blur-xl pointer-events-none" />
            )}
        </div>
    );
};

export default WorkerCard;
