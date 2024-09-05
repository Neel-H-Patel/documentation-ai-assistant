import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "basic-code-helper" is now active!');

    // Register the command that shows the selected code in a notification
    let disposable = vscode.commands.registerCommand('basic-code-helper.showSelectedCode', () => {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);

            if (selectedText) {
                vscode.window.showInformationMessage(`You selected: ${selectedText}`);
            } else {
                vscode.window.showInformationMessage('No code selected');
            }
        }
    });

    context.subscriptions.push(disposable);

    // Register the CodeActionProvider to provide the lightbulb action
    const codeActionProvider = vscode.languages.registerCodeActionsProvider('*', new ShowSelectedCodeActionProvider(), {
        providedCodeActionKinds: ShowSelectedCodeActionProvider.providedCodeActionKinds
    });

    context.subscriptions.push(codeActionProvider);
}

export function deactivate() {}

// Define the CodeActionProvider class for the lightbulb
class ShowSelectedCodeActionProvider implements vscode.CodeActionProvider {

    // The types of actions this provider can return
    static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    // This method is called when a lightbulb should be shown (when text is selected)
    public provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range
    ): vscode.CodeAction[] | undefined {
        if (range.isEmpty) {
            return;
        }

        const selectedText = document.getText(range);

        // Create a CodeAction (lightbulb option)
        const action = new vscode.CodeAction(`Show selected code: "${selectedText}"`, vscode.CodeActionKind.QuickFix);

        // Link this action to the command that shows the selected code
        action.command = {
            command: 'basic-code-helper.showSelectedCode',
            title: 'Show Selected Code',
            arguments: [selectedText]
        };

        return [action];
    }
}
