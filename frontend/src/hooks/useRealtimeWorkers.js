import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebase/config';

const useRealtimeWorkers = () => {
    const [workers, setWorkers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const workersRef = ref(db, 'site/workers');

        const handleData = (snapshot) => {
            const data = snapshot.val();
            setWorkers(data || {});
            setLoading(false);
        };

        const handleError = (err) => {
            console.error("Firebase Error:", err);
            setError(err);
            setLoading(false);
        };

        // Subscribe
        onValue(workersRef, handleData, handleError);

        // Cleanup
        return () => {
            off(workersRef, handleData);
        };
    }, []);

    return { workers, loading, error };
};

export default useRealtimeWorkers;
