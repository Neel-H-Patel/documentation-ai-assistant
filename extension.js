const vscode = require('vscode');
const path = require('path');
const axios = require('axios');

// This method is called when your extension is activated
async function activate(context) {
    const disposable = vscode.commands.registerCommand('customextension.searchWdsBlogExample', async function () {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            let fileUri = editor.document.uri;
            let filePathUri = fileUri.fsPath;
            console.log("The file path is: " + filePathUri);

            let pathString = filePathUri;
            let fileExtension = path.extname(pathString).substring(1).trim(); // Get the file extension and remove the dot

            console.log("The fileExtension is: " + fileExtension);
            let languageType = "unknown";

            // Map file extensions to language types
            switch (fileExtension) {
                case 'py':
                    languageType = "Python";
                    vscode.window.showInformationMessage('Python found!');
                    break;
                case 'js':
                    languageType = "JavaScript";
                    vscode.window.showInformationMessage('JavaScript found!');
                    break;
                case 'html':
                    languageType = "HTML";
                    vscode.window.showInformationMessage('HTML found!');
                    break;
                case 'css':
                    languageType = "CSS";
                    vscode.window.showInformationMessage('CSS found!');
                    break;
                case 'cpp': 
                    languageType = "CPP"; 
                    vscode.window.showInformationMessage('C++ found!')
                    break; 
                // Add more languages if needed
                default:
                    languageType = "Unknown or Unsupported";
                    break;
            }

            // Check if the file is Python and contains a special comment
            if (languageType === "Python" || languageType === "JavaScript" || languageType === "HTML" || languageType === "CSS" || languageType === "CPP") {
                let fileContent = editor.document.getText();
                console.log("fileContent: " + fileContent); 

                let query = extractQuery(fileContent);
                console.log("Query: " + query); 

                if (query) {
                    try {
                        // Sending a POST request to the Flask server
                        const response = await axios.post('http://127.0.0.1:5000/query', {
                            queries: [query]
                        });

                        const results = response.data.results;

                        // Display the result in the webview panel
                        const panel = vscode.window.createWebviewPanel(
                            'codeExplanation',
                            'Code Explanation',
                            vscode.ViewColumn.Beside,
                            {
                                enableScripts: true,
                            }
                        );

                        // Set the HTML content for the webview
                        panel.webview.html = getWebviewContent(panel, context, languageType, results[0]);

                    } catch (error) {
                        vscode.window.showErrorMessage(`Failed to get response from Llama: ${error}`);
                    }
                } else {
                    vscode.window.showInformationMessage("No query found in the file.");
                }
            } else {
                vscode.window.showInformationMessage("Unsupported language or no file open.");
            }
        } else {
            vscode.window.showInformationMessage("No file is open.");
        }
    });

    context.subscriptions.push(disposable);
}

// Function to extract the special comment-based query
function extractQuery(content) {
    const regexPatterns = [
        /(?:#)\?\?\s*(.*)/,              // Python: #??
        /(?:\/\/)\?\?\s*(.*)/,            // C++, JavaScript: //??
        /(?:<!--)\?\?\s*(.*?)-->/,        // HTML: <!--?? -->
        /(?:\/\*)\?\?\s*(.*?)\*\//,       // CSS, C++: /*?? */
    ];

    for (const regex of regexPatterns) {
        const match = content.match(regex);
        if (match) {
            return match[1];
        }
    }

    return null;
}

// react window to display llm response 
function getWebviewContent(panel, context, languageType, result) {
    const scriptUri = panel.webview.asWebviewUri(
        vscode.Uri.file(path.join(context.extensionPath, 'dist', 'main.js'))
    );

     // JSON stringify the result to safely pass it into the HTML
     //const safeResult = JSON.stringify(result);
     const safeResult = JSON.stringify(result).replace(/"/g, '&quot;');
     // Escape the result string for safe HTML embedding
    //  const safeResult = escapeHtml(result);
     console.log("Safe result in getWebviewContent:", safeResult);

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Code Explanation</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                padding: 0;
                margin: 0;
                background-color: #f4f4f4;
            }
            #root {
                padding: 20px;
            }
        </style>
    </head>
    <body>
        <div id="root"></div>
        <script>
            const vscode = acquireVsCodeApi(); 
            vscode.setState({ result: "${safeResult}" });

        </script>
        <script src="${scriptUri}"></script>
    </body>
    </html>`;
}

// Function to generate the HTML content for the webview
// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
};