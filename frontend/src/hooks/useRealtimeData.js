import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebase/config';

export const useRealtimeData = () => {
    const [workers, setWorkers] = useState({});
    const [machines, setMachines] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const workersRef = ref(db, 'site/workers');
        const machinesRef = ref(db, 'site/machines');

        const handleWorkers = (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setWorkers(data);
            } else {
                setWorkers({});
            }
        };

        const handleMachines = (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setMachines(data);
            } else {
                setMachines({});
            }
            setLoading(false);
        };

        const handleError = (err) => {
            setError(err);
            setLoading(false);
        };

        const unsubscribeWorkers = onValue(workersRef, handleWorkers, handleError);
        const unsubscribeMachines = onValue(machinesRef, handleMachines, handleError);

        return () => {
            off(workersRef, handleWorkers); // Note: off() syntax might differ in v9 modular, unsubscribe function is returned by onValue
            unsubscribeWorkers();
            unsubscribeMachines();
        };
    }, []);

    return { workers, machines, loading, error };
};
