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

## Automated Sync: VSCode → VSCodium

Instead of manually copying files and installing extensions, you can automate the entire process with these scripts. They copy all configurations (settings, keybindings, snippets, profiles) from VSCode to VSCodium and install all your extensions automatically.

### PowerShell Script (Cross-Platform)

This script works on both Windows and Linux with PowerShell 7.

Save as `sync-vscode-to-vscodium.ps1`:

```powershell
param(
    [string]$VSCodiumCli = ""
)

# script para copiar configs do vscode para o vscodium
# e sincronizar extensoes (vscode -> vscodium)

function Get-VSCodeUserDir {
    if ($IsWindows) {
        return (Join-Path $env:APPDATA "Code\User")
    } elseif ($IsLinux -or $IsMacOS) {
        return "$HOME/.config/Code/User"
    } else {
        throw "sistema operacional nao suportado"
    }
}

function Get-VSCodiumUserDir {
    if ($IsWindows) {
        return (Join-Path $env:APPDATA "VSCodium\User")
    } elseif ($IsLinux -or $IsMacOS) {
        return "$HOME/.config/VSCodium/User"
    } else {
        throw "sistema operacional nao suportado"
    }
}

function Find-VSCodiumCli {
    param([string]$Preferred)

    if ($Preferred) {
        # se usuario passou algo, tenta primeiro
        $cmd = Get-Command $Preferred -ErrorAction SilentlyContinue
        if ($cmd) { return $cmd.Source }
        if (Test-Path $Preferred) { return $Preferred }
    }

    # tenta nomes comuns em path
    foreach ($name in "codium", "vscodium") {
        $cmd = Get-Command $name -ErrorAction SilentlyContinue
        if ($cmd) { return $cmd.Source }
    }

    # tenta caminhos padrao por sistema
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

    throw "nao encontrei o executavel do vscodium. passe o caminho em -VSCodiumCli"
}

Write-Host "=== sync vscode -> vscodium ==="

$vsCodeUser = Get-VSCodeUserDir
$vscodiumUser = Get-VSCodiumUserDir

if (-not (Test-Path $vsCodeUser)) {
    throw "pasta de configuracoes do vscode nao encontrada: $vsCodeUser"
}

New-Item -ItemType Directory -Path $vscodiumUser -Force | Out-Null

Write-Host "pasta vscode  :" $vsCodeUser
Write-Host "pasta vscodium:" $vscodiumUser

# copia settings.json
$settings = Join-Path $vsCodeUser "settings.json"
if (Test-Path $settings) {
    Copy-Item $settings $vscodiumUser -Force
    Write-Host "copiado settings.json"
} else {
    Write-Host "aviso: settings.json nao encontrado no vscode"
}

# copia keybindings.json
$keybindings = Join-Path $vsCodeUser "keybindings.json"
if (Test-Path $keybindings) {
    Copy-Item $keybindings $vscodiumUser -Force
    Write-Host "copiado keybindings.json"
} else {
    Write-Host "aviso: keybindings.json nao encontrado no vscode"
}

# copia snippets
$snippets = Join-Path $vsCodeUser "snippets"
if (Test-Path $snippets) {
    Copy-Item $snippets $vscodiumUser -Recurse -Force
    Write-Host "copiado diretorio snippets"
}

# copia profiles (se existir)
$profiles = Join-Path $vsCodeUser "profiles"
if (Test-Path $profiles) {
    Copy-Item $profiles $vscodiumUser -Recurse -Force
    Write-Host "copiado diretorio profiles"
}

# exporta lista de extensoes do vscode
Write-Host ""
Write-Host "exportando extensoes do vscode..."

$extensions = @()
try {
    $extensions = code --list-extensions
} catch {
    Write-Host "erro ao executar 'code --list-extensions'. verifique se o comando 'code' funciona no terminal."
}

if (-not $extensions -or $extensions.Count -eq 0) {
    Write-Host "nenhuma extensao encontrada ou comando 'code' nao funcionou."
} else {
    $backupFile = Join-Path $HOME "vscode-extensions-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
    $extensions | Set-Content -Encoding UTF8 $backupFile
    Write-Host "lista de extensoes salva em:" $backupFile

    # encontra cli do vscodium
    $vscodiumCliPath = Find-VSCodiumCli -Preferred $VSCodiumCli
    Write-Host ""
    Write-Host "usando vscodium cli:" $vscodiumCliPath
    Write-Host ""
    Write-Host "instalando extensoes no vscodium..."

    foreach ($ext in $extensions) {
        if ([string]::IsNullOrWhiteSpace($ext)) { continue }
        Write-Host "  instalando $ext"
        try {
            & $vscodiumCliPath --install-extension $ext | Out-Null
        } catch {
            Write-Host "  falha ao instalar $ext"
        }
    }

    Write-Host ""
    Write-Host "sincronizacao concluida."
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

# script simples para sincronizar vscode -> vscodium no linux

VSCODE_USER="$HOME/.config/Code/User"
VSCODIUM_USER="$HOME/.config/VSCodium/User"

# permite sobrescrever o comando via variavel de ambiente
VSCODIUM_CLI="${VSCODIUM_CLI:-codium}"

echo "pasta vscode   : $VSCODE_USER"
echo "pasta vscodium : $VSCODIUM_USER"
echo "vscodium cli   : $VSCODIUM_CLI"
echo

if [ ! -d "$VSCODE_USER" ]; then
  echo "erro: pasta do vscode nao encontrada: $VSCODE_USER"
  exit 1
fi

mkdir -p "$VSCODIUM_USER"

# copia settings
if [ -f "$VSCODE_USER/settings.json" ]; then
  cp "$VSCODE_USER/settings.json" "$VSCODIUM_USER/"
  echo "copiado settings.json"
fi

# copia keybindings
if [ -f "$VSCODE_USER/keybindings.json" ]; then
  cp "$VSCODE_USER/keybindings.json" "$VSCODIUM_USER/"
  echo "copiado keybindings.json"
fi

# copia snippets
if [ -d "$VSCODE_USER/snippets" ]; then
  cp -r "$VSCODE_USER/snippets" "$VSCODIUM_USER/"
  echo "copiado diretorio snippets"
fi

# copia profiles
if [ -d "$VSCODE_USER/profiles" ]; then
  cp -r "$VSCODE_USER/profiles" "$VSCODIUM_USER/"
  echo "copiado diretorio profiles"
fi

echo
echo "exportando extensoes do vscode..."

if ! command -v code >/dev/null 2>&1; then
  echo "erro: comando 'code' nao encontrado no path."
  exit 1
fi

EXT_FILE="$HOME/vscode-extensions-$(date +%Y%m%d-%H%M%S).txt"
code --list-extensions > "$EXT_FILE"

echo "lista de extensoes salva em: $EXT_FILE"
echo

if ! command -v "$VSCODIUM_CLI" >/dev/null 2>&1; then
  echo "erro: comando '$VSCODIUM_CLI' nao encontrado. ajuste a variavel VSCODIUM_CLI."
  exit 1
fi

echo "instalando extensoes no vscodium..."

while IFS= read -r ext; do
  [ -z "$ext" ] && continue
  echo "  instalando $ext"
  "$VSCODIUM_CLI" --install-extension "$ext" >/dev/null 2>&1 || echo "  falha ao instalar $ext"
done < "$EXT_FILE"

echo
echo "sincronizacao concluida."
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
