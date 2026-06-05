#!/usr/bin/env python3
from __future__ import annotations

import fnmatch
import json
import os
import re
import shlex
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any


ROOT = Path.cwd()
RUNNER_TEMP = Path(os.environ.get("RUNNER_TEMP", "/tmp"))
OUT = RUNNER_TEMP / "ella-output"
OUT.mkdir(parents=True, exist_ok=True)

SAFE_LABELS_DEFAULT = [
    {"name": "bug", "color": "d73a4a", "description": "Something is not working"},
    {"name": "enhancement", "color": "a2eeef",
        "description": "New feature or request"},
    {"name": "documentation", "color": "0075ca",
        "description": "Improvements or additions to documentation"},
    {"name": "dependencies", "color": "0366d6",
        "description": "Dependency updates or package changes"},
    {"name": "security", "color": "b60205",
        "description": "Security related changes"},
    {"name": "performance", "color": "fbca04",
        "description": "Performance related changes"},
    {"name": "refactor", "color": "cfd3d7",
        "description": "Code refactoring without behavior changes"},
    {"name": "tests", "color": "0e8a16", "description": "Testing related changes"},
    {"name": "ui", "color": "c2e0c6", "description": "User interface related changes"},
    {"name": "frontend", "color": "1d76db",
        "description": "Frontend related changes"},
    {"name": "backend", "color": "5319e7", "description": "Backend related changes"},
    {"name": "i18n", "color": "bfd4f2",
        "description": "Internationalization or localization"},
    {"name": "ci", "color": "fef2c0", "description": "CI/CD or workflow changes"},
    {"name": "chore", "color": "ededed", "description": "Maintenance or cleanup"},
    {"name": "question", "color": "d876e3",
        "description": "Further information is requested"},
    {"name": "good first issue", "color": "7057ff",
        "description": "Good for newcomers"},
    {"name": "help wanted", "color": "008672",
        "description": "Extra attention is needed"},
]

DEFAULT_IGNORE = [
    ".git/**",
    ".env",
    ".env.*",
    "**/.env",
    "**/.env.*",
    "**/node_modules/**",
    "**/.next/**",
    "**/dist/**",
    "**/build/**",
    "**/coverage/**",
    "**/__pycache__/**",
    "**/.pytest_cache/**",
    "**/.mypy_cache/**",
    "**/.ruff_cache/**",
    "**/target/**",
    "**/bin/**",
    "**/obj/**",
    "**/*.generated.*",
    "**/*.min.js",
    "**/*.map",
    "pnpm-lock.yaml",
    "package-lock.json",
    "yarn.lock",
    "bun.lockb",
    "Cargo.lock",
    "poetry.lock",
    "uv.lock",
]


def env_int(name: str, default: int) -> int:
    raw = os.environ.get(name, "").strip()
    if not raw:
        return default
    try:
        value = int(raw)
        return value if value > 0 else default
    except ValueError:
        return default


MAX_ATTEMPTS = env_int("ELLA_MAX_ATTEMPTS", 15)
TIME_LIMIT_SECONDS = env_int("ELLA_TIME_LIMIT_SECONDS", 3600)

MAX_CONTEXT_PR_DIFF_BYTES = env_int("ELLA_MAX_CONTEXT_PR_DIFF_BYTES", 500_000)
MAX_CONTEXT_FILE_BYTES = env_int("ELLA_MAX_CONTEXT_FILE_BYTES", 120_000)
MAX_CONTEXT_REQUESTED_FILE_BYTES = env_int(
    "ELLA_MAX_CONTEXT_REQUESTED_FILE_BYTES", 250_000)
MAX_CONTEXT_REPO_FILES_BYTES = env_int(
    "ELLA_MAX_CONTEXT_REPO_FILES_BYTES", 200_000)

MAX_TOKENS = {
    "ask": env_int("ELLA_MAX_TOKENS_ASK", 2048),
    "pr": env_int("ELLA_MAX_TOKENS_PR", 4096),
    "review": env_int("ELLA_MAX_TOKENS_REVIEW", 4096),
    "plan": env_int("ELLA_MAX_TOKENS_PLAN", 4096),
    "label": env_int("ELLA_MAX_TOKENS_LABEL", 1200),
    "fix": env_int("ELLA_MAX_TOKENS_FIX", 16384),
    "continue": env_int("ELLA_MAX_TOKENS_FIX", 16384),
    "solve": env_int("ELLA_MAX_TOKENS_SOLVE", 16384),
}


class CommandError(Exception):
    pass


def write_debug(name: str, text: str) -> None:
    (OUT / name).write_text(text, encoding="utf-8", errors="replace")


def read_text_limited(path: Path, limit: int) -> str:
    try:
        with path.open("rb") as f:
            data = f.read(limit)
        text = data.decode("utf-8", errors="replace")
        if path.stat().st_size > limit:
            text += "\n\n[truncated]\n"
        return text
    except FileNotFoundError:
        return ""


def run_cmd(
    args: list[str],
    *,
    check: bool = True,
    capture: bool = True,
    cwd: Path = ROOT,
    timeout: int = 900,
    env: dict[str, str] | None = None,
) -> subprocess.CompletedProcess[str]:
    if capture:
        result = subprocess.run(
            args,
            cwd=cwd,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            timeout=timeout,
            env=env,
        )
    else:
        result = subprocess.run(args, cwd=cwd, text=True,
                                timeout=timeout, env=env)

    if check and result.returncode != 0:
        output = result.stdout if capture else ""
        raise CommandError(f"Command failed: {' '.join(args)}\n{output}")
    return result


def gh(args: list[str], *, check: bool = True) -> str:
    result = run_cmd(["gh", *args], check=check, capture=True, timeout=120)
    return result.stdout


def git(args: list[str], *, check: bool = True) -> str:
    result = run_cmd(["git", *args], check=check, capture=True, timeout=900)
    return result.stdout


def clean_env_for_checks() -> dict[str, str]:
    env = dict(os.environ)
    for key in list(env):
        if key.startswith("ELLA_AI_"):
            env.pop(key, None)
        if key in {"GH_TOKEN", "GITHUB_TOKEN", "YUE_APP_PRIVATE_KEY", "YUE_APP_CLIENT_ID", "ELLA_APP_PRIVATE_KEY", "ELLA_APP_CLIENT_ID"}:
            env.pop(key, None)
    env["CI"] = "true"
    return env


def command_exists(cmd: str) -> bool:
    return shutil.which(cmd) is not None


def safe_rel_path(path: str) -> bool:
    p = Path(path)
    if not path.strip():
        return False
    if p.is_absolute():
        return False
    if ".." in p.parts:
        return False
    if p.parts and p.parts[0] == ".git":
        return False
    return True


def load_ignore_patterns() -> list[str]:
    patterns = list(DEFAULT_IGNORE)
    custom = ROOT / ".ella" / "ignore"
    if custom.exists():
        for line in custom.read_text(encoding="utf-8", errors="replace").splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            patterns.append(line)
    return patterns


def is_ignored(path: str, patterns: list[str]) -> bool:
    normalized = path.replace("\\", "/")
    for pattern in patterns:
        p = pattern.strip().replace("\\", "/")
        if not p:
            continue
        if fnmatch.fnmatch(normalized, p):
            return True
        if p.endswith("/**") and normalized.startswith(p[:-3]):
            return True
        if "/" not in p and fnmatch.fnmatch(Path(normalized).name, p):
            return True
    return False


def load_labels() -> list[dict[str, str]]:
    labels_path = ROOT / ".ella" / "labels.json"
    if not labels_path.exists():
        return SAFE_LABELS_DEFAULT

    try:
        data = json.loads(labels_path.read_text(encoding="utf-8"))
        if not isinstance(data, list):
            return SAFE_LABELS_DEFAULT
        labels: list[dict[str, str]] = []
        for item in data:
            if not isinstance(item, dict):
                continue
            name = str(item.get("name", "")).strip()
            if not name:
                continue
            labels.append(
                {
                    "name": name,
                    "color": str(item.get("color", "ededed")).strip().lstrip("#")[:6] or "ededed",
                    "description": str(item.get("description", "")).strip()[:100],
                }
            )
        return labels or SAFE_LABELS_DEFAULT
    except Exception:
        return SAFE_LABELS_DEFAULT


def parse_jsonish(text: str) -> Any:
    raw = text.strip()
    if raw.startswith("```"):
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw).strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        start = raw.find("{")
        end = raw.rfind("}")
        if start == -1 or end == -1 or end <= start:
            raise
        return json.loads(raw[start: end + 1])


def tail_text(path: Path, lines: int = 100) -> str:
    if not path.exists():
        return ""
    content = path.read_text(encoding="utf-8", errors="replace").splitlines()
    return "\n".join(content[-lines:])


class Ella:
    def __init__(self) -> None:
        event_path = os.environ.get("GITHUB_EVENT_PATH")
        if not event_path:
            raise RuntimeError("GITHUB_EVENT_PATH is missing")

        self.event = json.loads(Path(event_path).read_text(encoding="utf-8"))
        self.repo = os.environ["GITHUB_REPOSITORY"]
        self.run_id = os.environ.get("GITHUB_RUN_ID", str(int(time.time())))
        self.issue = self.event["issue"]
        self.comment_event = self.event["comment"]
        self.issue_number = int(self.issue["number"])
        self.comment_id = int(self.comment_event["id"])
        self.is_pr = "pull_request" in self.issue
        self.default_branch = self.event["repository"]["default_branch"]

        self.mode = "unknown"
        self.prompt = ""
        self.progress_comment_id: str | None = None
        self.pr_info: dict[str, Any] | None = None
        self.issue_info: dict[str, Any] | None = None
        self.allowed_files: list[str] = []
        self.ignore_patterns = load_ignore_patterns()

        self.ai_base_url = os.environ.get("ELLA_AI_BASE_URL", "").strip()
        self.ai_model = os.environ.get("ELLA_AI_MODEL", "").strip()
        self.ai_api_key = os.environ.get("ELLA_AI_API_KEY", "").strip()

        self.commit_name = os.environ.get("YURI_COMMIT_NAME", "").strip()
        self.commit_email = os.environ.get("YURI_COMMIT_EMAIL", "").strip()

        self.feedback = ""
        self.extra_context = ""
        self.final_summary = ""

    def run(self) -> None:
        self.mask_secrets()
        self.react("eyes")
        self.parse_command()

        if self.mode == "help":
            self.comment(self.help_text())
            self.react("+1")
            return

        if self.mode == "unknown":
            self.comment("I do not recognize that command. Use `/ella help`.")
            self.react("confused")
            return

        if self.mode in {"ask", "pr", "review", "plan", "label", "fix", "continue", "solve"}:
            self.validate_ai_config()

        if (not self.is_pr) and self.mode in {"pr", "review", "fix", "continue"}:
            self.comment("That command needs to be used inside a PR.")
            self.react("confused")
            return

        if self.is_pr and self.mode == "solve":
            self.comment(
                "Use `/ella fix` inside a PR. Use `/ella solve` on an issue.")
            self.react("confused")
            return

        if self.is_pr and self.mode in {"pr", "review", "plan", "label", "fix", "continue"}:
            self.load_pr_metadata()

        if (not self.is_pr) and self.mode in {"plan", "label", "solve"}:
            self.load_issue_metadata()

        if self.mode in {"ask", "pr", "review", "plan"}:
            response = self.handle_read_only()
            self.comment(response)
            self.react("+1")
            return

        if self.mode == "label":
            self.handle_label()
            self.react("+1")
            return

        if self.mode in {"fix", "continue"}:
            if self.pr_info and self.pr_info.get("isCrossRepository") is True:
                self.comment(
                    "I will not apply automatic fixes to PRs coming from forks. For safety, I only commit to branches from this repository.")
                self.react("confused")
                return
            self.checkout_pr_branch()
            self.load_repo_instructions()
            self.allowed_files = self.get_pr_changed_files()
            self.create_progress_comment(
                "👀 I started working on this PR.\n\n"
                f"Status: preparing context.\n"
                f"Limit: {MAX_ATTEMPTS} attempts / {TIME_LIMIT_SECONDS // 60} minutes."
                if self.mode == "fix"
                else
                "👀 I will continue trying to fix this PR.\n\n"
                f"Status: preparing context.\n"
                f"Limit: {MAX_ATTEMPTS} attempts / {TIME_LIMIT_SECONDS // 60} minutes."
            )
            success = self.fix_loop()
            if success:
                commit_sha = self.commit_and_push_fix()
                self.comment(
                    f"I applied the fix and committed it.\n\nCommit: `{commit_sha}`\n\n{self.final_summary}")
                self.react("rocket")
            else:
                self.comment(
                    f"I tried to solve this in a loop, but I could not get the checks to pass within the limits.\n\n{self.final_summary}")
                self.react("confused")
            return

        if self.mode == "solve":
            self.checkout_solve_branch()
            self.load_repo_instructions()
            self.allowed_files = self.get_repo_files()
            self.create_progress_comment(
                "👀 I started working on this issue.\n\n"
                f"Status: preparing branch and context.\n"
                f"Limit: {MAX_ATTEMPTS} attempts / {TIME_LIMIT_SECONDS // 60} minutes."
            )
            success = self.fix_loop()
            if success:
                commit_sha = self.commit_and_push_solve()
                pr_url = self.create_solve_pr()
                self.comment(
                    f"I created a PR for this issue.\n\nPR: {pr_url}\nCommit: `{commit_sha}`")
                self.react("rocket")
            else:
                self.comment(
                    f"I tried to solve this in a loop, but I could not get the checks to pass within the limits.\n\n{self.final_summary}")
                self.react("confused")
            return

    def mask_secrets(self) -> None:
        for value in [
            os.environ.get("ELLA_AI_BASE_URL", ""),
            os.environ.get("ELLA_AI_MODEL", ""),
            os.environ.get("ELLA_AI_API_KEY", ""),
            os.environ.get("YURI_COMMIT_NAME", ""),
            os.environ.get("YURI_COMMIT_EMAIL", ""),
        ]:
            if value:
                print(f"::add-mask::{value}")

    def parse_command(self) -> None:
        body = str(self.comment_event.get("body", "")).strip()
        commands = [
            ("help", "/ella help"),
            ("continue", "/ella continue"),
            ("review", "/ella review"),
            ("label", "/ella label"),
            ("solve", "/ella solve"),
            ("plan", "/ella plan"),
            ("fix", "/ella fix"),
            ("ask", "/ella ask"),
            ("pr", "/ella pr"),
        ]

        self.mode = "unknown"
        self.prompt = ""

        for mode, prefix in commands:
            if body == prefix or body.startswith(prefix + " "):
                self.mode = mode
                self.prompt = body[len(prefix):].strip()
                break

        defaults = {
            "ask": "Reply with one short sentence saying everything is working.",
            "pr": "Analyze this PR briefly. Explain what changed, possible risks, and whether it looks safe to merge.",
            "review": "Do a serious code review for this PR. Look for bugs, regressions, security risks, type issues, and missing tests.",
            "plan": "Create a short, practical plan. Do not edit anything.",
            "label": "Classify this issue or PR using common relevant labels.",
            "fix": "Fix the problem described in the PR or comment. Make the smallest safe change possible.",
            "continue": "Continue trying to fix this PR with the smallest safe change possible.",
            "solve": "Solve this issue with the smallest safe change possible.",
        }

        if self.mode in defaults and not self.prompt:
            self.prompt = defaults[self.mode]

        write_debug("command.json", json.dumps(
            {"mode": self.mode, "prompt": self.prompt}, indent=2))

    def validate_ai_config(self) -> None:
        missing = []
        if not self.ai_base_url:
            missing.append("ELLA_AI_BASE_URL")
        if not self.ai_model:
            missing.append("ELLA_AI_MODEL")
        if not self.ai_api_key:
            missing.append("ELLA_AI_API_KEY")
        if missing:
            raise RuntimeError(
                "Missing required secrets: " + ", ".join(missing))

    def help_text(self) -> str:
        return """Available commands:

`/ella ask your question`
I answer using the configured model.

`/ella pr request`
I give a short PR analysis.

`/ella review request`
I do a stricter PR code review.

`/ella plan request`
I write a plan without editing files.

`/ella label`
I apply common labels to the issue or PR.

`/ella fix request`
I try to fix the current PR, run checks, and commit as Yuri Cunha.

`/ella continue request`
I continue trying to fix the current PR with more attempts.

`/ella solve request`
On an issue, I create a branch, try to solve it, run checks, and open a PR."""

    def react(self, content: str) -> None:
        try:
            gh([
                "api",
                "--method",
                "POST",
                f"repos/{self.repo}/issues/comments/{self.comment_id}/reactions",
                "-H",
                "Accept: application/vnd.github+json",
                "-f",
                f"content={content}",
            ], check=False)
        except Exception:
            pass

    def comment(self, body: str) -> None:
        gh(["issue", "comment", str(self.issue_number),
           "--repo", self.repo, "--body", body])

    def create_progress_comment(self, body: str) -> None:
        out = gh([
            "api",
            "--method",
            "POST",
            f"repos/{self.repo}/issues/{self.issue_number}/comments",
            "-f",
            f"body={body}",
            "--jq",
            ".id",
        ])
        self.progress_comment_id = out.strip()

    def update_progress(self, body: str) -> None:
        if not self.progress_comment_id:
            return
        gh([
            "api",
            "--method",
            "PATCH",
            f"repos/{self.repo}/issues/comments/{self.progress_comment_id}",
            "-f",
            f"body={body}",
        ], check=False)

    def load_pr_metadata(self) -> None:
        raw = gh([
            "pr",
            "view",
            str(self.issue_number),
            "--repo",
            self.repo,
            "--json",
            "title,body,author,baseRefName,headRefName,headRepository,headRepositoryOwner,isCrossRepository,isDraft,state,url",
        ])
        self.pr_info = json.loads(raw)
        write_debug("pr-info.json", json.dumps(self.pr_info, indent=2))

        diff = gh(["pr", "diff", str(self.issue_number), "--repo", self.repo])
        write_debug("pr-diff.txt", diff)
        write_debug("pr-diff-limited.txt", diff[:MAX_CONTEXT_PR_DIFF_BYTES])

    def load_issue_metadata(self) -> None:
        raw = gh([
            "issue",
            "view",
            str(self.issue_number),
            "--repo",
            self.repo,
            "--json",
            "title,body,author,url,number,state",
        ])
        self.issue_info = json.loads(raw)
        write_debug("issue-info.json", json.dumps(self.issue_info, indent=2))

    def checkout_pr_branch(self) -> None:
        if not self.pr_info:
            raise RuntimeError("PR info not loaded")

        head_ref = self.pr_info["headRefName"]
        git(["fetch", "origin",
            f"refs/heads/{head_ref}:refs/remotes/origin/{head_ref}"])
        git(["checkout", "-B", head_ref, f"origin/{head_ref}"])

    def checkout_solve_branch(self) -> None:
        if not self.issue_info:
            raise RuntimeError("Issue info not loaded")

        title = str(self.issue_info.get("title", "issue"))
        safe_title = re.sub(r"[^a-z0-9]+", "-",
                            title.lower()).strip("-")[:50] or "issue"
        branch = f"ella/issue-{self.issue_number}-{safe_title}-{self.run_id}"
        self.solve_branch = branch
        git(["checkout", "-B", branch])

    def get_pr_changed_files(self) -> list[str]:
        raw = gh(["pr", "diff", str(self.issue_number),
                 "--repo", self.repo, "--name-only"])
        files = [line.strip() for line in raw.splitlines() if line.strip()]
        files = [f for f in files if safe_rel_path(
            f) and not is_ignored(f, self.ignore_patterns)]
        write_debug("allowed-files.txt", "\n".join(files) + "\n")
        return files

    def get_repo_files(self) -> list[str]:
        raw = git(["ls-files"])
        files = [line.strip() for line in raw.splitlines() if line.strip()]
        files = [f for f in files if safe_rel_path(
            f) and not is_ignored(f, self.ignore_patterns)]
        write_debug("allowed-files.txt", "\n".join(files) + "\n")
        write_debug("repo-files-limited.txt", ("\n".join(files) +
                    "\n")[:MAX_CONTEXT_REPO_FILES_BYTES])
        return files

    def load_repo_instructions(self) -> None:
        chunks: list[str] = []
        for rel in [
            ".ella/instructions.md",
            "AGENTS.md",
            "ELLA.md",
            ".github/copilot-instructions.md",
            ".github/ella-instructions.md",
        ]:
            path = ROOT / rel
            if path.exists():
                chunks.append(
                    f"\n----- INSTRUCTIONS: {rel} -----\n{read_text_limited(path, 40_000)}\n----- END INSTRUCTIONS: {rel} -----\n")
        text = "\n".join(chunks)
        write_debug("repo-instructions.txt", text)
        self.repo_instructions = text

    def handle_read_only(self) -> str:
        context = self.build_read_only_context()
        system = self.system_prompt_for_read_only()
        response = self.ai_call(context, system, MAX_TOKENS[self.mode])
        write_debug("ai-response.txt", response)
        return response

    def build_read_only_context(self) -> str:
        lines = [
            "User request:",
            self.prompt,
            "",
            f"Mode: {self.mode}",
        ]

        if self.mode == "label":
            labels = load_labels()
            lines.extend([
                "",
                "Allowed labels:",
                *[f"- {label['name']}" for label in labels],
                "",
                "Return ONLY valid JSON with this schema:",
                '{ "summary": "short reason", "labels": ["bug", "frontend"] }',
            ])

        if self.pr_info:
            lines.extend([
                "",
                "PR info:",
                json.dumps(self.pr_info, indent=2),
                "",
                "PR diff, possibly truncated:",
                (OUT / "pr-diff-limited.txt").read_text(encoding="utf-8",
                                                        errors="replace") if (OUT / "pr-diff-limited.txt").exists() else "",
            ])

        if self.issue_info:
            lines.extend([
                "",
                "Issue info:",
                json.dumps(self.issue_info, indent=2),
            ])

        context = "\n".join(lines)
        write_debug("context.txt", context)
        return context

    def system_prompt_for_read_only(self) -> str:
        base = "You are Ella Mizuki, Yuri's GitHub repository assistant. Write in English. Use first person when referring to yourself. Do not refer to yourself in the third person."
        if self.mode == "review":
            return base + " Do a serious code review. Be direct. Focus on bugs, security risks, regressions, type issues, missing tests, breaking changes, and suspicious code. Do not modify code."
        if self.mode == "plan":
            return base + " Create a practical implementation plan. Do not modify code. Include likely files, steps, risks, and checks."
        if self.mode == "label":
            return base + " Classify the issue or PR with common GitHub labels. Return only valid JSON. No Markdown. No code fences."
        if self.mode == "pr":
            return base + " Be short, direct, and practical. Analyze only the PR context provided. Do not modify code."
        return base + " Be short, direct, and practical."

    def handle_label(self) -> None:
        response = self.handle_read_only()
        labels_config = load_labels()
        labels_by_name = {x["name"].lower(): x for x in labels_config}

        try:
            data = parse_jsonish(response)
        except Exception:
            self.comment("I could not parse the label response as JSON.")
            self.react("confused")
            return

        picked: list[str] = []
        for item in data.get("labels", []):
            if not isinstance(item, str):
                continue
            name = item.strip().lower()
            if name in labels_by_name and name not in picked:
                picked.append(name)

        if not picked:
            self.comment("I could not find any valid labels to apply.")
            self.react("confused")
            return

        for item in labels_config:
            gh([
                "label",
                "create",
                item["name"],
                "--repo",
                self.repo,
                "--color",
                item.get("color", "ededed"),
                "--description",
                item.get("description", ""),
            ], check=False)

        for name in picked:
            gh(["issue", "edit", str(self.issue_number), "--repo",
               self.repo, "--add-label", labels_by_name[name]["name"]])

        summary = str(data.get("summary")
                      or "I applied the most relevant labels.").strip()
        write_debug("labels.txt", "\n".join(picked) + "\n")
        write_debug("label-summary.txt", summary + "\n")
        self.comment(
            f"I applied these labels: {', '.join(labels_by_name[name]['name'] for name in picked)}\n\n{summary}")

    def ai_call(self, context: str, system_prompt: str, max_tokens: int, allow_retry: bool = True) -> str:
        body = {
            "model": self.ai_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": context},
            ],
            "temperature": 0,
            "max_tokens": max_tokens,
            "stream": True,
            "tools": [],
            "tool_choice": "none",
        }

        data = json.dumps(body).encode("utf-8")
        url = self.ai_base_url.rstrip("/") + "/chat/completions"

        request = urllib.request.Request(
            url,
            data=data,
            method="POST",
            headers={
                "Authorization": f"Bearer {self.ai_api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json, text/event-stream",
                "Cache-Control": "no-cache",
                "User-Agent": "curl/8.7.1",
            },
        )

        content_parts: list[str] = []
        tool_call_seen = False
        raw_lines: list[str] = []

        try:
            with urllib.request.urlopen(request, timeout=900) as response:
                status = getattr(response, "status", 200)
                print(f"HTTP status: {status}")

                for raw in response:
                    line = raw.decode("utf-8", errors="replace")
                    raw_lines.append(line)

                    stripped = line.strip()
                    if not stripped or stripped.startswith(":"):
                        continue

                    if stripped.startswith("data:"):
                        payload = stripped[len("data:"):].strip()
                        if not payload or payload == "[DONE]":
                            continue
                        try:
                            obj = json.loads(payload)
                        except json.JSONDecodeError:
                            continue
                        if self.collect_ai_choices(obj, content_parts):
                            tool_call_seen = True
                    else:
                        try:
                            obj = json.loads(stripped)
                        except json.JSONDecodeError:
                            continue
                        if self.collect_ai_choices(obj, content_parts):
                            tool_call_seen = True

        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            write_debug("response.stream", detail)
            raise CommandError(
                f"AI endpoint failed with HTTP status {exc.code}.")
        except urllib.error.URLError as exc:
            raise CommandError(f"AI endpoint request failed: {exc.reason}")

        raw_text = "".join(raw_lines)
        write_debug("response.stream", raw_text)

        content = "".join(content_parts).strip()
        if content:
            return content

        if allow_retry:
            write_debug(
                "empty-content-retry.txt",
                "The first response did not contain visible content. Retrying once with tool calls disabled and a stricter prompt.\n"
                f"tool_call_seen={tool_call_seen}\n",
            )
            retry_system_prompt = (
                system_prompt
                + "\n\nImportant: do not call tools, do not use function calls, do not expose reasoning, "
                + "and return only the final visible answer in normal assistant message content."
            )
            return self.ai_call(context, retry_system_prompt, max_tokens, allow_retry=False)

        reason = "The model did not return visible message content."
        if tool_call_seen:
            reason += " It tried to call a tool instead."
        raise CommandError(reason)

    @staticmethod
    def collect_ai_choices(obj: Any, content_parts: list[str]) -> bool:
        if not isinstance(obj, dict):
            return False

        tool_call_seen = False

        for choice in obj.get("choices") or []:
            if not isinstance(choice, dict):
                continue

            delta = choice.get("delta") or {}
            message = choice.get("message") or {}

            if delta.get("tool_calls") or message.get("tool_calls") or choice.get("tool_calls"):
                tool_call_seen = True

            content = delta.get("content") or message.get("content") or choice.get("text")
            if content:
                content_parts.append(str(content))

        return tool_call_seen

    def fix_loop(self) -> bool:
        start = time.time()
        attempt = 1

        if not self.prepare_environment():
            self.final_summary = (
                "Failure type: install_failed\n\n"
                "Install failed before I could safely edit.\n\n"
                + (OUT / "install-summary.md").read_text(encoding="utf-8",
                                                         errors="replace")
            )
            write_debug("final-summary.md", self.final_summary)
            self.update_progress(
                "❌ I stopped before editing.\n\nReason: install failed.\nA debug artifact will be uploaded if available.")
            return False

        while attempt <= MAX_ATTEMPTS:
            elapsed = int(time.time() - start)
            if elapsed >= TIME_LIMIT_SECONDS:
                self.final_summary = (
                    "Failure type: time_limit\n\n"
                    "Time limit reached before checks passed.\n\n"
                    f"Attempts used: {attempt - 1}/{MAX_ATTEMPTS}\n"
                    f"Time used: {elapsed}s/{TIME_LIMIT_SECONDS}s\n\n"
                    f"Last feedback:\n{self.feedback}"
                )
                write_debug("final-summary.md", self.final_summary)
                self.update_progress(
                    f"⏱️ I reached the time limit.\n\nAttempts: {attempt - 1}/{MAX_ATTEMPTS}\nTime used: {elapsed}s/{TIME_LIMIT_SECONDS}s")
                return False

            print(f"Attempt {attempt}/{MAX_ATTEMPTS}")
            self.update_progress(
                "👀 I am working on it.\n\n"
                f"Status: attempt {attempt}/{MAX_ATTEMPTS}\n"
                "Step: preparing context and calling the model.\n"
                f"Time used: {elapsed}s/{TIME_LIMIT_SECONDS}s"
            )

            context = self.build_fix_context(attempt)
            system = self.system_prompt_for_fix()

            try:
                response = self.ai_call(context, system, MAX_TOKENS[self.mode])
                write_debug("ai-response.txt", response)
            except Exception as exc:
                self.feedback = f"Failure type: ai_endpoint\n\n{exc}"
                write_debug("feedback.txt", self.feedback)
                attempt += 1
                continue

            status = self.apply_ai_response(response)
            if status == "needs_files":
                self.append_needed_files_context()
                self.feedback = f"Failure type: needs_more_files\n\nAttempt {attempt} requested more files. I provided the valid requested files."
                write_debug("feedback.txt", self.feedback)
                self.update_progress(
                    f"📖 I need more context.\n\nAttempt: {attempt}/{MAX_ATTEMPTS}\nStatus: I provided the extra allowed files.")
                attempt += 1
                continue

            if status != "ok":
                self.feedback = f"Attempt {attempt} returned invalid or non-applicable JSON.\n\n" + (
                    OUT / "apply-error.txt").read_text(encoding="utf-8", errors="replace")
                write_debug("feedback.txt", self.feedback)
                self.update_progress(
                    f"⚠️ The model returned a response I could not apply.\n\nAttempt: {attempt}/{MAX_ATTEMPTS}\nNext step: ask for a corrected format or allowed file.")
                attempt += 1
                continue

            diff_check = run_cmd(["git", "diff", "--check"],
                                 capture=True, check=False)
            write_debug("diff-check.txt", diff_check.stdout or "")
            if diff_check.returncode != 0:
                self.feedback = f"Failure type: diff_check_failed\n\nAttempt {attempt} failed git diff --check.\n\n{diff_check.stdout}"
                write_debug("feedback.txt", self.feedback)
                self.update_progress(
                    f"⚠️ I applied changes, but they failed git diff --check.\n\nAttempt: {attempt}/{MAX_ATTEMPTS}\nNext step: fix formatting or whitespace.")
                attempt += 1
                continue

            changed = git(["ls-files", "--modified",
                          "--others", "--exclude-standard"])
            write_debug("changed-files.txt", changed)
            if not changed.strip():
                self.feedback = f"Failure type: no_changes\n\nAttempt {attempt} did not produce real file changes."
                write_debug("feedback.txt", self.feedback)
                self.update_progress(
                    f"⚠️ I did not produce any real file changes.\n\nAttempt: {attempt}/{MAX_ATTEMPTS}\nNext step: retry with clearer feedback.")
                attempt += 1
                continue

            self.update_progress(
                f"🧪 I applied changes and I am running checks.\n\nAttempt: {attempt}/{MAX_ATTEMPTS}\nStep: install/lint/test/build or detected project checks.")

            checks_ok = self.run_project_checks()
            if checks_ok:
                self.final_summary = (
                    "I applied the fix successfully.\n\n"
                    f"Attempts used: {attempt}/{MAX_ATTEMPTS}\n\n"
                    "Summary:\n"
                    + (OUT / "fix-summary.txt").read_text(encoding="utf-8",
                                                          errors="replace")
                    + "\n"
                    + (OUT / "checks-summary.md").read_text(encoding="utf-8",
                                                            errors="replace")
                )
                write_debug("final-summary.md", self.final_summary)
                self.update_progress(
                    f"✅ Checks passed.\n\nAttempts used: {attempt}/{MAX_ATTEMPTS}\nNext step: commit/PR.")
                return True

            self.feedback = (
                "Failure type: project_checks_failed\n\n"
                f"Attempt {attempt} applied changes, but checks failed.\n\n"
                + (OUT / "checks-summary.md").read_text(encoding="utf-8",
                                                        errors="replace")
                + "\n\nFix only the errors above while preserving the current behavior."
            )
            write_debug("feedback.txt", self.feedback)
            self.update_progress(
                f"🔁 I applied changes, but checks failed.\n\nAttempt: {attempt}/{MAX_ATTEMPTS}\nNext step: fix the check errors and try again.")
            attempt += 1

        self.final_summary = (
            "Failure type: max_attempts\n\n"
            "I could not reach a valid fix within the limits.\n\n"
            f"Attempts used: {MAX_ATTEMPTS}/{MAX_ATTEMPTS}\n\n"
            f"Last feedback:\n{self.feedback}"
        )
        write_debug("final-summary.md", self.final_summary)
        self.update_progress(
            f"❌ I could not get the checks to pass within the limits.\n\nAttempts used: {MAX_ATTEMPTS}/{MAX_ATTEMPTS}\nStatus: stopped without committing.")
        return False

    def system_prompt_for_fix(self) -> str:
        if self.mode == "solve":
            action = "You are solving a GitHub issue by editing a branch and opening a PR."
        else:
            action = "You are fixing an existing PR."
        return (
            "You are Ella Mizuki, Yuri's GitHub repository assistant. "
            "Write in English. Use first person when referring to yourself. Do not refer to yourself in the third person. "
            f"{action} "
            "Return only valid JSON. No Markdown. No code fences. "
            "You may ask for file contents using needs_files. "
            "When editing, return a files array with complete final file contents."
        )

    def build_fix_context(self, attempt: int) -> str:
        lines: list[str] = [
            f"You are running attempt {attempt} of {MAX_ATTEMPTS}.",
            f"Time limit: {TIME_LIMIT_SECONDS} seconds.",
            "",
            "User request:",
            self.prompt,
            "",
            "Repository instructions:",
            getattr(self, "repo_instructions", ""),
            "",
            "Required output format:",
            "Return ONLY valid JSON. No Markdown. No code fences.",
            "Schema for editing files:",
            '{ "summary": "short explanation", "files": [ { "path": "relative/path.ext", "content": "complete final file content" } ] }',
            "",
            "Optional schema if you need to inspect files before editing:",
            '{ "summary": "need more file contents", "needs_files": ["relative/path.ext"] }',
            "",
            "Rules:",
            "- Write in English.",
            "- Use first person when referring to yourself.",
            "- Do not refer to yourself in the third person.",
            "- Return complete final file content for every edited file.",
            "- Keep the smallest safe change possible.",
            "- Do not include explanations outside JSON.",
            "- Do not edit secrets, env files, lockfiles, generated files, or ignored files.",
            "- If previous feedback exists, fix that feedback only.",
            "",
            "Previous failure type and feedback:",
            self.feedback,
            "",
            "Extra file context requested in previous attempts:",
            self.extra_context,
            "",
            "Allowed files:",
            "\n".join(self.allowed_files),
        ]

        if self.mode in {"fix", "continue"}:
            lines.extend([
                "",
                "PR info:",
                json.dumps(self.pr_info or {}, indent=2),
                "",
                "PR diff, truncated:",
                (OUT / "pr-diff-limited.txt").read_text(encoding="utf-8",
                                                        errors="replace") if (OUT / "pr-diff-limited.txt").exists() else "",
                "",
                "Allowed files current content, truncated:",
            ])
            for rel in self.allowed_files:
                path = ROOT / rel
                if path.exists():
                    lines.append(
                        f"\n----- FILE: {rel} -----\n{read_text_limited(path, MAX_CONTEXT_FILE_BYTES)}\n----- END FILE: {rel} -----")

        if self.mode == "solve":
            lines.extend([
                "",
                "Issue info:",
                json.dumps(self.issue_info or {}, indent=2),
                "",
                "Repository files, truncated:",
                (OUT / "repo-files-limited.txt").read_text(encoding="utf-8",
                                                           errors="replace") if (OUT / "repo-files-limited.txt").exists() else "",
                "",
                "Common project files:",
            ])
            for rel in [
                "package.json",
                "turbo.json",
                "pnpm-workspace.yaml",
                "pyproject.toml",
                "requirements.txt",
                "go.mod",
                "Cargo.toml",
                "Dockerfile",
                "docker-compose.yml",
                "compose.yml",
                "README.md",
                "tsconfig.json",
            ]:
                path = ROOT / rel
                if path.exists() and not is_ignored(rel, self.ignore_patterns):
                    lines.append(
                        f"\n----- FILE: {rel} -----\n{read_text_limited(path, MAX_CONTEXT_FILE_BYTES)}\n----- END FILE: {rel} -----")

        context = "\n".join(lines)
        write_debug("context.txt", context)
        return context

    def apply_ai_response(self, response: str) -> str:
        try:
            data = parse_jsonish(response)
        except Exception as exc:
            write_debug(
                "apply-error.txt", f"Failure type: invalid_json\nAI response JSON parse failed: {exc}\n\nAI response preview:\n{response[:4000]}")
            return "error"

        if not isinstance(data, dict):
            write_debug(
                "apply-error.txt", f"Failure type: invalid_json\nAI response JSON must be an object.\n\nAI response preview:\n{response[:4000]}")
            return "error"

        summary = str(data.get("summary")
                      or "I applied the requested fix.").strip()
        write_debug("fix-summary.txt", summary + "\n")

        needs_files = data.get("needs_files")
        if isinstance(needs_files, list) and needs_files:
            requested: list[str] = []
            allowed_set = set(self.allowed_files)

            for item in needs_files:
                if not isinstance(item, str):
                    continue
                path = item.strip()
                if not safe_rel_path(path) or is_ignored(path, self.ignore_patterns):
                    continue
                if self.mode == "solve":
                    if (ROOT / path).exists():
                        requested.append(path)
                elif path in allowed_set:
                    requested.append(path)

            write_debug("needed-files.txt", "\n".join(requested) + "\n")
            return "needs_files"

        files = data.get("files")
        if not isinstance(files, list):
            write_debug(
                "apply-error.txt", f"Failure type: invalid_json\nAI response JSON must contain either needs_files or files array.\n\nAI response preview:\n{response[:4000]}")
            return "error"

        allowed_set = set(self.allowed_files)
        changed_count = 0

        for item in files:
            if not isinstance(item, dict):
                write_debug(
                    "apply-error.txt", "Failure type: invalid_json\nEach files item must be an object.")
                return "error"

            path = item.get("path")
            content = item.get("content")

            if not isinstance(path, str) or not path.strip():
                write_debug(
                    "apply-error.txt", "Failure type: invalid_json\nEach files item must contain a path string.")
                return "error"

            if not isinstance(content, str):
                write_debug(
                    "apply-error.txt", f"Failure type: invalid_json\nFile {path} must contain a content string.")
                return "error"

            path = path.strip()

            if not safe_rel_path(path):
                write_debug(
                    "apply-error.txt", f"Failure type: unsafe_file\nUnsafe file path rejected: {path}")
                return "error"

            if is_ignored(path, self.ignore_patterns):
                write_debug(
                    "apply-error.txt", f"Failure type: ignored_file\nRefusing to edit ignored file: {path}")
                return "error"

            if self.mode in {"fix", "continue"} and path not in allowed_set:
                write_debug(
                    "apply-error.txt", f"Failure type: file_not_allowed\nFile path is not in allowed files list: {path}")
                return "error"

            if self.mode == "solve" and path not in allowed_set and (ROOT / path).exists():
                if is_ignored(path, self.ignore_patterns):
                    write_debug(
                        "apply-error.txt", f"Failure type: ignored_file\nRefusing to edit ignored file: {path}")
                    return "error"

            target = ROOT / path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(content, encoding="utf-8")
            changed_count += 1

        if changed_count == 0:
            write_debug(
                "apply-error.txt", "Failure type: no_changes\nAI returned zero files to change.")
            return "error"

        return "ok"

    def append_needed_files_context(self) -> None:
        needed = (OUT / "needed-files.txt")
        if not needed.exists() or not needed.read_text(encoding="utf-8").strip():
            self.feedback = "Failure type: invalid_needs_files\nThe model requested file contents, but no valid allowed files were requested."
            return

        chunks = ["\nFiles requested by the model:"]
        for rel in needed.read_text(encoding="utf-8", errors="replace").splitlines():
            rel = rel.strip()
            if not rel:
                continue
            path = ROOT / rel
            if path.exists() and safe_rel_path(rel) and not is_ignored(rel, self.ignore_patterns):
                chunks.append(
                    f"\n----- REQUESTED FILE: {rel} -----\n{read_text_limited(path, MAX_CONTEXT_REQUESTED_FILE_BYTES)}\n----- END REQUESTED FILE: {rel} -----")
            else:
                chunks.append(
                    f"\n----- REQUESTED FILE MISSING OR BLOCKED: {rel} -----")
        self.extra_context += "\n".join(chunks)
        write_debug("extra-context.txt", self.extra_context)

    def prepare_environment(self) -> bool:
        if (ROOT / ".ella" / "checks.sh").exists():
            write_debug("install-summary.md",
                        "- ⚪ custom .ella/checks.sh found, install is handled by the custom checks script\n")
            return True

        summaries: list[str] = []
        ok = True

        for name, cmd in self.detect_install_commands():
            success, log = self.run_logged_check(
                f"install-{name}", cmd, timeout=1200)
            summaries.append(f"- {'✅' if success else '❌'} install ({name})")
            if not success:
                summaries.append("")
                summaries.append(f"Last lines from install ({name}):")
                summaries.append("```txt")
                summaries.append(log)
                summaries.append("```")
                ok = False

        if not summaries:
            summaries.append("- ⚪ no automatic install command detected")

        write_debug("install-summary.md", "\n".join(summaries) + "\n")
        return ok

    def detect_install_commands(self) -> list[tuple[str, list[str]]]:
        commands: list[tuple[str, list[str]]] = []

        if (ROOT / "package.json").exists():
            if (ROOT / "pnpm-lock.yaml").exists():
                commands.append(
                    ("pnpm", ["bash", "-lc", "corepack enable || true; pnpm install --frozen-lockfile"]))
            elif (ROOT / "package-lock.json").exists():
                commands.append(("npm", ["npm", "ci"]))
            elif (ROOT / "yarn.lock").exists():
                commands.append(
                    ("yarn", ["bash", "-lc", "corepack enable || true; yarn install --frozen-lockfile"]))
            elif (ROOT / "bun.lockb").exists() or (ROOT / "bun.lock").exists():
                if command_exists("bun"):
                    commands.append(
                        ("bun", ["bun", "install", "--frozen-lockfile"]))

        if (ROOT / "pyproject.toml").exists():
            if (ROOT / "uv.lock").exists() and command_exists("uv"):
                commands.append(("uv", ["uv", "sync"]))
            elif (ROOT / "poetry.lock").exists() and command_exists("poetry"):
                commands.append(
                    ("poetry", ["poetry", "install", "--no-interaction"]))
            elif (ROOT / "requirements.txt").exists():
                commands.append(
                    ("pip", [sys.executable, "-m", "pip", "install", "-r", "requirements.txt"]))
            else:
                commands.append(
                    ("pip-editable", [sys.executable, "-m", "pip", "install", "-e", "."]))
        elif (ROOT / "requirements.txt").exists():
            commands.append(
                ("pip", [sys.executable, "-m", "pip", "install", "-r", "requirements.txt"]))

        if (ROOT / "composer.json").exists() and command_exists("composer"):
            commands.append(
                ("composer", ["composer", "install", "--no-interaction", "--no-progress"]))

        return commands

    def run_project_checks(self) -> bool:
        summary: list[str] = ["Checks executed:", ""]
        install_summary = (OUT / "install-summary.md")
        if install_summary.exists():
            summary.append(install_summary.read_text(
                encoding="utf-8", errors="replace").strip())
            summary.append("")

        if (ROOT / ".ella" / "checks.sh").exists():
            checks = [("custom-checks", ["bash", ".ella/checks.sh"])]
        else:
            checks = self.detect_check_commands()

        if not checks:
            summary.append("- ⚪ no automatic checks detected")
            write_debug("checks-summary.md", "\n".join(summary) + "\n")
            return True

        all_ok = True
        for name, cmd in checks:
            success, log_tail = self.run_logged_check(name, cmd, timeout=1500)
            summary.append(f"- {'✅' if success else '❌'} {name}")
            if not success:
                all_ok = False
                summary.append("")
                summary.append(f"Last lines from {name}:")
                summary.append("```txt")
                summary.append(log_tail)
                summary.append("```")

        write_debug("checks-summary.md", "\n".join(summary) + "\n")
        return all_ok

    def detect_check_commands(self) -> list[tuple[str, list[str]]]:
        checks: list[tuple[str, list[str]]] = []

        if (ROOT / "package.json").exists():
            scripts = {}
            try:
                package = json.loads(
                    (ROOT / "package.json").read_text(encoding="utf-8"))
                scripts = package.get("scripts") or {}
            except Exception:
                scripts = {}

            if (ROOT / "pnpm-lock.yaml").exists():
                runner = ["pnpm", "run"]
            elif (ROOT / "yarn.lock").exists():
                runner = ["yarn"]
            elif (ROOT / "bun.lockb").exists() or (ROOT / "bun.lock").exists():
                runner = ["bun", "run"] if command_exists("bun") else [
                    "npm", "run"]
            else:
                runner = ["npm", "run"]

            for script in ["lint", "typecheck", "test", "build"]:
                if script in scripts:
                    checks.append((f"node-{script}", [*runner, script]))

        if (ROOT / "go.mod").exists() and command_exists("go"):
            checks.append(
                ("go-fmt", ["bash", "-lc", 'test -z "$(gofmt -l .)"']))
            checks.append(("go-vet", ["go", "vet", "./..."]))
            checks.append(("go-test", ["go", "test", "./..."]))

        if (ROOT / "Cargo.toml").exists() and command_exists("cargo"):
            checks.append(("cargo-fmt", ["cargo", "fmt", "--check"]))
            checks.append(
                ("cargo-clippy", ["cargo", "clippy", "--", "-D", "warnings"]))
            checks.append(("cargo-test", ["cargo", "test"]))

        if (ROOT / "pyproject.toml").exists() or (ROOT / "requirements.txt").exists() or (ROOT / "pytest.ini").exists():
            if self.python_module_exists("ruff") or command_exists("ruff"):
                cmd = ["ruff", "check", "."] if command_exists(
                    "ruff") else [sys.executable, "-m", "ruff", "check", "."]
                checks.append(("python-ruff", cmd))
            if self.python_module_exists("black") or command_exists("black"):
                cmd = ["black", "--check", "."] if command_exists(
                    "black") else [sys.executable, "-m", "black", "--check", "."]
                checks.append(("python-black", cmd))
            if self.python_module_exists("mypy") or command_exists("mypy"):
                cmd = ["mypy", "."] if command_exists(
                    "mypy") else [sys.executable, "-m", "mypy", "."]
                checks.append(("python-mypy", cmd))
            if self.python_module_exists("pytest") or command_exists("pytest") or any((ROOT / x).exists() for x in ["tests", "test"]):
                cmd = ["pytest"] if command_exists("pytest") else [
                    sys.executable, "-m", "pytest"]
                checks.append(("python-pytest", cmd))

        if any(ROOT.glob("*.sln")) or any(ROOT.glob("**/*.csproj")):
            if command_exists("dotnet"):
                checks.append(("dotnet-restore", ["dotnet", "restore"]))
                checks.append(
                    ("dotnet-build", ["dotnet", "build", "--no-restore"]))
                checks.append(
                    ("dotnet-test", ["dotnet", "test", "--no-build"]))

        if (ROOT / "pom.xml").exists() and command_exists("mvn"):
            checks.append(("maven-test", ["mvn", "test"]))
        if ((ROOT / "build.gradle").exists() or (ROOT / "build.gradle.kts").exists()) and (ROOT / "gradlew").exists():
            checks.append(("gradle-test", ["./gradlew", "test"]))

        if (ROOT / "composer.json").exists():
            if (ROOT / "vendor/bin/phpunit").exists():
                checks.append(("phpunit", ["vendor/bin/phpunit"]))
            if (ROOT / "vendor/bin/phpstan").exists():
                checks.append(("phpstan", ["vendor/bin/phpstan", "analyse"]))

        if (ROOT / "docker-compose.yml").exists() or (ROOT / "compose.yml").exists():
            if command_exists("docker"):
                compose_file = "docker-compose.yml" if (
                    ROOT / "docker-compose.yml").exists() else "compose.yml"
                checks.append(
                    ("docker-compose-config", ["docker", "compose", "-f", compose_file, "config"]))

        return checks

    def python_module_exists(self, module: str) -> bool:
        result = run_cmd(
            [sys.executable, "-c", f"import {module}"], check=False, capture=True, timeout=30, env=clean_env_for_checks())
        return result.returncode == 0

    def run_logged_check(self, name: str, cmd: list[str], timeout: int = 900) -> tuple[bool, str]:
        safe_name = re.sub(r"[^a-zA-Z0-9_.-]+", "-", name)
        log_path = OUT / f"check-{safe_name}.log"
        print(f"Running {name}...")

        try:
            result = subprocess.run(
                cmd,
                cwd=ROOT,
                text=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                timeout=timeout,
                env=clean_env_for_checks(),
            )
            log_path.write_text(result.stdout or "",
                                encoding="utf-8", errors="replace")
            return result.returncode == 0, tail_text(log_path, 120)
        except subprocess.TimeoutExpired as exc:
            output = (exc.stdout or "") if isinstance(exc.stdout, str) else ""
            output += f"\nCommand timed out after {timeout}s.\n"
            log_path.write_text(output, encoding="utf-8", errors="replace")
            return False, tail_text(log_path, 120)
        except Exception as exc:
            log_path.write_text(str(exc), encoding="utf-8", errors="replace")
            return False, str(exc)

    def infer_commit_type(self, changed_files: list[str]) -> tuple[str, str | None]:
        normalized = [path.replace("\\", "/") for path in changed_files]

        if not normalized:
            return "chore", None

        if all(
            path.endswith((".md", ".mdx", ".txt", ".rst"))
            or path.lower().endswith("readme")
            or "/docs/" in path
            or path.startswith("docs/")
            for path in normalized
        ):
            return "docs", None

        if all(
            path.startswith(".github/workflows/")
            or path.startswith(".github/actions/")
            or path.startswith(".ella/")
            or path in {"Dockerfile", "docker-compose.yml", "compose.yml"}
            or path.endswith((".yml", ".yaml"))
            for path in normalized
        ):
            return "ci", None

        if all(
            "/test/" in path
            or "/tests/" in path
            or path.startswith("test/")
            or path.startswith("tests/")
            or path.endswith((".test.ts", ".test.tsx", ".spec.ts", ".spec.tsx", ".test.js", ".spec.js"))
            for path in normalized
        ):
            return "test", None

        if any(
            path.endswith(("package.json", "pnpm-lock.yaml", "package-lock.json", "yarn.lock", "bun.lockb"))
            or "dependabot" in path
            for path in normalized
        ):
            return "chore", "deps"

        if any(
            path.startswith("apps/web/")
            or path.startswith("apps/docs/")
            or path.startswith("packages/ui/")
            for path in normalized
        ):
            return "fix", "ui"

        return "fix", None

    def fallback_commit_message(self, changed_files: list[str]) -> str:
        commit_type, scope = self.infer_commit_type(changed_files)
        summary = "apply requested changes"

        summary_path = OUT / "fix-summary.txt"
        if summary_path.exists():
            raw_summary = summary_path.read_text(encoding="utf-8", errors="replace").strip()
            if raw_summary:
                first_line = raw_summary.splitlines()[0].strip()
                first_line = re.sub(r"^(fix|fixed|change|changed|update|updated|add|added):?\s+", "", first_line, flags=re.I)
                if first_line:
                    summary = first_line[:90].rstrip(" .")

        if self.mode == "solve":
            issue_title = ""
            if self.issue_info:
                issue_title = str(self.issue_info.get("title", "")).strip()
            if issue_title:
                summary = issue_title[:90].rstrip(" .")

        subject_prefix = f"{commit_type}({scope})" if scope else commit_type
        subject = f"{subject_prefix}: {summary}"
        if len(subject) > 72:
            subject = subject[:69].rstrip(" .") + "..."

        body_lines = [
            "Details:",
            f"- Request: {self.prompt}",
        ]

        if summary_path.exists():
            raw_summary = summary_path.read_text(encoding="utf-8", errors="replace").strip()
            if raw_summary:
                body_lines.append(f"- Summary: {raw_summary}")

        if changed_files:
            body_lines.append("- Changed files:")
            for path in changed_files[:12]:
                body_lines.append(f"  - {path}")
            if len(changed_files) > 12:
                body_lines.append(f"  - ...and {len(changed_files) - 12} more")

        if self.mode == "solve":
            body_lines.append(f"- Refs: #{self.issue_number}")

        return subject + "\n\n" + "\n".join(body_lines).strip() + "\n"

    def generate_commit_message(self, changed_files: list[str]) -> str:
        fallback = self.fallback_commit_message(changed_files)

        diff_stat = git(["diff", "--stat"], check=False)
        diff = git(["diff", "--", *changed_files], check=False) if changed_files else ""
        diff = diff[:12000]

        summary = ""
        summary_path = OUT / "fix-summary.txt"
        if summary_path.exists():
            summary = summary_path.read_text(encoding="utf-8", errors="replace").strip()

        context_lines = [
            "Create a Conventional Commit message for these changes.",
            "",
            "Rules:",
            "- Return ONLY valid JSON.",
            "- No Markdown and no code fences.",
            "- Subject must follow Conventional Commits, like docs: update README or fix(ui): handle empty state.",
            "- Subject must be <= 72 characters.",
            "- Body should be detailed but concise, using 2-6 bullet points.",
            "- Use English.",
            "- Use imperative mood.",
            "- Do not mention Ella unless the changed files are specifically about Ella.",
            "",
            f"Mode: {self.mode}",
            f"Issue or PR number: {self.issue_number}",
            "",
            "User request:",
            self.prompt,
            "",
            "AI change summary:",
            summary,
            "",
            "Changed files:",
            "\n".join(changed_files),
            "",
            "Diff stat:",
            diff_stat,
            "",
            "Diff, possibly truncated:",
            diff,
            "",
            "Return schema:",
            '{ "subject": "type(scope): short summary", "body": "- Detail one\\n- Detail two" }',
        ]

        system_prompt = (
            "You write high-quality git commit messages. "
            "Return only valid JSON with subject and body. "
            "Do not call tools. Do not include reasoning."
        )

        try:
            response = self.ai_call("\n".join(context_lines), system_prompt, 1200)
            data = parse_jsonish(response)

            subject = str(data.get("subject", "")).strip()
            body = str(data.get("body", "")).strip()

            if not subject or "\n" in subject:
                raise ValueError("Invalid commit subject")

            if len(subject) > 72:
                subject = subject[:69].rstrip(" .") + "..."

            if not re.match(r"^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\([a-z0-9._/-]+\))?!?: .+", subject):
                raise ValueError(f"Commit subject is not conventional: {subject}")

            if not body:
                body = fallback.split("\n\n", 1)[1].strip() if "\n\n" in fallback else ""

            return subject + "\n\n" + body.strip() + "\n"

        except Exception as exc:
            write_debug("commit-message-fallback.txt", f"Falling back to heuristic commit message.\nReason: {type(exc).__name__}: {exc}\n")
            return fallback

    def write_commit_message_file(self, changed_files: list[str]) -> Path:
        message = self.generate_commit_message(changed_files)
        path = OUT / "commit-message.txt"
        path.write_text(message, encoding="utf-8")
        return path

    def commit_and_push_fix(self) -> str:
        if not self.commit_name or not self.commit_email:
            raise RuntimeError(
                "Missing required commit secrets: YURI_COMMIT_NAME and/or YURI_COMMIT_EMAIL")
        if not self.pr_info:
            raise RuntimeError("PR info missing")

        git(["config", "user.name", self.commit_name])
        git(["config", "user.email", self.commit_email])

        changed = git(["ls-files", "--modified", "--others",
                      "--exclude-standard"]).splitlines()
        if not changed:
            raise RuntimeError("No changed files to commit")

        commit_message_path = self.write_commit_message_file(changed)

        run_cmd(["git", "add", "--", *changed], capture=True)
        git(["commit", "--no-verify", "-F", str(commit_message_path)])

        head_ref = self.pr_info["headRefName"]
        git(["push", "origin", f"HEAD:{head_ref}"])

        return git(["rev-parse", "--short", "HEAD"]).strip()

    def commit_and_push_solve(self) -> str:
        if not self.commit_name or not self.commit_email:
            raise RuntimeError(
                "Missing required commit secrets: YURI_COMMIT_NAME and/or YURI_COMMIT_EMAIL")

        git(["config", "user.name", self.commit_name])
        git(["config", "user.email", self.commit_email])

        changed = git(["ls-files", "--modified", "--others",
                      "--exclude-standard"]).splitlines()
        if not changed:
            raise RuntimeError("No changed files to commit")

        commit_message_path = self.write_commit_message_file(changed)

        run_cmd(["git", "add", "--", *changed], capture=True)
        git(["commit", "--no-verify", "-F", str(commit_message_path)])
        git(["push", "origin", f"HEAD:{self.solve_branch}"])

        return git(["rev-parse", "--short", "HEAD"]).strip()

    def create_solve_pr(self) -> str:
        if not self.issue_info:
            raise RuntimeError("Issue info missing")
        title = self.issue_info.get("title", f"Issue #{self.issue_number}")
        body = f"Closes #{self.issue_number}\n\n{self.final_summary}"
        out = gh([
            "pr",
            "create",
            "--repo",
            self.repo,
            "--base",
            self.default_branch,
            "--head",
            self.solve_branch,
            "--title",
            f"Fix issue #{self.issue_number}: {title}",
            "--body",
            body,
        ])
        return out.strip()


def main() -> int:
    try:
        Ella().run()
        return 0
    except Exception as exc:
        write_debug("fatal-error.txt", f"{type(exc).__name__}: {exc}\n")
        print(f"Fatal error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
