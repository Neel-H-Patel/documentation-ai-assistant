import React from 'react';
import ReactDOM from 'react-dom/client';

// Component for displaying the Code Explanation
const CodeExplanation = ({ explanation }) => {
    const [codeExample, setCodeExample] = React.useState('');
    const [explanationText, setExplanationText] = React.useState('');
    const [documentationLinks, setDocumentationLinks] = React.useState([]);

    // Function to parse the explanation into different sections
    const parseExplanation = (response) => {
        // Adjusted regex for capturing code block between triple backticks
        const codeRegex = /### Code Example:\s*```(?:python|javascript)?\s*([\s\S]*?)\s*```/;  // Matches code inside triple backticks
        const explanationRegex = /### Explanation:\s*([\s\S]*?)(?=### Documentation Links:|$)/;  // Matches explanation text
        const linksRegex = /### Documentation Links:\s*([\s\S]*)/;  // Matches all the documentation links

        const codeMatch = response.match(codeRegex);
        const explanationMatch = response.match(explanationRegex);
        const linksMatch = response.match(linksRegex);

        console.log("Code match:", codeMatch);  // Log to check if parsing works
        console.log("Explanation match:", explanationMatch);
        console.log("Links match:", linksMatch);

        if (codeMatch) {
            setCodeExample(codeMatch[1].trim());  // Capture the code block
        } else {
            setCodeExample('No code example found.');
        }

        if (explanationMatch) {
            setExplanationText(explanationMatch[1].trim());
        } else {
            setExplanationText('No explanation found.');
        }

        if (linksMatch) {
            const links = linksMatch[1].split('\n').map(link => link.trim()).filter(Boolean);
            setDocumentationLinks(links);
        } else {
            setDocumentationLinks([]);
        }
    };

    // When the component receives the explanation, parse it
    React.useEffect(() => {
        if (explanation) {
            parseExplanation(explanation);
        }
    }, [explanation]);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>Code Example</h2>
            <pre style={{
                backgroundColor: '#2d2d2d',  // Darker background color (dark gray)
                color: '#f8f8f2',            // Light text color (off-white)
                padding: '10px',
                borderRadius: '5px',
                fontFamily: 'monospace'      // Ensure it's rendered as monospaced font
            }}>
                {codeExample}
            </pre>

            <h2>Explanation</h2>
            <p>{explanationText}</p>

            <h2>Documentation Links</h2>
            <ul>
                {documentationLinks.length > 0 ? (
                    documentationLinks.map((link, index) => {
                        const linkParts = link.match(/\[([^\]]+)\]\(([^)]+)\)/);  // Extract text and URL from markdown link
                        return (
                            <li key={index}>
                                <a href={linkParts?.[2]} target="_blank" rel="noopener noreferrer">
                                    {linkParts?.[1] || link}
                                </a>
                            </li>
                        );
                    })
                ) : (
                    <p>No documentation links found.</p>
                )}
            </ul>
        </div>
    );
};

// Fetch explanation data from the VS Code extension context
const vscode = acquireVsCodeApi();
window.addEventListener('message', (event) => {
    const message = event.data;
    console.log("Message received in webview:", message);
    if (message.type === 'updateContent') {
        const root = ReactDOM.createRoot(document.getElementById('root'));  // Use React 18's createRoot
        root.render(<CodeExplanation explanation={message.value} />);
    }
});