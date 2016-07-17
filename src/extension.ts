import * as vscode from 'vscode';
import fileCommand from './file';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand('extension.openInGitHubFile', fileCommand));
}
