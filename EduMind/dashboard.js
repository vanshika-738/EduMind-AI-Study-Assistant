// Dashboard functionality with Firebase
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    if (typeof requireAuth === 'function') {
        requireAuth();
    }
    
    // Initialize dashboard
    initializeDashboard();
});

async function initializeDashboard() {
    // Set current date
    const currentDate = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = currentDate.toLocaleDateString('en-US', options);
    
    // Load user data and progress
    await loadUserData();
    await loadUserProgress();
    await loadRecentActivity();
    await loadUpcomingTasks();
    
    // Initialize progress chart
    initializeProgressChart();
    
    // Setup event listeners
    setupDashboardEvents();
}

async function loadUserData() {
    try {
        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
            // Set user name from Firebase auth
            document.getElementById('userName').textContent = currentUser.displayName || 'Student';
            
            // Update user avatar
            const userAvatar = document.getElementById('userAvatar');
            if (userAvatar && currentUser.photoURL) {
                userAvatar.src = currentUser.photoURL;
            }
            
            // Load additional user data from Firestore
            const userDoc = await firebase.firestore().collection('users').doc(currentUser.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                if (userData.name) {
                    document.getElementById('userName').textContent = userData.name;
                }
            }
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

async function loadUserProgress() {
    try {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) return;

        const progressDoc = await firebase.firestore().collection('user_progress').doc(currentUser.uid).get();
        
        if (progressDoc.exists) {
            const progress = progressDoc.data();
            
            // Update stats cards
            const statCards = document.querySelectorAll('.stat-card');
            if (statCards.length >= 4) {
                statCards[0].querySelector('.stat-value').textContent = progress.totalSessions || 0;
                statCards[1].querySelector('.stat-value').textContent = `${progress.completedTasks || 0}/${progress.totalTasks || 0}`;
                statCards[2].querySelector('.stat-value').textContent = `${progress.avgQuizScore || 0}%`;
                
                // Format focus time
                const totalMinutes = progress.totalStudyTime || 0;
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                statCards[3].querySelector('.stat-value').textContent = `${hours}h ${minutes}m`;
            }
            
            // Update progress changes
            updateProgressChanges(progress);
            
        } else {
            // Initialize with zero values for new users
            initializeNewUserProgress();
        }
    } catch (error) {
        console.error('Error loading user progress:', error);
    }
}

function updateProgressChanges(progress) {
    const changeElements = document.querySelectorAll('.stat-change');
    
    if (changeElements.length >= 4) {
        // Study sessions change
        if (progress.totalSessions > 0) {
            changeElements[0].textContent = `+${progress.totalSessions} total`;
            changeElements[0].style.color = '#4caf50';
        }
        
        // Tasks change
        const totalTasks = progress.totalTasks || 0;
        const completedTasks = progress.completedTasks || 0;
        if (totalTasks > 0) {
            const completionRate = Math.round((completedTasks / totalTasks) * 100);
            changeElements[1].textContent = `${completionRate}% done`;
            changeElements[1].style.color = completionRate >= 50 ? '#4caf50' : '#ff9800';
        }
        
        // Score change
        if (progress.avgQuizScore > 0) {
            changeElements[2].textContent = 'Great progress!';
            changeElements[2].style.color = '#4caf50';
        }
        
        // Time change
        if (progress.totalStudyTime > 0) {
            changeElements[3].textContent = 'Keep it up!';
            changeElements[3].style.color = '#4caf50';
        }
    }
}

function initializeNewUserProgress() {
    const statCards = document.querySelectorAll('.stat-card');
    const changeElements = document.querySelectorAll('.stat-change');
    
    if (statCards.length >= 4) {
        statCards[0].querySelector('.stat-value').textContent = '0';
        statCards[1].querySelector('.stat-value').textContent = '0/0';
        statCards[2].querySelector('.stat-value').textContent = '0%';
        statCards[3].querySelector('.stat-value').textContent = '0h 0m';
    }
    
    // Set motivational messages
    if (changeElements.length >= 4) {
        changeElements[0].textContent = 'Start studying!';
        changeElements[1].textContent = 'Add some tasks!';
        changeElements[2].textContent = 'Take a quiz!';
        changeElements[3].textContent = 'Use timer!';
    }
}

async function loadRecentActivity() {
    try {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) return;

        const activityContainer = document.querySelector('.activity-list');
        if (!activityContainer) return;
        
        // Get recent activities from Firestore
        const activities = await getRecentActivities(currentUser.uid);
        
        if (activities.length === 0) {
            // Show welcome message for new users
            activityContainer.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon info">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="activity-details">
                        <p>Welcome to EduMind! Start your learning journey by uploading notes or taking a quiz.</p>
                        <span class="activity-time">Just now</span>
                    </div>
                </div>
            `;
            return;
        }
        
        // Display recent activities
        activityContainer.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="fas fa-${getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-details">
                    <p>${activity.description}</p>
                    <span class="activity-time">${formatTime(activity.timestamp)}</span>
                </div>
                ${activity.score ? `<div class="activity-score">${activity.score}%</div>` : ''}
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading recent activity:', error);
    }
}

async function getRecentActivities(userId) {
    try {
        const activities = [];
        
        // Get recent quiz attempts
        const quizSnapshot = await firebase.firestore()
            .collection('quiz_attempts')
            .where('userId', '==', userId)
            .orderBy('completedAt', 'desc')
            .limit(3)
            .get();
        
        quizSnapshot.forEach(doc => {
            const data = doc.data();
            activities.push({
                type: 'completed',
                description: `Completed quiz with score ${data.score}%`,
                timestamp: data.completedAt,
                score: data.score
            });
        });
        
        // Get recent notes uploads
        const notesSnapshot = await firebase.firestore()
            .collection('notes')
            .where('userId', '==', userId)
            .orderBy('uploadDate', 'desc')
            .limit(2)
            .get();
        
        notesSnapshot.forEach(doc => {
            const data = doc.data();
            activities.push({
                type: 'uploaded',
                description: `Uploaded "${data.title}"`,
                timestamp: data.uploadDate
            });
        });
        
        // Sort by timestamp and return top 4
        return activities
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 4);
        
    } catch (error) {
        console.error('Error fetching activities:', error);
        return [];
    }
}

function getActivityIcon(type) {
    const icons = {
        'completed': 'check',
        'uploaded': 'upload',
        'generated': 'robot',
        'quiz': 'question-circle',
        'study': 'book',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function formatTime(timestamp) {
    if (!timestamp) return 'Recently';
    
    const now = new Date();
    const activityTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now - activityTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return activityTime.toLocaleDateString();
}

async function loadUpcomingTasks() {
    try {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) return;

        const tasksContainer = document.querySelector('.tasks-list');
        if (!tasksContainer) return;
        
        // Get tasks from Firestore
        const tasksSnapshot = await firebase.firestore()
            .collection('tasks')
            .where('userId', '==', currentUser.uid)
            .where('status', '==', 'pending')
            .orderBy('dueDate')
            .limit(5)
            .get();
        
        const tasks = [];
        tasksSnapshot.forEach(doc => {
            tasks.push({ id: doc.id, ...doc.data() });
        });
        
        if (tasks.length === 0) {
            tasksContainer.innerHTML = `
                <div class="task-item empty-task">
                    <div class="task-details">
                        <p>No upcoming tasks. Add some tasks to get started!</p>
                    </div>
                </div>
            `;
            return;
        }
        
        // Display tasks
        tasksContainer.innerHTML = tasks.map(task => `
            <div class="task-item" data-task-id="${task.id}">
                <div class="task-checkbox">
                    <input type="checkbox" id="task-${task.id}" ${task.status === 'completed' ? 'checked' : ''}>
                    <label for="task-${task.id}"></label>
                </div>
                <div class="task-details">
                    <p>${task.title}</p>
                    <span class="task-due">${formatDueDate(task.dueDate)}</span>
                </div>
                <div class="task-priority ${task.priority || 'medium'}"></div>
            </div>
        `).join('');
        
        // Update tasks progress
        updateTasksProgress(tasks.length, 0); // Assuming all tasks are pending
        
        // Add event listeners for task checkboxes
        tasksContainer.querySelectorAll('.task-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', handleTaskCompletion);
        });
        
    } catch (error) {
        console.error('Error loading upcoming tasks:', error);
    }
}

function updateTasksProgress(totalTasks, completedTasks) {
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.tasks-progress span');
    
    if (progressFill && progressText) {
        const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        progressFill.style.width = `${progressPercentage}%`;
        progressText.textContent = `${Math.round(progressPercentage)}% completed`;
    }
}

function formatDueDate(dueDate) {
    if (!dueDate) return 'No due date';
    
    const now = new Date();
    const due = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays === -1) return 'Due yesterday';
    if (diffDays < 0) return `Due ${Math.abs(diffDays)} days ago`;
    if (diffDays < 7) return `Due in ${diffDays} days`;
    
    return `Due ${due.toLocaleDateString()}`;
}

async function handleTaskCompletion(event) {
    const taskId = event.target.closest('.task-item').dataset.taskId;
    const isCompleted = event.target.checked;
    
    try {
        await firebase.firestore().collection('tasks').doc(taskId).update({
            status: isCompleted ? 'completed' : 'pending',
            completedAt: isCompleted ? firebase.firestore.FieldValue.serverTimestamp() : null
        });
        
        // Reload progress and tasks
        await loadUserProgress();
        await loadUpcomingTasks();
        
        showNotification('Task updated successfully!', 'success');
        
    } catch (error) {
        console.error('Error updating task:', error);
        event.target.checked = !event.target.checked; // Revert checkbox state
        showNotification('Error updating task. Please try again.', 'error');
    }
}

function initializeProgressChart() {
    const progressCtx = document.getElementById('progressChart');
    if (!progressCtx) return;

    const progressChart = new Chart(progressCtx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Study Time (hours)',
                data: [2.5, 3, 2, 4, 3.5, 2, 3],
                borderColor: '#00bcd4',
                backgroundColor: 'rgba(0, 188, 212, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + 'h';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function setupDashboardEvents() {
    // Chat toggle functionality
    const chatToggle = document.querySelector('.chat-toggle');
    const chatContent = document.querySelector('.chat-content');
    
    if (chatToggle && chatContent) {
        chatToggle.addEventListener('click', function() {
            const isHidden = chatContent.style.display === 'none';
            chatContent.style.display = isHidden ? 'block' : 'none';
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
        });
    }
    
    // Chat functionality
    const chatInput = document.querySelector('.chat-input input');
    const sendBtn = document.querySelector('.send-btn');
    
    if (sendBtn && chatInput) {
        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Logout functionality - FIXED
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logoutUser();
        });
    }
    
    // User dropdown logout
    const dropdownLogout = document.querySelector('.user-dropdown a[href="index.html"]');
    if (dropdownLogout) {
        dropdownLogout.addEventListener('click', function(e) {
            e.preventDefault();
            logoutUser();
        });
    }
}

// Fixed logout function
async function logoutUser() {
    try {
        await firebase.auth().signOut();
        // Redirect to home page after successful logout
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Error signing out. Please try again.', 'error');
    }
}

function sendMessage() {
    const chatInput = document.querySelector('.chat-input input');
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message
    addMessage(message, 'user');
    
    // Clear input
    chatInput.value = '';
    
    // Simulate AI response after a delay
    setTimeout(() => {
        const aiResponse = getAIResponse(message);
        addMessage(aiResponse, 'ai');
    }, 1000);
}

function addMessage(text, sender) {
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    
    const icon = document.createElement('i');
    icon.className = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
    avatarDiv.appendChild(icon);
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = `<p>${text}</p>`;
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getAIResponse(message) {
    // Simple AI response simulation
    const responses = [
        "That's an interesting question! Based on your study materials, I'd recommend focusing on the key concepts we covered last week.",
        "Great question! Let me check your notes and previous quizzes to give you the most relevant information.",
        "I understand you're looking for clarification on this topic. Let me summarize the main points for you.",
        "Based on your study patterns, I suggest reviewing this concept with flashcards for better retention.",
        "I notice you've been doing well with this subject! Would you like me to generate a quiz to test your knowledge?",
        "That's a common area of confusion. Let me break it down into simpler terms for you."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

// Notification function
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

// Make sure Firebase is available
if (typeof firebase === 'undefined') {
    console.error('Firebase is not loaded. Please check your Firebase configuration.');
}