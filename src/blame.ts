import { window, workspace } from 'vscode';
import { baseCommand, formatBitbucketLinePointer, formatGitHubLinePointer, SelectedLines } from './common';

export default function blameCommand() {
  baseCommand('blame', { github: formatGitHubBlameUrl, bitbucket: formatBitbucketBlameUrl });
}

export function formatGitHubBlameUrl(remote: string, branch: string, filePath: string, lines?: SelectedLines): string {
  return `${remote}/blame/${branch}/${filePath}${formatGitHubLinePointer(lines)}`;
}

export function formatBitbucketBlameUrl(remote: string, branch: string, filePath: string, lines?: SelectedLines): string {
  return `${remote}/annotate/${branch}/${filePath}${formatBitbucketLinePointer(filePath, lines)}`;
}
