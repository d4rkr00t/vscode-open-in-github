import {
  baseCommand,
  formatBitbucketLinePointer,
  formatGitHubLinePointer,
  formatGithubBranchName,
  SelectedLines,
  formatGitlabLinePointer,
  Action,
  RemoteURLMappings,
} from "./common";
import { formatBitbucketServerUrl } from "./bitbucketServer";

export default function blameCommand(action: Action) {
  return () =>
    baseCommand("blame", action, {
      github: formatGitHubBlameUrl,
      bitbucket: formatBitbucketBlameUrl,
      bitbucketServer: formatBitbucketServerUrl,
      gitlab: formatGitlabBlameUrl,
    });
}

export function formatGitHubBlameUrl(
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
  return `${remote}/blame/${formatGithubBranchName(
    branch
  )}/${filePath}${formatGitHubLinePointer(lines)}`;
}

export function formatBitbucketBlameUrl(
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
  return `${remote}/annotate/${branch}/${filePath}${formatBitbucketLinePointer(
    filePath,
    lines
  )}`;
}

export function formatGitlabBlameUrl(
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
  return `${remote}/blame/${formatGithubBranchName(
    branch
  )}/${filePath}${formatGitlabLinePointer(lines)}`;
}
