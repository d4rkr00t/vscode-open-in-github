import { window, workspace } from 'vscode';
import { baseCommand, formatBitbucketLinePointer, formatGitHubLinePointer, SelectedLines } from './common';
import { formatBitbucketServerUrl } from './bitbucketServer';

export default function blameCommand() {
  baseCommand('blame', { github: formatGitHubBlameUrl, bitbucket: formatBitbucketBlameUrl, bitbucketServer: formatBitbucketServerUrl });
}

export function formatGitHubBlameUrl(remote: string, branch: string, filePath: string, lines?: SelectedLines): string {
  return `${remote}/blame/${branch}/${filePath}${formatGitHubLinePointer(lines)}`;
}

export function formatBitbucketBlameUrl(remote: string, branch: string, filePath: string, lines?: SelectedLines): string {
  return `${remote}/annotate/${branch}/${filePath}${formatBitbucketLinePointer(filePath, lines)}`;
}
