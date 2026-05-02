import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import Home from './pages/home';
import Auth from './pages/auth';
import reportWebVitals from './reportWebVitals';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import Discussion from './pages/discussion';
import GeneralDiscussion from './pages/discussions/general';
import News from './pages/discussions/news';
import Rules from './pages/discussions/rules';
import Profile from './pages/profile';
import SearchResult from './pages/search_result';
import ThreadDetails from './pages/discussions/thread';
import MovieDetails from './pages/MovieDetails';
import ThreadNewsDetails from './pages/discussions/thread_news';
import ReviewsList from './pages/reviews_list';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};


// Initialize Firebase before rendering the app
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/discussion" element={<Discussion />} />
            <Route path="/discussion/general" element={<GeneralDiscussion />} />
            <Route path="/discussion/news" element={<News />} />
            <Route path="/discussion/rules" element={<Rules />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search-result/:query" element={<SearchResult />} />
            <Route path="/threads/:id" element={<ThreadDetails />} />
            <Route path="/show/:id" element={<MovieDetails />} />
            <Route path="/news-threads/:id" element={<ThreadNewsDetails />} />
            <Route path="/reviews" element={<ReviewsList />} />
          </Routes>
        </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
