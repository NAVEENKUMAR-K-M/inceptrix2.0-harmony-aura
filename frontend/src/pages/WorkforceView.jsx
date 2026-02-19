import React, { useMemo } from 'react';
import { Users, Heart, Activity, Shield, Clock, AlertTriangle, Battery, User } from 'lucide-react';
import useRealtimeWorkers from '../hooks/useRealtimeWorkers';
import useRealtimeMachines from '../hooks/useRealtimeMachines';
import { calculateCIS } from '../utils/cisCalculator';
import { workerMappings } from '../utils/mappings';

const getRiskColor = (level) => {
    switch (level) {
        case 'Critical': return { text: 'text-critical', bg: 'bg-critical/10', border: 'border-critical/20', dot: 'bg-critical' };
        case 'Warning': return { text: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20', dot: 'bg-warning' };
        default: return { text: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', dot: 'bg-primary' };
    }
};

const WorkforceView = () => {
    const { workers, loading } = useRealtimeWorkers();
    const { machines } = useRealtimeMachines();

    const workerList = useMemo(() => {
        if (!workers) return [];
        return Object.entries(workers).map(([id, data]) => ({
            id,
            ...data,
            name: workerMappings[id] || id,
        }));
    }, [workers]);

    const stats = useMemo(() => {
        let critical = 0, warning = 0, safe = 0;
        let totalFatigue = 0, totalStress = 0, totalHR = 0;
        workerList.forEach(w => {
            const m = machines ? machines[w.assigned_machine] : null;
            const { level } = calculateCIS(w, m);
            if (level === 'Critical') critical++;
            else if (level === 'Warning') warning++;
            else safe++;
            totalFatigue += w.fatigue_percent || 0;
            totalStress += w.stress_percent || 0;
            totalHR += w.heart_rate_bpm || 0;
        });
        const n = workerList.length || 1;
        return { critical, warning, safe, total: workerList.length, avgFatigue: totalFatigue / n, avgStress: totalStress / n, avgHR: totalHR / n };
    }, [workerList, machines]);

    if (loading) {
        return <div className="flex items-center justify-center h-[60vh]"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-display font-bold text-white tracking-tight">Workforce Monitor</h2>
                <p className="text-textSecondary mt-1">Team health, fatigue, and safety readiness overview.</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                    { icon: Users, label: 'Active Crew', value: stats.total, sub: `${stats.critical} critical`, color: 'text-primary' },
                    { icon: Heart, label: 'Avg Heart Rate', value: `${stats.avgHR.toFixed(0)}`, sub: 'BPM', color: 'text-rose-400' },
                    { icon: Battery, label: 'Avg Fatigue', value: `${stats.avgFatigue.toFixed(1)}%`, sub: stats.avgFatigue > 50 ? 'Elevated' : 'Normal', color: stats.avgFatigue > 50 ? 'text-warning' : 'text-primary' },
                    { icon: Activity, label: 'Avg Stress', value: `${stats.avgStress.toFixed(1)}%`, sub: stats.avgStress > 40 ? 'High' : 'Manageable', color: stats.avgStress > 40 ? 'text-critical' : 'text-primary' },
                ].map((stat, i) => (
                    <div key={i} className="bg-surface/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <stat.icon size={14} className="text-textDim" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-textDim">{stat.label}</span>
                        </div>
                        <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs text-textDim mt-1">{stat.sub}</div>
                    </div>
                ))}
            </div>

            {/* Worker Table */}
            <div className="bg-surface/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Individual Status</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 text-textDim text-[10px] uppercase tracking-widest">
                                <th className="text-left px-5 py-3 font-semibold">Worker</th>
                                <th className="text-left px-3 py-3 font-semibold">HR</th>
                                <th className="text-left px-3 py-3 font-semibold">Fatigue</th>
                                <th className="text-left px-3 py-3 font-semibold">Stress</th>
                                <th className="text-left px-3 py-3 font-semibold">CIS</th>
                                <th className="text-left px-3 py-3 font-semibold">Risk</th>
                                <th className="text-left px-3 py-3 font-semibold">Machine</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workerList.sort((a, b) => (b.cis_score || 0) - (a.cis_score || 0)).map((w) => {
                                const m = machines ? machines[w.assigned_machine] : null;
                                const { level } = calculateCIS(w, m);
                                const rc = getRiskColor(level);
                                return (
                                    <tr key={w.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                        <td className="px-5 py-3 font-medium text-white flex items-center gap-2">
                                            <User size={14} className="text-textDim" />
                                            {w.name}
                                        </td>
                                        <td className="px-3 py-3 font-mono text-rose-400">{w.heart_rate_bpm}</td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.min(100, w.fatigue_percent)}%` }} />
                                                </div>
                                                <span className="text-textSecondary font-mono text-xs">{w.fatigue_percent?.toFixed(1)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-purple-400 rounded-full" style={{ width: `${Math.min(100, w.stress_percent)}%` }} />
                                                </div>
                                                <span className="text-textSecondary font-mono text-xs">{w.stress_percent?.toFixed(1)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 font-mono font-bold text-white">{w.cis_score?.toFixed(2)}</td>
                                        <td className="px-3 py-3">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${rc.bg} ${rc.text} ${rc.border} border`}>
                                                {level}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-textDim text-xs">{w.assigned_machine}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WorkforceView;
