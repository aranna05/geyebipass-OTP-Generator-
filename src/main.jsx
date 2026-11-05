// Import React DOM client rendering module
import React from 'react';
// Import createRoot function for React 18 initialization
import ReactDOM from 'react-dom/client';
// Import main App component from App.jsx
import App from './App';

// Mount React application tree into root DOM element
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
