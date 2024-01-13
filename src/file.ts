import {
  baseCommand,
  formatBitbucketLinePointer,
  formatGitHubLinePointer,
  formatGithubBranchName,
  formatGitHubQueryParams,
  SelectedLines,
  formatGitlabLinePointer,
  Action,
  RemoteURLMappings,
} from "./common";
import { formatBitbucketServerUrl } from "./bitbucketServer";

export default function fileCommand(action: Action) {
  return () =>
    baseCommand("file", action, {
      github: formatGitHubFileUrl,
      bitbucket: formatBitbucketFileUrl,
      bitbucketServer: formatBitbucketServerUrl,
      gitlab: formatGitlabFileUrl,
    });
}

export function formatGitHubFileUrl(
  derivedRemote: string,
  branch: string,
  filePath: string,
  remoteURLMappings: RemoteURLMappings = {},
  lines?: SelectedLines
): string {
  const remote =
    derivedRemote in remoteURLMappings
      ? remoteURLMappings[derivedRemote]
      : derivedRemote;
  return `${remote}/blob/${formatGithubBranchName(
    branch
  )}/${filePath}${formatGitHubQueryParams(filePath)}${formatGitHubLinePointer(
    lines
  )}`;
}

export function formatBitbucketFileUrl(
  derivedRemote: string,
  branch: string,
  filePath: string,
  remoteURLMappings: RemoteURLMappings = {},
  lines?: SelectedLines
): string {
  const remote =
    derivedRemote in remoteURLMappings
      ? remoteURLMappings[derivedRemote]
      : derivedRemote;
  return `${remote}/src/${branch}/${filePath}${formatBitbucketLinePointer(
    filePath,
    lines
  )}`;
}

export function formatGitlabFileUrl(
  derivedRemote: string,
  branch: string,
  filePath: string,
  remoteURLMappings: RemoteURLMappings = {},
  lines?: SelectedLines
): string {
  const remote =
    derivedRemote in remoteURLMappings
      ? remoteURLMappings[derivedRemote]
      : derivedRemote;
  return `${remote}/blob/${formatGithubBranchName(
    branch
  )}/${filePath}${formatGitlabLinePointer(lines)}`;
}
