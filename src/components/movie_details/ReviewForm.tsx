import React, { useState } from 'react';

interface ReviewFormProps {
  onSubmit: (reviewText: string, rating: number, isSpoiler: boolean) => void | Promise<void>;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit }) => {
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reviewText.trim()) {
      setError('Write a review before posting.');
      return;
    }
    if (rating < 1 || rating > 5) {
      setError('Choose a rating from 1 to 5.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await onSubmit(reviewText.trim(), rating, isSpoiler);
      setReviewText('');
      setRating(0);
      setIsSpoiler(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to post your review.');
    } finally {
      setSubmitting(false);
    }
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
          <option value={0}>Choose a rating</option>
          <option value={1}>1 / 5</option>
          <option value={2}>2 / 5</option>
          <option value={3}>3 / 5</option>
          <option value={4}>4 / 5</option>
          <option value={5}>5 / 5</option>
        </select>
        <button className="review-form-submit" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Posting…' : 'Post Review'}
        </button>
      </div>
      <label className="review-form-spoiler">
        <input
          type="checkbox"
          checked={isSpoiler}
          onChange={(e) => setIsSpoiler(e.target.checked)}
        />
        Contains spoilers
      </label>
      {error && <p className="review-form-error" role="alert">{error}</p>}
    </div>
  );
};

export default ReviewForm;
