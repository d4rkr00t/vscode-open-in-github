import { window, workspace } from "vscode";
import {
  baseCommand,
  formatGithubBranchName,
  SelectedLines,
  Action
} from "./common";
import { formatBitbucketServerUrl } from "./bitbucketServer";

export default function historyCommand(action: Action) {
  return () =>
    baseCommand("history", action, {
      github: formatGitHubHistoryUrl,
      bitbucket: formatBitbucketHistoryUrl,
      bitbucketServer: formatBitbucketServerUrl,
      gitlab: formatGitHubHistoryUrl
    });
}

export function formatGitHubHistoryUrl(
  remote: string,
  branch: string,
  filePath: string,
  lines: SelectedLines
): string {
  return `${remote}/commits/${formatGithubBranchName(branch)}/${filePath}`;
}

export function formatBitbucketHistoryUrl(
  remote: string,
  branch: string,
  filePath: string,
  lines: SelectedLines
): string {
  return `${remote}/history-node/${branch}/${filePath}`;
}
