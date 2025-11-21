// auth.js - Complete Firebase Authentication with Proper Logout
import {
    app,
    auth,
    db,
    googleProvider,
    githubProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    doc,
    collection,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from './firebase-config.js';

console.log('Auth.js loaded with Firebase app:', app.name);

// Theme Management
function initializeTheme() {
    const themeSwitch = document.getElementById('theme-switch');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const currentTheme = localStorage.getItem('theme');
    
    if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeSwitch) themeSwitch.checked = true;
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        if (themeSwitch) themeSwitch.checked = false;
    }
    
    // Theme switch event
    if (themeSwitch) {
        themeSwitch.addEventListener('change', function() {
            if (this.checked) {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
        });
    }
}

// Authentication State Management
function initializeAuth() {
    onAuthStateChanged(auth, (user) => {
        console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
        
        if (user) {
            // User is signed in
            updateUIForLoggedInUser(user);
            initializeUserData(user);
        } else {
            // User is signed out
            updateUIForLoggedOutUser();
            
            // If we're on a protected page, redirect to login
            const protectedPages = ['dashboard.html', 'profile.html', 'settings.html'];
            const currentPage = window.location.pathname.split('/').pop();
            
            if (protectedPages.includes(currentPage)) {
                console.log('Redirecting to login from protected page');
                window.location.href = 'login.html';
            }
        }
    });
}

// Initialize user data in Firestore
async function initializeUserData(user) {
    try {
        const userRef = doc(db, 'users', user.uid);
        const { getDoc, setDoc } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
        
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            // Create user document if it doesn't exist
            await setDoc(userRef, {
                name: user.displayName || user.email.split('@')[0],
                email: user.email,
                profilePhoto: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email.split('@')[0])}&background=00bcd4&color=fff`,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                authProvider: user.providerData[0]?.providerId || 'email'
            });
        } else {
            // Update last login
            await updateDoc(userRef, {
                lastLogin: serverTimestamp()
            });
        }
    } catch (error) {
        console.error('Error initializing user data:', error);
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser(user) {
    const loginBtn = document.querySelector('a[href="login.html"]');
    const signupBtn = document.querySelector('a[href="signup.html"]');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    
    if (loginBtn && signupBtn) {
        loginBtn.textContent = 'Dashboard';
        loginBtn.href = 'dashboard.html';
        signupBtn.textContent = 'Logout';
        signupBtn.href = '#';
        
        // Remove existing event listeners and add new one
        const newSignupBtn = signupBtn.cloneNode(true);
        signupBtn.parentNode.replaceChild(newSignupBtn, signupBtn);
        
        newSignupBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    if (userAvatar) {
        userAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email.split('@')[0])}&background=00bcd4&color=fff`;
    }
    
    if (userName) {
        userName.textContent = user.displayName || user.email.split('@')[0];
    }
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    const loginBtn = document.querySelector('a[href="dashboard.html"]');
    const signupBtn = document.querySelector('a[href="#"]');
    
    if (loginBtn && signupBtn && loginBtn.textContent === 'Dashboard') {
        loginBtn.textContent = 'Login';
        loginBtn.href = 'login.html';
        signupBtn.textContent = 'Sign Up';
        signupBtn.href = 'signup.html';
        
        // Remove existing event listeners
        const newSignupBtn = signupBtn.cloneNode(true);
        signupBtn.parentNode.replaceChild(newSignupBtn, signupBtn);
    }
}

// Logout function - FIXED VERSION
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        console.log('Starting logout process...');
        
        signOut(auth).then(() => {
            console.log('Firebase signOut successful');
            
            // Clear localStorage
            localStorage.removeItem('currentUser');
            
            // Show success message
            showNotification('Logged out successfully!', 'success');
            
            // Redirect to home page after short delay
            setTimeout(() => {
                console.log('Redirecting to index.html');
                window.location.href = 'index.html';
            }, 1000);
            
        }).catch((error) => {
            console.error('Logout error:', error);
            showNotification('Logout failed. Please try again.', 'error');
        });
    }
}

// Google Sign-In Function
async function googleSignIn() {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    const isNew = !userDoc.exists();
    
    if (isNew) {
        await setDoc(userRef, {
            name: user.displayName,
            email: user.email,
            profilePhoto: user.photoURL,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            authProvider: 'google'
        });
        
        // Create user progress document
        const progressRef = doc(db, 'user_progress', user.uid);
        await setDoc(progressRef, {
            userId: user.uid,
            totalSessions: 0,
            totalStudyTime: 0,
            avgQuizScore: 0,
            completedTasks: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastActive: serverTimestamp(),
            level: 1,
            experience: 0,
            achievements: []
        });
    } else {
        await updateDoc(userRef, {
            lastLogin: serverTimestamp()
        });
    }
    
    return { user, isNew };
}

// GitHub Sign-In Function
async function githubSignIn() {
    const result = await signInWithPopup(auth, githubProvider);
    const user = result.user;
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    const isNew = !userDoc.exists();
    
    if (isNew) {
        await setDoc(userRef, {
            name: user.displayName || user.email.split('@')[0],
            email: user.email,
            profilePhoto: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email.split('@')[0])}&background=00bcd4&color=fff`,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            authProvider: 'github'
        });
        
        // Create user progress document
        const progressRef = doc(db, 'user_progress', user.uid);
        await setDoc(progressRef, {
            userId: user.uid,
            totalSessions: 0,
            totalStudyTime: 0,
            avgQuizScore: 0,
            completedTasks: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastActive: serverTimestamp(),
            level: 1,
            experience: 0,
            achievements: []
        });
    } else {
        await updateDoc(userRef, {
            lastLogin: serverTimestamp()
        });
    }
    
    return { user, isNew };
}

// Mobile Menu Toggle
function initializeMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Navbar Scroll Effect
function initializeNavbarScroll() {
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.style.padding = '10px 0';
                navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.padding = '15px 0';
                navbar.style.boxShadow = 'none';
            }
        }
    });
}

// Utility function to show notifications
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto hide after 5 seconds
    const autoHide = setTimeout(() => {
        hideNotification(notification);
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        clearTimeout(autoHide);
        hideNotification(notification);
    });
    
    function hideNotification(notif) {
        notif.classList.remove('show');
        setTimeout(() => {
            if (notif.parentNode) {
                notif.parentNode.removeChild(notif);
            }
        }, 300);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing auth system...');
    
    initializeTheme();
    initializeAuth();
    initializeMobileMenu();
    initializeNavbarScroll();
    
    // Add notification styles if not present
    if (!document.querySelector('.notification-styles')) {
        const style = document.createElement('style');
        style.className = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: var(--card-bg);
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                padding: 15px 20px;
                display: flex;
                align-items: center;
                gap: 15px;
                z-index: 1000;
                max-width: 400px;
                transform: translateX(150%);
                transition: transform 0.3s ease;
                border-left: 4px solid;
            }
            
            .notification-success {
                border-left-color: #4caf50;
            }
            
            .notification-error {
                border-left-color: #f44336;
            }
            
            .notification-warning {
                border-left-color: #ff9800;
            }
            
            .notification-info {
                border-left-color: var(--primary);
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 1;
            }
            
            .notification-content i {
                font-size: 1.2rem;
            }
            
            .notification-success .notification-content i {
                color: #4caf50;
            }
            
            .notification-error .notification-content i {
                color: #f44336;
            }
            
            .notification-warning .notification-content i {
                color: #ff9800;
            }
            
            .notification-info .notification-content i {
                color: var(--primary);
            }
            
            .notification-close {
                background: none;
                border: none;
                color: var(--text);
                cursor: pointer;
                opacity: 0.7;
                transition: all 0.3s ease;
            }
            
            .notification-close:hover {
                opacity: 1;
                transform: scale(1.1);
            }
        `;
        document.head.appendChild(style);
    }
    
    console.log('Auth system initialized successfully');
});

// Make functions globally available
window.logout = logout;
window.firebaseAuth = {
    auth,
    db,
    logout,
    showNotification
};

// Export for module usage
export {
    auth,
    db,
    googleProvider,
    githubProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
    logout,
    googleSignIn,
    githubSignIn,
    showNotification,
    initializeTheme
};