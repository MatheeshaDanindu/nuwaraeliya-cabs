// Entry point for React application
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { CustomThemeProvider } from './ThemeContext';

// Create the root element and render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Provide theme context to the entire app */}
    <CustomThemeProvider>
      <App />
    </CustomThemeProvider>
  </React.StrictMode>
);

// Measure app performance (logs to console or analytics endpoint)
reportWebVitals();
