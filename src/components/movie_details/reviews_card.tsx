import React from 'react';
import '../../styles/MovieDetails.css';
import ReactionButton from './ReactionButton';
import SpoilerText from './SpoilerText';
import ReportButton from '../report/ReportButton';

interface ReviewCardProps {
  review: string;
  author: string;
  rating: number;
  index?: number;
  reviewId?: string;
  reactionCount?: number;
  reactedByMe?: boolean;
  isSpoiler?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  author,
  rating,
  index = 0,
  reviewId,
  reactionCount = 0,
  reactedByMe = false,
  isSpoiler = false,
}) => {
  return (
    <article className="review-card">
      <div className="review-card-header">
        <div className="review-avatar">{index + 1}</div>
        <div className="review-meta">
          <span className="review-author">{author}</span>
          <span className="review-time">just now</span>
        </div>
        <div className="review-score">
          <span className="review-score-label">Rating</span>
          <span className="review-score-value">{rating}/5</span>
        </div>
      </div>
      <SpoilerText isSpoiler={isSpoiler} className="review-content-wrap">
        <p className="review-content">{review}</p>
      </SpoilerText>
      <div className="review-actions-row">
        {reviewId && (
          <ReactionButton reviewId={reviewId} count={reactionCount} reacted={reactedByMe} />
        )}
        <button type="button" className="review-action">Reply</button>
        <button type="button" className="review-action">Share</button>
        <button type="button" className="review-action">Save</button>
        {reviewId && (
          <ReportButton targetType="review" targetId={reviewId} className="review-action" />
        )}
      </div>
    </article>
  );
};

export default ReviewCard;

export {}
