import { window, workspace } from 'vscode';
import { baseCommand, BRANCH_URL_SEP, SelectedLines } from './common';
import { formatBitbucketServerUrl } from './bitbucketServer';

export default function historyCommand() {
  baseCommand('history', { github: formatGitHubHistoryUrl, bitbucket: formatBitbucketHistoryUrl, bitbucketServer: formatBitbucketServerUrl });
}

export function formatGitHubHistoryUrl(remote: string, branch: string, filePath: string, lines: SelectedLines): string {
  return `${remote}/commits/${branch}/${filePath}`;
}

export function formatBitbucketHistoryUrl(remote: string, branch: string, filePath: string, lines: SelectedLines): string {
  return `${remote}/history-node/${branch}/${filePath}`;
}
