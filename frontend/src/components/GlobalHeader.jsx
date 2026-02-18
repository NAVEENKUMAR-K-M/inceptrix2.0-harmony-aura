import React from 'react';
import { Bell, Search, Wifi, Database, Server } from 'lucide-react';
import SupervisorIcon from './SupervisorIcon';

const GlobalHeader = ({ stats }) => {
    return (
        <header className="fixed top-0 left-[280px] right-0 h-20 bg-background/80 backdrop-blur-md border-b border-white/5 z-40 flex items-center justify-between px-8">
            {/* Search / Command */}
            <div className="flex items-center gap-4 w-96">
                <div className="relative w-full group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textDim group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search workers, machines, or alerts..."
                        className="w-full bg-surface border border-white/5 rounded-full pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-surfaceHighlight transition-all placeholder:text-textDim"
                    />
                </div>
            </div>

            {/* System Status & Actions */}
            <div className="flex items-center gap-6">
                {/* System Health Indicators */}
                <div className="flex items-center gap-4 mr-4 border-r border-white/5 pr-6 hidden md:flex">
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                        <Wifi size={12} />
                        <span>LINK: STABLE</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                        <Database size={12} />
                        <span>DB: CONNECTED</span>
                    </div>
                </div>



                {/* Supervisor Profile */}
                <div className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-bold text-white leading-tight">Admin User</div>
                        <div className="text-[10px] text-primary font-mono tracking-wider">SUPERVISOR ACCESS</div>
                    </div>
                    <SupervisorIcon />
                </div>
            </div>
        </header>
    );
};

export default GlobalHeader;
