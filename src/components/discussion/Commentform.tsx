import React, { useState } from 'react';

interface CommentFormProps {
  onSubmit: (commentText: string) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit }) => {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim() === '') return;
    onSubmit(commentText);
    setCommentText('');
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
      <button type="submit" className="comment-submit">
        Post Comment
      </button>
    </form>
  );
};

export default CommentForm;