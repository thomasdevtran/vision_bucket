import React, { useCallback, useEffect, useState } from 'react';
import { getFollowCounts, FollowCounts } from '../../functions/firebase_backend';
import FollowButton from './FollowButton';
import '../../styles/follow.css';

interface FollowSectionProps {
  targetUid: string;
}

function FollowSection({ targetUid }: FollowSectionProps) {
  const [counts, setCounts] = useState<FollowCounts | null>(null);

  const loadCounts = useCallback(() => {
    getFollowCounts(targetUid)
      .then(setCounts)
      .catch(() => setCounts(null));
  }, [targetUid]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  return (
    <div className="follow-section">
      <div className="follow-counts">
        <span className="follow-count">
          <strong>{counts?.followers ?? 0}</strong> Followers
        </span>
        <span className="follow-count">
          <strong>{counts?.following ?? 0}</strong> Following
        </span>
      </div>
      <FollowButton targetUid={targetUid} onChange={loadCounts} />
    </div>
  );
}

export default FollowSection;
