import { window, workspace } from 'vscode';

import { getRemotes, formatRemotes, getCurrentBranch, showQuickPickWindow, prepareQuickPickItems } from './common';

const exec = require('child_process').exec;
const path = require('path');
const opn = require('opn');
const R = require('ramda');

const BRANCH_URL_SEP = '\t—\t';

export default function fileCommand() {
  const activeTextEditor = window.activeTextEditor;

    if (!activeTextEditor) {
      window.showErrorMessage('No opened files.');
      return;
    }

    const filePath = window.activeTextEditor.document.fileName;
    const projectPath = workspace.rootPath;
    const relativeFilePath = path.relative(projectPath, filePath);
    const line = window.activeTextEditor.selection.start.line + 1;
    const defaultBranch = workspace.getConfiguration('openInGitHub').get('defaultBranch') || 'master';

    const getRemotesPromise = getRemotes(exec, projectPath).then(formatRemotes);
    const getCurrentBranchPromise = getCurrentBranch(exec, projectPath);

    Promise.all([getRemotesPromise, getCurrentBranchPromise])
      .then(prepareQuickPickItems.bind(null, formatQuickPickItems, relativeFilePath, line, defaultBranch))
      .then(showQuickPickWindow)
      .catch(err => window.showErrorMessage(err));
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
