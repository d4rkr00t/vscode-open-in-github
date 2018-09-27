import { window, workspace, QuickPickItem } from 'vscode';

const exec = require('child_process').exec;
const path = require('path');
const opn = require('opn');
const R = require('ramda');

export const BRANCH_URL_SEP = ' — ';

interface Formatters {
  github: Function,
  bitbucket: Function
}

export interface SelectedLines {
  start: number,
  end?: number
}

/**
 * Makes initial preparations for all commands.
 *
 * @return {Promise}
 */
export function baseCommand(commandName: string, formatters: Formatters) {
  const activeTextEditor = window.activeTextEditor;

  if (!activeTextEditor) {
    window.showErrorMessage('No opened files.');
    return;
  }

  const filePath = window.activeTextEditor.document.fileName;
  const fileUri = window.activeTextEditor.document.uri;
  const lineStart = window.activeTextEditor.selection.start.line + 1;
  const lineEnd = window.activeTextEditor.selection.end.line + 1;
  const selectedLines = { start: lineStart, end: lineEnd };
  const defaultBranch = workspace.getConfiguration('openInGitHub', fileUri).get<string>('defaultBranch') || 'master';
  const defaultRemote = workspace.getConfiguration('openInGitHub', fileUri).get<string>('defaultRemote') || 'origin';
  const projectPath = path.dirname(filePath);

  return getRepoRoot(exec, projectPath)
    .then(repoRootPath => {
      const relativeFilePath = path.relative(repoRootPath, filePath);

      return getBranches(exec, projectPath, defaultBranch)
        .then(branches => {
          const getRemotesPromise =
            getRemotes(exec, projectPath, defaultRemote, defaultBranch, branches).then(formatRemotes);
          return Promise.all([getRemotesPromise, branches])
        })
        .then(result => prepareQuickPickItems(formatters, commandName, relativeFilePath, selectedLines, result))
        .then(showQuickPickWindow)
        .catch(err => window.showErrorMessage(err));
    });

}

/**
 * Returns repo root path.
 *
 * @param {Function} exec
 * @param {String} workspacePath
 *
 * @return {Promise<String>}
 */
export function getRepoRoot(exec, workspacePath: string) : Promise<string> {
  return new Promise((resolve, reject) => {
    exec('git rev-parse --show-toplevel', { cwd: workspacePath }, (error, stdout, stderr) => {
      if (stderr || error) return reject(stderr || error);
      resolve(stdout.trim());
    });
  });
}

/**
 * Returns raw list of remotes.
 *
 * @param {Function} exec
 * @param {String} projectPath
 * @param {String} defaultRemote
 * @param {String} defaultBranch
 * @param {String[]} branches
 *
 * @return {Promise<String[]>}
 */
export function getRemotes(exec, projectPath: string, defaultRemote: string, defaultBranch: string, branches: string[]) {
  /**
   * If there is only default branch that was pushed to remote then return only default remote.
   */
  if (branches.length === 1 && branches[0] === defaultBranch) {
    return getRemoteByName(exec, projectPath, defaultRemote);
  }

  return getAllRemotes(exec, projectPath);
}

/**
 * Returns raw list of all remotes.
 *
 * @todo: Should work on windows too...
 *
 * @param {Function} exec
 * @param {String} projectPath
 *
 * @return {Promise<String[]>}
 */
export function getAllRemotes(exec, projectPath: string) : Promise<string[]> {
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
 * Returns raw remote by given name e.g. – origin
 *
 * @param {Function} exec
 * @param {String} projectPath
 * @param {String} remoteName
 *
 * @return {Promise<String[]>}
 */
export function getRemoteByName(exec, projectPath: string, remoteName: string) : Promise<string[]> {
  return new Promise((resolve, reject) => {
    exec(`git config --get remote.${remoteName}.url`, { cwd: projectPath }, (error, stdout, stderr) => {
      if (stderr || error) return reject(stderr || error);
      resolve([stdout]);
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
    R.uniq,
    R.map(R.replace(/\/$/, '')),
    R.reject(R.isEmpty),
    R.map(R.replace(/\n/, '')),
    R.map(R.trim),
    R.map(rem => rem.replace(/\/\/(.+)@github/, '//github')),
    R.map(rem =>
      rem.match(/github\.com/)
        ? rem.replace(/\.git(\b|$)/, '')
        : rem),
    R.reject(R.isNil),
    R.map(rem => {
      if (rem.match(/^https?:/)) {
        return rem.replace(/\.git(\b|$)/, '');
      } else if (rem.match(/@/)) {
        return 'https://' +
          rem
            .replace(/^.+@/, '')
            .replace(/\.git(\b|$)/, '')
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
 * @param {String} defaultBranch
 *
 * @return {Promise<String>}
 */
export function getBranches(exec, projectPath: string, defaultBranch: string) : Promise<string[]> {
  return new Promise((resolve, reject) => {
    exec('git branch --no-color -a', { cwd: projectPath }, (error, stdout, stderr) => {
      if (stderr || error) return reject(stderr || error);

      const getCurrentBranch = R.compose(
        R.trim,
        R.replace('*', ''),
        R.find(line => line.startsWith('*')),
        R.split('\n')
      );

      const processBranches = R.compose(
        R.filter(br => stdout.match(new RegExp(`remotes\/.*\/${br}`))),
        R.uniq
      );

      const currentBranch = getCurrentBranch(stdout);
      const branches = processBranches([currentBranch, defaultBranch]);

      resolve(branches);
    });
  });
}

export function formatQuickPickItems(formatters: Formatters, commandName: string, relativeFilePath: string, lines: SelectedLines, remotes: string[], branch: string): QuickPickItem[] {
  return remotes
    .map(remote => (
      isBitbucket(remote)
        ? { remote, url: formatters.bitbucket(remote, branch, relativeFilePath, lines) }
        : { remote, url: formatters.github(remote, branch, relativeFilePath, lines) }))
    .map(remote => ({
      label: relativeFilePath,
      detail: `${branch} | ${remote.remote}`,
      description: `[${commandName}]`,
      url: remote.url
    }));
}

/**
 * Builds quick pick items list.
 *
 * @param {String} relativeFilePath
 * @param {SelectedLines} lines
 *
 * @return {String[]}
 */
export function prepareQuickPickItems(formatters: Formatters, commandName: string, relativeFilePath: string, lines: SelectedLines, [remotes, branches]: string[][]): QuickPickItem[] {
  if (!branches.length) {
    return [];
  }

  if (branches.length === 1) {
    return formatQuickPickItems(formatters, commandName, relativeFilePath, lines, remotes, branches[0]);
  }

  const processBranches = R.compose(
    R.flatten,
    (result) => R.zip(result[0], result[1]),
    R.map(branch => formatQuickPickItems(formatters, commandName, relativeFilePath, lines, remotes, branch))
  );

  return processBranches(branches);
}

/**
 * Returns true if remote is butbicket.
 */
export function isBitbucket(remote: string): boolean {
  return !!remote.match('bitbucket.org');
}

export function formatBitbucketLinePointer(filePath: string, lines?: SelectedLines): string {
  if (!lines || !lines.start) {
    return '';
  }
  const fileBasename = `#${path.basename(filePath)}`;
  let linePointer = `${fileBasename}-${lines.start}`;
  if (lines.end && lines.end != lines.start) linePointer += `:${lines.end}`;

  return linePointer;
}

export function formatGitHubLinePointer(lines?: SelectedLines): string {
  if (!lines || !lines.start) {
    return '';
  }

  let linePointer = `#L${lines.start}`;
  if (lines.end && lines.end != lines.start) linePointer += `:L${lines.end}`;

  return linePointer;
}

/**
 * Shows quick pick window.
 *
 * @param {String[]} quickPickList
 */
export function showQuickPickWindow(quickPickList: QuickPickItem[]) {
  if (quickPickList.length === 1) {
    openQuickPickItem(quickPickList[0]);
    return;
  }

  window
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
export function openQuickPickItem(item?: QuickPickItem) {
  if (!item) return;
  opn((item as any).url);
}
