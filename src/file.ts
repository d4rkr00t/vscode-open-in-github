import { window, workspace } from 'vscode';
import { baseCommand, formatBitbucketLinePointer, formatGitHubLinePointer, SelectedLines } from './common';

export default function fileCommand() {
  baseCommand('file', { github: formatGitHubFileUrl, bitbucket: formatBitbucketFileUrl });
}

export function formatGitHubFileUrl(remote: string, branch: string, filePath: string, lines?: SelectedLines): string {
  return `${remote}/blob/${branch}/${filePath}${formatGitHubLinePointer(lines)}`;
}

export function formatBitbucketFileUrl(remote: string, branch: string, filePath: string, lines?: SelectedLines): string {
  return `${remote}/src/${branch}/${filePath}${formatBitbucketLinePointer(filePath, lines)}`;
}
