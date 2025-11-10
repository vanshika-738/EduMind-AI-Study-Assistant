// Timer functionality
document.addEventListener('DOMContentLoaded', function() {
    // Timer state
    let timerState = {
        isRunning: false,
        isPaused: false,
        currentMode: 'focus', // 'focus', 'break', 'longBreak'
        currentTime: 25 * 60, // in seconds
        totalTime: 25 * 60,
        sessionsCompleted: 0,
        currentSession: 1,
        timerInterval: null
    };

    // Settings
    let settings = {
        focusDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4,
        enableSound: true,
        autoStartBreaks: true,
        autoStartFocus: false
    };

    // Statistics
    let statistics = {
        totalFocusTime: 0,
        completedSessions: 0,
        sessionsHistory: [],
        currentStreak: 0,
        lastSessionDate: null
    };

    // Initialize
    initializeTimer();

    function initializeTimer() {
        loadSettings();
        loadStatistics();
        setupEventListeners();
        updateTimerDisplay();
        updateSettingsDisplay();
        updateStatistics();
        populateTaskSelection();
        renderSessionsHistory();
    }

    function setupEventListeners() {
        // Timer controls
        document.getElementById('startTimer').addEventListener('click', startTimer);
        document.getElementById('pauseTimer').addEventListener('click', pauseTimer);
        document.getElementById('resetTimer').addEventListener('click', resetTimer);

        // Settings
        document.getElementById('focusDuration').addEventListener('input', updateFocusDuration);
        document.getElementById('breakDuration').addEventListener('input', updateBreakDuration);
        document.getElementById('longBreakDuration').addEventListener('input', updateLongBreakDuration);
        document.getElementById('sessionsBeforeLongBreak').addEventListener('input', updateSessionsBeforeLongBreak);
        document.getElementById('enableSound').addEventListener('change', toggleSound);
        document.getElementById('autoStartBreaks').addEventListener('change', toggleAutoStartBreaks);
        document.getElementById('autoStartFocus').addEventListener('change', toggleAutoStartFocus);

        // Task selection
        document.getElementById('startWithTask').addEventListener('click', startTimerWithTask);
        document.getElementById('taskSelection').addEventListener('change', updateCurrentTask);

        // Statistics
        document.getElementById('statsPeriod').addEventListener('change', updateStatistics);
        document.getElementById('clearHistory').addEventListener('click', clearHistory);

        // Complete modal
        document.getElementById('closeCompleteModal').addEventListener('click', closeCompleteModal);
        document.getElementById('takeBreak').addEventListener('click', startBreak);
        document.getElementById('nextSession').addEventListener('click', startNextSession);

        // Close modal when clicking outside
        document.getElementById('timerCompleteModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeCompleteModal();
            }
        });
    }

    function startTimer() {
        if (timerState.isRunning) return;

        timerState.isRunning = true;
        timerState.isPaused = false;
        
        document.getElementById('startTimer').disabled = true;
        document.getElementById('pauseTimer').disabled = false;
        document.getElementById('resetTimer').disabled = false;

        // Add pulse animation
        document.querySelector('.timer-card').classList.add('pulse');

        timerState.timerInterval = setInterval(() => {
            timerState.currentTime--;
            updateTimerDisplay();

            if (timerState.currentTime <= 0) {
                completeTimer();
            }
        }, 1000);
    }

    function pauseTimer() {
        if (!timerState.isRunning) return;

        timerState.isRunning = false;
        timerState.isPaused = true;
        
        clearInterval(timerState.timerInterval);
        
        document.getElementById('startTimer').disabled = false;
        document.getElementById('pauseTimer').disabled = true;

        // Remove pulse animation
        document.querySelector('.timer-card').classList.remove('pulse');
    }

    function resetTimer() {
        timerState.isRunning = false;
        timerState.isPaused = false;
        
        clearInterval(timerState.timerInterval);
        
        // Reset to current mode's total time
        timerState.currentTime = timerState.totalTime;
        
        document.getElementById('startTimer').disabled = false;
        document.getElementById('pauseTimer').disabled = true;
        document.getElementById('resetTimer').disabled = true;

        // Remove pulse animation
        document.querySelector('.timer-card').classList.remove('pulse');

        updateTimerDisplay();
    }

    function completeTimer() {
        clearInterval(timerState.timerInterval);
        timerState.isRunning = false;
        
        document.getElementById('startTimer').disabled = false;
        document.getElementById('pauseTimer').disabled = true;

        // Remove pulse animation
        document.querySelector('.timer-card').classList.remove('pulse');

        // Play sound if enabled
        if (settings.enableSound) {
            playTimerSound();
        }

        // Update statistics
        updateSessionStatistics();

        // Show completion modal
        showCompletionModal();
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timerState.currentTime / 60);
        const seconds = timerState.currentTime % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('timerDisplay').textContent = display;

        // Update progress ring
        const progressRing = document.querySelector('.progress-ring-circle');
        const circumference = 2 * Math.PI * 140;
        const offset = circumference - (timerState.currentTime / timerState.totalTime) * circumference;
        progressRing.style.strokeDashoffset = offset;

        // Update mode display
        document.getElementById('timerMode').textContent = 
            timerState.currentMode === 'focus' ? 'Focus' : 
            timerState.currentMode === 'break' ? 'Break' : 'Long Break';

        // Update session info
        document.getElementById('sessionInfo').textContent = 
            `Session ${timerState.currentSession} of ${settings.sessionsBeforeLongBreak}`;
    }

    function updateFocusDuration() {
        const value = parseInt(this.value);
        settings.focusDuration = value;
        document.getElementById('focusDurationValue').textContent = `${value} minutes`;
        
        if (timerState.currentMode === 'focus' && !timerState.isRunning) {
            timerState.currentTime = value * 60;
            timerState.totalTime = value * 60;
            updateTimerDisplay();
        }
        
        saveSettings();
    }

    function updateBreakDuration() {
        const value = parseInt(this.value);
        settings.breakDuration = value;
        document.getElementById('breakDurationValue').textContent = `${value} minutes`;
        saveSettings();
    }

    function updateLongBreakDuration() {
        const value = parseInt(this.value);
        settings.longBreakDuration = value;
        document.getElementById('longBreakDurationValue').textContent = `${value} minutes`;
        saveSettings();
    }

    function updateSessionsBeforeLongBreak() {
        const value = parseInt(this.value);
        settings.sessionsBeforeLongBreak = value;
        document.getElementById('sessionsValue').textContent = `${value} sessions`;
        saveSettings();
    }

    function toggleSound() {
        settings.enableSound = this.checked;
        saveSettings();
    }

    function toggleAutoStartBreaks() {
        settings.autoStartBreaks = this.checked;
        saveSettings();
    }

    function toggleAutoStartFocus() {
        settings.autoStartFocus = this.checked;
        saveSettings();
    }

    function updateSettingsDisplay() {
        document.getElementById('focusDuration').value = settings.focusDuration;
        document.getElementById('breakDuration').value = settings.breakDuration;
        document.getElementById('longBreakDuration').value = settings.longBreakDuration;
        document.getElementById('sessionsBeforeLongBreak').value = settings.sessionsBeforeLongBreak;
        document.getElementById('enableSound').checked = settings.enableSound;
        document.getElementById('autoStartBreaks').checked = settings.autoStartBreaks;
        document.getElementById('autoStartFocus').checked = settings.autoStartFocus;

        document.getElementById('focusDurationValue').textContent = `${settings.focusDuration} minutes`;
        document.getElementById('breakDurationValue').textContent = `${settings.breakDuration} minutes`;
        document.getElementById('longBreakDurationValue').textContent = `${settings.longBreakDuration} minutes`;
        document.getElementById('sessionsValue').textContent = `${settings.sessionsBeforeLongBreak} sessions`;
    }

    function showCompletionModal() {
        const modal = document.getElementById('timerCompleteModal');
        const title = document.getElementById('completeTitle');
        const icon = document.getElementById('completeIcon');
        const message = document.getElementById('completeMessage');
        const summary = document.getElementById('sessionSummary');

        if (timerState.currentMode === 'focus') {
            title.textContent = 'Focus Session Complete!';
            icon.className = 'fas fa-check-circle';
            icon.style.color = '#4caf50';
            message.textContent = 'Great job! You completed a focus session.';
            
            // Update session count
            timerState.sessionsCompleted++;
            timerState.currentSession++;
            
            // Check if it's time for a long break
            const nextMode = timerState.currentSession > settings.sessionsBeforeLongBreak ? 'longBreak' : 'break';
            
            summary.innerHTML = `
                <h4>Session Summary</h4>
                <div class="summary-stats">
                    <div class="summary-stat">
                        <span class="value">${settings.focusDuration}</span>
                        <span class="label">Minutes</span>
                    </div>
                    <div class="summary-stat">
                        <span class="value">${timerState.currentSession - 1}</span>
                        <span class="label">Session</span>
                    </div>
                    <div class="summary-stat">
                        <span class="value">${nextMode === 'longBreak' ? 'Long Break' : 'Break'}</span>
                        <span class="label">Next</span>
                    </div>
                    <div class="summary-stat">
                        <span class="value">${Math.floor(statistics.totalFocusTime / 3600)}h</span>
                        <span class="label">Total Today</span>
                    </div>
                </div>
            `;
        } else {
            title.textContent = 'Break Time Over!';
            icon.className = 'fas fa-play-circle';
            icon.style.color = '#2196f3';
            message.textContent = 'Break time is over. Ready for your next focus session?';
            
            summary.innerHTML = `
                <h4>Break Complete</h4>
                <div class="summary-stats">
                    <div class="summary-stat">
                        <span class="value">${timerState.currentMode === 'break' ? settings.breakDuration : settings.longBreakDuration}</span>
                        <span class="label">Minutes</span>
                    </div>
                    <div class="summary-stat">
                        <span class="value">${timerState.currentSession}</span>
                        <span class="label">Next Session</span>
                    </div>
                    <div class="summary-stat">
                        <span class="value">${settings.sessionsBeforeLongBreak - timerState.currentSession + 1}</span>
                        <span class="label">Sessions Left</span>
                    </div>
                </div>
            `;
        }

        modal.classList.add('active');
    }

    function closeCompleteModal() {
        document.getElementById('timerCompleteModal').classList.remove('active');
    }

    function startBreak() {
        closeCompleteModal();
        
        // Determine break type
        const breakType = timerState.currentSession > settings.sessionsBeforeLongBreak ? 'longBreak' : 'break';
        const breakDuration = breakType === 'longBreak' ? settings.longBreakDuration : settings.breakDuration;
        
        timerState.currentMode = breakType;
        timerState.currentTime = breakDuration * 60;
        timerState.totalTime = breakDuration * 60;
        
        updateTimerDisplay();
        
        if (settings.autoStartBreaks) {
            startTimer();
        }
    }

    function startNextSession() {
        closeCompleteModal();
        
        // Reset session count if we completed all sessions
        if (timerState.currentSession > settings.sessionsBeforeLongBreak) {
            timerState.currentSession = 1;
        }
        
        timerState.currentMode = 'focus';
        timerState.currentTime = settings.focusDuration * 60;
        timerState.totalTime = settings.focusDuration * 60;
        
        updateTimerDisplay();
        
        if (settings.autoStartFocus) {
            startTimer();
        }
    }

    function startTimerWithTask() {
        const taskSelect = document.getElementById('taskSelection');
        const selectedTask = taskSelect.value;
        
        if (selectedTask) {
            document.getElementById('currentTask').textContent = selectedTask;
            startTimer();
        } else {
            alert('Please select a task first');
        }
    }

    function updateCurrentTask() {
        const taskSelect = document.getElementById('taskSelection');
        document.getElementById('currentTask').textContent = taskSelect.value || 'No task selected';
    }

    function populateTaskSelection() {
        const tasks = JSON.parse(localStorage.getItem('edumind_tasks')) || [];
        const taskSelect = document.getElementById('taskSelection');
        
        taskSelect.innerHTML = '<option value="">-- Select a task --</option>';
        
        tasks.filter(task => !task.completed).forEach(task => {
            const option = document.createElement('option');
            option.value = task.title;
            option.textContent = task.title;
            taskSelect.appendChild(option);
        });
    }

    function updateSessionStatistics() {
        const sessionDuration = timerState.totalTime - timerState.currentTime;
        
        if (timerState.currentMode === 'focus') {
            statistics.totalFocusTime += sessionDuration;
            statistics.completedSessions++;
            
            // Update streak
            const today = new Date().toDateString();
            if (statistics.lastSessionDate !== today) {
                statistics.currentStreak++;
                statistics.lastSessionDate = today;
            }
            
            // Add to history
            statistics.sessionsHistory.unshift({
                date: new Date().toISOString(),
                duration: sessionDuration,
                mode: 'focus',
                task: document.getElementById('currentTask').textContent
            });
            
            // Keep only last 50 sessions
            if (statistics.sessionsHistory.length > 50) {
                statistics.sessionsHistory.pop();
            }
        }
        
        updateProgressBars();
        updateStatistics();
        renderSessionsHistory();
        saveStatistics();
    }

    function updateProgressBars() {
        const today = new Date().toDateString();
        const todaySessions = statistics.sessionsHistory.filter(session => 
            new Date(session.date).toDateString() === today
        );
        
        const todayFocusTime = todaySessions.reduce((total, session) => total + session.duration, 0);
        const todayHours = Math.floor(todayFocusTime / 3600);
        const todayMinutes = Math.floor((todayFocusTime % 3600) / 60);
        
        document.getElementById('todayTime').textContent = `${todayHours}h ${todayMinutes}m`;
        document.getElementById('todayProgress').style.width = `${Math.min((todayFocusTime / (8 * 3600)) * 100, 100)}%`;
        
        // Weekly progress (simplified)
        const weeklyFocusTime = statistics.totalFocusTime;
        const weeklyHours = Math.floor(weeklyFocusTime / 3600);
        const weeklyMinutes = Math.floor((weeklyFocusTime % 3600) / 60);
        
        document.getElementById('weeklyTime').textContent = `${weeklyHours}h ${weeklyMinutes}m`;
        document.getElementById('weeklyProgress').style.width = `${Math.min((weeklyFocusTime / (10 * 3600)) * 100, 100)}%`;
    }

    function updateStatistics() {
        const period = document.getElementById('statsPeriod').value;
        let filteredSessions = [];
        
        const now = new Date();
        switch (period) {
            case 'today':
                const today = now.toDateString();
                filteredSessions = statistics.sessionsHistory.filter(session => 
                    new Date(session.date).toDateString() === today
                );
                break;
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filteredSessions = statistics.sessionsHistory.filter(session => 
                    new Date(session.date) >= weekAgo
                );
                break;
            case 'month':
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                filteredSessions = statistics.sessionsHistory.filter(session => 
                    new Date(session.date) >= monthAgo
                );
                break;
        }
        
        const totalFocusTime = filteredSessions.reduce((total, session) => total + session.duration, 0);
        const completedSessions = filteredSessions.length;
        const averageSession = completedSessions > 0 ? Math.round(totalFocusTime / completedSessions / 60) : 0;
        
        document.getElementById('totalFocusTime').textContent = 
            `${Math.floor(totalFocusTime / 3600)}h ${Math.floor((totalFocusTime % 3600) / 60)}m`;
        document.getElementById('completedSessions').textContent = completedSessions;
        document.getElementById('averageSession').textContent = `${averageSession}m`;
        document.getElementById('currentStreak').textContent = `${statistics.currentStreak} days`;
    }

    function renderSessionsHistory() {
        const sessionsList = document.getElementById('sessionsList');
        const emptySessions = document.getElementById('emptySessions');
        
        const recentSessions = statistics.sessionsHistory.slice(0, 10);
        
        if (recentSessions.length === 0) {
            sessionsList.style.display = 'none';
            emptySessions.style.display = 'block';
        } else {
            sessionsList.style.display = 'flex';
            emptySessions.style.display = 'none';
            
            sessionsList.innerHTML = recentSessions.map(session => {
                const date = new Date(session.date);
                const duration = Math.round(session.duration / 60);
                
                return `
                    <div class="session-item animate-fade-in">
                        <div class="session-icon">
                            <i class="fas ${session.mode === 'focus' ? 'fa-brain' : 'fa-coffee'}"></i>
                        </div>
                        <div class="session-content">
                            <h4>${session.mode === 'focus' ? 'Focus Session' : 'Break Time'}</h4>
                            <div class="session-meta">
                                <span class="session-duration">${duration} minutes</span>
                                <span class="session-date">${date.toLocaleDateString()}</span>
                                <span class="session-time">${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                ${session.task && session.task !== 'No task selected' ? 
                                    `<span class="session-task">${session.task}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    function clearHistory() {
        if (confirm('Are you sure you want to clear all session history?')) {
            statistics.sessionsHistory = [];
            statistics.totalFocusTime = 0;
            statistics.completedSessions = 0;
            statistics.currentStreak = 0;
            saveStatistics();
            updateStatistics();
            renderSessionsHistory();
            updateProgressBars();
            showNotification('Session history cleared!');
        }
    }

    function playTimerSound() {
        const audio = document.getElementById('timerSound');
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Audio play failed:', e));
    }

    function loadSettings() {
        const savedSettings = localStorage.getItem('edumind_timer_settings');
        if (savedSettings) {
            settings = { ...settings, ...JSON.parse(savedSettings) };
        }
    }

    function saveSettings() {
        localStorage.setItem('edumind_timer_settings', JSON.stringify(settings));
    }

    function loadStatistics() {
        const savedStats = localStorage.getItem('edumind_timer_stats');
        if (savedStats) {
            statistics = { ...statistics, ...JSON.parse(savedStats) };
        }
    }

    function saveStatistics() {
        localStorage.setItem('edumind_timer_stats', JSON.stringify(statistics));
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--primary);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: var(--shadow);
            z-index: 3000;
            animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 2.7s;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .animate-fade-in {
            animation: fadeIn 0.5s ease forwards;
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
});