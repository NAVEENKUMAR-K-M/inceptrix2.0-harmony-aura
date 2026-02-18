import React from 'react';

const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'safe':
        case 'normal':
        case 'idle':
            return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'warning':
        case 'degrading':
        case 'working':
            return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        case 'critical':
        case 'failure':
        case 'error':
            return 'bg-red-500/10 text-red-400 border-red-500/20';
        case 'high_load':
            return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
        default:
            return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
};

const StatusBadge = ({ status, label }) => {
    const colorClass = getStatusColor(status);

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass} uppercase tracking-wider`}>
            {label || status || 'UNKNOWN'}
        </span>
    );
};

export default StatusBadge;
