import { window, workspace } from 'vscode';
import { baseCommand, formatBitbucketLinePointer, formatGitHubLinePointer, formatGithubBranchName, SelectedLines } from './common';
import { formatBitbucketServerUrl } from './bitbucketServer';

export default function fileCommand() {
  baseCommand('file', { github: formatGitHubFileUrl, bitbucket: formatBitbucketFileUrl, bitbucketServer: formatBitbucketServerUrl });
}

export function formatGitHubFileUrl(remote: string, branch: string, filePath: string, lines?: SelectedLines): string {
  return `${remote}/blob/${formatGithubBranchName(branch)}/${filePath}${formatGitHubLinePointer(lines)}`;
}

export function formatBitbucketFileUrl(remote: string, branch: string, filePath: string, lines?: SelectedLines): string {
  return `${remote}/src/${branch}/${filePath}${formatBitbucketLinePointer(filePath, lines)}`;
}
