import * as vscode from 'vscode';
import fileCommand from './file';
import blameCommand from './blame';
import historyCommand from './history';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('openInGithub.openInGitHubFile', fileCommand),
    vscode.commands.registerCommand('openInGithub.openInGitHubBlame', blameCommand),
    vscode.commands.registerCommand('openInGithub.openInGitHubHistory', historyCommand)
  );
}
