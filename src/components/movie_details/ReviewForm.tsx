import React, { useState } from 'react';

interface ReviewFormProps {
  onSubmit: (reviewText: string, rating: number) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit }) => {
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState<number>(0);

  const handleSubmit = () => {
    onSubmit(reviewText, rating);
    setReviewText('');
    setRating(0);
  };

  return (
    <div className="review-form">
      <textarea
        className="review-form-textarea"
        placeholder="What did you think?"
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        rows={4}
      />
      <div className="review-form-row">
        <select
          className="review-form-rating"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          <option value={0}>0 / 5</option>
          <option value={1}>1 / 5</option>
          <option value={2}>2 / 5</option>
          <option value={3}>3 / 5</option>
          <option value={4}>4 / 5</option>
          <option value={5}>5 / 5</option>
        </select>
        <button className="review-form-submit" onClick={handleSubmit}>Post Review</button>
      </div>
    </div>
  );
};

export default ReviewForm;
