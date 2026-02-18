import React, { useState, useEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import Sidebar from '../components/Sidebar';
import GlobalHeader from '../components/GlobalHeader';
import WorkerCard from '../components/WorkerCard';
import WorkerDetailModal from '../components/WorkerDetailModal';
import useRealtimeWorkers from '../hooks/useRealtimeWorkers';
import useRealtimeMachines from '../hooks/useRealtimeMachines';

// Helper to calculate active stats
const calculateStats = (workers) => {
    if (!workers) return { total: 0, critical: 0, warning: 0, safe: 0 };
    const values = Object.values(workers);
    return {
        total: values.length,
        critical: values.filter(w => w.cis_risk_level === 'Critical').length,
        warning: values.filter(w => w.cis_risk_level === 'Warning').length,
        safe: values.filter(w => w.cis_risk_level === 'Safe').length,
    };
};

const Dashboard = () => {
    const { workers, loading: workersLoading } = useRealtimeWorkers();
    const { machines } = useRealtimeMachines();
    const [selectedWorkerId, setSelectedWorkerId] = useState(null);
    const [filter, setFilter] = useState('All'); // All, Critical, Warning, Safe
    const [activeTab, setActiveTab] = useState('overview');

    const stats = useMemo(() => calculateStats(workers), [workers]);

    // Filter Logic
    const filteredWorkers = useMemo(() => {
        if (!workers) return [];
        const workerList = Object.values(workers);

        // Sort numerically by worker ID (W1, W2, ... W10)
        workerList.sort((a, b) => {
            const numA = parseInt(a.worker_id.replace(/\D/g, ''), 10);
            const numB = parseInt(b.worker_id.replace(/\D/g, ''), 10);
            return numA - numB;
        });

        if (filter === 'All') return workerList;
        return workerList.filter(w => w.cis_risk_level === filter);
    }, [workers, filter]);

    // Derived Data for Modal
    const selectedWorker = selectedWorkerId && workers ? workers[selectedWorkerId] : null;
    const selectedMachine = selectedWorker && machines ? machines[selectedWorker.assigned_machine] : null;

    if (workersLoading) {
        return (
            <div className="fixed inset-0 bg-background z-[200] flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 bg-primary/10 rounded-full animate-pulse" />
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="font-display font-bold text-xl text-white tracking-widest animate-pulse">HARMONY AURA</div>
                        <div className="font-mono text-[10px] text-primary mt-2 tracking-[0.3em] opacity-70">INITIALIZING UPLINK...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent text-textMain font-sans selection:bg-primary/30">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            <GlobalHeader stats={stats} />

            <main className="pl-[280px] pt-20 flex-1">
                <div className="p-8 w-full max-w-[1920px] mx-auto">

                    {/* Dashboard Header / Filter Bar */}
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-3xl font-display font-bold text-white tracking-tight">One-View Overwatch</h2>
                            <p className="text-textSecondary mt-1">Real-time biometrics and machine telemetry.</p>
                        </div>

                        {/* Filter Pills */}
                        <div className="flex bg-surface rounded-xl p-1 border border-white/5">
                            {['All', 'Critical', 'Warning', 'Safe'].map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setFilter(level)}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${filter === level
                                        ? 'bg-white/10 text-white shadow-sm'
                                        : 'text-textDim hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {level} <span className="opacity-50 text-xs ml-1">
                                        {level === 'All' ? stats.total : level === 'Critical' ? stats.critical : level === 'Warning' ? stats.warning : stats.safe}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grid Layout */}
                    {filteredWorkers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                            {filteredWorkers.map((worker, index) => (
                                <WorkerCard
                                    key={worker.worker_id}
                                    worker={worker}
                                    machine={machines ? machines[worker.assigned_machine] : null}
                                    onClick={() => setSelectedWorkerId(worker.worker_id)}
                                    index={index}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-textDim opacity-50">
                            <div className="text-6xl mb-4">☹</div>
                            <p className="font-mono text-lg">No active units found matching this criteria.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal Layer */}
            {selectedWorker && (
                <WorkerDetailModal
                    worker={selectedWorker}
                    machine={selectedMachine}
                    onClose={() => setSelectedWorkerId(null)}
                />
            )}
        </div>
    );
};

export default Dashboard;
