'use strict';
import * as vscode from 'vscode';

const exec = require('child_process').exec;
const path = require('path');

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

    const getRemotesPromise = getRemotes(exec, projectPath).then(formatRemotes);
    const getCurrentBranchPromise = getCurrentBranch(exec, projectPath);

    Promise.all([getRemotesPromise, getCurrentBranchPromise])
      .then(prepareQuickPickItems.bind(null, relativeFilePath, 'master'))
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
  return new Promise((resolve, reject) => {
    exec('git remote -v', { cwd: projectPath }, (error, stdout, stderr) => {
      if (stderr || error) return reject(stderr || error);

      const remotes = stdout
        .split('\n')
        .map(line => line.split(/\t/))
        .map(line => line[1])
        .filter(line => line)
        .map(line => line.split(' '))
        .map(line => line[0])
        .reduce((acc, line) => acc.indexOf(line) === -1 ? acc.concat([line]) : acc, []);

      resolve(remotes);
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
  return remotes.map(rem => {
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
  .filter(rem => !!rem)
  .map(rem => rem.replace(/\/$/, ''));
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

      const branch = stdout
        .split('\n')
        .find(line => line.startsWith('*'))
        .replace('*', '')
        .trim();

      resolve(branch);
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
export function formatQuickPickItems(relativeFilePath: string, remotes: string[], branch: string): string[] {
  return remotes
    .map(r => `${r}/blob/${branch}/${relativeFilePath}`)
    .map(r => `[${branch}]${BRANCH_URL_SEP}${r}`);
}

/**
 * Builds quick pick items list.
 *
 * @param {String} relativeFilePath
 * @param {String} masterBranch
 *
 * @return {String[]}
 */
export function prepareQuickPickItems(relativeFilePath: string, masterBranch: string, [remotes, branch]: [string[], string]) : string[] {
  // https://github.com/elm-lang/navigation/blob/master/src/Navigation.elm

  if (masterBranch === branch) {
    return formatQuickPickItems(relativeFilePath, remotes, branch);
  }

  const currentBranchQuickPickList = formatQuickPickItems(relativeFilePath, remotes, branch);
  const masterBranchQuickPickList = formatQuickPickItems(relativeFilePath, remotes, masterBranch);

  return [].concat(currentBranchQuickPickList).reduce(acc => {
    acc.push(
      currentBranchQuickPickList.shift(),
      masterBranchQuickPickList.shift()
    );
    return acc;
  }, []);
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
  const fileUrl = item.split(BRANCH_URL_SEP)[1];

  console.log(fileUrl);

  exec('open ' + fileUrl);
}
