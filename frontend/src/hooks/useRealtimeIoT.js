import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebase/config';
import { decryptEnvelope, isEncrypted } from '../utils/cryptoProvider';

/**
 * useRealtimeIoT — Firebase Realtime hook for IoT data (E2EE).
 *
 * Listens to three Firebase paths:
 *   - site/iot/vitals              (ENCRYPTED — ESP32 wearable sensor data)
 *   - site/iot/edge_intelligence   (ENCRYPTED — ESP32-S3 computed CIS/PdM)
 *   - site/iot/status              (Unencrypted — device heartbeat/online)
 *
 * Automatically detects encrypted envelopes and decrypts them
 * before updating React state. Falls back to raw data if no
 * encryption is detected (backward compatible).
 */
const useRealtimeIoT = () => {
    const [vitals, setVitals] = useState(null);
    const [edgeIntelligence, setEdgeIntelligence] = useState(null);
    const [deviceStatus, setDeviceStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [securityStatus, setSecurityStatus] = useState({
        vitalsEncrypted: false,
        edgeEncrypted: false,
        tamperDetected: false,
    });

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

        // ── Vitals handler (with E2EE decryption) ──
        const vitalsHandler = async (snapshot) => {
            const raw = snapshot.val();
            loaded.vitals = true;
            checkLoaded();

            if (!raw) { setVitals(null); return; }

            if (isEncrypted(raw)) {
                // Data is encrypted — decrypt it
                const decrypted = await decryptEnvelope(raw.s);
                if (decrypted) {
                    setVitals(decrypted);
                    setSecurityStatus(prev => ({ ...prev, vitalsEncrypted: true, tamperDetected: false }));
                } else {
                    // Decryption failed — possible tamper
                    console.error('[IoT Hook] Vitals decryption failed!');
                    setSecurityStatus(prev => ({ ...prev, vitalsEncrypted: true, tamperDetected: true }));
                    setVitals(null);
                }
            } else {
                // Legacy unencrypted data (backward compatible)
                setVitals(raw);
                setSecurityStatus(prev => ({ ...prev, vitalsEncrypted: false }));
            }
        };

        // ── Edge Intelligence handler (with E2EE decryption) ──
        const edgeHandler = async (snapshot) => {
            const raw = snapshot.val();
            loaded.edge = true;
            checkLoaded();

            if (!raw) { setEdgeIntelligence(null); return; }

            if (isEncrypted(raw)) {
                const decrypted = await decryptEnvelope(raw.s);
                if (decrypted) {
                    setEdgeIntelligence(decrypted);
                    setSecurityStatus(prev => ({ ...prev, edgeEncrypted: true, tamperDetected: false }));
                } else {
                    console.error('[IoT Hook] Edge intelligence decryption failed!');
                    setSecurityStatus(prev => ({ ...prev, edgeEncrypted: true, tamperDetected: true }));
                    setEdgeIntelligence(null);
                }
            } else {
                setEdgeIntelligence(raw);
                setSecurityStatus(prev => ({ ...prev, edgeEncrypted: false }));
            }
        };

        // ── Status handler (never encrypted) ──
        const statusHandler = (snapshot) => {
            setDeviceStatus(snapshot.val());
            loaded.status = true;
            checkLoaded();
        };

        onValue(vitalsRef, vitalsHandler);
        onValue(edgeRef, edgeHandler);
        onValue(statusRef, statusHandler);

        const timeout = setTimeout(() => setLoading(false), 5000);

        return () => {
            off(vitalsRef, vitalsHandler);
            off(edgeRef, edgeHandler);
            off(statusRef, statusHandler);
            clearTimeout(timeout);
        };
    }, []);

    return { vitals, edgeIntelligence, deviceStatus, loading, securityStatus };
};

export default useRealtimeIoT;
