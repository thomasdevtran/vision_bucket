import React from 'react';


import '../styles/discussion.css';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';
import { Link } from 'react-router-dom';

function Discussion() {
  return (
    <>
      <div className="discussion-page">
        <Header />
        <main className="discussion-container">
          <section className="discussion-hero">
            <p className="discussion-kicker">Community Hub</p>
            <h1 className="discussion-title">Discussion Board</h1>
            <p className="discussion-description">
              Jump into trending conversations or browse the latest news threads. Everything stays
              organized so you can keep up with what the community is watching.
            </p>
          </section>
          <section className="discussion-sections">
            <Link to="/discussion/news" className="discussion-card">
              <div className="discussion-card-tag">News</div>
              <h2>Industry Updates</h2>
              <p>Fresh announcements, trailers, and release chatter curated by the community.</p>
              <span className="discussion-card-cta">Browse news threads</span>
            </Link>
            <Link to="/discussion/general" className="discussion-card">
              <div className="discussion-card-tag">Threads</div>
              <h2>General Discussion</h2>
              <p>Start a topic, ask for recommendations, and share quick takes on new releases.</p>
              <span className="discussion-card-cta">Explore the board</span>
            </Link>
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
}

export default Discussion;