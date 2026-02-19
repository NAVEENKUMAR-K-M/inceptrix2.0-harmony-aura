import React, { useState, useCallback } from 'react';
import { ShieldAlert, AlertTriangle, Info, ChevronDown, ChevronUp, User, Cpu, MapPin, Send, Check } from 'lucide-react';
import { ref, push, set } from 'firebase/database';
import { db } from '../firebase/config';

const SEVERITY_CONFIG = {
    CRITICAL: {
        icon: ShieldAlert,
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        badge: 'bg-red-500/20 text-red-300 border-red-500/30',
        glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
        pulse: true,
    },
    WARNING: {
        icon: AlertTriangle,
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        text: 'text-amber-400',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        glow: '',
        pulse: false,
    },
    INFO: {
        icon: Info,
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        text: 'text-blue-400',
        badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        glow: '',
        pulse: false,
    },
};

const TARGET_ICONS = {
    worker: User,
    machine: Cpu,
    site: MapPin,
};

const ActionableAlerts = ({ alerts = [] }) => {
    const [expanded, setExpanded] = useState(true);
    const [sentCommands, setSentCommands] = useState({}); // { alertId: true }

    const dispatchCommand = useCallback(async (alert) => {
        if (sentCommands[alert.id]) return; // prevent double-send

        const commandRef = ref(db, 'site/commands');
        const newCmdRef = push(commandRef);
        await set(newCmdRef, {
            action: alert.action,
            target_type: alert.target_type,
            target_id: alert.target_id,
            severity: alert.severity,
            source: 'web_dashboard',
            duration_s: alert.severity === 'CRITICAL' ? 180 : 120,
            timestamp: Date.now(),
            status: 'PENDING',
        });

        setSentCommands(prev => ({ ...prev, [alert.id]: true }));

        // Reset after 3 seconds
        setTimeout(() => {
            setSentCommands(prev => {
                const next = { ...prev };
                delete next[alert.id];
                return next;
            });
        }, 3000);
    }, [sentCommands]);

    // Sort: CRITICAL first, then WARNING, then INFO
    const sortedAlerts = [...alerts].sort((a, b) => {
        const order = { CRITICAL: 0, WARNING: 1, INFO: 2 };
        return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
    });

    const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
    const warningCount = alerts.filter(a => a.severity === 'WARNING').length;

    if (alerts.length === 0) {
        return (
            <div className="bg-surface/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 
                            shadow-[0_0_60px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-mono text-textDim uppercase tracking-wider">Actionable Alerts</span>
                </div>
                <div className="flex items-center justify-center py-4 text-green-400/60">
                    <ShieldAlert size={18} className="mr-2" />
                    <span className="text-sm font-mono">All Clear — No active recommendations</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-surface/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl
                        shadow-[0_0_60px_rgba(0,0,0,0.3)] overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${criticalCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span className="text-xs font-mono text-textDim uppercase tracking-wider">Actionable Alerts</span>

                    {/* Counts */}
                    <div className="flex items-center gap-2 ml-2">
                        {criticalCount > 0 && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                                {criticalCount} CRIT
                            </span>
                        )}
                        {warningCount > 0 && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {warningCount} WARN
                            </span>
                        )}
                    </div>
                </div>
                {expanded ? <ChevronUp size={16} className="text-textDim" /> : <ChevronDown size={16} className="text-textDim" />}
            </button>

            {/* Alerts List */}
            {expanded && (
                <div className="px-5 pb-5 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {sortedAlerts.map((alert, i) => {
                        const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.INFO;
                        const SeverityIcon = config.icon;
                        const TargetIcon = TARGET_ICONS[alert.target_type] || MapPin;
                        const isSent = sentCommands[alert.id];

                        return (
                            <div
                                key={alert.id || i}
                                className={`${config.bg} ${config.border} ${config.glow} border rounded-xl p-3.5
                                            transition-all duration-300 hover:scale-[1.01]`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`mt-0.5 ${config.pulse ? 'animate-pulse' : ''}`}>
                                        <SeverityIcon size={16} className={config.text} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {/* Target & Severity */}
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${config.badge}`}>
                                                {alert.severity}
                                            </span>
                                            <div className="flex items-center gap-1 text-textDim">
                                                <TargetIcon size={10} />
                                                <span className="text-[10px] font-mono">{alert.target_id}</span>
                                            </div>
                                        </div>

                                        {/* Message */}
                                        <p className="text-xs text-white/80 mb-2 leading-relaxed">{alert.message}</p>

                                        {/* Action Button (FUNCTIONAL) */}
                                        <button
                                            onClick={() => dispatchCommand(alert)}
                                            disabled={isSent}
                                            className={`group flex items-center gap-2 rounded-lg px-3 py-2 border transition-all duration-300 cursor-pointer
                                                ${isSent
                                                    ? 'bg-green-500/10 border-green-500/30'
                                                    : 'bg-white/[0.05] border-white/[0.05] hover:bg-white/[0.1] hover:border-white/[0.15] active:scale-[0.98]'
                                                }`}
                                        >
                                            {isSent ? (
                                                <>
                                                    <Check size={12} className="text-green-400" />
                                                    <span className="text-xs font-semibold text-green-400">Command Sent ✓</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={10} className="text-textDim group-hover:text-white/70 transition-colors" />
                                                    <span className="text-[9px] text-textDim font-mono uppercase">Action:</span>
                                                    <span className={`text-xs font-semibold ${config.text}`}>{alert.action}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ActionableAlerts;

