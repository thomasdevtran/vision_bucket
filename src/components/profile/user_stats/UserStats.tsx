import React, { useEffect, useState } from 'react';
import '../../../styles/profile.css';
import user_icon from '../../../assets/user_high.png';
import { getAuth, onAuthStateChanged } from '../../../functions/session';
import { getUserProfile, updateLastOnline } from '../../../functions/firebase_backend';

interface UserData {
    username: string;
    Last_online: string;
    Joined: string;
    reviews: string[];
}

function UserStats() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const data = await getUserProfile(user.uid);
                    setUserData(data);
                    await updateLastOnline(user.uid);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setUserData(null);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="user-info-card">
            <img src={user_icon} alt="User Icon" className="profile-picture" />
            <div><h1>{userData?.username || 'Guest'}</h1>
            <p>
                Last Online: {userData?.Last_online ? formatDate(userData.Last_online) : 'N/A'}
                <br />
                Joined: {userData?.Joined ? formatDate(userData.Joined) : 'N/A'}
                <br />
                Reviews: {userData?.reviews?.length || 0}
            </p></div>
        </div>
    );
}

export default UserStats;
