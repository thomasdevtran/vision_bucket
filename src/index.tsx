import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import './functions/firebase';
import Home from './pages/home';
import Auth from './pages/auth';
import reportWebVitals from './reportWebVitals';
import Discussion from './pages/discussion';
import GeneralDiscussion from './pages/discussions/general';
import News from './pages/discussions/news';
import Profile from './pages/profile';
import SearchResult from './pages/search_result';
import ThreadDetails from './pages/discussions/thread';
import MovieDetails from './pages/MovieDetails';
import ListDetail from './pages/ListDetail';
import Diary from './pages/diary';
import ThreadNewsDetails from './pages/discussions/thread_news';
import ReviewsList from './pages/reviews_list';
import Feed from './pages/feed';
import Moderation from './pages/moderation';
import NotificationsPage from './pages/notifications';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/discussion" element={<Discussion />} />
            <Route path="/discussion/general" element={<GeneralDiscussion />} />
            <Route path="/discussion/news" element={<News />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:uid" element={<Profile />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/diary" element={<Diary />} />
            <Route path="/reviews" element={<ReviewsList />} />
            <Route path="/moderation" element={<Moderation />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/search-result/:query" element={<SearchResult />} />
            <Route path="/threads/:id" element={<ThreadDetails />} />
            <Route path="/show/:id" element={<MovieDetails />} />
            <Route path="/lists/:id" element={<ListDetail />} />
            <Route path="/news-threads/:id" element={<ThreadNewsDetails />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
