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

This snippet contains **my personal VSCode configuration files** for easy migration to VSCodium or fresh VSCode installations. It includes a comprehensive list of extensions and detailed editor settings.

> [!WARNING]
> These are **my personal configurations**. Review and adjust settings before applying them to your setup. Some settings like file paths, API keys, and preferences may need customization for your environment.

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

## Automated Sync: VSCode → VSCodium

Instead of manually copying files and installing extensions, you can automate the entire process with these scripts. They copy all configurations (settings, keybindings, snippets, profiles) from VSCode to VSCodium and install all your extensions automatically.

### PowerShell Script (Cross-Platform)

This script works on both Windows and Linux with PowerShell 7.

Save as `sync-vscode-to-vscodium.ps1`:

```powershell
param(
    [string]$VSCodiumCli = ""
)

# script to copy vscode configs to vscodium
# and sync extensions (vscode -> vscodium)

function Get-VSCodeUserDir {
    if ($IsWindows) {
        return (Join-Path $env:APPDATA "Code\User")
    } elseif ($IsLinux -or $IsMacOS) {
        return "$HOME/.config/Code/User"
    } else {
        throw "operating system not supported"
    }
}

function Get-VSCodiumUserDir {
    if ($IsWindows) {
        return (Join-Path $env:APPDATA "VSCodium\User")
    } elseif ($IsLinux -or $IsMacOS) {
        return "$HOME/.config/VSCodium/User"
    } else {
        throw "operating system not supported"
    }
}

function Find-VSCodiumCli {
    param([string]$Preferred)

    if ($Preferred) {
        # if user provided a path, try it first
        $cmd = Get-Command $Preferred -ErrorAction SilentlyContinue
        if ($cmd) { return $cmd.Source }
        if (Test-Path $Preferred) { return $Preferred }
    }

    # try common names in path
    foreach ($name in "codium", "vscodium") {
        $cmd = Get-Command $name -ErrorAction SilentlyContinue
        if ($cmd) { return $cmd.Source }
    }

    # try default paths by system
    if ($IsWindows) {
        $candidates = @(
            "$env:LOCALAPPDATA\Programs\VSCodium\VSCodium.exe",
            "C:\Program Files\VSCodium\VSCodium.exe"
        )
    } else {
        $candidates = @(
            "/usr/bin/codium",
            "/usr/local/bin/codium",
            "/snap/bin/codium"
        )
    }

    foreach ($path in $candidates) {
        if (Test-Path $path) { return $path }
    }

    throw "could not find vscodium executable. pass the path in -VSCodiumCli"
}

Write-Host "=== sync vscode -> vscodium ==="

$vsCodeUser = Get-VSCodeUserDir
$vscodiumUser = Get-VSCodiumUserDir

if (-not (Test-Path $vsCodeUser)) {
    throw "vscode configuration folder not found: $vsCodeUser"
}

New-Item -ItemType Directory -Path $vscodiumUser -Force | Out-Null

Write-Host "vscode folder  :" $vsCodeUser
Write-Host "vscodium folder:" $vscodiumUser

# copy settings.json
$settings = Join-Path $vsCodeUser "settings.json"
if (Test-Path $settings) {
    Copy-Item $settings $vscodiumUser -Force
    Write-Host "copied settings.json"
} else {
    Write-Host "warning: settings.json not found in vscode"
}

# copy keybindings.json
$keybindings = Join-Path $vsCodeUser "keybindings.json"
if (Test-Path $keybindings) {
    Copy-Item $keybindings $vscodiumUser -Force
    Write-Host "copied keybindings.json"
} else {
    Write-Host "warning: keybindings.json not found in vscode"
}

# copy snippets
$snippets = Join-Path $vsCodeUser "snippets"
if (Test-Path $snippets) {
    Copy-Item $snippets $vscodiumUser -Recurse -Force
    Write-Host "copied snippets directory"
}

# copy profiles (if exists)
$profiles = Join-Path $vsCodeUser "profiles"
if (Test-Path $profiles) {
    Copy-Item $profiles $vscodiumUser -Recurse -Force
    Write-Host "copied profiles directory"
}

# export vscode extensions list
Write-Host ""
Write-Host "exporting vscode extensions..."

$extensions = @()
try {
    $extensions = code --list-extensions
} catch {
    Write-Host "error running 'code --list-extensions'. check if the 'code' command works in terminal."
}

if (-not $extensions -or $extensions.Count -eq 0) {
    Write-Host "no extensions found or 'code' command did not work."
} else {
    $backupFile = Join-Path $HOME "vscode-extensions-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
    $extensions | Set-Content -Encoding UTF8 $backupFile
    Write-Host "extensions list saved to:" $backupFile

    # find vscodium cli
    $vscodiumCliPath = Find-VSCodiumCli -Preferred $VSCodiumCli
    Write-Host ""
    Write-Host "using vscodium cli:" $vscodiumCliPath
    Write-Host ""
    Write-Host "installing extensions in vscodium..."

    foreach ($ext in $extensions) {
        if ([string]::IsNullOrWhiteSpace($ext)) { continue }
        Write-Host "  installing $ext"
        try {
            & $vscodiumCliPath --install-extension $ext | Out-Null
        } catch {
            Write-Host "  failed to install $ext"
        }
    }

    Write-Host ""
    Write-Host "sync completed."
}
```

#### Usage on Windows

Run the script with PowerShell 7:

```powershell
.\sync-vscode-to-vscodium.ps1
```

If the script can't find VSCodium automatically, specify the path:

```powershell
.\sync-vscode-to-vscodium.ps1 -VSCodiumCli "C:\Program Files\VSCodium\VSCodium.exe"
```

#### Usage on Linux with PowerShell 7

If you have `pwsh` installed:

```bash
pwsh ./sync-vscode-to-vscodium.ps1
```

Or specify a custom VSCodium command:

```bash
pwsh ./sync-vscode-to-vscodium.ps1 -VSCodiumCli vscodium
```

### Bash Script (Linux Only)

Save as `sync-vscode-to-vscodium.sh`:

```bash
#!/usr/bin/env bash
set -e

# simple script to sync vscode -> vscodium on linux

VSCODE_USER="$HOME/.config/Code/User"
VSCODIUM_USER="$HOME/.config/VSCodium/User"

# allow overriding command via environment variable
VSCODIUM_CLI="${VSCODIUM_CLI:-codium}"

echo "vscode folder   : $VSCODE_USER"
echo "vscodium folder : $VSCODIUM_USER"
echo "vscodium cli   : $VSCODIUM_CLI"
echo

if [ ! -d "$VSCODE_USER" ]; then
  echo "error: vscode folder not found: $VSCODE_USER"
  exit 1
fi

mkdir -p "$VSCODIUM_USER"

# copy settings
if [ -f "$VSCODE_USER/settings.json" ]; then
  cp "$VSCODE_USER/settings.json" "$VSCODIUM_USER/"
  echo "copied settings.json"
fi

# copy keybindings
if [ -f "$VSCODE_USER/keybindings.json" ]; then
  cp "$VSCODE_USER/keybindings.json" "$VSCODIUM_USER/"
  echo "copied keybindings.json"
fi

# copy snippets
if [ -d "$VSCODE_USER/snippets" ]; then
  cp -r "$VSCODE_USER/snippets" "$VSCODIUM_USER/"
  echo "copied snippets directory"
fi

# copy profiles
if [ -d "$VSCODE_USER/profiles" ]; then
  cp -r "$VSCODE_USER/profiles" "$VSCODIUM_USER/"
  echo "copied profiles directory"
fi

echo
echo "exporting vscode extensions..."

if ! command -v code >/dev/null 2>&1; then
  echo "error: 'code' command not found in path."
  exit 1
fi

EXT_FILE="$HOME/vscode-extensions-$(date +%Y%m%d-%H%M%S).txt"
code --list-extensions > "$EXT_FILE"

echo "extensions list saved to: $EXT_FILE"
echo

if ! command -v "$VSCODIUM_CLI" >/dev/null 2>&1; then
  echo "error: '$VSCODIUM_CLI' command not found. adjust VSCODIUM_CLI variable."
  exit 1
fi

echo "installing extensions in vscodium..."

while IFS= read -r ext; do
  [ -z "$ext" ] && continue
  echo "  installing $ext"
  "$VSCODIUM_CLI" --install-extension "$ext" >/dev/null 2>&1 || echo "  failed to install $ext"
done < "$EXT_FILE"

echo
echo "sync completed."
```

#### Usage on Linux

First, make the script executable:

```bash
chmod +x sync-vscode-to-vscodium.sh
./sync-vscode-to-vscodium.sh
```

If your VSCodium command is `vscodium` instead of `codium`:

```bash
VSCODIUM_CLI=vscodium ./sync-vscode-to-vscodium.sh
```

## Manual Installation of Extensions

If you prefer to install extensions manually from an `extensions.txt` file:

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
