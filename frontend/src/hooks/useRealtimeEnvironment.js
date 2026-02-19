import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebase/config';

const useRealtimeEnvironment = () => {
    const [envData, setEnvData] = useState({
        ambient_temp_c: 30.0,
        humidity_pct: 55.0,
        weather: 'Clear',
        wind_speed_kmh: 8.0,
    });

    useEffect(() => {
        const envRef = ref(db, 'site/env');
        const handleData = (snapshot) => {
            const data = snapshot.val();
            if (data) setEnvData(data);
        };
        onValue(envRef, handleData);
        return () => off(envRef, handleData);
    }, []);

    return envData;
};

export default useRealtimeEnvironment;
