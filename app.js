// DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const prioritySelect = document.getElementById('priority-select');
const scheduleDate = document.getElementById('schedule-date');
const taskList = document.getElementById('task-list');
const taskCounter = document.getElementById('task-counter');
const totalTasksElement = document.getElementById('total-tasks');
const completedTasksElement = document.getElementById('completed-tasks');
const pendingTasksElement = document.getElementById('pending-tasks');
const scheduledTasksElement = document.getElementById('scheduled-tasks');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const filterBtns = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sort-select');
const shareBtn = document.getElementById('share-btn');
const syncBtn = document.getElementById('sync-btn');
const offlineModeBtn = document.getElementById('offline-mode-btn');
const connectionStatus = document.getElementById('connection-status');

// Modal Elements
const shareModal = document.getElementById('share-modal');
const closeModalBtns = document.querySelectorAll('.close-modal');
const generateLinkBtn = document.getElementById('generate-link-btn');
const shareLinkContainer = document.getElementById('share-link-container');
const shareLinkInput = document.getElementById('share-link');
const copyLinkBtn = document.getElementById('copy-link-btn');
const exportTasksBtn = document.getElementById('export-tasks-btn');
const importTasksInput = document.getElementById('import-tasks-input');
const importTasksBtn = document.getElementById('import-tasks-btn');
const notificationModal = document.getElementById('notification-modal');
const notificationMessage = document.getElementById('notification-message');
const dismissNotificationBtn = document.getElementById('dismiss-notification-btn');
const snoozeNotificationBtn = document.getElementById('snooze-notification-btn');

// Task array to store all tasks
let tasks = [];

// Current filter and sort settings
let currentFilter = 'all';
let currentSort = 'date-added';

// Offline mode flag
let isOfflineMode = false;

// Pending sync tasks (for offline mode)
let pendingSyncTasks = [];

// Check online status
function updateOnlineStatus() {
    if (navigator.onLine) {
        connectionStatus.textContent = 'Online';
        connectionStatus.classList.remove('offline');
        offlineModeBtn.innerHTML = '<i class="fas fa-wifi"></i> Online';
        offlineModeBtn.classList.remove('offline');
        
        // If we have pending sync tasks and we're not in forced offline mode
        if (pendingSyncTasks.length > 0 && !isOfflineMode) {
            syncTasks();
        }
    } else {
        connectionStatus.textContent = 'Offline';
        connectionStatus.classList.add('offline');
        offlineModeBtn.innerHTML = '<i class="fas fa-wifi-slash"></i> Offline';
        offlineModeBtn.classList.add('offline');
    }
}

// Toggle offline mode manually
offlineModeBtn.addEventListener('click', () => {
    isOfflineMode = !isOfflineMode;
    
    if (isOfflineMode) {
        offlineModeBtn.innerHTML = '<i class="fas fa-wifi-slash"></i> Offline Mode';
        offlineModeBtn.classList.add('offline');
        alert('Offline mode enabled. Changes will be saved locally and can be synced later.');
    } else {
        offlineModeBtn.innerHTML = '<i class="fas fa-wifi"></i> Online Mode';
        offlineModeBtn.classList.remove('offline');
        
        if (navigator.onLine && pendingSyncTasks.length > 0) {
            if (confirm(`You have ${pendingSyncTasks.length} pending tasks to sync. Sync now?`)) {
                syncTasks();
            }
        }
    }
});

// Listen for online/offline events
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Load tasks from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderTasks();
    updateSummary();
    updateOnlineStatus();
    checkScheduledTasks();
    
    // Check for pending sync tasks
    const pendingSyncData = localStorage.getItem('pendingSyncTasks');
    if (pendingSyncData) {
        pendingSyncTasks = JSON.parse(pendingSyncData);
        if (pendingSyncTasks.length > 0 && navigator.onLine && !isOfflineMode) {
            if (confirm(`You have ${pendingSyncTasks.length} pending tasks to sync. Sync now?`)) {
                syncTasks();
            }
        }
    }
});

// Add new task
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const taskText = taskInput.value.trim();
    if (taskText === '') return;
    
    const newTask = {
        id: Date.now().toString(),
        text: taskText,
        completed: false,
        priority: prioritySelect.value,
        date: new Date().toISOString(),
        scheduleDate: scheduleDate.value ? new Date(scheduleDate.value).toISOString() : null
    };
    
    tasks.push(newTask);
    
    // If offline, add to pending sync
    if (!navigator.onLine || isOfflineMode) {
        addToPendingSync('add', newTask);
    }
    
    saveTasks();
    renderTasks();
    updateSummary();
    
    // Set up notification for scheduled task
    if (newTask.scheduleDate) {
        scheduleNotification(newTask);
    }
    
    taskInput.value = '';
    scheduleDate.value = '';
    taskInput.focus();
});

// Toggle task completion status
taskList.addEventListener('click', (e) => {
    if (e.target.classList.contains('task-checkbox')) {
        const taskId = e.target.closest('.task-item').dataset.id;
        toggleTaskStatus(taskId);
    }
});

// Handle task actions (delete)
taskList.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
        const taskId = e.target.closest('.task-item').dataset.id;
        deleteTask(taskId);
    }
});

// Clear completed tasks
clearCompletedBtn.addEventListener('click', () => {
    const completedTaskIds = tasks.filter(task => task.completed).map(task => task.id);
    
    tasks = tasks.filter(task => !task.completed);
    
    // If offline, add to pending sync
    if (!navigator.onLine || isOfflineMode) {
        completedTaskIds.forEach(id => {
            addToPendingSync('delete', { id });
        });
    }
    
    saveTasks();
    renderTasks();
    updateSummary();
});

// Clear all tasks
clearAllBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all tasks?')) {
        const allTaskIds = tasks.map(task => task.id);
        
        tasks = [];
        
        // If offline, add to pending sync
        if (!navigator.onLine || isOfflineMode) {
            allTaskIds.forEach(id => {
                addToPendingSync('delete', { id });
            });
        }
        
        saveTasks();
        renderTasks();
        updateSummary();
    }
});

// Filter tasks
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// Sort tasks
sortSelect.addEventListener('change', () => {
    currentSort = sortSelect.value;
    renderTasks();
});

// Share button - open modal
shareBtn.addEventListener('click', () => {
    shareModal.style.display = 'block';
});

// Close modals
closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        shareModal.style.display = 'none';
        notificationModal.style.display = 'none';
    });
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === shareModal) {
        shareModal.style.display = 'none';
    }
    if (e.target === notificationModal) {
        notificationModal.style.display = 'none';
    }
});

// Generate share link
generateLinkBtn.addEventListener('click', () => {
    // In a real app, this would create a server-side link
    // For demo purposes, we'll create a data URL
    const tasksData = JSON.stringify(tasks);
    const encodedData = encodeURIComponent(tasksData);
    const shareLink = `${window.location.href.split('?')[0]}?sharedTasks=${encodedData}`;
    
    shareLinkInput.value = shareLink;
    shareLinkContainer.classList.remove('hidden');
});

// Copy share link
copyLinkBtn.addEventListener('click', () => {
    shareLinkInput.select();
    document.execCommand('copy');
    alert('Link copied to clipboard!');
});

// Export tasks as file
exportTasksBtn.addEventListener('click', () => {
    const tasksData = JSON.stringify(tasks, null, 2);
    const blob = new Blob([tasksData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Import tasks from file
importTasksBtn.addEventListener('click', () => {
    const file = importTasksInput.files[0];
    if (!file) {
        alert('Please select a file to import');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedTasks = JSON.parse(e.target.result);
            
            if (confirm(`Import ${importedTasks.length} tasks? This will merge with your existing tasks.`)) {
                // Merge tasks, avoiding duplicates by ID
                const existingIds = tasks.map(task => task.id);
                const newTasks = importedTasks.filter(task => !existingIds.includes(task.id));
                
                tasks = [...tasks, ...newTasks];
                saveTasks();
                renderTasks();
                updateSummary();
                
                // Set up notifications for scheduled tasks
                newTasks.forEach(task => {
                    if (task.scheduleDate) {
                        scheduleNotification(task);
                    }
                });
                
                alert(`Successfully imported ${newTasks.length} new tasks.`);
            }
        } catch (error) {
            alert('Error importing tasks. Please make sure the file is valid JSON.');
            console.error('Import error:', error);
        }
    };
    reader.readAsText(file);
});

// Sync button
syncBtn.addEventListener('click', () => {
    if (navigator.onLine) {
        syncTasks();
    } else {
        alert('Cannot sync while offline. Please connect to the internet and try again.');
    }
});

// Dismiss notification
dismissNotificationBtn.addEventListener('click', () => {
    notificationModal.style.display = 'none';
});

// Snooze notification
snoozeNotificationBtn.addEventListener('click', () => {
    const taskId = notificationModal.dataset.taskId;
    if (taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            // Snooze for 10 minutes
            const snoozeTime = new Date(new Date().getTime() + 10 * 60000);
            task.scheduleDate = snoozeTime.toISOString();
            saveTasks();
            scheduleNotification(task);
        }
    }
    notificationModal.style.display = 'none';
});

// Toggle task completion status
function toggleTaskStatus(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            const updatedTask = { ...task, completed: !task.completed };
            
            // If offline, add to pending sync
            if (!navigator.onLine || isOfflineMode) {
                addToPendingSync('update', updatedTask);
            }
            
            return updatedTask;
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
    updateSummary();
}

// Delete a task
function deleteTask(id) {
    // If offline, add to pending sync
    if (!navigator.onLine || isOfflineMode) {
        addToPendingSync('delete', { id });
    }
    
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    updateSummary();
}

// Add task to pending sync
function addToPendingSync(action, taskData) {
    pendingSyncTasks.push({
        action,
        taskData,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('pendingSyncTasks', JSON.stringify(pendingSyncTasks));
}

// Sync tasks with server
function syncTasks() {
    // In a real app, this would send data to a server
    // For demo purposes, we'll simulate a successful sync
    
    alert(`Syncing ${pendingSyncTasks.length} tasks...`);
    
    // Simulate network delay
    setTimeout(() => {
        pendingSyncTasks = [];
        localStorage.removeItem('pendingSyncTasks');
        alert('All tasks synced successfully!');
    }, 1500);
}

// Schedule notification for a task
function scheduleNotification(task) {
    if (!task.scheduleDate) return;
    
    const scheduleTime = new Date(task.scheduleDate).getTime();
    const currentTime = new Date().getTime();
    const timeUntilNotification = scheduleTime - currentTime;
    
    if (timeUntilNotification <= 0) return;
    
    setTimeout(() => {
        showNotification(task);
    }, timeUntilNotification);
}

// Show notification for a scheduled task
function showNotification(task) {
    notificationMessage.textContent = `Reminder: ${task.text}`;
    notificationModal.dataset.taskId = task.id;
    notificationModal.style.display = 'block';
    
    // Also show browser notification if supported
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification('Task Reminder', {
                body: task.text,
                icon: '/favicon.ico'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('Task Reminder', {
                        body: task.text,
                        icon: '/favicon.ico'
                    });
                }
            });
        }
    }
}

// Check for scheduled tasks that need notifications
function checkScheduledTasks() {
    tasks.forEach(task => {
        if (task.scheduleDate && !task.completed) {
            scheduleNotification(task);
        }
    });
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load tasks from localStorage
function loadTasks() {
    // Check for shared tasks in URL
    const urlParams = new URLSearchParams(window.location.search);
    const sharedTasksParam = urlParams.get('sharedTasks');
    
    if (sharedTasksParam) {
        try {
            const sharedTasks = JSON.parse(decodeURIComponent(sharedTasksParam));
            if (confirm(`Load ${sharedTasks.length} shared tasks? This will replace your current tasks.`)) {
                tasks = sharedTasks;
                saveTasks();
                // Remove the query parameter from URL
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
            }
        } catch (error) {
            console.error('Error parsing shared tasks:', error);
        }
    }
    
    // Load from localStorage if no shared tasks or user declined
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
}

// Render tasks based on current filter and sort
function renderTasks() {
    // Clear the task list
    taskList.innerHTML = '';
    
    // Filter tasks
    let filteredTasks = tasks;
    if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    } else if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'scheduled') {
        filteredTasks = tasks.filter(task => task.scheduleDate && !task.completed);
    }
    
    // Sort tasks
    filteredTasks = sortTasks(filteredTasks, currentSort);
    
    // Render each task
    filteredTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.classList.add('task-item');
        taskItem.classList.add(`${task.priority}-priority`);
        if (task.completed) {
            taskItem.classList.add('completed');
        }
        if (task.scheduleDate && !task.completed) {
            taskItem.classList.add('scheduled');
        }
        taskItem.dataset.id = task.id;
        
        const date = new Date(task.date);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        
        let scheduleInfo = '';
        if (task.scheduleDate) {
            const scheduleDate = new Date(task.scheduleDate);
            const formattedSchedule = `${scheduleDate.toLocaleDateString()} ${scheduleDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            scheduleInfo = `<span class="schedule-indicator"><i class="fas fa-clock"></i> ${formattedSchedule}</span>`;
        }
        
        taskItem.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.text}</span>
                <span class="task-date">${formattedDate}</span>
                ${scheduleInfo}
            </div>
            <div class="task-actions">
                <button class="delete-btn"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        taskList.appendChild(taskItem);
    });
    
    // Update task counter
    taskCounter.textContent = `(${filteredTasks.length})`;
}

// Sort tasks based on sort option
function sortTasks(tasksToSort, sortOption) {
    switch (sortOption) {
        case 'date-added':
            return [...tasksToSort].sort((a, b) => new Date(b.date) - new Date(a.date));
        case 'priority':
            const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };
            return [...tasksToSort].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        case 'alphabetical':
            return [...tasksToSort].sort((a, b) => a.text.localeCompare(b.text));
        case 'schedule-date':
            return [...tasksToSort].sort((a, b) => {
                // Put tasks without schedule date at the end
                if (!a.scheduleDate && !b.scheduleDate) return 0;
                if (!a.scheduleDate) return 1;
                if (!b.scheduleDate) return -1;
                return new Date(a.scheduleDate) - new Date(b.scheduleDate);
            });
        default:
            return tasksToSort;
    }
}

// Update summary information
function updateSummary() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const scheduledTasks = tasks.filter(task => task.scheduleDate && !task.completed).length;
    
    totalTasksElement.textContent = totalTasks;
    completedTasksElement.textContent = completedTasks;
    pendingTasksElement.textContent = pendingTasks;
    scheduledTasksElement.textContent = scheduledTasks;
}