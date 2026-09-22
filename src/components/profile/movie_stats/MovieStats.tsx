import React, { useEffect, useState } from 'react';
import '../../../styles/profile.css';
import { getAuth, onAuthStateChanged } from '../../../functions/session';
import { getWatchEntries, WatchEntry } from '../../../functions/firebase_backend';

function MovieStats() {
    const [entries, setEntries] = useState<WatchEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    setEntries(await getWatchEntries(user.uid));
                } catch (err) {
                    setEntries([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setEntries([]);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    const count = (status: WatchEntry['status']) => entries.filter((entry) => entry.status === status).length;

    return (
        <div className="stats-card">
            <h2>Your library at a glance</h2>
            <dl className="library-stats">
                <div><dt>Films tracked</dt><dd>{entries.length}</dd></div>
                <div><dt>Completed</dt><dd>{count('Completed')}</dd></div>
                <div><dt>Plan to watch</dt><dd>{count('Plan_to_watch')}</dd></div>
                <div><dt>On hold</dt><dd>{count('On_hold')}</dd></div>
                <div><dt>Rewatched</dt><dd>{count('Rewatched')}</dd></div>
                <div><dt>Dropped</dt><dd>{count('Dropped')}</dd></div>
            </dl>
        </div>
    );
}

export default MovieStats;
