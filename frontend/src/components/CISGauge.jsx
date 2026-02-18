import React from 'react';

const CISGauge = ({ score }) => {
    // Score is 0.0 to 1.0
    const percentage = Math.min(Math.max(score * 100, 0), 100);

    let color = '#10B981'; // Green
    if (score > 0.3) color = '#F59E0B'; // Amber
    if (score > 0.7) color = '#EF4444'; // Red

    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-12 h-12">
            <svg className="transform -rotate-90 w-12 h-12">
                {/* Track */}
                <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    stroke="#2A2D35"
                    strokeWidth="3"
                    fill="transparent"
                />
                {/* Progress */}
                <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    stroke={color}
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                />
            </svg>
            <span className="absolute text-[10px] font-bold text-white/90">
                {score?.toFixed(2)}
            </span>
        </div>
    );
};

export default CISGauge;
