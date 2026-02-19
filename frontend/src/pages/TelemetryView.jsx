import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Activity, Gauge, Thermometer, Cpu } from 'lucide-react';
import useRealtimeMachines from '../hooks/useRealtimeMachines';
import { machineMappings } from '../utils/mappings';

const MAX_HISTORY = 60; // 60 data points = ~60s of history

const METRICS = [
    { key: 'engine_rpm', label: 'Engine RPM', icon: Gauge, unit: '', color: '#06D6A0', warnThreshold: 2500 },
    { key: 'engine_load', label: 'Engine Load', icon: Cpu, unit: '%', color: '#3B82F6', warnThreshold: 80 },
    { key: 'coolant_temp', label: 'Coolant Temp', icon: Thermometer, unit: '°C', color: '#F97316', warnThreshold: 100 },
    { key: 'vibration_mm_s', label: 'Vibration', icon: Activity, unit: ' mm/s', color: '#A855F7', warnThreshold: 8 },
];

/* Mini sparkline chart using canvas */
const Sparkline = ({ data, color, warn, height = 48 }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || data.length < 2) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        const min = Math.min(...data) * 0.95;
        const max = Math.max(...data) * 1.05 || 1;
        const range = max - min || 1;

        // Warn zone
        if (warn != null) {
            const wy = h - ((warn - min) / range) * h;
            ctx.strokeStyle = 'rgba(239,68,68,0.15)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(0, wy);
            ctx.lineTo(w, wy);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Line
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.lineJoin = 'round';
        data.forEach((v, i) => {
            const x = (i / (data.length - 1)) * w;
            const y = h - ((v - min) / range) * h;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Gradient fill
        const lastX = w;
        const lastY = h - ((data[data.length - 1] - min) / range) * h;
        ctx.lineTo(lastX, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, color + '20');
        grad.addColorStop(1, color + '00');
        ctx.fillStyle = grad;
        ctx.fill();
    }, [data, color, warn, height]);

    return <canvas ref={canvasRef} width={200} height={height} className="w-full" />;
};

const TelemetryView = () => {
    const { machines } = useRealtimeMachines();
    const [history, setHistory] = useState({});

    // Accumulate history
    useEffect(() => {
        if (!machines) return;
        setHistory(prev => {
            const next = { ...prev };
            for (const [mid, mData] of Object.entries(machines)) {
                if (!next[mid]) next[mid] = {};
                for (const metric of METRICS) {
                    if (!next[mid][metric.key]) next[mid][metric.key] = [];
                    const arr = [...next[mid][metric.key], mData[metric.key] ?? 0];
                    next[mid][metric.key] = arr.slice(-MAX_HISTORY);
                }
            }
            return next;
        });
    }, [machines]);

    const machineList = useMemo(() => {
        if (!machines) return [];
        return Object.entries(machines).map(([id, data]) => ({
            id,
            name: machineMappings[id] || id,
            ...data,
        })).sort((a, b) => (b.stress_index || 0) - (a.stress_index || 0));
    }, [machines]);

    if (machineList.length === 0) {
        return <div className="flex items-center justify-center h-[60vh] text-textDim">Waiting for machine telemetry...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-display font-bold text-white tracking-tight">Live Telemetry</h2>
                <p className="text-textSecondary mt-1">Real-time sensor feeds across all fleet assets.</p>
            </div>

            {machineList.map((machine) => {
                const mh = history[machine.id] || {};
                const stressColor = machine.stress_index >= 70 ? 'text-critical' : machine.stress_index >= 40 ? 'text-warning' : 'text-primary';

                return (
                    <div key={machine.id} className="bg-surface/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
                        {/* Machine Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-white font-semibold">{machine.name}</h3>
                                <span className="text-textDim text-xs">{machine.machine_type} • {machine.id} • {machine.operating_mode}</span>
                            </div>
                            <div className="text-right">
                                <div className={`text-lg font-bold font-mono ${stressColor}`}>{machine.stress_index?.toFixed(1)}%</div>
                                <div className="text-[10px] text-textDim uppercase tracking-wider">Stress</div>
                            </div>
                        </div>

                        {/* Metric Sparklines */}
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                            {METRICS.map((metric) => {
                                const val = machine[metric.key];
                                const data = mh[metric.key] || [];
                                const isWarn = val > metric.warnThreshold;
                                return (
                                    <div key={metric.key} className={`rounded-xl p-3 border ${isWarn ? 'bg-critical/5 border-critical/20' : 'bg-white/[0.02] border-white/[0.04]'}`}>
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <metric.icon size={11} className="text-textDim" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-textDim">{metric.label}</span>
                                        </div>
                                        <div className={`text-lg font-bold font-mono ${isWarn ? 'text-critical' : 'text-white'}`}>
                                            {typeof val === 'number' ? val.toFixed(1) : val}{metric.unit}
                                        </div>
                                        <div className="mt-2">
                                            <Sparkline data={data} color={isWarn ? '#EF4444' : metric.color} warn={metric.warnThreshold} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TelemetryView;
