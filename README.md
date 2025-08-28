# To-Do List 2025

A modern, responsive web application for managing your daily tasks efficiently, with support for offline usage, task scheduling, and sharing capabilities.

## Features

- **Add Tasks**: Create new tasks with customizable priority levels (Low, Medium, High)
- **Task Management**: Mark tasks as completed, delete individual tasks
- **Filtering**: Filter tasks by status (All, Pending, Completed, Scheduled)
- **Sorting**: Sort tasks by date added, priority, alphabetically, or schedule date
- **Data Persistence**: Tasks are saved to local storage and persist between sessions
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Task Summary**: View statistics about your tasks (total, completed, pending, scheduled)
- **Bulk Actions**: Clear all completed tasks or all tasks at once
- **Task Scheduling**: Set dates and times for tasks with automatic reminders
- **Offline Mode**: Create and manage tasks without an internet connection
- **Task Sharing**: Share your tasks with others via link or export/import JSON files
- **Sync Capability**: Synchronize offline changes when back online

## Technologies Used

- HTML5
- CSS3 (with Flexbox for responsive layouts)
- JavaScript (ES6+)
- Local Storage API for data persistence
- Font Awesome for icons

## Usage

1. **Adding a Task**:
   - Type your task in the input field
   - Select a priority level from the dropdown
   - Optionally set a schedule date and time
   - Click "Add Task" or press Enter

2. **Managing Tasks**:
   - Click the checkbox to mark a task as completed/pending
   - Click the trash icon to delete a task
   - Receive notifications for scheduled tasks

3. **Filtering and Sorting**:
   - Use the filter buttons to show All, Pending, Completed, or Scheduled tasks
   - Use the Sort dropdown to change the order of displayed tasks (date added, priority, alphabetical, or schedule date)

4. **Bulk Actions**:
   - "Clear Completed" removes all completed tasks
   - "Clear All" removes all tasks after confirmation

5. **Offline Usage**:
   - Toggle between online and offline modes using the button in the footer
   - Changes made offline will be stored locally and can be synced later
   - Click the "Sync" button when back online to synchronize changes

6. **Sharing Tasks**:
   - Click the "Share" button to open sharing options
   - Generate and copy a shareable link to send to others
   - Export tasks as a JSON file for offline sharing
   - Import tasks from a JSON file shared by others

## Installation

No installation required! This is a client-side application that runs directly in your web browser.

1. Clone or download this repository
2. Open `index.html` in your web browser

## Future Enhancements

- Task categories/tags
- Dark/Light theme toggle
- Task search functionality
- Task editing
- User accounts with cloud synchronization
- Recurring tasks
- Collaborative task lists
- Mobile app version

## License

© 2025 To-Do List App. All rights reserved.