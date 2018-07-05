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

* Open the file in GitHub — "Open In GitHub: File"
* Open the blame in GitHub — "Open In GitHub: Blame"
* Open the history in GitHub — "Open In GitHub: History"

![Commands](assets/commands.png)
![Multiple remotes](assets/multiple-remotes-and-branches.png)

## Features

* Supports multiple remotes and branches.
* Supports in-house GitHub installations.
* Works with Bitbucket.
* Configurable default branch.
* Open multiline selection.
* Open the current revision.

## Configuration

Add these lines to the workspace settings:

```js
{
  ...
  "openInGitHub.defaultBranch": "master",
  "openInGitHub.defaultRemote": "origin",
  "openInGitHub.includeCurrentRevision": true,
  ...
}
```

## TODO
* Open Repository
* Open Pull Request related to the file

## Links

Logo taken from here: [https://octodex.github.com/](https://octodex.github.com/)
