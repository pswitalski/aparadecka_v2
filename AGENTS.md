# Agent Rules — aparadecka_v2

## Git & commits

- NEVER commit, push, amend, or open a pull request without explicit user permission.
- Always finish the change, then ASK: "Shall I commit and push?" and wait for a clear "yes".
- When proposing a commit, also propose the message and get approval for both.
- Branch names must follow `<type>/<kebab-description>` (e.g. `feat/about-page`), where `<type>` is one of: feat, fix, docs, refactor, chore, ci, test, style, perf, build. The long-lived branches `master`, `stage`, and `prod` are exempt. Enforced by the pre-push hook.
- Commit messages must follow Conventional Commits with a colon: `type(scope): description` (e.g. `feat(web): rebuild gallery`, `ci: split web deploy`). `type` is required; `scope` is optional. Enforced by the commit-msg hook via commitlint. Proposed commit messages must conform to this format.
