import React from 'react';
import StatusBadge from './StatusBadge';
import { Activity, Thermometer, Gauge, Zap, AlertTriangle } from 'lucide-react';
import { getMachineName } from '../utils/mappings';

const MetricRow = ({ icon: Icon, label, value, unit, color = "text-textSecondary" }) => (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
        <div className="flex items-center gap-2">
            <Icon size={14} className="text-textSecondary" />
            <span className="text-sm text-textSecondary">{label}</span>
        </div>
        <span className={`text-sm font-medium ${color}`}>
            {value} <span className="text-xs text-textSecondary ml-0.5">{unit}</span>
        </span>
    </div>
);

const MachineSummary = ({ machine }) => {
    if (!machine) return <div className="text-textSecondary text-sm p-4">No machine data unavailable</div>;

    return (
        <div className="bg-surfaceHighlight/50 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-textMain">{getMachineName(machine.machine_id)}</h3>
                    <p className="text-xs text-textSecondary">{machine.machine_type}</p>
                </div>
                <StatusBadge status={machine.operating_mode} />
            </div>

            <div className="space-y-1">
                <MetricRow
                    icon={Activity}
                    label="Engine RPM"
                    value={machine.engine_rpm}
                    unit="RPM"
                />
                <MetricRow
                    icon={Zap}
                    label="Engine Load"
                    value={machine.engine_load}
                    unit="%"
                    color={machine.engine_load > 85 ? "text-amber-400" : "text-textMain"}
                />
                <MetricRow
                    icon={Thermometer}
                    label="Coolant Temp"
                    value={machine.coolant_temp}
                    unit="°C"
                    color={machine.coolant_temp > 90 ? "text-amber-400" : "text-textMain"}
                />
                <MetricRow
                    icon={Gauge}
                    label="Hydraulic"
                    value={machine.hydraulic_pressure}
                    unit="PSI"
                />
            </div>

            {machine.fault_codes && machine.fault_codes.length > 0 && (
                <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                    <AlertTriangle size={14} className="text-red-400 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-red-400">Fault Codes Detected</p>
                        <p className="text-xs text-red-300/80">{machine.fault_codes.join(', ')}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MachineSummary;
