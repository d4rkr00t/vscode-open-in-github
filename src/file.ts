import { window, workspace } from 'vscode';
import { baseCommand, formatBitbucketLinePointer, formatGitHubLinePointer } from './common';

export default function fileCommand() {
  baseCommand({ github: formatGitHubFileUrl, bitbucket: formatBitbucketFileUrl });
}

export function formatGitHubFileUrl(remote: string, branch: string, filePath: string, line?: number): string {
  return `${remote}/blob/${branch}/${filePath}${formatGitHubLinePointer(line)}`;
}

export function formatBitbucketFileUrl(remote: string, branch: string, filePath: string, line?: number): string {
  return `${remote}/src/${branch}/${filePath}${formatBitbucketLinePointer(filePath, line)}`;
}
