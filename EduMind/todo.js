// To-Do List functionality
document.addEventListener('DOMContentLoaded', function() {
    let tasks = JSON.parse(localStorage.getItem('edumind_tasks')) || [];
    let currentFilter = 'all';
    
    // Initialize
    initializeTodoApp();
    
    function initializeTodoApp() {
        setupEventListeners();
        renderTasks();
        updateStats();
        renderDeadlines();
    }
    
    function setupEventListeners() {
        // Add task form
        const addTaskForm = document.getElementById('addTaskForm');
        addTaskForm.addEventListener('submit', handleAddTask);
        
        // Task filter
        const taskFilter = document.getElementById('taskFilter');
        taskFilter.addEventListener('change', function() {
            currentFilter = this.value;
            renderTasks();
        });
        
        // Clear completed tasks
        const clearCompleted = document.getElementById('clearCompleted');
        clearCompleted.addEventListener('click', handleClearCompleted);
        
        // Edit task modal
        const editTaskModal = document.getElementById('editTaskModal');
        const closeEditModal = document.getElementById('closeEditModal');
        const cancelEdit = document.getElementById('cancelEdit');
        const editTaskForm = document.getElementById('editTaskForm');
        
        closeEditModal.addEventListener('click', () => editTaskModal.classList.remove('active'));
        cancelEdit.addEventListener('click', () => editTaskModal.classList.remove('active'));
        editTaskForm.addEventListener('submit', handleEditTask);
        
        // Close modal when clicking outside
        editTaskModal.addEventListener('click', function(e) {
            if (e.target === editTaskModal) {
                editTaskModal.classList.remove('active');
            }
        });
    }
    
    function handleAddTask(e) {
        e.preventDefault();
        
        const taskData = {
            id: Date.now(),
            title: document.getElementById('taskTitle').value.trim(),
            subject: document.getElementById('taskSubject').value,
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value,
            estimate: parseFloat(document.getElementById('taskEstimate').value),
            description: document.getElementById('taskDescription').value.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        if (!taskData.title) {
            alert('Please enter a task title');
            return;
        }
        
        tasks.push(taskData);
        saveTasks();
        renderTasks();
        updateStats();
        renderDeadlines();
        
        // Reset form
        document.getElementById('addTaskForm').reset();
        document.getElementById('taskEstimate').value = 1;
        
        showNotification('Task added successfully!');
    }
    
    function handleEditTask(e) {
        e.preventDefault();
        
        const taskId = parseInt(document.getElementById('editTaskId').value);
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                title: document.getElementById('editTaskTitle').value.trim(),
                subject: document.getElementById('editTaskSubject').value,
                priority: document.getElementById('editTaskPriority').value,
                dueDate: document.getElementById('editTaskDueDate').value,
                estimate: parseFloat(document.getElementById('editTaskEstimate').value),
                description: document.getElementById('editTaskDescription').value.trim()
            };
            
            saveTasks();
            renderTasks();
            updateStats();
            renderDeadlines();
            
            document.getElementById('editTaskModal').classList.remove('active');
            showNotification('Task updated successfully!');
        }
    }
    
    function handleClearCompleted() {
        if (confirm('Are you sure you want to clear all completed tasks?')) {
            tasks = tasks.filter(task => !task.completed);
            saveTasks();
            renderTasks();
            updateStats();
            showNotification('Completed tasks cleared!');
        }
    }
    
    function renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const emptyTasks = document.getElementById('emptyTasks');
        
        const filteredTasks = filterTasks(tasks, currentFilter);
        
        if (filteredTasks.length === 0) {
            tasksList.style.display = 'none';
            emptyTasks.style.display = 'block';
        } else {
            tasksList.style.display = 'flex';
            emptyTasks.style.display = 'none';
            
            tasksList.innerHTML = filteredTasks.map(task => `
                <div class="task-item ${task.completed ? 'completed' : ''} animate-fade-in">
                    <div class="task-checkbox">
                        <input type="checkbox" id="task-${task.id}" ${task.completed ? 'checked' : ''}>
                        <label for="task-${task.id}" onclick="toggleTask(${task.id})"></label>
                    </div>
                    <div class="task-content">
                        <h4>${task.title}</h4>
                        <div class="task-meta">
                            <span class="task-subject">${getSubjectDisplayName(task.subject)}</span>
                            <span class="task-priority priority-${task.priority}">${task.priority}</span>
                            ${task.dueDate ? `
                                <span class="task-due ${isOverdue(task.dueDate) ? 'overdue' : ''}">
                                    <i class="fas fa-calendar"></i>
                                    ${formatDueDate(task.dueDate)}
                                </span>
                            ` : ''}
                            <span class="task-estimate">
                                <i class="fas fa-clock"></i>
                                ${task.estimate}h
                            </span>
                        </div>
                        ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
                    </div>
                    <div class="task-actions">
                        <button class="task-action-btn" onclick="editTask(${task.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="task-action-btn" onclick="deleteTask(${task.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }
    
    function filterTasks(tasks, filter) {
        const today = new Date().toISOString().split('T')[0];
        const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        switch (filter) {
            case 'active':
                return tasks.filter(task => !task.completed);
            case 'completed':
                return tasks.filter(task => task.completed);
            case 'today':
                return tasks.filter(task => task.dueDate === today && !task.completed);
            case 'week':
                return tasks.filter(task => 
                    task.dueDate && 
                    task.dueDate >= today && 
                    task.dueDate <= weekFromNow && 
                    !task.completed
                );
            default:
                return tasks;
        }
    }
    
    function updateStats() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;
        
        const today = new Date().toISOString().split('T')[0];
        const dueToday = tasks.filter(task => task.dueDate === today && !task.completed).length;
        
        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;
        document.getElementById('dueToday').textContent = dueToday;
        
        // Update progress
        const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        document.getElementById('progressPercent').textContent = `${progressPercent}%`;
        document.getElementById('overallProgress').style.width = `${progressPercent}%`;
        
        document.getElementById('completedCount').textContent = completedTasks;
        document.getElementById('inProgressCount').textContent = pendingTasks;
        document.getElementById('notStartedCount').textContent = pendingTasks; // Simplified for demo
    }
    
    function renderDeadlines() {
        const deadlinesList = document.getElementById('deadlinesList');
        const emptyDeadlines = document.getElementById('emptyDeadlines');
        
        const upcomingTasks = tasks
            .filter(task => task.dueDate && !task.completed)
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5); // Show only 5 upcoming deadlines
        
        if (upcomingTasks.length === 0) {
            deadlinesList.style.display = 'none';
            emptyDeadlines.style.display = 'block';
        } else {
            deadlinesList.style.display = 'flex';
            emptyDeadlines.style.display = 'none';
            
            deadlinesList.innerHTML = upcomingTasks.map(task => {
                const daysUntilDue = getDaysUntilDue(task.dueDate);
                let urgencyClass = 'days-normal';
                let urgencyText = 'Normal';
                
                if (daysUntilDue < 0) {
                    urgencyClass = 'days-urgent';
                    urgencyText = 'Overdue';
                } else if (daysUntilDue <= 1) {
                    urgencyClass = 'days-urgent';
                    urgencyText = 'Urgent';
                } else if (daysUntilDue <= 3) {
                    urgencyClass = 'days-warning';
                    urgencyText = 'Soon';
                }
                
                return `
                    <div class="deadline-item ${daysUntilDue <= 1 ? 'urgent' : ''} animate-fade-in">
                        <div class="deadline-icon">
                            <i class="fas fa-flag"></i>
                        </div>
                        <div class="deadline-content">
                            <h4>${task.title}</h4>
                            <div class="deadline-meta">
                                <span class="task-subject">${getSubjectDisplayName(task.subject)}</span>
                                <span class="deadline-days ${urgencyClass}">${urgencyText}</span>
                                <span>Due: ${formatDisplayDate(task.dueDate)}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
    
    // Global functions for task actions
    window.toggleTask = function(taskId) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            saveTasks();
            renderTasks();
            updateStats();
            renderDeadlines();
            
            const action = tasks[taskIndex].completed ? 'completed' : 'marked as pending';
            showNotification(`Task ${action}!`);
        }
    };
    
    window.editTask = function(taskId) {
        const task = tasks.find(task => task.id === taskId);
        if (task) {
            document.getElementById('editTaskId').value = task.id;
            document.getElementById('editTaskTitle').value = task.title;
            document.getElementById('editTaskSubject').value = task.subject;
            document.getElementById('editTaskPriority').value = task.priority;
            document.getElementById('editTaskDueDate').value = task.dueDate;
            document.getElementById('editTaskEstimate').value = task.estimate;
            document.getElementById('editTaskDescription').value = task.description || '';
            
            document.getElementById('editTaskModal').classList.add('active');
        }
    };
    
    window.deleteTask = function(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id !== taskId);
            saveTasks();
            renderTasks();
            updateStats();
            renderDeadlines();
            showNotification('Task deleted!');
        }
    };
    
    function saveTasks() {
        localStorage.setItem('edumind_tasks', JSON.stringify(tasks));
    }
    
    // Utility functions
    function getSubjectDisplayName(subject) {
        const subjects = {
            'general': 'General',
            'math': 'Mathematics',
            'science': 'Science',
            'history': 'History',
            'language': 'Language',
            'programming': 'Programming',
            'other': 'Other'
        };
        return subjects[subject] || subject;
    }
    
    function formatDueDate(dateString) {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        if (dateString === today) return 'Today';
        if (dateString === tomorrow) return 'Tomorrow';
        
        return new Date(dateString).toLocaleDateString();
    }
    
    function formatDisplayDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }
    
    function isOverdue(dateString) {
        return new Date(dateString) < new Date().setHours(0, 0, 0, 0);
    }
    
    function getDaysUntilDue(dateString) {
        const dueDate = new Date(dateString);
        const today = new Date().setHours(0, 0, 0, 0);
        const diffTime = dueDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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