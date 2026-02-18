export const WORKER_THRESHOLDS = {
    HEART_RATE: {
        WARNING: 100,
        CRITICAL: 120
    },
    FATIGUE: {
        WARNING: 70,
        CRITICAL: 90
    },
    STRESS: {
        WARNING: 60,
        CRITICAL: 80
    },
    CIS: {
        WARNING: 0.3, // Above 0.3 is Warning
        CRITICAL: 0.7 // Above 0.7 is Critical
    }
};

export const MACHINE_THRESHOLDS = {
    TEMP: {
        WARNING: 90,
        CRITICAL: 105
    },
    LOAD: {
        WARNING: 85,
        CRITICAL: 95
    },
    DEGRADATION: {
        WARNING: 5,
        CRITICAL: 10
    }
};

export const getStatusColor = (status) => {
    switch (status) {
        case 'Safe':
        case 'Normal':
            return 'bg-primary text-white'; // Soft Green
        case 'Warning':
        case 'Degrading':
            return 'bg-warning text-black'; // Amber
        case 'Critical':
        case 'Failure':
            return 'bg-critical text-white'; // Red
        default:
            return 'bg-surfaceHighlight text-textMain';
    }
};
