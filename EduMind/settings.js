// Settings Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize settings
    initializeSettings();
    
    // Navigation between sections
    setupNavigation();
    
    // Profile photo and cover functionality
    setupProfileMedia();
    
    // Form submissions
    setupForms();
    
    // Preferences functionality
    setupPreferences();
    
    // Notifications functionality
    setupNotifications();
    
    // Mobile menu functionality
    setupMobileMenu();
});

function initializeSettings() {
    // Load user data from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Set user information
    if (currentUser.name) {
        document.getElementById('userDisplayName').textContent = currentUser.name;
        document.getElementById('fullName').value = currentUser.name;
        document.getElementById('username').value = currentUser.username || 'student_user';
        document.getElementById('email').value = currentUser.email || 'student@edumind.com';
        document.getElementById('navUserAvatar').src = currentUser.profilePhoto || 'https://ui-avatars.com/api/?name=Student+User&background=00bcd4&color=fff';
    }
    
    // Load saved profile photo and cover
    const savedProfilePhoto = localStorage.getItem('profilePhoto');
    const savedCoverPhoto = localStorage.getItem('coverPhoto');
    
    if (savedProfilePhoto) {
        document.getElementById('profileImage').src = savedProfilePhoto;
    }
    
    if (savedCoverPhoto) {
        document.getElementById('coverPhoto').style.backgroundImage = `url(${savedCoverPhoto})`;
        document.getElementById('coverPhoto').style.backgroundSize = 'cover';
        document.getElementById('coverPhoto').style.backgroundPosition = 'center';
    }
    
    // Load theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('theme-switch').checked = savedTheme === 'dark';
    
    // Set active theme option
    document.querySelectorAll('.theme-option').forEach(option => {
        if (option.dataset.theme === savedTheme) {
            option.classList.add('active');
        }
    });
}

function setupNavigation() {
    // Navigation between settings sections
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.settings-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items and sections
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.dataset.section;
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Add animation
                targetSection.style.animation = 'none';
                setTimeout(() => {
                    targetSection.style.animation = 'fadeIn 0.5s ease';
                }, 10);
            }
        });
    });
}

function setupProfileMedia() {
    // Profile photo upload
    const photoEditBtn = document.getElementById('photoEditBtn');
    const photoUpload = document.getElementById('photoUpload');
    const profileImage = document.getElementById('profileImage');
    
    if (photoEditBtn && photoUpload) {
        photoEditBtn.addEventListener('click', function() {
            photoUpload.click();
        });
        
        photoUpload.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    profileImage.src = e.target.result;
                    
                    // Save to localStorage
                    localStorage.setItem('profilePhoto', e.target.result);
                    
                    // Update nav avatar
                    document.getElementById('navUserAvatar').src = e.target.result;
                    
                    // Show success message
                    showNotification('Profile photo updated successfully!', 'success');
                };
                
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }
    
    // Cover photo upload
    const coverEditBtn = document.getElementById('coverEditBtn');
    const coverUpload = document.getElementById('coverUpload');
    const coverPhoto = document.getElementById('coverPhoto');
    
    if (coverEditBtn && coverUpload) {
        coverEditBtn.addEventListener('click', function() {
            coverUpload.click();
        });
        
        coverUpload.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    coverPhoto.style.backgroundImage = `url(${e.target.result})`;
                    coverPhoto.style.backgroundSize = 'cover';
                    coverPhoto.style.backgroundPosition = 'center';
                    
                    // Save to localStorage
                    localStorage.setItem('coverPhoto', e.target.result);
                    
                    // Show success message
                    showNotification('Cover photo updated successfully!', 'success');
                };
                
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }
}

function setupForms() {
    // Profile form submission
    const profileForm = document.getElementById('profileForm');
    const cancelProfileBtn = document.getElementById('cancelProfileBtn');
    
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('fullName').value,
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                bio: document.getElementById('bio').value,
                location: document.getElementById('location').value,
                education: document.getElementById('education').value
            };
            
            // Update user data in localStorage
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const updatedUser = { ...currentUser, ...formData };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            
            // Update display name
            document.getElementById('userDisplayName').textContent = formData.name;
            document.getElementById('userEmail').textContent = formData.email;
            
            // Show success message
            showNotification('Profile updated successfully!', 'success');
        });
        
        if (cancelProfileBtn) {
            cancelProfileBtn.addEventListener('click', function() {
                // Reset form to original values
                const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                document.getElementById('fullName').value = currentUser.name || 'Student User';
                document.getElementById('username').value = currentUser.username || 'student_user';
                document.getElementById('email').value = currentUser.email || 'student@edumind.com';
                document.getElementById('phone').value = currentUser.phone || '+1 (555) 123-4567';
                document.getElementById('bio').value = currentUser.bio || 'Passionate student dedicated to learning and academic excellence.';
                document.getElementById('location').value = currentUser.location || 'New York, USA';
                document.getElementById('education').value = currentUser.education || 'undergraduate';
            });
        }
    }
    
    // Password change functionality
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const passwordModal = document.getElementById('passwordModal');
    const closePasswordModal = document.getElementById('closePasswordModal');
    const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
    const passwordForm = document.getElementById('passwordForm');
    
    if (changePasswordBtn && passwordModal) {
        changePasswordBtn.addEventListener('click', function() {
            passwordModal.classList.add('active');
        });
        
        closePasswordModal.addEventListener('click', function() {
            passwordModal.classList.remove('active');
        });
        
        cancelPasswordBtn.addEventListener('click', function() {
            passwordModal.classList.remove('active');
            passwordForm.reset();
        });
        
        // Close modal when clicking outside
        passwordModal.addEventListener('click', function(e) {
            if (e.target === passwordModal) {
                passwordModal.classList.remove('active');
                passwordForm.reset();
            }
        });
        
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Simple validation
            if (newPassword !== confirmPassword) {
                showNotification('New passwords do not match!', 'error');
                return;
            }
            
            if (newPassword.length < 6) {
                showNotification('Password must be at least 6 characters long!', 'error');
                return;
            }
            
            // In a real app, you would send this to your backend
            console.log('Password change requested:', { currentPassword, newPassword });
            
            // Show success message
            showNotification('Password updated successfully!', 'success');
            
            // Close modal and reset form
            passwordModal.classList.remove('active');
            passwordForm.reset();
        });
        
        // Password strength indicator
        const newPasswordInput = document.getElementById('newPassword');
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        
        if (newPasswordInput && strengthBar && strengthText) {
            newPasswordInput.addEventListener('input', function() {
                const password = this.value;
                const strength = calculatePasswordStrength(password);
                
                const strengthColors = {
                    weak: '#f44336',
                    medium: '#ff9800',
                    strong: '#4caf50',
                    veryStrong: '#2e7d32'
                };
                
                const strengthTexts = {
                    weak: 'Weak',
                    medium: 'Medium',
                    strong: 'Strong',
                    veryStrong: 'Very Strong'
                };
                
                strengthBar.style.width = `${strength.percentage}%`;
                strengthBar.style.backgroundColor = strengthColors[strength.level];
                strengthText.textContent = strengthTexts[strength.level];
            });
        }
    }
    
    // Delete account functionality
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.')) {
                // In a real app, you would send a delete request to your backend
                console.log('Account deletion requested');
                
                // Clear localStorage and redirect to home
                localStorage.clear();
                window.location.href = 'index.html';
                
                showNotification('Account deleted successfully', 'success');
            }
        });
    }
}

function setupPreferences() {
    // Theme selection
    const themeOptions = document.querySelectorAll('.theme-option');
    
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.dataset.theme;
            
            // Remove active class from all options
            themeOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to selected option
            this.classList.add('active');
            
            // Apply theme
            if (theme === 'auto') {
                // Auto theme based on system preference
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
                document.getElementById('theme-switch').checked = prefersDark;
                localStorage.setItem('theme', 'auto');
            } else {
                document.documentElement.setAttribute('data-theme', theme);
                document.getElementById('theme-switch').checked = theme === 'dark';
                localStorage.setItem('theme', theme);
            }
            
            showNotification('Theme updated successfully!', 'success');
        });
    });
    
    // Font size selection
    const fontSizeBtns = document.querySelectorAll('.font-size-btn');
    
    fontSizeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const size = this.dataset.size;
            
            // Remove active class from all buttons
            fontSizeBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Apply font size
            document.documentElement.style.fontSize = 
                size === 'small' ? '14px' : 
                size === 'medium' ? '16px' : '18px';
            
            localStorage.setItem('fontSize', size);
            showNotification('Font size updated successfully!', 'success');
        });
    });
    
    // Load saved font size
    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    document.querySelector(`.font-size-btn[data-size="${savedFontSize}"]`).classList.add('active');
    document.documentElement.style.fontSize = 
        savedFontSize === 'small' ? '14px' : 
        savedFontSize === 'medium' ? '16px' : '18px';
    
    // Animations toggle
    const animationsToggle = document.getElementById('animationsToggle');
    
    if (animationsToggle) {
        animationsToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.remove('no-animations');
                localStorage.setItem('animations', 'enabled');
            } else {
                document.body.classList.add('no-animations');
                localStorage.setItem('animations', 'disabled');
            }
            
            showNotification('Animation settings updated!', 'success');
        });
        
        // Load saved animation preference
        const savedAnimations = localStorage.getItem('animations') || 'enabled';
        animationsToggle.checked = savedAnimations === 'enabled';
        if (savedAnimations === 'disabled') {
            document.body.classList.add('no-animations');
        }
    }
    
    // Language selection
    const languageSelect = document.getElementById('languageSelect');
    
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            const language = this.value;
            localStorage.setItem('language', language);
            showNotification(`Language changed to ${this.options[this.selectedIndex].text}`, 'success');
        });
        
        // Load saved language
        const savedLanguage = localStorage.getItem('language') || 'en';
        languageSelect.value = savedLanguage;
    }
    
    // Study settings
    const studyDuration = document.getElementById('studyDuration');
    const breakDuration = document.getElementById('breakDuration');
    const dailyGoal = document.getElementById('dailyGoal');
    const weeklyGoal = document.getElementById('weeklyGoal');
    
    if (studyDuration) {
        studyDuration.addEventListener('change', function() {
            localStorage.setItem('studyDuration', this.value);
            showNotification('Study duration updated!', 'success');
        });
        
        // Load saved study duration
        const savedStudyDuration = localStorage.getItem('studyDuration') || '25';
        studyDuration.value = savedStudyDuration;
    }
    
    if (breakDuration) {
        breakDuration.addEventListener('change', function() {
            localStorage.setItem('breakDuration', this.value);
            showNotification('Break duration updated!', 'success');
        });
        
        // Load saved break duration
        const savedBreakDuration = localStorage.getItem('breakDuration') || '5';
        breakDuration.value = savedBreakDuration;
    }
    
    if (dailyGoal) {
        dailyGoal.addEventListener('change', function() {
            localStorage.setItem('dailyGoal', this.value);
            showNotification('Daily goal updated!', 'success');
        });
        
        // Load saved daily goal
        const savedDailyGoal = localStorage.getItem('dailyGoal') || '4';
        dailyGoal.value = savedDailyGoal;
    }
    
    if (weeklyGoal) {
        weeklyGoal.addEventListener('change', function() {
            localStorage.setItem('weeklyGoal', this.value);
            showNotification('Weekly goal updated!', 'success');
        });
        
        // Load saved weekly goal
        const savedWeeklyGoal = localStorage.getItem('weeklyGoal') || '20';
        weeklyGoal.value = savedWeeklyGoal;
    }
}

function setupNotifications() {
    // All notification toggles will automatically save their state
    const notificationToggles = document.querySelectorAll('#notifications .toggle-switch input');
    
    notificationToggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const setting = this.id.replace('Toggle', '');
            const isEnabled = this.checked;
            
            // Save to localStorage
            const notifications = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
            notifications[setting] = isEnabled;
            localStorage.setItem('notificationSettings', JSON.stringify(notifications));
            
            showNotification('Notification settings updated!', 'success');
        });
        
        // Load saved notification settings
        const notifications = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
        if (notifications.hasOwnProperty(this.id.replace('Toggle', ''))) {
            this.checked = notifications[this.id.replace('Toggle', '')];
        }
    });
    
    // Two-factor authentication toggle
    const twoFactorToggle = document.getElementById('twoFactorToggle');
    
    if (twoFactorToggle) {
        twoFactorToggle.addEventListener('change', function() {
            if (this.checked) {
                showNotification('Two-factor authentication enabled!', 'success');
            } else {
                showNotification('Two-factor authentication disabled!', 'warning');
            }
            
            localStorage.setItem('twoFactorEnabled', this.checked);
        });
        
        // Load saved two-factor setting
        const twoFactorEnabled = localStorage.getItem('twoFactorEnabled') === 'true';
        twoFactorToggle.checked = twoFactorEnabled;
    }
}

function setupMobileMenu() {
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
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.padding = '10px 0';
            navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.padding = '15px 0';
            navbar.style.boxShadow = 'none';
        }
    });
}

// Utility functions
function calculatePasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) score++;
    if (password.match(/\d/)) score++;
    if (password.match(/[^a-zA-Z\d]/)) score++;
    
    const levels = {
        0: { level: 'weak', percentage: 25 },
        1: { level: 'weak', percentage: 25 },
        2: { level: 'medium', percentage: 50 },
        3: { level: 'strong', percentage: 75 },
        4: { level: 'veryStrong', percentage: 100 }
    };
    
    return levels[score] || levels[0];
}

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

// Add no-animations class styles
const noAnimationsStyle = document.createElement('style');
noAnimationsStyle.textContent = `
    .no-animations * {
        animation: none !important;
        transition: none !important;
    }
`;
document.head.appendChild(noAnimationsStyle);