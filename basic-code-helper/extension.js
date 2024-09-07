const vscode = require('vscode');
const { createAssistant, createThread, addMessage, streamAssistantResponse, getAssistant } = require('./assistantAPI');

let currentPanel = undefined;

// Function to create or show the webview panel
function createOrShowWebviewPanel() {
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

        currentPanel.webview.html = getWebviewContent();
    }
}

function updateWebviewContent(response) {
    console.log("Sending to webview:", response);  // Add logging to check if this is firing
    if (currentPanel) {
        currentPanel.webview.postMessage({ type: 'updateContent', value: response });
    } else {
        vscode.window.showErrorMessage('No webview to send message to.');
    }
}

// Function to return HTML content for the webview
function getWebviewContent() {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Code Explanation</title>
        </head>
        <body>
            <h1>Code Explanation</h1>
            <div id="explanation-content">Waiting for the explanation...</div>
            <script>
                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.type === 'updateContent') {
                        document.getElementById('explanation-content').innerText = message.value;
                    }
                });
            </script>
            <script>
                window.addEventListener('message', event => {
                    const message = event.data;
                    console.log("Message received in webview:", message);  // Log to ensure message is received
                    if (message.type === 'updateContent') {
                        document.getElementById('explanation-content').innerText = message.value;
                    }
                });
            </script>
        </body>
        </html>`;
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
async function explainCodeUsingAssistant(codeSnippet) {
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
        createOrShowWebviewPanel();
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
            command: 'basic-code-helper.showSelectedCode',
            title: 'Explain Selected Code',
            arguments: [selectedText]
        };

        return [action];
    }
}

// This function gets called when your extension is activated
function activate(context) {
    console.log('Congratulations, your extension "basic-code-helper" is now active!');

    // Register the command to explain the selected code
    let disposable = vscode.commands.registerCommand('basic-code-helper.showSelectedCode', async (selectedText) => {
        if (selectedText) {
            await explainCodeUsingAssistant(selectedText);
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
