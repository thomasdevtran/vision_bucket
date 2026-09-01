import React, { useEffect, useState } from 'react';
import '../../../styles/profile.css';
import blue_circle from '../../../assets/circles/blue_circle.png';
import yellow_circle from '../../../assets/circles/yellow_circle.png';
import red_circle from '../../../assets/circles/red_circle.png';
import grey_circle from '../../../assets/circles/grey_circle.png';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
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
            <h2>Movie Stats</h2>
            <p>
                <img src={blue_circle} alt="Blue Circle" className="circle-picture" />Completed: {count('Completed')}
                <br />
                <img src={yellow_circle} alt="Yellow Circle" className="circle-picture" />On-hold: {count('On_hold')}
                <br />
                <img src={red_circle} alt="Red Circle" className="circle-picture" />Dropped: {count('Dropped')}
                <br />
                <img src={grey_circle} alt="Grey Circle" className="circle-picture" />Plan to Watch: {count('Plan_to_watch')}
                <br />
                <br />
                Tracked: {entries.length}
                <br />
                Rewatched: {count('Rewatched')}
            </p>
            {/* insert the pie chart somewhere */}
        </div>
    );
}

export default MovieStats;
