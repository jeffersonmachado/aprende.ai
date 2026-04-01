import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './styles/globals.css';
import './styles/index.css';

const routerBasename = import.meta.env.BASE_URL === '/'
  ? undefined
  : import.meta.env.BASE_URL.replace(/\/$/, '');

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><BrowserRouter basename={routerBasename} future={routerFuture}><AuthProvider><App /></AuthProvider></BrowserRouter></React.StrictMode>
);
