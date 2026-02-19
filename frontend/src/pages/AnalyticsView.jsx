import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, ShieldCheck, Zap, AlertTriangle, Gauge } from 'lucide-react';
import useRealtimeWorkers from '../hooks/useRealtimeWorkers';
import useRealtimeMachines from '../hooks/useRealtimeMachines';
import useRealtimeEnvironment from '../hooks/useRealtimeEnvironment';
import { calculateCIS } from '../utils/cisCalculator';

/* Radial Gauge (SVG-based) */
const RadialGauge = ({ value, max = 100, label, color, size = 120 }) => {
    const pct = Math.min(value / max, 1);
    const r = (size - 12) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - pct * 0.75); // 270° arc

    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Background arc */}
                <circle
                    cx={size / 2} cy={size / 2} r={r}
                    fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"
                    strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
                    strokeDashoffset={0}
                    transform={`rotate(135 ${size / 2} ${size / 2})`}
                    strokeLinecap="round"
                />
                {/* Value arc */}
                <circle
                    cx={size / 2} cy={size / 2} r={r}
                    fill="none" stroke={color} strokeWidth="6"
                    strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
                    strokeDashoffset={offset}
                    transform={`rotate(135 ${size / 2} ${size / 2})`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
                <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fill="white" fontSize="20" fontWeight="800" fontFamily="monospace">
                    {value.toFixed(0)}
                </text>
                <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fill="rgba(148,163,184,0.7)" fontSize="9" fontWeight="600" letterSpacing="0.5">
                    {label}
                </text>
            </svg>
        </div>
    );
};

/* Distribution Bar */
const DistributionBar = ({ segments, labels }) => (
    <div>
        <div className="flex h-4 rounded-full overflow-hidden bg-white/5">
            {segments.map((seg, i) => (
                <div key={i} className="transition-all duration-700" style={{ width: `${seg.pct}%`, backgroundColor: seg.color }} />
            ))}
        </div>
        <div className="flex justify-between mt-2">
            {labels.map((l, i) => (
                <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: segments[i]?.color }} />
                    <span className="text-[10px] text-textDim font-semibold">{l}: {segments[i]?.count}</span>
                </div>
            ))}
        </div>
    </div>
);

const AnalyticsView = () => {
    const { workers } = useRealtimeWorkers();
    const { machines } = useRealtimeMachines();
    const envData = useRealtimeEnvironment();

    const analytics = useMemo(() => {
        if (!workers || !machines) return null;

        const workerList = Object.entries(workers).map(([id, d]) => ({ id, ...d }));
        const machineList = Object.entries(machines).map(([id, d]) => ({ id, ...d }));

        // Worker stats
        let critW = 0, warnW = 0, safeW = 0;
        let totalFatigue = 0, totalStress = 0;
        workerList.forEach(w => {
            const m = machines[w.assigned_machine];
            const { level } = calculateCIS(w, m);
            if (level === 'Critical') critW++;
            else if (level === 'Warning') warnW++;
            else safeW++;
            totalFatigue += w.fatigue_percent || 0;
            totalStress += w.stress_percent || 0;
        });
        const n = workerList.length || 1;

        // Machine stats
        let totalLoad = 0, totalStress_m = 0, totalTemp = 0;
        machineList.forEach(m => {
            totalLoad += m.engine_load || 0;
            totalStress_m += m.stress_index || 0;
            totalTemp += m.coolant_temp || 0;
        });
        const nm = machineList.length || 1;

        // Fleet efficiency = 100 - avg stress
        const fleetEfficiency = Math.max(0, 100 - (totalStress_m / nm));
        // Safety compliance = safe workers %
        const safetyCompliance = (safeW / n) * 100;
        // Thermal risk
        const avgTemp = totalTemp / nm;

        return {
            fleetEfficiency,
            safetyCompliance,
            avgFatigue: totalFatigue / n,
            avgStress: totalStress / n,
            avgLoad: totalLoad / nm,
            avgMachineStress: totalStress_m / nm,
            avgTemp,
            workerDist: { crit: critW, warn: warnW, safe: safeW, total: n },
            machineCount: nm,
        };
    }, [workers, machines]);

    if (!analytics) {
        return <div className="flex items-center justify-center h-[60vh]"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-display font-bold text-white tracking-tight">Analytics</h2>
                <p className="text-textSecondary mt-1">Aggregated fleet performance and safety compliance metrics.</p>
            </div>

            {/* Gauges Row */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-surface/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 flex flex-col items-center">
                    <RadialGauge value={analytics.fleetEfficiency} label="FLEET EFFICIENCY" color="#06D6A0" />
                </div>
                <div className="bg-surface/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 flex flex-col items-center">
                    <RadialGauge value={analytics.safetyCompliance} label="SAFETY COMPLIANCE" color={analytics.safetyCompliance > 80 ? '#22C55E' : analytics.safetyCompliance > 50 ? '#FBBF24' : '#EF4444'} />
                </div>
                <div className="bg-surface/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 flex flex-col items-center">
                    <RadialGauge value={analytics.avgLoad} label="AVG LOAD" color="#3B82F6" />
                </div>
                <div className="bg-surface/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 flex flex-col items-center">
                    <RadialGauge value={analytics.avgTemp} max={130} label="AVG COOLANT TEMP" color={analytics.avgTemp > 100 ? '#EF4444' : '#F97316'} />
                </div>
            </div>

            {/* Distribution & Details */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Workforce Risk Distribution */}
                <div className="bg-surface/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <ShieldCheck size={16} className="text-primary" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Workforce Risk Distribution</h3>
                    </div>
                    <DistributionBar
                        segments={[
                            { pct: (analytics.workerDist.crit / analytics.workerDist.total) * 100, color: '#EF4444', count: analytics.workerDist.crit },
                            { pct: (analytics.workerDist.warn / analytics.workerDist.total) * 100, color: '#FBBF24', count: analytics.workerDist.warn },
                            { pct: (analytics.workerDist.safe / analytics.workerDist.total) * 100, color: '#22C55E', count: analytics.workerDist.safe },
                        ]}
                        labels={['Critical', 'Warning', 'Safe']}
                    />

                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                            <div className="text-[9px] font-bold uppercase tracking-widest text-textDim mb-1">Avg Fatigue</div>
                            <div className="text-xl font-bold font-mono text-amber-400">{analytics.avgFatigue.toFixed(1)}%</div>
                        </div>
                        <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                            <div className="text-[9px] font-bold uppercase tracking-widest text-textDim mb-1">Avg Stress</div>
                            <div className="text-xl font-bold font-mono text-purple-400">{analytics.avgStress.toFixed(1)}%</div>
                        </div>
                    </div>
                </div>

                {/* Environment Snapshot */}
                <div className="bg-surface/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap size={16} className="text-cyan-400" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Fleet & Environment Insights</h3>
                    </div>

                    <div className="space-y-3">
                        {[
                            { label: 'Fleet Stress Index', value: `${analytics.avgMachineStress.toFixed(1)}%`, color: analytics.avgMachineStress > 60 ? 'text-critical' : 'text-primary', icon: Gauge },
                            { label: 'Ambient Temperature', value: `${envData?.ambient_temp_c?.toFixed(1) || '--'}°C`, color: (envData?.ambient_temp_c || 0) > 38 ? 'text-critical' : 'text-cyan-400', icon: TrendingUp },
                            { label: 'Humidity', value: `${envData?.humidity_pct?.toFixed(0) || '--'}%`, color: (envData?.humidity_pct || 0) > 70 ? 'text-warning' : 'text-blue-400', icon: BarChart3 },
                            { label: 'Weather Condition', value: envData?.weather || 'Clear', color: envData?.weather === 'Heatwave' ? 'text-orange-400' : envData?.weather === 'Rain' ? 'text-blue-400' : 'text-green-400', icon: AlertTriangle },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between bg-white/[0.02] rounded-xl px-4 py-3 border border-white/[0.04]">
                                <div className="flex items-center gap-2">
                                    <item.icon size={13} className="text-textDim" />
                                    <span className="text-xs text-textSecondary font-medium">{item.label}</span>
                                </div>
                                <span className={`text-sm font-bold font-mono ${item.color}`}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsView;
