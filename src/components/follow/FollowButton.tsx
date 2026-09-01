import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  followUser,
  unfollowUser,
  getFollowStatus,
  getErrorMessage,
} from '../../functions/firebase_backend';
import '../../styles/follow.css';

interface FollowButtonProps {
  targetUid: string;
  onChange?: (following: boolean) => void;
}

function FollowButton({ targetUid, onChange }: FollowButtonProps) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!user || user.uid === targetUid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getFollowStatus(targetUid)
      .then((status) => {
        if (active) setFollowing(status);
      })
      .catch(() => {
        if (active) setFollowing(false);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, targetUid]);

  // Do not offer a follow control for signed-out users or your own profile.
  if (!user || user.uid === targetUid) return null;

  const toggle = async () => {
    setLoading(true);
    setError(null);
    const next = !following;
    try {
      if (next) {
        await followUser(targetUid);
      } else {
        await unfollowUser(targetUid);
      }
      setFollowing(next);
      onChange?.(next);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update follow status.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="follow-button-wrap">
      <button
        type="button"
        className={`follow-button ${following ? 'is-following' : ''}`}
        onClick={toggle}
        disabled={loading}
      >
        {loading ? '...' : following ? 'Following' : 'Follow'}
      </button>
      {error && <p className="follow-error">{error}</p>}
    </div>
  );
}

export default FollowButton;
