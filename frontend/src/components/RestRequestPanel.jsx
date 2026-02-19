import React, { useState, useCallback } from 'react';
import { User, Heart, Zap, Shield, Cpu, Check, X, Clock, BedDouble } from 'lucide-react';
import { ref, set, push } from 'firebase/database';
import { db } from '../firebase/config';
import { getWorkerName, getMachineName } from '../utils/mappings';

const RestRequestPanel = ({ requests = {} }) => {
    const [expanded, setExpanded] = useState(true);
    const [acted, setActed] = useState({}); // { reqId: 'APPROVED' | 'DENIED' }

    const pendingEntries = Object.entries(requests).filter(
        ([, r]) => r.status === 'PENDING'
    );

    const handleApprove = useCallback(async (reqId, req) => {
        if (acted[reqId]) return;
        setActed(prev => ({ ...prev, [reqId]: 'APPROVED' }));

        // Update status
        await set(ref(db, `site/rest_requests/${reqId}/status`), 'APPROVED');

        // Dispatch FORCE_BREAK command
        const cmdRef = push(ref(db, 'site/commands'));
        await set(cmdRef, {
            action: 'ASSIGN 15-MIN MANDATORY BREAK',
            target_type: 'worker',
            target_id: req.worker_id,
            severity: 'WARNING',
            source: 'web_dashboard',
            duration_s: 900,
            timestamp: Date.now(),
            status: 'PENDING',
        });

        setTimeout(() => {
            setActed(prev => {
                const next = { ...prev };
                delete next[reqId];
                return next;
            });
        }, 4000);
    }, [acted]);

    const handleDeny = useCallback(async (reqId) => {
        if (acted[reqId]) return;
        setActed(prev => ({ ...prev, [reqId]: 'DENIED' }));
        await set(ref(db, `site/rest_requests/${reqId}/status`), 'DENIED');

        setTimeout(() => {
            setActed(prev => {
                const next = { ...prev };
                delete next[reqId];
                return next;
            });
        }, 4000);
    }, [acted]);

    if (pendingEntries.length === 0) return null;

    return (
        <div className="bg-surface border border-cyan-500/20 rounded-2xl overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                        <BedDouble size={16} className="text-cyan-400" />
                    </div>
                    <span className="font-semibold text-white text-sm">Operator Rest Requests</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-cyan-500/15 text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider">
                        {pendingEntries.length} PENDING
                    </span>
                    <svg
                        className={`w-4 h-4 text-textDim transition-transform ${expanded ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* Content */}
            {expanded && (
                <div className="px-4 pb-4 space-y-3">
                    {pendingEntries.map(([reqId, req]) => {
                        const vitals = req.vitals || {};
                        const riskLevel = vitals.cis_risk_level || 'Safe';
                        const riskColor = riskLevel === 'Critical'
                            ? 'text-red-400 bg-red-500/10 border-red-500/30'
                            : riskLevel === 'Warning'
                                ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                                : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

                        const actionState = acted[reqId];

                        return (
                            <div
                                key={reqId}
                                className="bg-white/[0.03] border border-cyan-500/15 rounded-xl p-4 transition-all"
                            >
                                {/* Worker Info Row */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <BedDouble size={14} className="text-cyan-400" />
                                        <span className="text-white font-semibold text-sm">
                                            {req.worker_name || getWorkerName(req.worker_id)}
                                        </span>
                                        <span className="text-textDim text-xs">requests rest</span>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${riskColor}`}>
                                        {riskLevel.toUpperCase()}
                                    </span>
                                </div>

                                {/* Vitals Chips */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <Chip icon={<User size={10} />} text={req.worker_id} color="text-cyan-400 bg-cyan-500/10" />
                                    <Chip icon={<Heart size={10} />} text={`${vitals.heart_rate || 0} BPM`} color="text-red-400 bg-red-500/10" />
                                    <Chip icon={<Zap size={10} />} text={`${(vitals.fatigue || 0).toFixed(0)}% Fatigue`} color="text-amber-400 bg-amber-500/10" />
                                    <Chip icon={<Shield size={10} />} text={`CIS ${(vitals.cis_score || 0).toFixed(2)}`} color={riskColor.split(' ')[0] + ' ' + riskColor.split(' ')[1]} />
                                    <Chip icon={<Cpu size={10} />} text={getMachineName(req.machine_id)} color="text-emerald-400 bg-emerald-500/10" />
                                </div>

                                {/* Action Buttons */}
                                {actionState ? (
                                    <div className="flex items-center justify-center gap-2 py-2">
                                        {actionState === 'APPROVED' ? (
                                            <>
                                                <Check size={14} className="text-emerald-400" />
                                                <span className="text-emerald-400 font-bold text-xs">REST APPROVED & BREAK DISPATCHED</span>
                                            </>
                                        ) : (
                                            <>
                                                <X size={14} className="text-red-400" />
                                                <span className="text-red-400 font-bold text-xs">REQUEST DENIED</span>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleApprove(reqId, req)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-500/12 border border-emerald-500/25 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
                                        >
                                            <Check size={13} /> APPROVE
                                        </button>
                                        <button
                                            onClick={() => handleDeny(reqId)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-bold hover:bg-red-500/18 transition-colors"
                                        >
                                            <X size={13} /> DENY
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const Chip = ({ icon, text, color }) => (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${color}`}>
        {icon}
        <span>{text}</span>
    </div>
);

export default RestRequestPanel;
