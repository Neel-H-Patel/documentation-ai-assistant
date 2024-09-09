const vscode = require('vscode');
const { createAssistant, createThread, addMessage, streamAssistantResponse, getAssistant } = require('./assistantAPI');
const path = require('path');
const fs = require('fs');

let currentPanel = undefined;

// Function to create or show the webview panel
function createOrShowWebviewPanel(extensionPath) {
    if (currentPanel) {
        currentPanel.reveal(vscode.ViewColumn.One);
    } else {
        currentPanel = vscode.window.createWebviewPanel(
            'codeExplainer',
            'Code Explanation',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        currentPanel.onDidDispose(() => {
            currentPanel = undefined;
        });

        currentPanel.webview.html = getWebviewContent(currentPanel, extensionPath);
    }
}

function updateWebviewContent(response) {
    console.log("Sending to webview:", response);  // Log the response to ensure it's structured as expected
    if (currentPanel) {
        currentPanel.webview.postMessage({
            type: 'updateContent',
            value: response  // Send the full response to the webview
        });
        console.log("Message posted to webview");
    } else {
        vscode.window.showErrorMessage('No webview to send message to.');
    }
}


// Function to return HTML content for the webview
function getWebviewContent(panel, extensionPath) {
    const scriptPath = path.join(extensionPath, 'dist', 'bundle.js');
    const scriptUri = panel.webview.asWebviewUri(vscode.Uri.file(scriptPath));
  
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Code Explanation</title>
        </head>
        <body>
          <div id="root"></div>
          <script src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }
  

// Function to limit the response to a word count
function limitToWordCount(text, wordLimit) {
    const words = text.split(/\s+/);
    if (words.length > wordLimit) {
        return words.slice(0, wordLimit).join(' ') + '...';
    }
    return text;
}

// Function to handle calling the Assistant API and updating the webview
async function explainCodeUsingAssistant(codeSnippet, extensionPath) {
    try {
        const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        statusBar.text = `Explaining code...`;
        statusBar.show();

        const assistant = await getAssistant();
        const thread = await createThread();

        await addMessage(thread.id, `Explain what the following code does:\n\n${codeSnippet}`);

        let response = '';
        await streamAssistantResponse(assistant.id, thread.id, (data) => {
            console.log("Received data chunk:", data);  // Log each data chunk
            response += data;  // Append data to response
            console.log("Current response:", response);  // Log the response being built
            statusBar.text = `Explaining code... ${response.length} chars received`;
        });

        // Add a short delay to ensure the full response is received
        await new Promise(resolve => setTimeout(resolve, 10000));  // Delay for 10 seconds

        const limitedResponse = limitToWordCount(response, 200);
        console.log("Final response (limited):", limitedResponse);  // Log the final limited response
        createOrShowWebviewPanel(extensionPath);
        updateWebviewContent(limitedResponse);

        statusBar.dispose();

    } catch (error) {
        console.error("Failed to get explanation from OpenAI Assistant:", error);
        vscode.window.showErrorMessage('Failed to get explanation from OpenAI Assistant. Please try again.');
    }
}

// Define the CodeActionProvider for the lightbulb
class ShowSelectedCodeActionProvider {
    static providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    provideCodeActions(document, range) {
        if (range.isEmpty) {
            return;
        }

        const selectedText = document.getText(range);
        const action = new vscode.CodeAction(`Explain selected code`, vscode.CodeActionKind.QuickFix);

        action.command = {
            command: 'documentation-ai-tutor.showSelectedCode',
            title: 'Explain Selected Code',
            arguments: [selectedText]
        };

        return [action];
    }
}

// This function gets called when your extension is activated
function activate(context) {
    console.log('Congratulations, your extension "documentation-ai-tutor" is now active!');

    // Register the command to explain the selected code
    let disposable = vscode.commands.registerCommand('documentation-ai-tutor.showSelectedCode', async (selectedText) => {
        if (selectedText) {
            await explainCodeUsingAssistant(selectedText, context.extensionPath);
        } else {
            vscode.window.showInformationMessage('No code selected');
        }
    });

    context.subscriptions.push(disposable);

    // Register the CodeActionProvider for the lightbulb
    const codeActionProvider = vscode.languages.registerCodeActionsProvider('*', new ShowSelectedCodeActionProvider(), {
        providedCodeActionKinds: ShowSelectedCodeActionProvider.providedCodeActionKinds
    });

    context.subscriptions.push(codeActionProvider);
}

// This function gets called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
};
