# Open in GitHub

[![github-issues](https://img.shields.io/github/issues/d4rkr00t/vscode-open-in-github.svg)](https://github.com/d4rkr00t/vscode-open-in-github/issues)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cl)

Provides commands to quickly view the current file on GitHub/Bitbucket.

## Installation

Launch VS Code Quick Open (⌘+P), paste the following command, and type enter.

```
ext install vscode-open-in-github
```

## Usage

When editing a file, use the command palette (cmd + shift + p / ctrl + shift + p) to:

- Open the file in GitHub — "Open In GitHub: File"
- Open the blame in GitHub — "Open In GitHub: Blame"
- Open the history in GitHub — "Open In GitHub: History"
- Copy GitHub URL for a file — "Copy GitHub URL: File"
- Copy GitHub URL for blame for a file — "Copy GitHub URL: Blame"
- Copy GitHub URL for history for a file — "Copy GitHub URL: History"

![Commands](assets/commands.png)
![Multiple remotes](assets/multiple-remotes-and-branches.png)

## Features

- Supports multiple remotes and branches.
- Supports in-house GitHub installations.
- Works with Bitbucket and Gitlab.
- Configurable default branch.
- Open/Copy multiline selection.
- Open/Copy current revision.

## Configuration

Add these lines to the workspace settings:

```js
{
  ...
  "openInGitHub.defaultBranch": "master",
  "openInGitHub.defaultRemote": "origin",
  "openInGithub.maxBuffer": 512000,

  
  // When enabled skips branch detection and always uses default branch.
  "openInGitHub.alwaysUseDeafultBranch": false,

  // Determines whether to disable URL suggestions for the current revision (commit SHA)
  "openInGitHub.excludeCurrentRevision": false,

  // Allows mapping from one remote to another when generating a URL
  "openInGitHub.remoteURLMapping": {
    "https://mirror.github.com": "https://github.com",
  }
  ...
}
```

## Links

Logo taken from here: [https://octodex.github.com/](https://octodex.github.com/)
