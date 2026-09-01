import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/header/header';
import Footer from '../../components/footer/footer';
import '../../styles/discussion.css';
import PostPreviewNews from '../../components/discussion/PostPreviewNews';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { createThread, getErrorMessage, getThreads } from '../../functions/firebase_backend';

interface Thread {
  id: string;
  title: string;
  description: string;
  date: string;
  author: string;
}

function News() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [publisher, setPublisher] = useState<User | null>(null);
  const [canPublish, setCanPublish] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const data = await getThreads('News');

        const mappedThreads = data.map((thread: any) => ({
          id: thread.id,
          author: thread.Author,
          date: thread.Date,
          title: thread.Title,
          description: thread.Description
        }));

        setThreads(mappedThreads);
      } catch (error) {
        console.error('Error fetching news threads:', error);
      }
    };

    fetchThreads();

    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      setPublisher(user);
      if (!user) {
        setCanPublish(false);
        return;
      }
      try {
        const token = await user.getIdTokenResult();
        const role = token.claims.role;
        const roles = Array.isArray(token.claims.roles) ? token.claims.roles : [];
        setCanPublish(role === 'admin' || role === 'editor' || roles.includes('admin') || roles.includes('editor'));
      } catch {
        setCanPublish(false);
      }
    });

    return unsubscribe;
  }, []);

  const handlePublish = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!publisher || !canPublish) return;
    setPublishing(true);
    setPublishError('');
    try {
      const created = await createThread('News', {
        Author: publisher.displayName || publisher.email?.split('@')[0] || 'Vision Bucket editor',
        Date: new Date().toISOString(),
        Title: title.trim(),
        Description: description.trim(),
        Comments: [],
        uid: publisher.uid,
      });
      setThreads((current) => [{
        id: created.id,
        author: created.Author,
        date: created.Date,
        title: created.Title,
        description: created.Description,
      }, ...current]);
      setTitle('');
      setDescription('');
    } catch (error) {
      setPublishError(getErrorMessage(error, 'Unable to publish this news post.'));
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="discussion-page">
      <Header />
      <div className="discussion-container">
        <nav className="breadcrumb">
          <Link to="/discussion" className="breadcrumb-link">Discussion</Link>
          <span className="breadcrumb-separator"> &gt; </span>
          <span className="breadcrumb-current">News</span>
        </nav>
        <section className="discussion-header">
          <h1 className="discussion-page-title">News</h1>
          <p className="discussion-page-subtitle">
            Headlines, trailers, and industry moves. Tap a card to open the full thread.
          </p>
        </section>
        {canPublish && (
          <section className="thread-creation">
            <h2 className="thread-title">Publish news</h2>
            <form className="thread-form" onSubmit={handlePublish}>
              <div className="form-group">
                <label htmlFor="news-title">Headline</label>
                <input
                  id="news-title"
                  value={title}
                  maxLength={200}
                  required
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="news-description">Story</label>
                <textarea
                  id="news-description"
                  value={description}
                  maxLength={5000}
                  rows={5}
                  required
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>
              <button className="create-thread-btn" disabled={publishing}>
                {publishing ? 'PUBLISHING…' : 'PUBLISH NEWS'}
              </button>
              {publishError && <p className="discussion-form-error" role="alert">{publishError}</p>}
            </form>
          </section>
        )}
        <PostPreviewNews threads={threads} />
      </div>
      <Footer />
    </div>
  );
}

export default News;
