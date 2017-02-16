import { window, workspace } from 'vscode';
import { baseCommand, BRANCH_URL_SEP } from './common';

export default function historyCommand() {
  baseCommand({ github: formatGitHubHistoryUrl, bitbucket: formatBitbucketHistoryUrl });
}

export function formatGitHubHistoryUrl(remote: string, branch: string, filePath: string, line: number): string {
  return `${remote}/commits/${branch}/${filePath}`;
}

export function formatBitbucketHistoryUrl(remote: string, branch: string, filePath: string, line: number): string {
  return `${remote}/history-node/${branch}/${filePath}`;
}
