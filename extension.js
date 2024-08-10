// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require('path'); // Import the path module

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {   
   
	const disposable = vscode.commands.registerCommand('customextension.searchWdsBlogExample', function () {
		let editor = vscode.window.activeTextEditor; 
		if(editor){
			let fileUri = editor.document.uri;
    		let filePathUri = fileUri.fsPath;
    		console.log("The file path is: " + filePathUri);

			console.log("Editor Document Details: ", editor.document);
			let filePath = editor.document.fileName;
			console.log("The path to the file is: " + filePath);

			let pathString = filePath; 
			let fileExtension = path.extname(pathString).substring(1).trim(); // Get the file extension and remove the dot
		
			console.log("The fileExtension is: " + fileExtension); 
			let languageType = "unknown"; 
			
			// Map file extensions to language types 
			switch(fileExtension){
				case 'py': 
					languageType = "Python"; 
					vscode.window.showInformationMessage('Python found!') 	
					break; 
				case 'js': 
					languageType = "JavaScript";
					vscode.window.showInformationMessage('Javascript found!') 
					break; 
				case 'html': 
					languageType = "HTML";
					vscode.window.showInformationMessage('HTML found!') 	 
					break; 
				case 'css': 
					languageType = "CSS"; 
					vscode.window.showInformationMessage('CSS found!') 	
					break; 
				// Add more languages if needed 
				default: 
					languageType = "Unknown or Unsupported"; 
					break; 
			}
			
			// Create and show the webview panel
            const panel = vscode.window.createWebviewPanel(
                'codeExplanation', // Identifies the type of the webview. Used internally
                'Code Explanation', // Title of the panel displayed to the user
                vscode.ViewColumn.Beside, // Open the webview beside the current editor
                {
                    enableScripts: true, // Enable JavaScript in the webview
                }
            );

            // Set the HTML content for the webview
            panel.webview.html = getWebviewContent(languageType);

			// display the detected language type 
			vscode.window.showInformationMessage(`Detected Language: ${languageType}`); 
		} else {
			vscode.window.showInformationMessage("No File found"); 
		}
		
	});
	
	context.subscriptions.push(disposable);
}

// Function to generate the HTML content for the webview
function getWebviewContent(languageType) {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Code Explanation</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                padding: 10px;
            }
            h1 {
                color: #007acc;
            }
            pre {
                background-color: #f4f4f4;
                padding: 10px;
                border-radius: 5px;
            }
        </style>
    </head>
    <body>
        <h1>Detected Language: ${languageType}</h1>
        <p>This panel shows information related to the detected programming language of your file.</p>
    </body>
    </html>`;
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
