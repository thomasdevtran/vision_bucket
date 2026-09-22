import React from 'react';
import '../../styles/MovieDetails.css';

interface ReviewCardProps {
  review: string;
  author: string;
  rating: number;
  date: string;
  index?: number;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, author, rating, date, index = 0 }) => {
  return (
    <article className="review-card">
      <div className="review-card-header">
        <div className="review-avatar">{index + 1}</div>
        <div className="review-meta">
          <span className="review-author">{author}</span>
          <time dateTime={date}>{new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}</time>
        </div>
        <div className="review-score">
          <span className="review-score-label">Rating</span>
          <span className="review-score-value">{rating}/5</span>
        </div>
      </div>
      <p className="review-content">{review}</p>
    </article>
  );
};

export default ReviewCard;

export {}
