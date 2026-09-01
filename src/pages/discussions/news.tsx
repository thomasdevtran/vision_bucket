import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/header/header';
import Footer from '../../components/footer/footer';
import '../../styles/discussion.css';
import PostPreviewNews from '../../components/discussion/PostPreviewNews';
import { getThreads } from '../../functions/firebase_backend';

interface Thread {
  id: string;
  title: string;
  description: string;
  date: string;
  author: string;
}

function News() {
  const [threads, setThreads] = useState<Thread[]>([]);

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
  }, []);

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
        <PostPreviewNews threads={threads} />
      </div>
      <Footer />
    </div>
  );
}

export default News;
