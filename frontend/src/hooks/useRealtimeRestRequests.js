import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebase/config';

const useRealtimeRestRequests = () => {
    const [requests, setRequests] = useState({});
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const reqRef = ref(db, 'site/rest_requests');
        const handleData = (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setRequests(data);
                const pending = Object.values(data).filter(r => r.status === 'PENDING').length;
                setPendingCount(pending);
            } else {
                setRequests({});
                setPendingCount(0);
            }
        };
        onValue(reqRef, handleData);
        return () => off(reqRef, handleData);
    }, []);

    return { requests, pendingCount };
};

export default useRealtimeRestRequests;
