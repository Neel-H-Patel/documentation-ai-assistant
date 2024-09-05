import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "basic-code-helper" is now active!');

    // Register the command
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
}

export function deactivate() {}