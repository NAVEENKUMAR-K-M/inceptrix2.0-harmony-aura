import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, Wifi, Database, X } from 'lucide-react';
import SupervisorIcon from './SupervisorIcon';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase/config';

const GlobalHeader = ({ stats }) => {
    const [notifications, setNotifications] = useState([]);
    const [showPanel, setShowPanel] = useState(false);
    const panelRef = useRef(null);

    // Listen for notifications from Firebase
    useEffect(() => {
        const notifRef = ref(db, 'site/notifications');
        const unsubscribe = onValue(notifRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const items = Object.entries(data)
                    .map(([key, val]) => ({ ...val, _key: key }))
                    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                    .slice(0, 50); // Keep last 50
                setNotifications(items);
            } else {
                setNotifications([]);
            }
        });
        return () => unsubscribe();
    }, []);

    // Close panel when clicking outside
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setShowPanel(false);
            }
        };
        if (showPanel) {
            document.addEventListener('mousedown', handleOutsideClick);
        }
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [showPanel]);

    const unreadCount = notifications.length;

    const formatTime = (ts) => {
        if (!ts) return '';
        const d = new Date(ts);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

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

                {/* Notification Bell */}
                <div className="relative" ref={panelRef}>
                    <button
                        onClick={() => setShowPanel(!showPanel)}
                        className="relative p-2 rounded-lg hover:bg-white/5 transition-colors group"
                        title="View Alert History"
                    >
                        <Bell size={20} className={`transition-colors ${unreadCount > 0 ? 'text-amber-400' : 'text-textDim group-hover:text-white'}`} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-critical text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notification Panel */}
                    {showPanel && (
                        <div className="absolute right-0 top-12 w-96 max-h-[500px] bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                            {/* Panel Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                                <div className="flex items-center gap-2">
                                    <Bell size={14} className="text-amber-400" />
                                    <span className="text-sm font-bold text-white">Alert History</span>
                                    <span className="text-[10px] font-mono text-textDim bg-white/5 px-1.5 py-0.5 rounded">{notifications.length}</span>
                                </div>
                                <button onClick={() => setShowPanel(false)} className="text-textDim hover:text-white transition-colors">
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Notification List */}
                            <div className="overflow-y-auto max-h-[440px] divide-y divide-white/5">
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-8 text-center text-textDim text-sm">
                                        <Bell size={24} className="mx-auto mb-2 opacity-30" />
                                        <p>No alerts yet</p>
                                    </div>
                                ) : (
                                    notifications.map((notif, i) => (
                                        <div
                                            key={notif._key || i}
                                            className="px-4 py-3 hover:bg-white/[0.02] transition-colors"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notif.type === 'CRITICAL' ? 'bg-critical animate-pulse' : 'bg-amber-400'}`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-white/90 leading-snug">{notif.message}</p>
                                                    <p className="text-[10px] font-mono text-textDim mt-1">{formatTime(notif.timestamp)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
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
