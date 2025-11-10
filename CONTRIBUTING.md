# Contributing to EduMind-AI-Study-Assistant

Thank you for your interest in contributing to **EduMind — AI Study Assistant**! We welcome contributions of all kinds — bug reports, documentation improvements, code, tests, design, or ideas. This document explains how to get started, what we expect from contributors, and how to submit high-quality contributions.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How to file an issue](#how-to-file-an-issue)
3. [How to propose a feature](#how-to-propose-a-feature)
4. [Getting the code and setting up locally](#getting-the-code-and-setting-up-locally)
5. [Branching & workflow](#branching--workflow)
6. [Submitting a Pull Request (PR)](#submitting-a-pull-request-pr)
7. [Coding style & tests](#coding-style--tests)
8. [Commit messages](#commit-messages)
9. [Review process](#review-process)
10. [Good first issues & mentoring](#good-first-issues--mentoring)
11. [License](#license)

---

## Code of Conduct

All contributors are expected to follow the project's [Code of Conduct](CODE_OF_CONDUCT.md). Be respectful, inclusive, and courteous in all interactions.

## How to file an issue

If you find a bug or want to request an improvement:

1. Search existing issues to avoid duplicates.
2. Click **New issue** and choose the appropriate template (bug report / feature request).
3. Provide a clear title and include:

   * Steps to reproduce (for bugs)
   * Expected vs actual behavior
   * Screenshots or logs (if applicable)
   * Environment details (OS, Node/Python version, browser, etc.)

## How to propose a feature

For new feature ideas:

1. Open a new issue using the **feature request** template.
2. Explain the problem the feature solves and the user benefit.
3. If possible, provide mockups, examples, or links to similar implementations.
4. Optionally propose a rough implementation plan or API.

## Getting the code and setting up locally

1. Fork the repository to your GitHub account.
2. Clone your fork:

```bash
git clone https://github.com/<your-username>/EduMind-AI-Study-Assistant.git
cd EduMind-AI-Study-Assistant
```

3. Install dependencies (example commands; change according to stack):

* If the project is Node.js / React:

```bash
npm install
# or
pnpm install
```

* If the project uses Python (backend or AI scripts):

```bash
python -m venv .venv
source .venv/bin/activate  # macOS / Linux
.venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

4. Run locally:

```bash
# frontend
npm start
# backend
npm run dev
# or
python app.py
```

> If there are specific environment variables or API keys required (OpenAI, Firebase, etc.), add a `.env.example` file showing the expected keys. **Do not** commit real secrets.

## Branching & workflow

Follow this branching model:

* `main` — stable production-ready code
* `develop` — integration branch (optional)
* Feature branches — `feat/<short-description>`
* Bugfix branches — `fix/<short-description>`

Always branch off from `main` (or `develop` if used).

## Submitting a Pull Request (PR)

1. Create a branch for your change.
2. Make small, focused commits with clear messages.
3. Push your branch to your fork and open a PR against `main` (or `develop` if specified).
4. Use the PR template (if provided) and describe:

   * What you changed
   * Why you changed it
   * How to test the change locally
5. Link related issues with `Fixes #<issue-number>` to auto-close them if appropriate.

## Coding style & tests

* Keep code readable and well-documented.
* Follow existing project conventions (file structure, naming, etc.).
* Add unit/integration tests for new features and bug fixes.
* Run the test suite locally before opening a PR.

Suggested tools:

* ESLint / Prettier for JavaScript/TypeScript
* Flake8 / Black for Python

If the repository has a `package.json`, prefer using the scripts defined there (e.g. `npm run lint`, `npm test`).

## Commit messages

Write descriptive, concise commit messages. Use the following format as a guideline:

```
<type>(scope?): short description

Longer description explaining what and why (optional).
```

Where `<type>` can be `feat`, `fix`, `docs`, `chore`, `test`, `refactor`, etc.

## Review process

* PRs will be reviewed by maintainers or designated reviewers.
* You may be asked to make changes — please address review comments promptly.
* Once approved, a maintainer will merge the PR. Small fixes may be squashed.

## Good first issues & mentoring

If you're new and want to contribute:

* Look for issues labeled **good first issue** or **help wanted**.
* Ask questions in the issue comments — maintainers are happy to guide you.
* For larger contributions, open an issue first to discuss the approach.

## License

By contributing, you agree that your contributions will be licensed under the repository's license ([License](#license)).

---

## Thank you!

Thanks for helping improve EduMind. Your contributions make the project better for everyone. If you need help getting started, open an issue or reach out in the project discussions.

*— The EduMind Maintainers*
