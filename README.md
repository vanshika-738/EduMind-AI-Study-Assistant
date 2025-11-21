# 🎓 EduMind – AI Study Assistant

**EduMind – AI Study Assistant** is a **web-based platform** built to help students organize, manage, and enhance their learning experience.  
It brings together smart tools like **Notes**, **To-Do List**, **Timer**, and **Whiteboard** — all integrated into a single, interactive dashboard to improve focus and productivity.

---

<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 10px; margin: 10px 0;">
  <img height="200" width="900" src="image.png">
  <span style="font-size: 25px; font-weight: 700;">We are particapting in the WOCS. Come and contribute. 💫</span>
</div>

---

## ✨ Key Features

| Feature | Description |
|----------|--------------|
| 📝 **Notes Dashboard** | Create, view, and edit your study notes seamlessly. |
| ✅ **To-Do List** | Track study goals and daily academic tasks. |
| ⏱️ **Pomodoro Timer** | Stay focused with structured study sessions. |
| 🧠 **Whiteboard** | Practice diagrams or solve problems interactively. |
| ☁️ **Cloud Storage** | Save files securely with Firebase & Cloudinary. |
| 🔐 **User Authentication** | Secure login and personalized dashboard. |
| ⚡ **Fast Performance** | Optimized for speed and smooth interaction. |

---

## 🧩 Tech Stack

| Layer | Technology Used |
|-------|-----------------|
| **Frontend** | HTML, CSS, JavaScript, Bootstrap |
| **Backend / Database** | Firebase (Firestore, Authentication, Hosting) |
| **Cloud Storage** | Cloudinary |
| **Version Control** | Git & GitHub |
| **Design** | Figma / Canva |
| **(Optional)** | Gemini API for AI-powered study summaries |

---

## 🛠️ Installation and Setup Guide

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- A code editor like VS Code (recommended for the Live Server extension)
- Git for cloning the repository

### Step 1: Clone the Repository
```bash
git clone https://github.com/dimpal-yadav/EduMind-AI-Study-Assistant.git
cd EduMind-AI-Study-Assistant
```

### Step 2: Required Files
All necessary files are included in the repository. The core application files are located in the `EduMind/` directory:
- `index.html` - Main entry point and landing page
- `firebase-config.js` - Firebase configuration file (requires your credentials)
- `auth.js` - Authentication logic and user management
- `dashboard.html` / `dashboard.js` - Main dashboard interface
- `style.css` - Main stylesheet
- Other feature-specific HTML/JS files (notes, todo, quiz, etc.)

No additional downloads or external files are required beyond cloning the repository.

### Step 3: Install Dependencies
This is a client-side web application with no build dependencies or package managers required. However, to run it locally with proper ES6 module support and avoid CORS issues, you need a local web server.

#### Using VS Code Live Server (Recommended)
1. Install the "Live Server" extension in VS Code from the Extensions marketplace.
2. Open the project folder in VS Code.
3. Right-click on `EduMind/index.html` and select "Open with Live Server".
4. The app will open in your default browser at `http://127.0.0.1:5500` or similar.

### Step 4: Firebase Configuration
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

### Step 5: Cloudinary Setup (Optional)
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

### Step 6: Run the App Locally
1. Start your local server using the method in Step 3
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

If you continue to experience issues, check the browser developer console (F12) for detailed error messages and refer to the Firebase documentation.

---

## 💡 Future Enhancements

- 🤖 **Add AI Chat Assistant** – for instant study help and query resolution  
- 💬 **Enable Group Study Rooms** – with real-time collaborative whiteboards

---

<div style="text-align: center; font-family: Arial, sans-serif; line-height: 1.6;">
  <h2>🧑‍💻 Author</h2>
  <p>
    <strong>👩‍💻 Name:</strong> Dimpal Yadav<br>
    <strong>🎓 Course:</strong> Third-Year Computer Science Student<br>
    <strong>💡 Interests:</strong> Passionate about Web Development, UI/UX Design, and AI-powered Learning Tools<br>
    <strong>🌐 LinkedIn:</strong> <a href="https://www.linkedin.com/in/dimpal-yadav-649982314/" target="_blank">Visit My LinkedIn</a><br>
    <strong>📧 Email:</strong> <a href="mailto:dimpal.yadav2912@gmail.com">dimpal.yadav2912@gmail.com</a>
  </p>
</div>

---

<h2 align="center">🌟 Star & Fork EduMind 🌟</h2>

<p align="center">
  <a href="https://github.com/dimpal-yadav/EduMind-AI-Study-Assistant/stargazers">
    <img src="https://img.shields.io/github/stars/dimpal-yadav/EduMind-AI-Study-Assistant?style=for-the-badge&logo=github&logoColor=white&color=ffcc00" height="45">
  </a>
  <a href="https://github.com/dimpal-yadav/EduMind-AI-Study-Assistant/network/members">
    <img src="https://img.shields.io/github/forks/dimpal-yadav/EduMind-AI-Study-Assistant?style=for-the-badge&logo=github&logoColor=white&color=00c853" height="45">
  </a>
</p>

<p align="center">
  🧠 Empower learning aur support karo innovation — Star ⭐ aur Fork 🍴 karke inspire karo dusron ko!
</p>

<p align="center">
  👉 <a href="https://github.com/dimpal-yadav/EduMind-AI-Study-Assistant">Visit EduMind AI Study Assistant Repo</a>
</p>

---

## 🤝 Contributing

We welcome contributions! Check out [CONTRIBUTING.md](./CONTRIBUTING.md) to learn how you can help improve EduMind AI Study Assistant.

---

## 📄 License

This project is open-source and available under the MIT License. See [LICENSE](./LICENSE) for more details.

---