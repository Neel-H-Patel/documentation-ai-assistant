import * as vscode from 'vscode';

const OPENAI_API_KEY = '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';  // Replace with your OpenAI API key

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "basic-code-helper" is now active!');

    // Register the command to show the selected code and retrieve explanation from OpenAI
    let disposable = vscode.commands.registerCommand('basic-code-helper.showSelectedCode', async (selectedText: string) => {
        if (selectedText) {
            // Call OpenAI API to get explanation of the selected code
            const explanation = await getExplanationFromOpenAI(selectedText);
            vscode.window.showInformationMessage(`OpenAI Response: ${explanation}`);
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

export function deactivate() {}

interface OpenAIResponse {
    choices: Array<{
        text: string;
    }>;
}

// Call OpenAI API to get an explanation of the code
async function getExplanationFromOpenAI(codeSnippet: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'text-davinci-003',  // You can use the latest GPT model
            prompt: `Explain what the following code does:\n\n${codeSnippet}`,
            max_tokens: 100,
        }),
    });

    // Typecast the response to the OpenAIResponse interface
    const data = await response.json() as OpenAIResponse;

    // Safely access the choices and return the explanation text
    return data.choices && data.choices[0].text.trim() || "No explanation available.";
}

// Define the CodeActionProvider for the lightbulb
class ShowSelectedCodeActionProvider implements vscode.CodeActionProvider {

    static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    public provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range
    ): vscode.CodeAction[] | undefined {
        if (range.isEmpty) {
            return;
        }

        const selectedText = document.getText(range);

        // Create a CodeAction (lightbulb option)
        const action = new vscode.CodeAction(`Explain selected code`, vscode.CodeActionKind.QuickFix);

        // Link this action to the command and pass the selected text as an argument
        action.command = {
            command: 'basic-code-helper.showSelectedCode',
            title: 'Explain Selected Code',
            arguments: [selectedText]  // Pass the selected text to the command
        };

        return [action];
    }
}
