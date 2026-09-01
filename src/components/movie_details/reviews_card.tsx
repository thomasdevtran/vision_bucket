import React from 'react';
import '../../styles/MovieDetails.css';

interface ReviewCardProps {
  review: string;
  author: string;
  rating: number;
  index?: number;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, author, rating, index = 0 }) => {
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
      <p className="review-content">{review}</p>
      <div className="review-actions-row">
        <button type="button" className="review-action">Reply</button>
        <button type="button" className="review-action">Share</button>
        <button type="button" className="review-action">Save</button>
      </div>
    </article>
  );
};

export default ReviewCard;

export {}
