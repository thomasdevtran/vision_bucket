import React, { useEffect, useState } from 'react';
import '../../styles/MovieDetails.css';
import { ApiError, getErrorMessage, reactToReview, unreactToReview } from '../../functions/firebase_backend';

interface ReactionButtonProps {
  reviewId: string;
  count: number;
  reacted?: boolean;
}

// A "helpful" reaction toggle with a live count. The count updates optimistically
// and reverts if the request fails; an unauthenticated tap prompts the user to
// sign in (mirroring the auth handling used elsewhere for review actions).
const ReactionButton: React.FC<ReactionButtonProps> = ({ reviewId, count, reacted = false }) => {
  const [reactionCount, setReactionCount] = useState(count);
  const [hasReacted, setHasReacted] = useState(reacted);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  // Keep in sync when the parent re-fetches reviews.
  useEffect(() => setReactionCount(count), [count]);
  useEffect(() => setHasReacted(reacted), [reacted]);

  const toggle = async () => {
    if (busy) return;
    const nextReacted = !hasReacted;
    const previousCount = reactionCount;
    const previousReacted = hasReacted;

    // Optimistic update.
    setHasReacted(nextReacted);
    setReactionCount((current) => Math.max(0, current + (nextReacted ? 1 : -1)));
    setBusy(true);
    setMessage('');

    try {
      const result = nextReacted ? await reactToReview(reviewId) : await unreactToReview(reviewId);
      setReactionCount(result.reactionCount);
      setHasReacted(result.reactedByMe);
    } catch (error) {
      // Revert on failure.
      setReactionCount(previousCount);
      setHasReacted(previousReacted);
      if (error instanceof ApiError && error.status === 401) {
        setMessage('Sign in to react.');
      } else {
        setMessage(getErrorMessage(error, 'Unable to update your reaction.'));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="reaction-control">
      <button
        type="button"
        className={`review-action reaction-button ${hasReacted ? 'is-active' : ''}`}
        onClick={toggle}
        disabled={busy}
        aria-pressed={hasReacted}
      >
        <span aria-hidden="true">👍</span> Helpful
        <span className="reaction-count">{reactionCount}</span>
      </button>
      {message && <span className="reaction-message" role="status">{message}</span>}
    </span>
  );
};

export default ReactionButton;
