// client/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// --- THE FIX IS HERE ---
// We are importing the CSS files directly into the main entry point.
// This is the most reliable way to ensure they are included in the final build.
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // Your custom styles
import './index.css'; // Other base styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);