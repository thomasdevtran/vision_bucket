import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/header/header';
import Footer from '../../components/footer/footer';
import '../../styles/discussion.css';
import DiscussionPreviews from '../../components/discussion/post_preview';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { createThread, deleteThread, getErrorMessage, getThreads } from '../../functions/firebase_backend';

interface Thread {
  id: string;
  uid?: string;
  title: string;
  description: string;
  date: string;
  author: string;
}

function GeneralDiscussion() {
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const data = await getThreads('Discussions');

        const mappedThreads = data.map((thread: any) => ({
          id: thread.id,
          uid: thread.uid,
          author: thread.Author,
          date: thread.Date,
          title: thread.Title,
          description: thread.Description
          
        }));

        setThreads(mappedThreads);
      } catch (error) {
        console.error('Error fetching threads:', error);
      }
    };

    fetchThreads();

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const extractedUsername = user.email?.split('@')[0] || 'Unknown User';
        setUsername(extractedUsername);
        setUserId(user.uid);
      } else {
        setUsername(null);
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      alert('You must be logged in to post.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const created = await createThread('Discussions', {
        Author: username || 'Anonymous',
        uid: userId,
        Date: new Date().toISOString().split('T')[0],
        Comments: [],
        Title: title,
        Description: description,
      });

      setThreads((current) => [{
        id: created.id,
        uid: userId,
        author: created.Author,
        date: created.Date,
        title: created.Title,
        description: created.Description,
      }, ...current]);

      setTitle('');
      setDescription('');
    } catch (error) {
      setFormError(getErrorMessage(error, 'Unable to create this thread.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteThread = async (threadId: string, uid: string) => {
    try {
      await deleteThread('Discussions', threadId, uid);

      const fetchThreads = async () => {
        try {
          const data = await getThreads('Discussions');

          const mappedThreads = data.map((thread: any) => ({
            id: thread.id,
            uid: thread.uid,
            author: thread.Author,
            date: thread.Date,
            title: thread.Title,
            description: thread.Description
            
          }));

          setThreads(mappedThreads);
        } catch (error) {
          console.error('Error fetching threads:', error);
        }
      };

      fetchThreads();
    } catch (error) {
      setFormError(getErrorMessage(error, 'Unable to delete this thread.'));
    }
  };

  return (
    <div className="discussion-page">
      <Header />
      <div className="discussion-container">
        <nav className="breadcrumb">
          <Link to="/discussion" className="breadcrumb-link">Discussion</Link>
          <span className="breadcrumb-separator"> &gt; </span>
          <span className="breadcrumb-current">General</span>
        </nav>
        <section className="discussion-header">
          <h1 className="discussion-page-title">General Discussion</h1>
          <p className="discussion-page-subtitle">
            Start a new topic or pick up an existing thread. Keep it friendly and stay on theme.
          </p>
        </section>
        <main className="thread-creation">
          <h2 className="thread-title">Create a Thread</h2>
          <form className="thread-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter thread title"
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                name="description"
                id="description"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter thread description"
                rows={4}
              />
            </div>
            <button className="create-thread-btn" disabled={submitting}>
              {submitting ? 'CREATING…' : 'CREATE THREAD'}
            </button>
            {formError && <p className="discussion-form-error" role="alert">{formError}</p>}
          </form>
        </main>
        <DiscussionPreviews threads={threads} onDeleteThread={handleDeleteThread} currentUid={userId} /> {/* Pass fetched threads */}
      </div>
      <Footer />
    </div>
  );
}

export default GeneralDiscussion;
