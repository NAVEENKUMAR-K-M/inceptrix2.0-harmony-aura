import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase/config';
import { Activity, AlertTriangle, CheckCircle, Clock, Wrench, Shield, TrendingDown, Cpu } from 'lucide-react';
import { machineMappings as machineNames } from '../utils/mappings';

const HEALTH_CONFIG = {
    Healthy: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', icon: CheckCircle, label: 'Operational' },
    Caution: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', icon: Clock, label: 'Schedule Inspection' },
    Serious: { color: '#F97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.2)', icon: Wrench, label: 'Plan Maintenance' },
    Critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', icon: AlertTriangle, label: 'Immediate Action' },
};

const Maintenance = () => {
    const [maintenanceData, setMaintenanceData] = useState(null);
    const [machineData, setMachineData] = useState(null);
    const [selectedMachine, setSelectedMachine] = useState(null);

    useEffect(() => {
        const mainRef = ref(db, 'site/maintenance');
        const machRef = ref(db, 'site/machines');

        const unsub1 = onValue(mainRef, (snapshot) => {
            if (snapshot.exists()) setMaintenanceData(snapshot.val());
        });
        const unsub2 = onValue(machRef, (snapshot) => {
            if (snapshot.exists()) setMachineData(snapshot.val());
        });

        return () => { unsub1(); unsub2(); };
    }, []);

    if (!maintenanceData) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Cpu size={48} className="mx-auto mb-4 text-textDim animate-pulse" />
                    <p className="text-textSecondary">Waiting for PdM predictions...</p>
                    <p className="text-textDim text-sm mt-1">Model needs ~60 seconds of telemetry data.</p>
                </div>
            </div>
        );
    }

    const machines = Object.entries(maintenanceData).map(([id, data]) => ({
        id,
        name: machineNames[id] || id,
        ...data,
        telemetry: machineData?.[id] || {},
    }));

    // Calculate fleet summary
    const summary = { Healthy: 0, Caution: 0, Serious: 0, Critical: 0 };
    machines.forEach(m => { summary[m.health_label] = (summary[m.health_label] || 0) + 1; });

    return (
        <div className="space-y-6">
            {/* Fleet Health Summary */}
            <div className="grid grid-cols-4 gap-4">
                {Object.entries(HEALTH_CONFIG).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                        <div
                            key={key}
                            className="rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.02]"
                            style={{ backgroundColor: config.bg, borderColor: config.border }}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <Icon size={20} style={{ color: config.color }} />
                                <span className="text-textDim text-xs font-mono uppercase tracking-wider">{key}</span>
                            </div>
                            <p className="text-3xl font-extrabold" style={{ color: config.color }}>{summary[key] || 0}</p>
                            <p className="text-textDim text-xs mt-1">{config.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Machine Cards */}
            <div className="space-y-4">
                <h3 className="text-textDim text-xs font-mono uppercase tracking-widest px-1">Fleet Health Monitor</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {machines.map((machine) => (
                        <MachineHealthCard
                            key={machine.id}
                            machine={machine}
                            isSelected={selectedMachine === machine.id}
                            onSelect={() => setSelectedMachine(selectedMachine === machine.id ? null : machine.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Selected Machine Detail */}
            {selectedMachine && maintenanceData[selectedMachine] && (
                <MachineDetail
                    machineId={selectedMachine}
                    data={maintenanceData[selectedMachine]}
                    telemetry={machineData?.[selectedMachine] || {}}
                />
            )}
        </div>
    );
};

const MachineHealthCard = ({ machine, isSelected, onSelect }) => {
    const config = HEALTH_CONFIG[machine.health_label] || HEALTH_CONFIG.Healthy;
    const Icon = config.icon;
    const healthPercent = Math.round((machine.health_score || 0) * 100);

    return (
        <div
            onClick={onSelect}
            className={`rounded-2xl p-5 border cursor-pointer transition-all duration-300 hover:scale-[1.01] ${isSelected ? 'ring-2 ring-primary/40' : ''
                }`}
            style={{
                backgroundColor: 'rgba(17,24,39,0.8)',
                borderColor: isSelected ? config.color : 'rgba(42,52,68,0.5)',
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h4 className="text-white font-semibold text-sm">{machine.name}</h4>
                    <p className="text-textDim text-xs mt-0.5">{machine.id} • {machine.telemetry.machine_type || 'Unknown'}</p>
                </div>
                <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: config.bg, border: `1px solid ${config.border}` }}
                >
                    <Icon size={14} style={{ color: config.color }} />
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: config.color }}>
                        {machine.health_label}
                    </span>
                </div>
            </div>

            {/* Health Bar */}
            <div className="mb-3">
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-textDim text-xs">Health Score</span>
                    <span className="font-bold text-sm" style={{ color: config.color }}>{healthPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                            width: `${healthPercent}%`,
                            backgroundColor: config.color,
                            boxShadow: `0 0 10px ${config.color}40`,
                        }}
                    />
                </div>
            </div>

            {/* Confidence */}
            <div className="flex items-center justify-between text-xs">
                <span className="text-textDim">AI Confidence</span>
                <span className="text-textSecondary font-mono">{Math.round((machine.confidence || 0) * 100)}%</span>
            </div>

            {/* Quick Telemetry */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/5">
                <div className="text-center">
                    <p className="text-textDim text-[10px] uppercase">RPM</p>
                    <p className="text-white font-bold text-sm">{machine.telemetry.engine_rpm || '—'}</p>
                </div>
                <div className="text-center">
                    <p className="text-textDim text-[10px] uppercase">Temp</p>
                    <p className="text-white font-bold text-sm">{machine.telemetry.coolant_temp || '—'}°</p>
                </div>
                <div className="text-center">
                    <p className="text-textDim text-[10px] uppercase">Vibration</p>
                    <p className="text-white font-bold text-sm">{machine.telemetry.vibration_mm_s || '—'}</p>
                </div>
            </div>
        </div>
    );
};

const MachineDetail = ({ machineId, data, telemetry }) => {
    const config = HEALTH_CONFIG[data.health_label] || HEALTH_CONFIG.Healthy;
    const probs = data.probabilities || {};

    return (
        <div className="rounded-2xl p-6 border border-white/10 bg-surface/80 backdrop-blur">
            <div className="flex items-center gap-3 mb-6">
                <Shield size={20} style={{ color: config.color }} />
                <h3 className="text-white font-bold">
                    {machineNames[machineId] || machineId} — AI Diagnostics
                </h3>
            </div>

            {/* Probability Distribution */}
            <div className="grid grid-cols-4 gap-3 mb-6">
                {Object.entries(probs).map(([label, prob]) => {
                    const c = HEALTH_CONFIG[label] || HEALTH_CONFIG.Healthy;
                    const pctVal = Math.round(prob * 100);
                    return (
                        <div key={label} className="rounded-xl p-4 border" style={{ backgroundColor: c.bg, borderColor: c.border }}>
                            <p className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: c.color }}>{label}</p>
                            <p className="text-2xl font-extrabold" style={{ color: c.color }}>{pctVal}%</p>
                            <div className="w-full h-1.5 rounded-full bg-white/5 mt-2 overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${pctVal}%`, backgroundColor: c.color }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Live Telemetry Grid */}
            <div>
                <h4 className="text-textDim text-xs font-mono uppercase tracking-widest mb-3">Live Sensor Readings</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Engine RPM', value: telemetry.engine_rpm, unit: '' },
                        { label: 'Engine Load', value: telemetry.engine_load, unit: '%' },
                        { label: 'Coolant Temp', value: telemetry.coolant_temp, unit: '°C' },
                        { label: 'Vibration', value: telemetry.vibration_mm_s, unit: 'mm/s' },
                        { label: 'Oil Pressure', value: telemetry.oil_pressure, unit: 'PSI' },
                        { label: 'Stress Index', value: telemetry.stress_index, unit: '%' },
                        { label: 'Mode', value: telemetry.operating_mode, unit: '' },
                        { label: 'Fuel Level', value: telemetry.fuel_level, unit: '%' },
                    ].map((item) => (
                        <div key={item.label} className="rounded-xl p-3 bg-white/[0.02] border border-white/5">
                            <p className="text-textDim text-[10px] uppercase tracking-wider">{item.label}</p>
                            <p className="text-white font-bold text-lg mt-1">
                                {typeof item.value === 'number' ? item.value.toFixed?.(1) || item.value : item.value || '—'}
                                {item.unit && <span className="text-textDim text-xs ml-1">{item.unit}</span>}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Maintenance;
