import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebase/config';

const useRealtimeAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [alertCount, setAlertCount] = useState(0);

    useEffect(() => {
        const recsRef = ref(db, 'site/recommendations');
        const handleData = (snapshot) => {
            const data = snapshot.val();
            if (data && data.alerts) {
                setAlerts(data.alerts);
                setAlertCount(data.count || data.alerts.length);
            } else {
                setAlerts([]);
                setAlertCount(0);
            }
        };
        onValue(recsRef, handleData);
        return () => off(recsRef, handleData);
    }, []);

    return { alerts, alertCount };
};

export default useRealtimeAlerts;
