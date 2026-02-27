import React, { useState, useEffect, useRef } from 'react';
import {
    Cpu, Heart, Thermometer, Droplets, Wind, Activity, Gauge,
    Wifi, WifiOff, Radio, Shield, AlertTriangle, TrendingDown,
    Zap, BarChart3, CircuitBoard, Server, ArrowRight, ChevronRight,
    Lock, LockOpen, ShieldAlert
} from 'lucide-react';
import useRealtimeIoT from '../hooks/useRealtimeIoT';

// ═══════════════════════════════════════════════════
//  Reusable Sub-Components
// ═══════════════════════════════════════════════════

const GlassCard = ({ children, className = '', glow = '' }) => (
    <div className={`bg-surface/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl
                     shadow-[0_0_60px_rgba(0,0,0,0.3)] ${glow} ${className}`}>
        {children}
    </div>
);

const SectionLabel = ({ icon: Icon, label, accentColor = 'text-primary' }) => (
    <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${accentColor === 'text-primary' ? 'bg-primary' : accentColor === 'text-cyan-400' ? 'bg-cyan-400' : 'bg-indigo-400'} animate-pulse`} />
        <Icon size={14} className={accentColor} />
        <span className="text-xs font-mono text-textDim uppercase tracking-wider">{label}</span>
    </div>
);

const StatPill = ({ label, value, unit = '', color = 'text-white', icon: Icon }) => (
    <div className="flex items-center justify-between py-2.5 px-1 border-b border-white/[0.04] last:border-0">
        <div className="flex items-center gap-2">
            {Icon && <Icon size={13} className="text-textDim" />}
            <span className="text-xs text-textSecondary font-medium">{label}</span>
        </div>
        <span className={`text-sm font-bold font-mono ${color}`}>
            {value}<span className="text-[10px] text-textDim ml-1">{unit}</span>
        </span>
    </div>
);

const DeviceStatusBadge = ({ online, label }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-500
        ${online
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : 'bg-red-500/10 border-red-500/30'
        }`}>
        <div className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
        {online ? <Wifi size={12} className="text-emerald-400" /> : <WifiOff size={12} className="text-red-400" />}
        <span className={`text-[10px] font-bold uppercase tracking-wider ${online ? 'text-emerald-400' : 'text-red-400'}`}>
            {label}: {online ? 'ONLINE' : 'OFFLINE'}
        </span>
    </div>
);

// ── CIS Gauge (circular) ──
const CISGaugeRing = ({ score, level }) => {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const progress = circumference - (score * circumference);

    const levelColor = level === 'Critical' ? '#EF4444' : level === 'Warning' ? '#F59E0B' : '#10B981';
    const levelGlow = level === 'Critical' ? 'rgba(239,68,68,0.4)' : level === 'Warning' ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)';

    return (
        <div className="relative flex items-center justify-center">
            <svg width="140" height="140" className="transform -rotate-90">
                {/* Background ring */}
                <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                {/* Progress ring */}
                <circle
                    cx="70" cy="70" r={radius} fill="none"
                    stroke={levelColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={progress}
                    style={{
                        transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.5s ease',
                        filter: `drop-shadow(0 0 8px ${levelGlow})`
                    }}
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold font-mono text-white" style={{ color: levelColor }}>
                    {(score * 100).toFixed(0)}
                </span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-textDim">CIS Score</span>
            </div>
        </div>
    );
};

// ── PdM Health Bar ──
const PdMHealthBar = ({ health, status }) => {
    const barColor = health >= 80 ? 'bg-emerald-500' : health >= 50 ? 'bg-amber-500' : health >= 20 ? 'bg-orange-500' : 'bg-red-500';
    const glowColor = health >= 80 ? 'shadow-emerald-500/30' : health >= 50 ? 'shadow-amber-500/30' : 'shadow-red-500/30';

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-xs text-textSecondary font-medium">Machine Health</span>
                <span className={`text-xs font-bold uppercase tracking-wider ${health >= 80 ? 'text-emerald-400' : health >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                    {status}
                </span>
            </div>
            <div className="w-full h-3 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${barColor} shadow-lg ${glowColor} transition-all duration-700 ease-out`}
                    style={{ width: `${health}%` }}
                />
            </div>
            <div className="text-right">
                <span className="text-lg font-bold font-mono text-white">{health.toFixed(1)}%</span>
            </div>
        </div>
    );
};

// ── Sparkline (simple array visualization) ──
const MiniSparkline = ({ data = [], color = '#10B981', height = 32 }) => {
    if (data.length < 2) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const w = 120;

    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = height - ((v - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={w} height={height} className="opacity-60">
            <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
        </svg>
    );
};

// ═══════════════════════════════════════════════════
//  MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════

const IoTOperations = () => {
    const { vitals, edgeIntelligence, deviceStatus, loading, securityStatus } = useRealtimeIoT();

    // E2EE status
    const isE2EE = securityStatus.vitalsEncrypted || securityStatus.edgeEncrypted;
    const isTampered = securityStatus.tamperDetected;

    // History buffer for sparklines (last 30 readings)
    const hrHistoryRef = useRef([]);
    const cisHistoryRef = useRef([]);
    const [hrHistory, setHrHistory] = useState([]);
    const [cisHistory, setCisHistory] = useState([]);

    useEffect(() => {
        if (vitals?.heart_rate_bpm) {
            hrHistoryRef.current = [...hrHistoryRef.current.slice(-29), vitals.heart_rate_bpm];
            setHrHistory([...hrHistoryRef.current]);
        }
    }, [vitals?.heart_rate_bpm]);

    useEffect(() => {
        if (edgeIntelligence?.cis_score != null) {
            cisHistoryRef.current = [...cisHistoryRef.current.slice(-29), edgeIntelligence.cis_score * 100];
            setCisHistory([...cisHistoryRef.current]);
        }
    }, [edgeIntelligence?.cis_score]);

    // Derive device online status
    const wearableOnline = !!vitals;
    const edgeOnline = !!edgeIntelligence;

    // Safe data access
    const hr = vitals?.heart_rate_bpm ?? '--';
    const bodyTemp = vitals?.body_temp_c ?? '--';
    const humidity = vitals?.ambient_humidity_pct ?? '--';
    const gasPPM = vitals?.gas_ppm ?? '--';
    const vibrationG = vitals?.vibration_g ?? '--';
    const tiltAngle = vitals?.tilt_angle_deg ?? '--';
    const accelX = vitals?.accel_x ?? 0;
    const accelY = vitals?.accel_y ?? 0;
    const accelZ = vitals?.accel_z ?? 0;
    const wifiRSSI = vitals?.wifi_rssi ?? '--';

    const cisScore = edgeIntelligence?.cis_score ?? 0;
    const cisLevel = edgeIntelligence?.cis_risk_level ?? 'Safe';
    const pdmHealth = edgeIntelligence?.pdm_health_score ?? 100;
    const pdmStatus = edgeIntelligence?.pdm_status ?? 'Healthy';
    const estFatigue = edgeIntelligence?.fatigue_estimated ?? 0;
    const estStress = edgeIntelligence?.stress_estimated ?? 0;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                <span className="text-sm font-mono text-textDim">Initializing IoT Uplink...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* ══ Page Header ══ */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
                        <CircuitBoard size={28} className="text-cyan-400" />
                        IoT Operations
                    </h2>
                    <p className="text-textSecondary mt-1">
                        Physical sensor telemetry &amp; edge-computed intelligence.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* E2EE Security Badge */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-500
                        ${isTampered ? 'bg-red-500/15 border-red-500/40' :
                            isE2EE ? 'bg-emerald-500/10 border-emerald-500/30' :
                                'bg-white/[0.03] border-white/[0.06]'}`}>
                        {isTampered ? <ShieldAlert size={12} className="text-red-400 animate-pulse" /> :
                            isE2EE ? <Lock size={12} className="text-emerald-400" /> :
                                <LockOpen size={12} className="text-textDim" />}
                        <span className={`text-[10px] font-bold uppercase tracking-wider
                            ${isTampered ? 'text-red-400' : isE2EE ? 'text-emerald-400' : 'text-textDim'}`}>
                            {isTampered ? 'TAMPER!' : isE2EE ? 'AES-256 E2EE' : 'UNENCRYPTED'}
                        </span>
                    </div>
                    <DeviceStatusBadge online={wearableOnline} label="Wearable" />
                    <DeviceStatusBadge online={edgeOnline} label="Edge S3" />
                </div>
            </div>

            {/* ══ Data Flow Indicator ══ */}
            <GlassCard className="p-4">
                <div className="flex items-center justify-center gap-4 text-textDim">
                    <div className="flex items-center gap-2">
                        <Radio size={14} className={wearableOnline ? 'text-cyan-400 animate-pulse' : 'text-textDim'} />
                        <span className="text-xs font-mono">ESP32 Wearable</span>
                    </div>
                    <ChevronRight size={14} className="text-white/20" />
                    {isE2EE && <Lock size={10} className="text-emerald-400" />}
                    <div className="flex items-center gap-2">
                        <Server size={14} className="text-amber-400" />
                        <span className="text-xs font-mono">Firebase RTDB</span>
                        {isE2EE && <span className="text-[8px] text-emerald-400/60 font-mono">(encrypted)</span>}
                    </div>
                    {isE2EE && <Lock size={10} className="text-emerald-400" />}
                    <ChevronRight size={14} className="text-white/20" />
                    <div className="flex items-center gap-2">
                        <Cpu size={14} className={edgeOnline ? 'text-indigo-400 animate-pulse' : 'text-textDim'} />
                        <span className="text-xs font-mono">ESP32-S3 Edge</span>
                    </div>
                    <ChevronRight size={14} className="text-white/20" />
                    <div className="flex items-center gap-2">
                        <BarChart3 size={14} className="text-primary" />
                        <span className="text-xs font-mono">This Dashboard</span>
                    </div>
                </div>
            </GlassCard>

            {/* ══ Main Grid ══ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── Column 1: Wearable Raw Sensors ── */}
                <GlassCard className="p-6">
                    <SectionLabel icon={Radio} label="Live Wearable Telemetry" accentColor="text-cyan-400" />

                    {/* Heart Rate Hero */}
                    <div className="bg-gradient-to-br from-red-500/10 to-transparent rounded-xl p-4 mb-4 border border-red-500/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Heart size={16} className="text-red-400 animate-pulse" />
                                    <span className="text-xs text-textDim font-mono uppercase">Heart Rate</span>
                                </div>
                                <div className="text-4xl font-bold font-mono text-red-400">
                                    {hr}<span className="text-sm text-textDim ml-1">BPM</span>
                                </div>
                            </div>
                            <MiniSparkline data={hrHistory} color="#EF4444" height={40} />
                        </div>
                    </div>

                    {/* Other Sensors */}
                    <div className="space-y-0">
                        <StatPill icon={Thermometer} label="Body Temperature" value={bodyTemp} unit="°C"
                            color={bodyTemp !== '--' && bodyTemp > 37 ? 'text-amber-400' : 'text-white'} />
                        <StatPill icon={Droplets} label="Ambient Humidity" value={humidity} unit="%" color="text-cyan-400" />
                        <StatPill icon={Wind} label="Gas Level" value={gasPPM} unit="PPM"
                            color={gasPPM !== '--' && gasPPM > 500 ? 'text-red-400' : 'text-white'} />
                        <StatPill icon={Activity} label="Vibration" value={vibrationG} unit="g" color="text-white" />
                        <StatPill icon={Gauge} label="Tilt Angle" value={tiltAngle} unit="°"
                            color={tiltAngle !== '--' && Math.abs(tiltAngle) > 45 ? 'text-amber-400' : 'text-white'} />
                    </div>

                    {/* Accelerometer Mini-Display */}
                    <div className="mt-4 pt-4 border-t border-white/[0.04]">
                        <span className="text-[10px] font-mono text-textDim uppercase tracking-wider">Accelerometer (g)</span>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            {[['X', accelX, 'text-red-400'], ['Y', accelY, 'text-green-400'], ['Z', accelZ, 'text-blue-400']].map(([axis, val, color]) => (
                                <div key={axis} className="text-center bg-white/[0.03] rounded-lg py-2">
                                    <span className={`text-[10px] font-mono ${color}`}>{axis}</span>
                                    <div className={`text-sm font-bold font-mono ${color}`}>{typeof val === 'number' ? val.toFixed(2) : val}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* WiFi Signal */}
                    <div className="mt-4 pt-3 border-t border-white/[0.04]">
                        <StatPill icon={Wifi} label="WiFi Signal" value={wifiRSSI} unit="dBm"
                            color={wifiRSSI !== '--' && wifiRSSI > -60 ? 'text-emerald-400' : 'text-amber-400'} />
                    </div>
                </GlassCard>

                {/* ── Column 2: Edge Intelligence ── */}
                <GlassCard className={`p-6 ${cisLevel === 'Critical' ? 'shadow-[0_0_30px_rgba(239,68,68,0.15)]' : ''}`}>
                    <SectionLabel icon={Cpu} label="Edge Intelligence (On-Device)" accentColor="text-indigo-400" />

                    {/* CIS Score Gauge */}
                    <div className="flex justify-center mb-6">
                        <CISGaugeRing score={cisScore} level={cisLevel} />
                    </div>

                    {/* Risk Level Badge */}
                    <div className="flex justify-center mb-6">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border
                            ${cisLevel === 'Critical' ? 'bg-red-500/15 text-red-400 border-red-500/30 animate-pulse' :
                                cisLevel === 'Warning' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                                    'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'}`}
                        >
                            {cisLevel === 'Critical' && <AlertTriangle size={12} className="inline mr-1.5 -mt-0.5" />}
                            {cisLevel}
                        </span>
                    </div>

                    {/* CIS Sparkline */}
                    {cisHistory.length > 1 && (
                        <div className="flex justify-center mb-4">
                            <MiniSparkline data={cisHistory}
                                color={cisLevel === 'Critical' ? '#EF4444' : cisLevel === 'Warning' ? '#F59E0B' : '#10B981'}
                                height={28} />
                        </div>
                    )}

                    {/* Breakdown */}
                    <div className="space-y-0">
                        <StatPill icon={TrendingDown} label="Estimated Fatigue" value={estFatigue.toFixed(1)} unit="%" color="text-amber-400" />
                        <StatPill icon={Zap} label="Estimated Stress" value={estStress.toFixed(1)} unit="%" color="text-orange-400" />
                        <StatPill icon={Gauge} label="Machine Stress Input" value={edgeIntelligence?.input_machine_stress?.toFixed(1) ?? '--'} unit="" color="text-textSecondary" />
                        <StatPill icon={Activity} label="Machine Load Input" value={edgeIntelligence?.input_machine_load?.toFixed(1) ?? '--'} unit="%" color="text-textSecondary" />
                    </div>

                    {/* Computation Badge */}
                    <div className="mt-5 pt-4 border-t border-white/[0.04] flex items-center justify-center gap-2">
                        <CircuitBoard size={12} className="text-indigo-400" />
                        <span className="text-[10px] font-mono text-indigo-400/70 uppercase tracking-widest">
                            Computed On-Device • {edgeIntelligence?.computed_on ?? 'ESP32-S3'}
                        </span>
                    </div>
                </GlassCard>

                {/* ── Column 3: PdM + System Health ── */}
                <GlassCard className="p-6">
                    <SectionLabel icon={Shield} label="Predictive Maintenance (Edge)" accentColor="text-primary" />

                    {/* PdM Health Bar */}
                    <div className="mb-6">
                        <PdMHealthBar health={pdmHealth} status={pdmStatus} />
                    </div>

                    {/* PdM Factors */}
                    <div className="bg-white/[0.02] rounded-xl p-4 mb-6 border border-white/[0.04]">
                        <span className="text-[10px] font-mono text-textDim uppercase tracking-wider mb-3 block">Health Factors</span>
                        <div className="space-y-3">
                            {[
                                { label: 'Engine Load', value: edgeIntelligence?.input_machine_load, max: 100, warn: 80 },
                                { label: 'Coolant Temp', value: vitals?.body_temp_c, max: 120, warn: 85 },
                                { label: 'Vibration', value: vitals?.vibration_g, max: 16, warn: 6 },
                            ].map(({ label, value, max, warn }) => {
                                const pct = value ? Math.min(100, (value / max) * 100) : 0;
                                const isWarning = value && value > warn;
                                return (
                                    <div key={label}>
                                        <div className="flex justify-between text-[11px] mb-1">
                                            <span className="text-textDim">{label}</span>
                                            <span className={isWarning ? 'text-amber-400 font-bold' : 'text-textSecondary'}>
                                                {value?.toFixed(1) ?? '--'}
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${isWarning ? 'bg-amber-500' : 'bg-primary/60'}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="space-y-0">
                        <div className="text-[10px] font-mono text-textDim uppercase tracking-wider mb-2">System Status</div>
                        <StatPill icon={Cpu} label="Wearable Uptime" value={vitals?.uptime_s ? `${Math.floor(vitals.uptime_s / 60)}m ${vitals.uptime_s % 60}s` : '--'} color="text-textSecondary" />
                        <StatPill icon={Server} label="Edge Feed" value={edgeIntelligence?.machine_feed_active ? 'Active' : 'Idle'} color={edgeIntelligence?.machine_feed_active ? 'text-emerald-400' : 'text-textDim'} />
                        <StatPill icon={Radio} label="Wearable Link" value={edgeIntelligence?.wearable_connected ? 'Connected' : 'Disconnected'} color={edgeIntelligence?.wearable_connected ? 'text-emerald-400' : 'text-red-400'} />
                    </div>
                </GlassCard>
            </div>

            {/* ══ No Data Fallback ══ */}
            {!wearableOnline && !edgeOnline && (
                <GlassCard className="p-8">
                    <div className="flex flex-col items-center justify-center text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center">
                            <WifiOff size={28} className="text-textDim" />
                        </div>
                        <div>
                            <h3 className="text-lg font-display font-bold text-white mb-1">No IoT Devices Detected</h3>
                            <p className="text-sm text-textSecondary max-w-md">
                                Ensure the ESP32 Wearable and ESP32-S3 Edge modules are powered on,
                                connected to WiFi, and configured with the correct Firebase credentials.
                            </p>
                        </div>
                        <div className="flex gap-3 mt-2">
                            <div className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono text-textDim">
                                Wearable → site/iot/vitals
                            </div>
                            <div className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono text-textDim">
                                Edge → site/iot/edge_intelligence
                            </div>
                        </div>
                    </div>
                </GlassCard>
            )}
        </div>
    );
};

export default IoTOperations;
