import { window, workspace, QuickPickItem } from "vscode";

const exec = require("child_process").exec;
const path = require("path");
const open = require("open");
const R = require("ramda");
const clipboardy = require("clipboardy");

export const BRANCH_URL_SEP = " — ";

interface Formatters {
  github: Function;
  bitbucket: Function;
  bitbucketServer: Function;
  gitlab: Function;
}

export interface SelectedLines {
  start: number;
  end?: number;
}

export type Action = (item?: QuickPickItem) => void;

/**
 * Makes initial preparations for all commands.
 *
 * @return {Promise}
 */
export function baseCommand(
  commandName: string,
  action: Action,
  formatters: Formatters
) {
  const activeTextEditor = window.activeTextEditor;

  if (!activeTextEditor) {
    window.showErrorMessage("No opened files.");
    return;
  }

  const filePath = window.activeTextEditor.document.fileName;
  const fileUri = window.activeTextEditor.document.uri;
  const lineStart = window.activeTextEditor.selection.start.line + 1;
  const lineEnd = window.activeTextEditor.selection.end.line + 1;
  const selectedLines = { start: lineStart, end: lineEnd };
  const config = workspace.getConfiguration(
    "openInGitHub",
    window.activeTextEditor.document.uri
  );
  const defaultBranch =
    workspace
      .getConfiguration("openInGitHub", fileUri)
      .get<string>("defaultBranch") || "master";
  const defaultRemote =
    workspace
      .getConfiguration("openInGitHub", fileUri)
      .get<string>("defaultRemote") || "origin";
  const maxBuffer =
    workspace
      .getConfiguration("openInGithub", fileUri)
      .get<number>("maxBuffer") || undefined;
  const excludeCurrentRevision =
    workspace
      .getConfiguration("openInGitHub")
      .get<boolean>("excludeCurrentRevision") || false;
  const repositoryType = config.get<string>("repositoryType");
  const projectPath = path.dirname(filePath);

  return getRepoRoot(exec, projectPath).then(repoRootPath => {
    const relativeFilePath = path.relative(repoRootPath, filePath);

    return getBranches(
      exec,
      projectPath,
      defaultBranch,
      maxBuffer,
      excludeCurrentRevision
    )
      .then(branches => {
        const getRemotesPromise = getRemotes(
          exec,
          projectPath,
          defaultRemote,
          defaultBranch,
          branches
        ).then(formatRemotes);
        return Promise.all([getRemotesPromise, branches]);
      })
      .then(result =>
        prepareQuickPickItems(
          repositoryType,
          formatters,
          commandName,
          relativeFilePath,
          selectedLines,
          result
        )
      )
      .then(showQuickPickWindow)
      .then(item => action(item))
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
export function getRepoRoot(exec, workspacePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(
      "git rev-parse --show-toplevel",
      { cwd: workspacePath },
      (error, stdout, stderr) => {
        if (stderr || error) return reject(stderr || error);
        resolve(stdout.trim());
      }
    );
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
export function getRemotes(
  exec,
  projectPath: string,
  defaultRemote: string,
  defaultBranch: string,
  branches: string[]
) {
  /**
   * If there is only default branch that was pushed to remote then return only default remote.
   */
  if (branches.length === 1 && branches[0] === defaultBranch) {
    return getRemoteByName(exec, projectPath, defaultRemote);
  }

  return getAllRemotes(exec, projectPath, defaultRemote);
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
export function getAllRemotes(
  exec,
  projectPath: string,
  defaultRemote: string
): Promise<string[]> {
  const sortRemoteByDefaultRemote = (defaultRemote: string) =>
    defaultRemote
      ? R.sort((a, b) =>
          a[0].startsWith(defaultRemote)
            ? -1
            : b[0].startsWith(defaultRemote)
            ? 1
            : 0
        )
      : R.identity;
  const process = R.compose(
    R.uniq,
    R.map(R.head),
    R.map(R.split(" ")),
    R.reject(R.isEmpty),
    R.map(R.last),
    sortRemoteByDefaultRemote(defaultRemote),
    R.map(R.split(/\t/)),
    R.split("\n")
  );

  return new Promise((resolve, reject) => {
    exec("git remote -v", { cwd: projectPath }, (error, stdout, stderr) => {
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
export function getRemoteByName(
  exec,
  projectPath: string,
  remoteName: string
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    exec(
      `git config --get remote.${remoteName}.url`,
      { cwd: projectPath },
      (error, stdout, stderr) => {
        if (stderr || error) return reject(stderr || error);
        resolve([stdout]);
      }
    );
  });
}

/**
 * Returns formatted list of remotes.
 *
 * @param {String[]} remotes
 *
 * @return {String[]}
 */
export function formatRemotes(remotes: string[]): string[] {
  const process = R.compose(
    R.uniq,
    R.map(R.replace(/\/$/, "")),
    R.reject(R.isEmpty),
    R.map(R.replace(/\n/, "")),
    R.map(R.trim),
    R.map(rem => rem.replace(/\/\/(.+)@github/, "//github")),
    R.map(rem =>
      rem.match(/github\.com/) ? rem.replace(/\.git(\b|$)/, "") : rem
    ),
    R.reject(R.isNil),
    R.map(rem => {
      if (rem.match(/^https?:/)) {
        return rem.replace(/\.git(\b|$)/, "");
      } else if (rem.match(/@/)) {
        return (
          "https://" +
          rem
            .replace(/^.+@/, "")
            .replace(/\.git(\b|$)/, "")
            .replace(/:/g, "/")
        );
      } else if (rem.match(/^ftps?:/)) {
        return rem.replace(/^ftp/, "http");
      } else if (rem.match(/^ssh:/)) {
        return rem.replace(/^ssh/, "https");
      } else if (rem.match(/^git:/)) {
        return rem.replace(/^git/, "https");
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
export function getBranches(
  exec,
  projectPath: string,
  defaultBranch: string,
  maxBuffer?: number,
  excludeCurrentRevision?: boolean
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const options: any = { cwd: projectPath };
    if (maxBuffer) options.maxBuffer = maxBuffer;

    exec("git branch --no-color -a", options, (error, stdout, stderr) => {
      if (stderr || error) return reject(stderr || error);

      const getCurrentBranch = R.compose(
        R.trim,
        R.replace("*", ""),
        R.find(line => line.startsWith("*")),
        R.split("\n")
      );

      const processBranches = R.compose(
        R.filter(br => stdout.match(new RegExp(`remotes\/.*\/${br}`))),
        R.uniq
      );

      const currentBranch = getCurrentBranch(stdout);
      const branches = processBranches([currentBranch, defaultBranch]);

      return excludeCurrentRevision
        ? resolve(branches)
        : getCurrentRevision(exec, projectPath).then(currentRevision => {
            return resolve(branches.concat(currentRevision));
          });
    });
  });
}

/**
 * Returns the commit sha for HEAD.
 *
 * @param {Function} exec
 * @param {String} projectPath
 * @param {String} defaultBranch
 *
 * @return {Promise<String>}
 */
export function getCurrentRevision(exec, projectPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(
      "git rev-parse HEAD",
      { cwd: projectPath },
      (error, stdout, stderr) => {
        if (stderr || error) return reject(stderr || error);
        resolve(stdout.trim());
      }
    );
  });
}

export function formatQuickPickItems(
  repositoryType: string,
  formatters: Formatters,
  commandName: string,
  relativeFilePath: string,
  lines: SelectedLines,
  remotes: string[],
  branch: string
): QuickPickItem[] {
  return remotes
    .map(remote => ({
      remote,
      url: chooseFormatter(formatters, repositoryType, remote)(
        remote,
        branch,
        relativeFilePath,
        lines
      )
    }))
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
export function prepareQuickPickItems(
  repositoryType: string,
  formatters: Formatters,
  commandName: string,
  relativeFilePath: string,
  lines: SelectedLines,
  [remotes, branches]: string[][]
): QuickPickItem[] {
  if (!branches.length) {
    return [];
  }

  if (branches.length === 1) {
    return formatQuickPickItems(
      repositoryType,
      formatters,
      commandName,
      relativeFilePath,
      lines,
      remotes,
      branches[0]
    );
  }

  const processBranches = R.compose(
    R.flatten,
    // Join: [1,2,3], [4,5,6], [7,8,9] -> [1,4,7], [2,5,8], [3,6,9]
    results =>
      R.map(
        i => R.map(item => item[i], results),
        R.range(0, results[0].length)
      ),
    R.map(branch =>
      formatQuickPickItems(
        repositoryType,
        formatters,
        commandName,
        relativeFilePath,
        lines,
        remotes,
        branch
      )
    )
  );
  return processBranches(branches);
}

export function formatGithubBranchName(branch) {
  return branch
    .split("/")
    .map(c => encodeURIComponent(c))
    .join("/");
}

/**
 * Returns true if remote is bitbucket.
 */
export function isBitbucket(remote: string): boolean {
  return !!remote.match("bitbucket.org");
}

/**
 * Returns true if remote is gitlab.
 */
export function isGitlab(remote: string): boolean {
  return !!remote.match("gitlab.com");
}

export function formatBitbucketLinePointer(
  filePath: string,
  lines?: SelectedLines
): string {
  if (!lines || !lines.start) {
    return "";
  }
  const fileBasename = `#${path.basename(filePath)}`;
  let linePointer = `${fileBasename}-${lines.start}`;
  if (lines.end && lines.end != lines.start) linePointer += `:${lines.end}`;

  return linePointer;
}

export function formatGitHubLinePointer(lines?: SelectedLines): string {
  if (!lines || !lines.start) {
    return "";
  }

  let linePointer = `#L${lines.start}`;
  if (lines.end && lines.end != lines.start) linePointer += `-L${lines.end}`;

  return linePointer;
}

export function formatGitlabLinePointer(lines?: SelectedLines): string {
  if (!lines || !lines.start) {
    return "";
  }

  let linePointer = `#L${lines.start}`;
  if (lines.end && lines.end != lines.start) linePointer += `-${lines.end}`;

  return linePointer;
}

/**
 * Shows quick pick window.
 *
 * @param {String[]} quickPickList
 */
export function showQuickPickWindow(quickPickList: QuickPickItem[]) {
  if (quickPickList.length === 1) {
    return Promise.resolve(quickPickList[0]);
  }

  return window.showQuickPick(quickPickList);
}

/**
 * Opens given quick pick item in browser.
 *
 * @param {String} item
 */
export function openQuickPickItem(item?: QuickPickItem) {
  if (!item) return;
  open((item as any).url);
}

/**
 * Copies given quick pick item to the clipboard.
 *
 * @param {String} item
 */
export function copyQuickPickItem(item?: QuickPickItem) {
  if (!item) return;
  const url = (item as any).url;
  clipboardy.writeSync(url);
  window.showInformationMessage("Copied to the clipboard: " + url);
}

/**
 * Chooses proper formatter based on repository type.
 */
function chooseFormatter(
  formatters: Formatters,
  repositoryType: string,
  remote: string
): Function {
  switch (repositoryType) {
    case "auto": {
      if (isBitbucket(remote)) {
        return formatters.bitbucket;
      }

      if (isGitlab(remote)) {
        return formatters.gitlab;
      }

      return formatters.github;
    }
    case "github":
      return formatters.github;
    case "bitbucket":
      return formatters.bitbucket;
    case "bitbucket-server":
      return formatters.bitbucketServer;
    case "gitlab":
      return formatters.gitlab;
  }
}
