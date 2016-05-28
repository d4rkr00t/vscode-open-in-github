'use strict';
import * as vscode from 'vscode';

const exec = require('child_process').exec;
const path = require('path');
const opn = require('opn');
const R = require('ramda');

const BRANCH_URL_SEP = '\t—\t';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('extension.openInGitHub', () => {
    const activeTextEditor = vscode.window.activeTextEditor;

    if (!activeTextEditor) {
      vscode.window.showErrorMessage('No opened files.');
      return;
    }

    const filePath = vscode.window.activeTextEditor.document.fileName;
    const projectPath = vscode.workspace.rootPath;
    const relativeFilePath = path.relative(projectPath, filePath);
    const line = vscode.window.activeTextEditor.selection.start.line + 1;
    const defaultBranch = vscode.workspace.getConfiguration('openInGitHub').get('defaultBranch') || 'master';

    const getRemotesPromise = getRemotes(exec, projectPath).then(formatRemotes);
    const getCurrentBranchPromise = getCurrentBranch(exec, projectPath);

    Promise.all([getRemotesPromise, getCurrentBranchPromise])
      .then(prepareQuickPickItems.bind(null, relativeFilePath, line, defaultBranch))
      .then(showQuickPickWindow)
      .catch(err => vscode.window.showErrorMessage(err));
  });

  context.subscriptions.push(disposable);
}

/**
 * Returns raw list of remotes.
 *
 * @todo: Should work on windows too...
 *
 * @param {Function} exec
 * @param {String} projectPath
 *
 * @return {Promise<String[]>}
 */
export function getRemotes(exec, projectPath: string) : Promise<string[]> {
  const process = R.compose(
    R.uniq,
    R.map(R.head),
    R.map(R.split(' ')),
    R.reject(R.isEmpty),
    R.map(R.last),
    R.map(R.split(/\t/)),
    R.split('\n')
  );

  return new Promise((resolve, reject) => {
    exec('git remote -v', { cwd: projectPath }, (error, stdout, stderr) => {
      if (stderr || error) return reject(stderr || error);

      resolve(process(stdout));
    });
  });
}

/**
 * Returns formatted list of remotes.
 *
 * @param {String[]} remotes
 *
 * @return {String[]}
 */
export function formatRemotes(remotes: string[]) : string[] {
  const process = R.compose(
    R.map(R.replace(/\/$/, '')),
    R.reject(R.isEmpty),
    R.map(rem => {
      if (rem.match(/^https?:/)) {
        return rem;
      } else if (rem.match(/@/)) {
        return 'https://' +
          rem
            .replace(/^.+@/, '')
            .replace(/\.git$/, '')
            .replace(/:/g, '/');
      } else if (rem.match(/^ftps?:/)) {
        return rem.replace(/^ftp/, 'http');
      } else if (rem.match(/^ssh:/)) {
        return rem.replace(/^ssh/, 'https');
      } else if (rem.match(/^git:/)) {
        return rem.replace(/^git/, 'https');
      }
    })
  );

  return process(remotes);
}

/**
 * Returns current branch.
 *
 * @todo: Should work on windows too...
 *
 * @param {Function} exec
 * @param {String} filePath
 *
 * @return {Promise<String>}
 */
export function getCurrentBranch(exec, projectPath: string) : Promise<string> {
  return new Promise((resolve, reject) => {
    exec('git branch --no-color', { cwd: projectPath }, (error, stdout, stderr) => {
      if (stderr || error) return reject(stderr || error);

      const process = R.compose(
        R.trim,
        R.replace('*', ''),
        R.find(line => line.startsWith('*')),
        R.split('\n')
      );

      resolve(process(stdout));
    });
  });
}

/**
 * Formates items for quick pick view.
 *
 * @param {String} relativeFilePath
 * @param {String[]} remotes
 * @param {String} branch
 *
 * @return {String[]}
 */
export function formatQuickPickItems(relativeFilePath: string, line: number, remotes: string[], branch: string): string[] {
  return remotes
    .map(r => `${r}/blob/${branch}/${relativeFilePath}#L${line || 1}`)
    .map(r => `[${branch}]${BRANCH_URL_SEP}${r}`);
}

/**
 * Builds quick pick items list.
 *
 * @param {String} relativeFilePath
 * @param {Number} line
 * @param {String} masterBranch
 *
 * @return {String[]}
 */
export function prepareQuickPickItems(relativeFilePath: string, line: number, masterBranch: string, [remotes, branch]: [string[], string]) : string[] {
  // https://github.com/elm-lang/navigation/blob/master/src/Navigation.elm

  if (masterBranch === branch) {
    return formatQuickPickItems(relativeFilePath, line, remotes, branch);
  }

  const currentBranchQuickPickList = formatQuickPickItems(relativeFilePath, line, remotes, branch);
  const masterBranchQuickPickList = formatQuickPickItems(relativeFilePath, line, remotes, masterBranch);

  return R.flatten(R.zip(currentBranchQuickPickList, masterBranchQuickPickList));
}

/**
 * Shows quick pick window.
 *
 * @param {String[]} qucikPickList
 */
export function showQuickPickWindow(quickPickList: string[]) {
  if (quickPickList.length === 1) {
    openQuickPickItem(quickPickList[0]);
    return;
  }

  vscode.window
    .showQuickPick(quickPickList)
    .then(selected => openQuickPickItem(selected));
}

/**
 * Opens given quick pick item in browser.
 *
 * @todo: Should work on windows too...
 *
 * @param {String} item
 */
export function openQuickPickItem(item: string) {
  opn(item.split(BRANCH_URL_SEP)[1]);
}
