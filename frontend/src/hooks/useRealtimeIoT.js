import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebase/config';

/**
 * useRealtimeIoT — Firebase Realtime hook for IoT data.
 * 
 * Listens to three Firebase paths simultaneously:
 *   - site/iot/vitals              (ESP32 wearable sensor data)
 *   - site/iot/edge_intelligence   (ESP32-S3 computed CIS/PdM)
 *   - site/iot/status              (device heartbeat/online status)
 */
const useRealtimeIoT = () => {
    const [vitals, setVitals] = useState(null);
    const [edgeIntelligence, setEdgeIntelligence] = useState(null);
    const [deviceStatus, setDeviceStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const vitalsRef = ref(db, 'site/iot/vitals');
        const edgeRef = ref(db, 'site/iot/edge_intelligence');
        const statusRef = ref(db, 'site/iot/status');

        let loaded = { vitals: false, edge: false, status: false };
        const checkLoaded = () => {
            if (loaded.vitals || loaded.edge || loaded.status) {
                setLoading(false);
            }
        };

        const vitalsHandler = (snapshot) => {
            setVitals(snapshot.val());
            loaded.vitals = true;
            checkLoaded();
        };

        const edgeHandler = (snapshot) => {
            setEdgeIntelligence(snapshot.val());
            loaded.edge = true;
            checkLoaded();
        };

        const statusHandler = (snapshot) => {
            setDeviceStatus(snapshot.val());
            loaded.status = true;
            checkLoaded();
        };

        onValue(vitalsRef, vitalsHandler);
        onValue(edgeRef, edgeHandler);
        onValue(statusRef, statusHandler);

        // Timeout: stop loading after 5s even if no data
        const timeout = setTimeout(() => setLoading(false), 5000);

        return () => {
            off(vitalsRef, vitalsHandler);
            off(edgeRef, edgeHandler);
            off(statusRef, statusHandler);
            clearTimeout(timeout);
        };
    }, []);

    return { vitals, edgeIntelligence, deviceStatus, loading };
};

export default useRealtimeIoT;
