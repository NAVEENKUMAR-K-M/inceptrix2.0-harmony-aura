import React from 'react';
import { LayoutDashboard, Users, Activity, Settings, BarChart3, ShieldCheck, LogOut } from 'lucide-react';

const NavItem = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${active
            ? 'bg-primary/10 text-primary shadow-[0_0_20px_rgba(16,185,129,0.1)] border border-primary/20'
            : 'text-textSecondary hover:bg-white/5 hover:text-white'
            }`}
    >
        <Icon size={20} className={`transition-transform duration-300 group-hover:scale-110 ${active ? 'fill-primary/20' : ''}`} />
        <span className="font-medium tracking-wide">{label}</span>
        {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
    </button>
);

const Sidebar = ({ activeTab = 'overview', onTabChange }) => {
    return (
        <aside className="fixed left-0 top-0 h-screen w-[280px] bg-surface border-r border-white/5 flex flex-col p-6 z-50">
            {/* Logo Area */}
            <div className="flex flex-col items-start gap-1 mb-10 px-2">
                <h1 className="font-display font-extrabold text-3xl text-white tracking-tight leading-none">
                    Harmony<span className="text-primary">Aura</span>
                </h1>
                <span className="text-[10px] text-textSecondary font-mono uppercase tracking-[0.2em] opacity-70 ml-1">
                    Supervisor v2.0
                </span>
            </div>

            {/* Navigation */}
            <div className="flex-1 space-y-2">
                <div className="text-xs font-mono text-textDim uppercase tracking-widest mb-4 px-4">Main Menu</div>
                <NavItem
                    icon={LayoutDashboard}
                    label="Overview"
                    active={activeTab === 'overview'}
                    onClick={() => onTabChange('overview')}
                />
                <NavItem
                    icon={Users}
                    label="Workforce"
                    active={activeTab === 'workforce'}
                    onClick={() => onTabChange('workforce')}
                />
                <NavItem
                    icon={Activity}
                    label="Live Telemetry"
                    active={activeTab === 'telemetry'}
                    onClick={() => onTabChange('telemetry')}
                />
                <NavItem
                    icon={BarChart3}
                    label="Analytics"
                    active={activeTab === 'analytics'}
                    onClick={() => onTabChange('analytics')}
                />
                <NavItem
                    icon={ShieldCheck}
                    label="Maintenance"
                    active={activeTab === 'maintenance'}
                    onClick={() => onTabChange('maintenance')}
                />
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-white/5 space-y-2">
                <NavItem
                    icon={Settings}
                    label="System Config"
                    active={activeTab === 'settings'}
                    onClick={() => onTabChange('settings')}
                />
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-critical hover:bg-critical/10 transition-colors mt-2 group">
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
