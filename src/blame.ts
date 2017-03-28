import { window, workspace } from 'vscode';
import { baseCommand, formatBitbucketLinePointer, formatGitHubLinePointer } from './common';

export default function blameCommand() {
  baseCommand('blame', { github: formatGitHubBlameUrl, bitbucket: formatBitbucketBlameUrl });
}

export function formatGitHubBlameUrl(remote: string, branch: string, filePath: string, line?: number): string {
  return `${remote}/blame/${branch}/${filePath}${formatGitHubLinePointer(line)}`;
}

export function formatBitbucketBlameUrl(remote: string, branch: string, filePath: string, line?: number): string {
  return `${remote}/annotate/${branch}/${filePath}${formatBitbucketLinePointer(filePath, line)}`;
}
