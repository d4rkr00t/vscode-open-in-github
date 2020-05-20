import { window, workspace } from "vscode";
import {
  baseCommand,
  formatBitbucketLinePointer,
  formatGitHubLinePointer,
  formatGithubBranchName,
  SelectedLines,
  formatGitlabLinePointer,
  Action
} from "./common";
import { formatBitbucketServerUrl } from "./bitbucketServer";

export default function blameCommand(action: Action) {
  return () =>
    baseCommand("blame", action, {
      github: formatGitHubBlameUrl,
      bitbucket: formatBitbucketBlameUrl,
      bitbucketServer: formatBitbucketServerUrl,
      gitlab: formatGitlabBlameUrl
    });
}

export function formatGitHubBlameUrl(
  remote: string,
  branch: string,
  filePath: string,
  lines?: SelectedLines
): string {
  return `${remote}/blame/${formatGithubBranchName(
    branch
  )}/${filePath}${formatGitHubLinePointer(lines)}`;
}

export function formatBitbucketBlameUrl(
  remote: string,
  branch: string,
  filePath: string,
  lines?: SelectedLines
): string {
  return `${remote}/annotate/${branch}/${filePath}${formatBitbucketLinePointer(
    filePath,
    lines
  )}`;
}

export function formatGitlabBlameUrl(
  remote: string,
  branch: string,
  filePath: string,
  lines?: SelectedLines
): string {
  return `${remote}/blame/${formatGithubBranchName(
    branch
  )}/${filePath}${formatGitlabLinePointer(lines)}`;
}
