import { window, workspace } from 'vscode';

import { baseCommand, BRANCH_URL_SEP } from './common';

const exec = require('child_process').exec;
const path = require('path');
const opn = require('opn');
const R = require('ramda');

export default function fileCommand() {
  baseCommand(formatQuickPickItems);
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
