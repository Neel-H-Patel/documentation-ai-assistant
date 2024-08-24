import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// eslint-disable-next-line no-undef
const state = vscode.getState(); // Retrieve the state

console.log("State in index.js:", state); // Log the state to verify

const result = state?.result || "No result available";

ReactDOM.render(
    <React.StrictMode>
        <App result={result} />
    </React.StrictMode>,
    document.getElementById('root')
);