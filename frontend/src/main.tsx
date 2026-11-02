import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './providers/auth';
import { ToastProvider } from './components/Toast';
import { App } from './app/App';
import { ThemeProvider } from './providers/theme';
import './styles.css';

createRoot(document.getElementById('root')!).render(<StrictMode><ThemeProvider><BrowserRouter><AuthProvider><ToastProvider><App /></ToastProvider></AuthProvider></BrowserRouter></ThemeProvider></StrictMode>);
