import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebase/config';

const useRealtimeMachines = () => {
    const [machines, setMachines] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const machinesRef = ref(db, 'site/machines');

        const handleData = (snapshot) => {
            const data = snapshot.val();
            setMachines(data || {});
            setLoading(false);
        };

        const handleError = (err) => {
            console.error("Firebase Error:", err);
            setError(err);
            setLoading(false);
        };

        // Subscribe
        onValue(machinesRef, handleData, handleError);

        // Cleanup
        return () => {
            off(machinesRef, handleData);
        };
    }, []);

    return { machines, loading, error };
};

export default useRealtimeMachines;
