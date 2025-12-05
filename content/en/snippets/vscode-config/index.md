---
title: VSCode Configuration Files
date: 2025-12-05
author: Yuri Cunha
description: Complete VSCode/VSCodium configuration with extensions list and settings backup for easy migration between installations.
tags:
  - vscode
  - vscodium
  - configuration
  - settings
  - extensions
---

This snippet contains my complete VSCode configuration files for easy migration to VSCodium or fresh VSCode installations. It includes a comprehensive list of extensions and detailed editor settings.

<!--more-->

## Extensions List

Save this file as `extensions.txt` to keep track of all installed extensions:

```txt
ahmadawais.shades-of-purple
continue.continue
davidanson.vscode-markdownlint
donjayamanne.githistory
dotjoshjohnson.xml
eamodio.gitlens
esbenp.prettier-vscode
garmin.monkey-c
github.vscode-pull-request-github
hbenl.vscode-test-explorer
icrawl.discord-vscode
lokalise.i18n-ally
ms-python.autopep8
ms-python.debugpy
ms-python.python
ms-python.vscode-pylance
ms-python.vscode-python-envs
ms-vscode.test-adapter-converter
quick-lint.quick-lint-js
redhat.vscode-xml
ritwickdey.liveserver
saoudrizwan.claude-dev
sirmspencer.vscode-autohide
usernamehw.errorlens
vscode-icons-team.vscode-icons
wakatime.vscode-wakatime
```

## Settings Configuration

Save this file as `settings.json` in your VSCode/VSCodium user settings directory:

```json
{
	"workbench.sideBar.location": "right",
	"files.autoSave": "onWindowChange",
	"editor.fontFamily": "'Fira Code'",
	"editor.fontWeight": "300", // Light
	"editor.fontLigatures": true,
	"editor.smoothScrolling": true,
	"editor.cursorSmoothCaretAnimation": "explicit",
	"editor.cursorBlinking": "expand",
	"editor.formatOnSave": true,
	"workbench.cloudChanges.autoResume": "off",
	"update.enableWindowsBackgroundUpdates": false,
	"telemetry.telemetryLevel": "off",
	"window.restoreWindows": "none",
	"window.commandCenter": true,
	"git.autofetch": true,
	"security.workspace.trust.untrustedFiles": "newWindow",
	"workbench.colorTheme": "Shades of Purple (Super Dark)",
	"editor.inlineSuggest.enabled": true,
	"git.enableSmartCommit": true,
	"git.confirmSync": false,
	"liveServer.settings.fullReload": true,
	"liveServer.settings.useLocalIp": true,
	"[javascript]": {
		"editor.defaultFormatter": "vscode.typescript-language-features"
	},
	"[markdown]": {
		"editor.defaultFormatter": "DavidAnson.vscode-markdownlint"
	},

	"github.copilot.enable": {
		"*": true,
		"plaintext": true,
		"markdown": false,
		"scminput": false,
		"typescriptreact": true
	},
	"git.openRepositoryInParentFolders": "never",
	"typescript.updateImportsOnFileMove.enabled": "always",
	"explorer.confirmDragAndDrop": false,
	"explorer.confirmDelete": false,
	"editor.unicodeHighlight.nonBasicASCII": false,
	"diffEditor.maxComputationTime": 0,
	"[xml]": {
		"editor.defaultFormatter": "DotJoshJohnson.xml"
	},
"[python]": {
      "editor.defaultFormatter": "ms-python.autopep8"
    },
	"[typescriptreact]": {
		"editor.defaultFormatter": "vscode.typescript-language-features"
	},
	"update.mode": "none",
	"[typescript]": {},
	"editor.autoClosingComments": "always",
	"editor.bracketPairColorization.independentColorPoolPerBracketType": true,
	"workbench.experimental.cloudChanges.autoStore": "onShutdown",
	"workbench.list.smoothScrolling": true,
	"workbench.preferredLightColorTheme": "Shades of Purple",
	"workbench.cloudChanges.continueOn": "off",
	"workbench.iconTheme": "vscode-icons",
	"prettier.endOfLine": "auto",
	"prettier.useTabs": true,
	"editor.formatOnPaste": true,
	"editor.defaultFormatter": "esbenp.prettier-vscode",
	"workbench.editor.restoreViewState": false,
	"files.associations": {
		"*.tpl": "markdown",
		"*.mdx": "markdown"
	},
	"diffEditor.ignoreTrimWhitespace": false,
	"gitlens.ai.experimental.provider": "anthropic",
	"gitlens.ai.experimental.anthropic.model": "claude-2.1",
	"vsicons.dontShowNewVersionMessage": true,
	"gitCommitSuggestions.openAIKey": "sk-whoKnows",
	"editor.unicodeHighlight.invisibleCharacters": false,
	"editor.stickyScroll.enabled": false,
	"css.lint.unknownAtRules": "ignore",
	"extensions.ignoreRecommendations": true,
	"extensions.autoCheckUpdates": false,
	"extensions.autoUpdate": false,
	"git.replaceTagsWhenPull": true,
	"discord.suppressNotifications": true,
	"discord.removeRemoteRepository": true,
	"discord.lowerDetailsEditing": " {dir_name}",
	"discord.lowerDetailsDebugging": "Debugging: {file_name}",
	"gitlens.advanced.messages": {
		"suppressLineUncommittedWarning": true
	},
	"workbench.editorAssociations": {
		"*.db-shm": "default",
		"*.dll": "default"
	},
	"editor.unicodeHighlight.ambiguousCharacters": false,
	"editor.largeFileOptimizations": false,
	"editor.minimap.size": "fit",
	"[json]": {
		"editor.defaultFormatter": "vscode.json-language-features"
	},
	"security.allowedUNCHosts": [
		"100.83.216.64"
	],
	"workbench.startupEditor": "none",
	"monkeyC.developerKeyPath": "c:\\Users\\isy\\Documents\\GitHub\\yurounded\\developer_key",
	"window.confirmSaveUntitledWorkspace": false,
	"window.customTitleBarVisibility": "windowed",
	"[html]": {
		"editor.defaultFormatter": "vscode.html-language-features"
	},
	"workbench.secondarySideBar.defaultVisibility": "hidden",
	"chat.disableAIFeatures": true
}
```

## Configuration Locations

### Windows

- **Settings**: `%APPDATA%\Code\User\settings.json`
- **VSCodium**: `%APPDATA%\VSCodium\User\settings.json`

### Linux

- **Settings**: `~/.config/Code/User/settings.json`
- **VSCodium**: `~/.config/VSCodium/User/settings.json`

### macOS

- **Settings**: `~/Library/Application Support/Code/User/settings.json`
- **VSCodium**: `~/Library/Application Support/VSCodium/User/settings.json`

## Installing Extensions from List

To install all extensions from the `extensions.txt` file, you can use this command:

### Bash (Linux/macOS)

```bash
cat extensions.txt | xargs -L 1 code --install-extension
```

### PowerShell (Windows)

```powershell
Get-Content extensions.txt | ForEach-Object { code --install-extension $_ }
```

### For VSCodium

Replace `code` with `codium` in the commands above:

```bash
cat extensions.txt | xargs -L 1 codium --install-extension
```

## Key Features

### Editor Enhancements
- **Font**: Fira Code with ligatures enabled
- **Smooth animations**: Cursor and scrolling
- **Auto-save**: On window change
- **Format on save**: Enabled

### Git Integration
- Auto-fetch enabled
- Smart commits enabled
- GitLens with experimental AI features
- Pull request integration

### Theme & Icons
- **Theme**: Shades of Purple (Super Dark)
- **Icons**: vscode-icons

### Language-Specific Formatters
- **JavaScript/TypeScript**: Built-in formatter
- **Python**: autopep8
- **Markdown**: markdownlint
- **XML**: DotJoshJohnson.xml
- **JSON**: Built-in formatter
- **HTML**: Built-in formatter

### Privacy & Performance
- Telemetry disabled
- Auto-updates disabled
- Cloud sync disabled
- Extension recommendations ignored

> [!WARNING]
> The `settings.json` file contains an API key (`gitCommitSuggestions.openAIKey`). Make sure to remove or replace this with your own key, or better yet, use environment variables for sensitive data.

> [!TIP]
> Before applying these settings to a fresh installation, review each setting to ensure it matches your workflow and preferences. Some settings like file paths may need adjustment for your environment.
