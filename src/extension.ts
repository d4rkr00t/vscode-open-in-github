import * as vscode from 'vscode';
import { openQuickPickItem, copyQuickPickItem } from './common';
import fileCommand from './file';
import blameCommand from './blame';
import historyCommand from './history';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('openInGithub.openInGitHubFile', fileCommand(openQuickPickItem)),
    vscode.commands.registerCommand('openInGithub.openInGitHubBlame', blameCommand(openQuickPickItem)),
    vscode.commands.registerCommand('openInGithub.openInGitHubHistory', historyCommand(openQuickPickItem)),
    vscode.commands.registerCommand('openInGithub.copyInGitHubFile', fileCommand(copyQuickPickItem)),
    vscode.commands.registerCommand('openInGithub.copyInGitHubBlame', blameCommand(copyQuickPickItem)),
    vscode.commands.registerCommand('openInGithub.copyInGitHubHistory', historyCommand(copyQuickPickItem))
  );
}
