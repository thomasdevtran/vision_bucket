import React from 'react';
import '../../styles/post_preview.css';
import { Link } from 'react-router-dom';

interface Thread {
  id: string;
  uid?: string;
  title: string;
  description: string;
  date: string;
  author: string;
}

interface DiscussionPreviewsProps {
  threads: Thread[];
  onDeleteThread: (threadId: string, uid: string) => void;
  currentUid: string | null;
}

const DiscussionPreviews: React.FC<DiscussionPreviewsProps> = ({ threads, onDeleteThread, currentUid }) => {

  return (
    <div className="discussion-preview_background">
      {threads.map((thread) => (
        <div className="background_discussion" key={thread.id}>
          <Link
            className="discussion-preview"
            to={`/threads/${thread.id}`}
          >
            <div className="thread-row-main"><h3 className="preview-card">{thread.title}</h3>
            <p className="thread-description">
              {(thread.description ?? '').split(' ').length > 10
                ? (thread.description ?? '').split(' ').slice(0, 10).join(' ') + '...'
                : (thread.description ?? '')}
            </p>
            <div className="author-date">
              <span className="author">{thread.author}</span>
              <time dateTime={thread.date}>{new Date(thread.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</time>
            </div>
            </div>
          </Link>
          {currentUid === thread.uid && (
            <button
              className="discussion-delete-button"
              onClick={() => onDeleteThread(thread.id, thread.uid!)}
            >
              Delete Thread
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default DiscussionPreviews;
