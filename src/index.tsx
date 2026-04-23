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

// Firebase configuration
// Note: In a production environment, these values should be stored in environment variables
const firebaseConfig = {
  apiKey: "AIzaSyBxY9tsBg6zberK1oOFG93a9QwZ1UWZOSo",
  authDomain: "visionbucket-3517c.firebaseapp.com",
  projectId: "visionbucket-3517c",
  storageBucket: "visionbucket-3517c.firebasestorage.app",
  messagingSenderId: "639317626851",
  appId: "1:639317626851:web:d55a82d6459173c9ee5ad6",
  measurementId: "G-DZLHPZML99"
};


// Initialize Firebase before rendering the app
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
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
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
