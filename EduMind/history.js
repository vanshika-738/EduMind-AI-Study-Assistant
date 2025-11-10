// history.js - Study History Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase services
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    // Check authentication
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            initializeHistoryPage(user);
        } else {
            // User is not signed in, redirect to login
            window.location.href = 'login.html';
        }
    });

    function initializeHistoryPage(user) {
        // Update user avatar
        const userAvatar = document.getElementById('userAvatar');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (userAvatar && currentUser.profilePhoto) {
            userAvatar.src = currentUser.profilePhoto;
        }

        // Load user data
        loadUserHistory(user.uid);
        loadStudySessions(user.uid);
        loadAchievements(user.uid);
        
        // Setup event listeners
        setupEventListeners(user.uid);
        
        // Initialize charts (will be populated when data is available)
        initializeCharts();
    }

    function loadUserHistory(userId) {
        // Show loading spinner
        showLoading(true);
        
        // Load user progress data
        db.collection('user_progress').doc(userId).get()
            .then((doc) => {
                if (doc.exists) {
                    const progressData = doc.data();
                    updateStatistics(progressData);
                    updateChartsWithData(progressData, userId);
                } else {
                    // Create initial progress document for new users
                    createInitialProgress(userId);
                }
            })
            .catch((error) => {
                console.error('Error loading user progress:', error);
                showError('Failed to load study history');
            })
            .finally(() => {
                showLoading(false);
            });

        // Load recent activities
        loadRecentActivities(userId);
    }

    function createInitialProgress(userId) {
        const initialProgress = {
            userId: userId,
            totalSessions: 0,
            totalStudyTime: 0,
            avgQuizScore: 0,
            completedTasks: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastActive: firebase.firestore.FieldValue.serverTimestamp(),
            level: 1,
            experience: 0,
            achievements: []
        };

        db.collection('user_progress').doc(userId).set(initialProgress)
            .then(() => {
                updateStatistics(initialProgress);
                updateChartsWithData(initialProgress, userId);
            })
            .catch((error) => {
                console.error('Error creating initial progress:', error);
            });
    }

    function updateStatistics(progressData) {
        // Update statistics cards
        document.getElementById('totalStudyTime').textContent = 
            formatStudyTime(progressData.totalStudyTime || 0);
        document.getElementById('totalNotes').textContent = 
            (progressData.totalNotes || 0).toString();
        document.getElementById('totalSummaries').textContent = 
            (progressData.totalSummaries || 0).toString();
        document.getElementById('totalQuizzes').textContent = 
            (progressData.totalQuizzes || 0).toString();

        // Update change indicators (simplified for demo)
        updateChangeIndicators(progressData);
    }

    function formatStudyTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }

    function updateChangeIndicators(progressData) {
        // This would normally compare with previous period data
        // For demo, we'll show encouraging messages
        const totalTime = progressData.totalStudyTime || 0;
        
        if (totalTime === 0) {
            document.getElementById('studyTimeChange').textContent = 'Start studying to see progress';
            document.getElementById('notesChange').textContent = 'No notes yet';
            document.getElementById('summariesChange').textContent = 'No summaries yet';
            document.getElementById('quizzesChange').textContent = 'No quizzes yet';
        } else if (totalTime < 60) {
            document.getElementById('studyTimeChange').textContent = 'Great start! Keep going';
            document.getElementById('notesChange').textContent = '+1 this week';
            document.getElementById('summariesChange').textContent = '+1 this week';
            document.getElementById('quizzesChange').textContent = '+1 this week';
        } else {
            document.getElementById('studyTimeChange').textContent = '+2h this week';
            document.getElementById('notesChange').textContent = '+3 this week';
            document.getElementById('summariesChange').textContent = '+2 this week';
            document.getElementById('quizzesChange').textContent = '+1 this week';
        }
    }

    function loadRecentActivities(userId) {
        // Load activities from different collections
        const activities = [];
        
        // Load from multiple collections (simplified for demo)
        Promise.all([
            db.collection('notes').where('userId', '==', userId).orderBy('uploadDate', 'desc').limit(5).get(),
            db.collection('summaries').where('userId', '==', userId).orderBy('createdAt', 'desc').limit(5).get(),
            db.collection('quiz_attempts').where('userId', '==', userId).orderBy('completedAt', 'desc').limit(5).get(),
            db.collection('study_sessions').where('userId', '==', userId).orderBy('startTime', 'desc').limit(5).get()
        ]).then((results) => {
            // Process notes
            results[0].forEach(doc => {
                const note = doc.data();
                activities.push({
                    type: 'notes',
                    title: 'Uploaded Notes',
                    description: `Added ${note.title}`,
                    time: note.uploadDate,
                    icon: 'fa-file-upload'
                });
            });

            // Process summaries
            results[1].forEach(doc => {
                const summary = doc.data();
                activities.push({
                    type: 'summaries',
                    title: 'Generated AI Summary',
                    description: `Created summary from notes`,
                    time: summary.createdAt,
                    icon: 'fa-robot'
                });
            });

            // Process quizzes
            results[2].forEach(doc => {
                const quiz = doc.data();
                activities.push({
                    type: 'quizzes',
                    title: 'Completed Quiz',
                    description: `Scored ${quiz.score}%`,
                    time: quiz.completedAt,
                    icon: 'fa-tasks'
                });
            });

            // Process study sessions
            results[3].forEach(doc => {
                const session = doc.data();
                activities.push({
                    type: 'timer',
                    title: 'Focus Session',
                    description: `${session.duration}min on ${session.topic || 'studying'}`,
                    time: session.startTime,
                    icon: 'fa-clock'
                });
            });

            // Sort by time and display
            activities.sort((a, b) => b.time - a.time);
            displayActivities(activities);
        }).catch((error) => {
            console.error('Error loading activities:', error);
        });
    }

    function displayActivities(activities) {
        const timeline = document.getElementById('activityTimeline');
        const emptyState = document.getElementById('emptyTimeline');

        if (activities.length === 0) {
            timeline.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        timeline.style.display = 'block';
        emptyState.style.display = 'none';
        timeline.innerHTML = '';

        activities.forEach(activity => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.innerHTML = `
                <div class="timeline-marker">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="timeline-content">
                    <h4>${activity.title}</h4>
                    <p>${activity.description}</p>
                    <span class="timeline-time">${formatTimeAgo(activity.time)}</span>
                </div>
            `;
            timeline.appendChild(timelineItem);
        });
    }

    function formatTimeAgo(timestamp) {
        if (!timestamp) return 'Recently';
        
        const time = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return time.toLocaleDateString();
    }

    function loadStudySessions(userId) {
        db.collection('study_sessions')
            .where('userId', '==', userId)
            .orderBy('startTime', 'desc')
            .limit(10)
            .get()
            .then((querySnapshot) => {
                const sessions = [];
                querySnapshot.forEach(doc => {
                    sessions.push({ id: doc.id, ...doc.data() });
                });
                displayStudySessions(sessions);
            })
            .catch((error) => {
                console.error('Error loading study sessions:', error);
            });
    }

    function displayStudySessions(sessions) {
        const tableBody = document.getElementById('sessionsTableBody');
        const tableContainer = document.getElementById('sessionsTableContainer');
        const noSessionsData = document.getElementById('noSessionsData');
        const tableFooter = document.getElementById('tableFooter');

        if (sessions.length === 0) {
            tableContainer.style.display = 'none';
            tableFooter.style.display = 'none';
            noSessionsData.style.display = 'block';
            return;
        }

        tableContainer.style.display = 'block';
        tableFooter.style.display = 'flex';
        noSessionsData.style.display = 'none';
        tableBody.innerHTML = '';

        sessions.forEach(session => {
            const row = document.createElement('tr');
            const startTime = session.startTime.toDate();
            
            row.innerHTML = `
                <td>${formatSessionDate(startTime)}</td>
                <td>${session.duration || 25} min</td>
                <td>${session.topic || 'General Study'}</td>
                <td>${session.type || 'Focus Session'}</td>
                <td>${getSessionDetails(session)}</td>
                <td>
                    <button class="btn small primary view-session" data-session-id="${session.id}">View</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Add event listeners to view buttons
        document.querySelectorAll('.view-session').forEach(button => {
            button.addEventListener('click', function() {
                const sessionId = this.getAttribute('data-session-id');
                viewSessionDetails(sessionId);
            });
        });
    }

    function formatSessionDate(date) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const sessionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        if (sessionDate.getTime() === today.getTime()) {
            return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
        }
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (sessionDate.getTime() === yesterday.getTime()) {
            return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
        }
        
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function getSessionDetails(session) {
        switch (session.type) {
            case 'quiz':
                return `Score: ${session.score || 'N/A'}%`;
            case 'summary':
                return 'AI Summary Generated';
            case 'notes':
                return 'Notes Created/Uploaded';
            case 'flashcards':
                return 'Flashcards Created';
            default:
                return 'Study Session Completed';
        }
    }

    function loadAchievements(userId) {
        // Load user's achievements from progress document
        db.collection('user_progress').doc(userId).get()
            .then((doc) => {
                if (doc.exists) {
                    const progress = doc.data();
                    const userAchievements = progress.achievements || [];
                    displayAchievements(userAchievements, progress);
                }
            })
            .catch((error) => {
                console.error('Error loading achievements:', error);
            });
    }

    function displayAchievements(userAchievements, progress) {
        const achievementsGrid = document.getElementById('achievementsGrid');
        const achievementsCount = document.getElementById('achievementsCount');
        
        // Define all possible achievements
        const allAchievements = [
            {
                id: 'first_steps',
                name: 'First Steps',
                description: 'Complete your first study session',
                icon: 'fa-rocket',
                requirement: progress.totalSessions > 0
            },
            {
                id: 'quick_learner',
                name: 'Quick Learner',
                description: 'Score 90% or higher on a quiz',
                icon: 'fa-brain',
                requirement: progress.avgQuizScore >= 90
            },
            {
                id: 'focus_master',
                name: 'Focus Master',
                description: 'Complete 10 focus sessions',
                icon: 'fa-clock',
                requirement: progress.totalSessions >= 10
            },
            {
                id: 'note_taker',
                name: 'Note Taker',
                description: 'Upload 10 different notes',
                icon: 'fa-book',
                requirement: (progress.totalNotes || 0) >= 10,
                progress: (progress.totalNotes || 0)
            },
            {
                id: 'ai_assistant',
                name: 'AI Assistant',
                description: 'Generate 5 AI summaries',
                icon: 'fa-robot',
                requirement: (progress.totalSummaries || 0) >= 5,
                progress: (progress.totalSummaries || 0)
            }
        ];

        let unlockedCount = 0;
        achievementsGrid.innerHTML = '';

        allAchievements.forEach(achievement => {
            const isUnlocked = achievement.requirement || userAchievements.includes(achievement.id);
            if (isUnlocked) unlockedCount++;

            const achievementItem = document.createElement('div');
            achievementItem.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;
            
            achievementItem.innerHTML = `
                <div class="achievement-icon">
                    <i class="fas ${achievement.icon}"></i>
                </div>
                <div class="achievement-content">
                    <h4>${achievement.name}</h4>
                    <p>${achievement.description}</p>
                    ${isUnlocked ? 
                        '<span class="achievement-date">Unlocked: Recently</span>' :
                        (achievement.progress ? 
                            `<span class="achievement-progress">Progress: ${achievement.progress}/${achievement.description.match(/\d+/)[0]}</span>` :
                            '<span class="achievement-progress">Not started</span>'
                        )
                    }
                </div>
            `;
            
            achievementsGrid.appendChild(achievementItem);
        });

        achievementsCount.textContent = `${unlockedCount}/${allAchievements.length} Unlocked`;
    }

    function setupEventListeners(userId) {
        // Filter activities
        const activityFilter = document.getElementById('activityFilter');
        if (activityFilter) {
            activityFilter.addEventListener('change', function() {
                filterActivities(this.value);
            });
        }

        // Chart period selector
        const chartPeriod = document.getElementById('chartPeriod');
        if (chartPeriod) {
            chartPeriod.addEventListener('change', function() {
                updateCharts(this.value, userId);
            });
        }

        // Export sessions
        const exportSessions = document.getElementById('exportSessions');
        if (exportSessions) {
            exportSessions.addEventListener('click', function() {
                exportSessionsData(userId);
            });
        }

        // Modal close
        const closeDetailsModal = document.getElementById('closeDetailsModal');
        if (closeDetailsModal) {
            closeDetailsModal.addEventListener('click', function() {
                document.getElementById('sessionDetailsModal').style.display = 'none';
            });
        }

        // Close modal when clicking outside
        const sessionDetailsModal = document.getElementById('sessionDetailsModal');
        if (sessionDetailsModal) {
            sessionDetailsModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.style.display = 'none';
                }
            });
        }

        // Theme toggle - Fix for dark/light mode
        const themeSwitch = document.getElementById('theme-switch');
        if (themeSwitch) {
            // Set initial theme state
            const currentTheme = localStorage.getItem('theme') || 'light';
            themeSwitch.checked = currentTheme === 'dark';
            
            themeSwitch.addEventListener('change', function() {
                if (this.checked) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    localStorage.setItem('theme', 'dark');
                } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                    localStorage.setItem('theme', 'light');
                }
                // Update charts to match theme
                updateChartThemes();
            });
        }
    }

    function filterActivities(filter) {
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        timelineItems.forEach(item => {
            const activityType = item.querySelector('.timeline-marker i').className;
            let type = 'all';
            
            if (activityType.includes('fa-file-upload')) type = 'notes';
            else if (activityType.includes('fa-robot')) type = 'summaries';
            else if (activityType.includes('fa-tasks')) type = 'quizzes';
            else if (activityType.includes('fa-clock')) type = 'timer';
            
            if (filter === 'all' || type === filter) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Chart instances storage
    let chartInstances = {
        timeDistribution: null,
        weeklyProgress: null,
        subjectChart: null,
        performanceChart: null
    };

    function initializeCharts() {
        const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDarkTheme ? '#f5f5f5' : '#2c3e50';
        const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor
                    }
                },
                y: {
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor
                    }
                }
            }
        };

        // Time Distribution Chart
        const timeDistributionCtx = document.getElementById('timeDistributionChart');
        if (timeDistributionCtx) {
            chartInstances.timeDistribution = new Chart(timeDistributionCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Quizzes', 'Notes', 'Summaries', 'Flashcards'],
                    datasets: [{
                        data: [0, 0, 0, 0],
                        backgroundColor: ['#00bcd4', '#9c27b0', '#4caf50', '#ff9800'],
                        borderColor: isDarkTheme ? '#1a1a2e' : '#ffffff',
                        borderWidth: 2
                    }]
                },
                options: chartOptions
            });
        }

        // Weekly Progress Chart
        const weeklyProgressCtx = document.getElementById('weeklyProgressChart');
        if (weeklyProgressCtx) {
            chartInstances.weeklyProgress = new Chart(weeklyProgressCtx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Study Time (min)',
                        data: [0, 0, 0, 0, 0, 0, 0],
                        borderColor: '#00bcd4',
                        backgroundColor: 'rgba(0, 188, 212, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: chartOptions
            });
        }

        // Subject Breakdown Chart
        const subjectCtx = document.getElementById('subjectChart');
        if (subjectCtx) {
            chartInstances.subjectChart = new Chart(subjectCtx, {
                type: 'bar',
                data: {
                    labels: ['Math', 'Science', 'History', 'Language'],
                    datasets: [{
                        label: 'Study Time (min)',
                        data: [0, 0, 0, 0],
                        backgroundColor: '#9c27b0',
                        borderColor: '#9c27b0',
                        borderWidth: 1
                    }]
                },
                options: chartOptions
            });
        }

        // Performance Chart
        const performanceCtx = document.getElementById('performanceChart');
        if (performanceCtx) {
            chartInstances.performanceChart = new Chart(performanceCtx, {
                type: 'radar',
                data: {
                    labels: ['Quizzes', 'Notes', 'Summaries', 'Flashcards', 'Focus Time'],
                    datasets: [{
                        label: 'Performance',
                        data: [0, 0, 0, 0, 0],
                        backgroundColor: 'rgba(76, 175, 80, 0.2)',
                        borderColor: '#4caf50',
                        borderWidth: 2,
                        pointBackgroundColor: '#4caf50'
                    }]
                },
                options: chartOptions
            });
        }

        // Show/hide charts based on data availability
        const noDataCharts = document.getElementById('noDataCharts');
        const chartsGrid = document.getElementById('chartsGrid');
        
        if (noDataCharts && chartsGrid) {
            noDataCharts.style.display = 'block';
            chartsGrid.style.display = 'none';
        }
    }

    function updateChartsWithData(progressData, userId) {
        const totalStudyTime = progressData.totalStudyTime || 0;
        const totalNotes = progressData.totalNotes || 0;
        const totalSummaries = progressData.totalSummaries || 0;
        const totalQuizzes = progressData.totalQuizzes || 0;

        // Show charts only if there's data
        const noDataCharts = document.getElementById('noDataCharts');
        const chartsGrid = document.getElementById('chartsGrid');
        
        if (totalStudyTime > 0) {
            if (noDataCharts) noDataCharts.style.display = 'none';
            if (chartsGrid) chartsGrid.style.display = 'grid';

            // Update Time Distribution Chart
            if (chartInstances.timeDistribution) {
                chartInstances.timeDistribution.data.datasets[0].data = [
                    totalQuizzes * 15, // Assuming 15min per quiz
                    totalNotes * 30,   // Assuming 30min per note
                    totalSummaries * 10, // Assuming 10min per summary
                    Math.max(0, totalStudyTime - (totalQuizzes * 15 + totalNotes * 30 + totalSummaries * 10))
                ];
                chartInstances.timeDistribution.update();
            }

            // Update Weekly Progress Chart
            if (chartInstances.weeklyProgress) {
                const weeklyData = generateWeeklyData(totalStudyTime);
                chartInstances.weeklyProgress.data.datasets[0].data = weeklyData;
                chartInstances.weeklyProgress.update();
            }

            // Update Subject Chart
            if (chartInstances.subjectChart) {
                const subjectData = generateSubjectData(totalStudyTime);
                chartInstances.subjectChart.data.datasets[0].data = subjectData;
                chartInstances.subjectChart.update();
            }

            // Update Performance Chart
            if (chartInstances.performanceChart) {
                const performanceData = [
                    Math.min(100, (totalQuizzes / 10) * 100), // Quiz performance
                    Math.min(100, (totalNotes / 20) * 100),   // Notes performance
                    Math.min(100, (totalSummaries / 15) * 100), // Summary performance
                    Math.min(100, (totalStudyTime / 500) * 100), // Flashcard performance
                    Math.min(100, (totalStudyTime / 1000) * 100) // Focus time performance
                ];
                chartInstances.performanceChart.data.datasets[0].data = performanceData;
                chartInstances.performanceChart.update();
            }
        } else {
            if (noDataCharts) noDataCharts.style.display = 'block';
            if (chartsGrid) chartsGrid.style.display = 'none';
        }
    }

    function generateWeeklyData(totalStudyTime) {
        // Generate realistic weekly data based on total study time
        const baseTime = totalStudyTime / 4; // Spread over 4 weeks
        return [
            Math.round(baseTime * 0.8),  // Mon
            Math.round(baseTime * 1.2),  // Tue
            Math.round(baseTime * 0.9),  // Wed
            Math.round(baseTime * 1.1),  // Thu
            Math.round(baseTime * 1.3),  // Fri
            Math.round(baseTime * 0.7),  // Sat
            Math.round(baseTime * 0.6)   // Sun
        ];
    }

    function generateSubjectData(totalStudyTime) {
        // Generate subject distribution
        return [
            Math.round(totalStudyTime * 0.3),  // Math
            Math.round(totalStudyTime * 0.25), // Science
            Math.round(totalStudyTime * 0.2),  // History
            Math.round(totalStudyTime * 0.25)  // Language
        ];
    }

    function updateCharts(period, userId) {
        // This would normally fetch and update chart data based on the selected period
        console.log('Updating charts for period:', period);
        
        // For demo, we'll simulate data update
        db.collection('user_progress').doc(userId).get()
            .then((doc) => {
                if (doc.exists) {
                    const progressData = doc.data();
                    updateChartsWithData(progressData, userId);
                    showNotification(`Charts updated for ${period} view`, 'info');
                }
            })
            .catch((error) => {
                console.error('Error updating charts:', error);
            });
    }

    function updateChartThemes() {
        const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDarkTheme ? '#f5f5f5' : '#2c3e50';
        const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        // Update all chart instances with new theme colors
        Object.values(chartInstances).forEach(chart => {
            if (chart) {
                chart.options.plugins.legend.labels.color = textColor;
                chart.options.scales.x.ticks.color = textColor;
                chart.options.scales.y.ticks.color = textColor;
                chart.options.scales.x.grid.color = gridColor;
                chart.options.scales.y.grid.color = gridColor;
                chart.update();
            }
        });
    }

    function viewSessionDetails(sessionId) {
        // In a real app, this would fetch detailed session data
        const modal = document.getElementById('sessionDetailsModal');
        const content = document.getElementById('sessionDetailsContent');
        
        content.innerHTML = `
            <div class="session-info">
                <div class="info-item">
                    <label>Session Type:</label>
                    <span>Focus Session</span>
                </div>
                <div class="info-item">
                    <label>Duration:</label>
                    <span>25 minutes</span>
                </div>
                <div class="info-item">
                    <label>Topic:</label>
                    <span>Mathematics</span>
                </div>
                <div class="info-item">
                    <label>Date & Time:</label>
                    <span>${new Date().toLocaleString()}</span>
                </div>
                <div class="info-item">
                    <label>Efficiency:</label>
                    <span>85%</span>
                </div>
            </div>
            <div class="session-notes">
                <h4>Session Notes</h4>
                <p>Completed algebra problems and reviewed calculus concepts. Focus was maintained throughout the session.</p>
            </div>
        `;
        
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    function exportSessionsData(userId) {
        // In a real app, this would generate and download a CSV file
        showNotification('Export feature coming soon!', 'info');
    }

    function showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = show ? 'flex' : 'none';
        }
    }

    function showError(message) {
        showNotification(message, 'error');
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
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            hideNotification(notification);
        }, 5000);
        
        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
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
});