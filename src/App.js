import React from 'react';
import './App.css';

function App({ result }) {
    // console.log("Result passed to App component:", result);
    // Trim &quot; from the start and end if they exist
    const cleanResult = result.startsWith('&quot;') && result.endsWith('&quot;') 
        ? result.slice(6, -6) 
        : result;

    return (

        <div> 
            <h1>{cleanResult}</h1>
        </div>
    );
}

export default App;