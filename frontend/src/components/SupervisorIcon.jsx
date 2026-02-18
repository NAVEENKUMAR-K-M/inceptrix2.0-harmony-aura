import React from 'react';

const SupervisorIcon = ({ className = "w-10 h-10" }) => (
    <div className={`${className} rounded-full bg-gradient-to-br from-primary/80 to-accent/80 p-0.5 shadow-lg border border-white/10 relative group overflow-hidden`}>
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="w-full h-full rounded-full bg-surfaceHighlight flex items-center justify-center relative overflow-hidden">
            <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-2/3 h-2/3 text-white transform group-hover:scale-105 transition-transform duration-300"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Shoulders/Body */}
                <path
                    d="M20 21C20 18.2386 17.7614 16 15 16H9C6.23858 16 4 18.2386 4 21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Head/Helmet */}
                <path
                    d="M12 13C14.2091 13 16 11.2091 16 9C16 6.79086 14.2091 5 12 5C9.79086 5 8 6.79086 8 9C8 11.2091 9.79086 13 12 13Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="currentColor"
                    fillOpacity="0.2"
                />
                {/* Helmet Top */}
                <path
                    d="M7 9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Safety Light on Helmet */}
                <rect x="11" y="2" width="2" height="2" rx="0.5" fill="#10B981" />
            </svg>
        </div>
    </div>
);

export default SupervisorIcon;
