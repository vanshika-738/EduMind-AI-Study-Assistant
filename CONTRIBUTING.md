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
   * Environment details (OS, browser, VS Code version, etc.)

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

3. **Required Files**:
   All necessary files are included in the repository. The core application files are located in the `EduMind/` directory:
   - `index.html` - Main entry point and landing page
   - `firebase-config.js` - Firebase configuration file (requires your credentials)
   - `auth.js` - Authentication logic and user management
   - `dashboard.html` / `dashboard.js` - Main dashboard interface
   - `style.css` - Main stylesheet
   - Other feature-specific HTML/JS files (notes, todo, quiz, etc.)

   No additional downloads or external files are required beyond cloning the repository.

4. **Install Dependencies**:
   This is a client-side web application with no build dependencies or package managers required. However, to run it locally with proper ES6 module support and avoid CORS issues, you need a local web server.

   **Using VS Code Live Server (Recommended)**:
   1. Install the "Live Server" extension in VS Code from the Extensions marketplace.
   2. Open the project folder in VS Code.
   3. Right-click on `EduMind/index.html` and select "Open with Live Server".
   4. The app will open in your default browser at `http://127.0.0.1:5500` or similar.

5. **Firebase Configuration**:
   EduMind uses Firebase for user authentication and data storage. You must set up your own Firebase project to enable these features.

   1. **Create a Firebase Project**:
      - Go to [Firebase Console](https://console.firebase.google.com)
      - Click "Create a project" and follow the setup wizard

   2. **Enable Authentication**:
      - In your Firebase project, go to "Authentication" > "Sign-in method"
      - Enable the following providers:
        - Email/Password
        - Google
        - GitHub

   3. **Set Up Firestore Database**:
      - Go to "Firestore Database" > "Create database"
      - Choose "Start in test mode" for development (you can configure security rules later for production)

   4. **Get Your Firebase Configuration**:
      - Go to "Project settings" > "General" > "Your apps"
      - Click "Add app" > "Web app" (</>) icon
      - Register your app with a nickname (e.g., "EduMind Local")
      - Copy the `firebaseConfig` object

   5. **Configure Your App**:
      - Open `EduMind/firebase-config.js`
      - Replace the existing `firebaseConfig` object with your own configuration:
        ```javascript
        const firebaseConfig = {
            apiKey: "your-api-key-here",
            authDomain: "your-project.firebaseapp.com",
            projectId: "your-project-id",
            storageBucket: "your-project.firebasestorage.app",
            messagingSenderId: "123456789",
            appId: "1:123456789:web:abcdef123456",
            measurementId: "G-ABCDEFGHIJ"  // Optional
        };
        ```

   6. **Configure Authorized Domains**:
      - In Firebase Console > Authentication > Settings > Authorized domains
      - Add `localhost` and `127.0.0.1` for local development

   7. **GitHub OAuth Setup** (for GitHub login):
      - Create a new OAuth App in your GitHub account settings
      - Set Authorization callback URL to: `https://your-project.firebaseapp.com/__/auth/handler`
      - Copy Client ID and Client Secret to Firebase Console > Authentication > Sign-in method > GitHub

6. **Cloudinary Setup (Optional)**:
   For cloud storage functionality (uploading images/files):
   1. Create a free account at [Cloudinary](https://cloudinary.com)
   2. Go to your Dashboard and copy your Cloud Name, API Key, and API Secret
   3. Create a new file `EduMind/config.js` (or add to existing config) with:
      ```javascript
      const cloudinaryConfig = {
          cloudName: 'your-cloud-name',
          apiKey: 'your-api-key',
          apiSecret: 'your-api-secret'
      };
      ```
   4. Import and use this config in relevant files as needed

7. **Run the App Locally**:
   1. Start your local server using Live Server (see step 4)
   2. Open the app in your browser
   3. Navigate to the signup/login page to create an account
   4. Access the dashboard and test the features

### Common Errors and Solutions

- **CORS Errors or Module Import Failures**:
  - **Cause**: Opening `index.html` directly in the browser without a server
  - **Solution**: Always use Live Server in VS Code

- **Firebase Configuration Errors**:
  - **Cause**: Incorrect config object or missing authorized domains
  - **Solution**: Double-check your `firebaseConfig` in `firebase-config.js` and ensure `localhost` is in authorized domains

- **Authentication Not Working**:
  - **Cause**: Providers not enabled or OAuth misconfigured
  - **Solution**: Verify all auth providers are enabled in Firebase Console and OAuth apps are correctly set up

- **Firestore Permission Denied**:
  - **Cause**: Database in production mode or restrictive security rules
  - **Solution**: Use "test mode" for development or update Firestore rules

- **GitHub Login Issues**:
  - **Cause**: Incorrect OAuth callback URL or missing client credentials
  - **Solution**: Ensure callback URL matches Firebase format and credentials are copied correctly

- **Blank Page or Console Errors**:
  - **Cause**: Network issues or incorrect file paths
  - **Solution**: Check browser console for errors, ensure all files are present, and try refreshing

> **Do not** commit real Firebase credentials or API keys. If you continue to experience issues, check the browser developer console (F12) for detailed error messages and refer to the Firebase documentation.

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
4. Use the PR template.
5. Link related issues with `Fixes #<issue-number>` to auto-close them.

## Coding style & tests

* Keep code readable and well-documented.
* Follow existing project conventions (file structure, naming, etc.).
* Test your changes locally using Live Server before opening a PR.
* Ensure all Firebase authentication flows work correctly.
* Test on multiple browsers (Chrome, Firefox, Edge, Safari) when possible.

Coding standards:

* Use consistent JavaScript formatting and naming conventions
* Comment complex logic and Firebase integration code
* Keep HTML semantic and accessible
* Ensure CSS follows existing styling patterns

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
