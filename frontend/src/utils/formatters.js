export const formatNumber = (num, decimals = 1) => {
    if (num === undefined || num === null) return '-';
    return Number(num).toFixed(decimals);
};

export const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export const formatPercentage = (num) => {
    if (num === undefined || num === null) return '-';
    return `${Math.round(num)}%`;
};
