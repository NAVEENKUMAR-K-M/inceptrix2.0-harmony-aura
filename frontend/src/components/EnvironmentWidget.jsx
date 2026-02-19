import React from 'react';
import { Thermometer, Droplets, Wind, Cloud, Sun, CloudRain, CloudLightning } from 'lucide-react';

const WEATHER_ICONS = {
    'Clear': Sun,
    'Overcast': Cloud,
    'Rain': CloudRain,
    'Heatwave': CloudLightning,
};

const WEATHER_COLORS = {
    'Clear': '#facc15',
    'Overcast': '#94a3b8',
    'Rain': '#60a5fa',
    'Heatwave': '#f97316',
};

const getTempColor = (temp) => {
    if (temp >= 45) return '#ef4444';
    if (temp >= 38) return '#f97316';
    if (temp >= 30) return '#facc15';
    return '#22c55e';
};

const getHumidityColor = (hum) => {
    if (hum >= 80) return '#ef4444';
    if (hum >= 65) return '#f97316';
    if (hum >= 50) return '#3b82f6';
    return '#22c55e';
};

const EnvironmentWidget = ({ envData }) => {
    if (!envData) return null;

    const { ambient_temp_c, humidity_pct, weather, wind_speed_kmh } = envData;
    const WeatherIcon = WEATHER_ICONS[weather] || Cloud;
    const weatherColor = WEATHER_COLORS[weather] || '#94a3b8';
    const tempColor = getTempColor(ambient_temp_c);
    const humColor = getHumidityColor(humidity_pct);

    return (
        <div className="bg-surface/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 
                        shadow-[0_0_60px_rgba(0,0,0,0.3)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: weatherColor }} />
                    <span className="text-xs font-mono text-textDim uppercase tracking-wider">Site Environment</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                    <WeatherIcon size={14} style={{ color: weatherColor }} />
                    <span className="text-xs font-semibold" style={{ color: weatherColor }}>{weather}</span>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-3">
                {/* Temperature */}
                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.04] relative overflow-hidden group
                                hover:border-white/10 transition-all duration-300">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{ background: `radial-gradient(circle at center, ${tempColor}08 0%, transparent 70%)` }} />
                    <div className="relative z-10">
                        <Thermometer size={16} className="mb-2 opacity-50" style={{ color: tempColor }} />
                        <div className="text-2xl font-bold font-mono" style={{ color: tempColor }}>
                            {ambient_temp_c?.toFixed(1)}°
                        </div>
                        <div className="text-[10px] text-textDim font-mono uppercase mt-1">Ambient</div>
                    </div>
                    {/* Temp bar */}
                    <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${Math.min(100, ((ambient_temp_c - 18) / 34) * 100)}%`,
                                background: tempColor
                            }} />
                    </div>
                </div>

                {/* Humidity */}
                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.04] relative overflow-hidden group
                                hover:border-white/10 transition-all duration-300">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{ background: `radial-gradient(circle at center, ${humColor}08 0%, transparent 70%)` }} />
                    <div className="relative z-10">
                        <Droplets size={16} className="mb-2 opacity-50" style={{ color: humColor }} />
                        <div className="text-2xl font-bold font-mono" style={{ color: humColor }}>
                            {humidity_pct?.toFixed(0)}%
                        </div>
                        <div className="text-[10px] text-textDim font-mono uppercase mt-1">Humidity</div>
                    </div>
                    <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${Math.min(100, humidity_pct)}%`,
                                background: humColor
                            }} />
                    </div>
                </div>

                {/* Wind */}
                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.04] relative overflow-hidden group
                                hover:border-white/10 transition-all duration-300">
                    <div className="relative z-10">
                        <Wind size={16} className="mb-2 opacity-50 text-sky-400" />
                        <div className="text-2xl font-bold font-mono text-sky-300">
                            {wind_speed_kmh?.toFixed(0)}
                        </div>
                        <div className="text-[10px] text-textDim font-mono uppercase mt-1">km/h Wind</div>
                    </div>
                    <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500 bg-sky-500"
                            style={{ width: `${Math.min(100, (wind_speed_kmh / 40) * 100)}%` }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnvironmentWidget;
