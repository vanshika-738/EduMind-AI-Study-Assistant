/*
=================================================
EduMind - Dashboard Logic (dashboard.js)
=================================================
*/

// Import required Firebase modules from firebase.js
// const { auth, db } = require('./firebase'); // In a real setup, this would be an import

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial User State Check (Simulated)
    // In a real application, auth.onAuthStateChanged would be used to:
    // a) Check if user is logged in. If not, redirect to login.html.
    // b) Get the current user's data (e.g., user.displayName).
    
    // Placeholder for getting user data
    const userName = "Alex"; // Replace with actual Firebase user data
    const welcomeMessageElement = document.getElementById('welcome-message');
    
    if (welcomeMessageElement) {
        welcomeMessageElement.innerHTML = `Welcome, <span style="color: #9c27b0;">${userName}!</span> 👋`;
    }

    // 2. Initialize Charts (Chart.js)

    // Placeholder Data (Pulled from Firestore 'progress' collection in a real app)
    const analyticsData = {
        quizScores: [85, 72, 91, 78, 95],
        taskCompletion: 75, // Percentage
        pomodoroCounts: [5, 8, 4, 10, 6, 7, 9] // Sessions per day
    };
    // Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check initial auth state
    const user = auth.currentUser;
    if (user) {
        showDashboard();
    } else {
        showLoginPage();
    }
    
    console.log('EduMind AI Study Assistant initialized');
});

    // --- Performance Chart (Line Chart) ---
    const performanceCtx = document.getElementById('performanceChart');
    if (performanceCtx) {
        new Chart(performanceCtx, {
            type: 'line',
            data: {
                labels: ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4', 'Quiz 5'],
                datasets: [{
                    label: 'Quiz Score (%)',
                    data: analyticsData.quizScores,
                    borderColor: '#00bcd4', // Primary Color
                    backgroundColor: 'rgba(0, 188, 212, 0.1)',
                    tension: 0.3,
                    fill: true,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                // AOS Animation: flip-up is applied to the container, Chart.js handles its own drawing animation
            }
        });
    }


    // --- Pomodoro Chart (Bar Chart) ---
    const pomodoroCtx = document.getElementById('pomodoroChart');
    if (pomodoroCtx) {
        new Chart(pomodoroCtx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Focus Sessions',
                    data: analyticsData.pomodoroCounts,
                    backgroundColor: '#9c27b0', // Accent Color
                    borderRadius: 5,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Sessions'
                        }
                    }
                }
            }
        });
    }
    // Authentication Management
const loginPage = document.getElementById('login');
const signupPage = document.getElementById('signup');
const dashboardPage = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const goToSignup = document.getElementById('go-to-signup');
const goToLogin = document.getElementById('go-to-login');
const forgotPassword = document.getElementById('forgot-password');
const forgotPasswordModal = document.getElementById('forgot-password-modal');
const closeForgotModal = document.getElementById('close-forgot-modal');
const resetPasswordBtn = document.getElementById('reset-password-btn');
const demoAccounts = document.querySelectorAll('.demo-account');

// Show login page
function showLoginPage() {
    hideAllPages();
    loginPage.classList.add('active-page');
}

// Show signup page
function showSignupPage() {
    hideAllPages();
    signupPage.classList.add('active-page');
}

// Show dashboard (main app)
function showDashboard() {
    hideAllPages();
    dashboardPage.classList.add('active-page');
}

// Hide all pages
function hideAllPages() {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active-page');
    });
}

// Event Listeners for navigation
goToSignup.addEventListener('click', (e) => {
    e.preventDefault();
    showSignupPage();
});

goToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginPage();
});

// Login form submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    loginUser(email, password);
});

// Signup form submission
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    // Validate password length
    if (password.length < 6) {
        alert('Password must be at least 6 characters long!');
        return;
    }
    
    registerUser(name, email, password);
});

// Demo account login
demoAccounts.forEach(account => {
    account.addEventListener('click', () => {
        const email = account.getAttribute('data-email');
        const password = account.getAttribute('data-password');
        
        document.getElementById('login-email').value = email;
        document.getElementById('login-password').value = password;
        
        loginUser(email, password);
    });
});

// Forgot password functionality
forgotPassword.addEventListener('click', (e) => {
    e.preventDefault();
    forgotPasswordModal.classList.remove('hidden');
});

closeForgotModal.addEventListener('click', () => {
    forgotPasswordModal.classList.add('hidden');
});

resetPasswordBtn.addEventListener('click', () => {
    const email = document.getElementById('reset-email').value;
    
    if (!email) {
        alert('Please enter your email address');
        return;
    }
    
    auth.sendPasswordResetEmail(email)
        .then(() => {
            alert('Password reset email sent! Check your inbox.');
            forgotPasswordModal.classList.add('hidden');
        })
        .catch(error => {
            console.error('Password reset error:', error);
            alert('Error sending reset email: ' + error.message);
        });
});

// Login user with Firebase
function loginUser(email, password) {
    const loginBtn = document.getElementById('login-btn');
    const loginText = document.getElementById('login-text');
    const loginLoading = document.getElementById('login-loading');
    
    // Show loading state
    loginText.classList.add('hidden');
    loginLoading.classList.remove('hidden');
    loginBtn.disabled = true;
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Login successful - handled by auth state change
            console.log('User logged in:', userCredential.user);
        })
        .catch((error) => {
            console.error('Login error:', error);
            alert('Login failed: ' + error.message);
            
            // Reset button state
            loginText.classList.remove('hidden');
            loginLoading.classList.add('hidden');
            loginBtn.disabled = false;
        });
}

// Register new user with Firebase
function registerUser(name, email, password) {
    const signupBtn = document.getElementById('signup-btn');
    const signupText = document.getElementById('signup-text');
    const signupLoading = document.getElementById('signup-loading');
    
    // Show loading state
    signupText.classList.add('hidden');
    signupLoading.classList.remove('hidden');
    signupBtn.disabled = true;
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Update user profile
            return userCredential.user.updateProfile({
                displayName: name
            });
        })
        .then(() => {
            // Create user document in Firestore
            const user = auth.currentUser;
            return db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            console.log('User registered successfully');
            // Registration successful - handled by auth state change
        })
        .catch((error) => {
            console.error('Registration error:', error);
            alert('Registration failed: ' + error.message);
            
            // Reset button state
            signupText.classList.remove('hidden');
            signupLoading.classList.add('hidden');
            signupBtn.disabled = false;
        });
}

// Update the auth state change handler
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        userName.textContent = user.displayName || 'User';
        dashboardUsername.textContent = user.displayName || 'Student';
        userAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=00bcd4&color=fff`;
        
        // Show dashboard
        showDashboard();
        
        // Load user data
        loadUserData(user.uid);
        
        // Update last login
        db.collection('users').doc(user.uid).update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
    } else {
        // User is signed out, show login page
        showLoginPage();
    }
});

// Update the logout function
logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        // Redirect to login page handled by auth state change
    }).catch(error => {
        console.error('Logout error:', error);
    });
});

    // 3. AI Chatbot Floating Trigger (Simulated)
    // In a real application, clicking the AI Chat card would toggle a floating, animated chat window.
    const chatTrigger = document.querySelector('.ai-chat-trigger');
    if (chatTrigger) {
        chatTrigger.addEventListener('click', () => {
            alert("AI Doubt Chatbot module is loading...");
            // In a real app: window.location.href = 'chat.html' OR show/hide a fixed chat modal
        });
    }

});