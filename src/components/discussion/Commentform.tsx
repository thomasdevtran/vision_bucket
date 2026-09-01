import React, { useState } from 'react';

interface CommentFormProps {
  onSubmit: (commentText: string) => void | Promise<void>;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit }) => {
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim() === '') return;
    setSubmitting(true);
    try {
      await onSubmit(commentText.trim());
      setCommentText('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea
        className="comment-input"
        placeholder="Write your comment here..."
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        rows={3}
      />
      <button type="submit" className="comment-submit" disabled={submitting}>
        {submitting ? 'Posting…' : 'Post Comment'}
      </button>
    </form>
  );
};

export default CommentForm;
