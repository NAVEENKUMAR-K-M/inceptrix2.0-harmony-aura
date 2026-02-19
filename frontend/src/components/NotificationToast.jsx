import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { ref, onChildAdded } from 'firebase/database';
import { db } from '../firebase/config';

const NotificationToast = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const notificationsRef = ref(db, 'site/notifications');

        const handleNewNotification = (snapshot) => {
            const data = snapshot.val();
            if (data && Date.now() - data.timestamp < 5000) { // Only show recent (prevents flood on reload)
                addToast(data);
            }
        };

        const unsubscribe = onChildAdded(notificationsRef, handleNewNotification);
        return () => unsubscribe();
    }, []);

    const addToast = (notification) => {
        setNotifications((prev) => [notification, ...prev].slice(0, 3)); // Keep max 3

        // Auto dismiss
        setTimeout(() => {
            removeToast(notification.id);
        }, 6000);
    };

    const removeToast = (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <div className="fixed top-24 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
            {notifications.map((n) => (
                <div
                    key={n.id}
                    className="pointer-events-auto bg-critical/90 backdrop-blur-md border border-critical/50 text-white rounded-lg p-4 shadow-[0_0_20px_rgba(239,68,68,0.4)] min-w-[320px] animate-in slide-in-from-right duration-300"
                >
                    <div className="flex items-start gap-3">
                        <div className="bg-white/20 p-2 rounded-full mt-0.5">
                            <AlertTriangle size={20} className="text-white animate-pulse" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm tracking-wide uppercase">Critical Alert</h4>
                            <p className="text-xs font-mono opacity-90 mt-1">{n.message}</p>
                            <span className="text-[10px] opacity-60 mt-2 block">{new Date(n.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <button
                            onClick={() => removeToast(n.id)}
                            className="hover:bg-white/20 p-1 rounded transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationToast;
