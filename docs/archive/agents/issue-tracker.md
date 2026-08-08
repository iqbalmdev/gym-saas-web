# Issue tracker: GitHub

Issues for this repo live as GitHub issues. Use the `gh` CLI.

Repo: `iqbalmdev/gym-saas-web` (confirm with `git remote -v`).

## Conventions

- **Create**: `gh issue create --title "..." --body "..."`
- **Read**: `gh issue view <number> --comments`
- **List**: `gh issue list --state open --json number,title,body,labels`
- **Comment / label / close**: `gh issue comment` / `gh issue edit` / `gh issue close`

## Pull requests as a triage surface

**PRs as a request surface: no.**

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

`gh issue view <number> --comments`.
