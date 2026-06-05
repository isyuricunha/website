# Ella Mizuki

This repository uses Ella through GitHub Actions.

Files:

```txt
.github/workflows/ella-mizuki.yml
.ella/agent.py
.ella/instructions.md
.ella/ignore
.ella/labels.json
.ella/checks.sh.example
```

Required GitHub Actions secrets:

```txt
ELLA_AI_BASE_URL
ELLA_AI_MODEL
ELLA_AI_API_KEY
YUE_APP_CLIENT_ID
YUE_APP_PRIVATE_KEY
YURI_COMMIT_NAME
YURI_COMMIT_EMAIL
```

Optional GitHub Actions secrets:

```txt
ELLA_MAX_ATTEMPTS
ELLA_TIME_LIMIT_SECONDS
ELLA_MAX_TOKENS_ASK
ELLA_MAX_TOKENS_PR
ELLA_MAX_TOKENS_REVIEW
ELLA_MAX_TOKENS_PLAN
ELLA_MAX_TOKENS_LABEL
ELLA_MAX_TOKENS_FIX
ELLA_MAX_TOKENS_SOLVE
ELLA_MAX_CONTEXT_PR_DIFF_BYTES
ELLA_MAX_CONTEXT_FILE_BYTES
ELLA_MAX_CONTEXT_REQUESTED_FILE_BYTES
ELLA_MAX_CONTEXT_REPO_FILES_BYTES
```

Commands:

```txt
/ella help
/ella ask <question>
/ella pr <request>
/ella review <request>
/ella plan <request>
/ella label
/ella fix <request>
/ella continue <request>
/ella solve <request>
```

Checks:

- If `.ella/checks.sh` exists, Ella runs it.
- If it does not exist, Ella auto-detects checks for common stacks.
