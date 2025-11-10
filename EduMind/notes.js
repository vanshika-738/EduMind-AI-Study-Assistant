// Notes functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme toggle for notes page
    initializeThemeToggle();
    
    // Upload option switching
    const uploadOptions = document.querySelectorAll('.upload-option');
    const uploadContents = document.querySelectorAll('.upload-content');
    
    uploadOptions.forEach(option => {
        option.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            
            // Update active option
            uploadOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            uploadContents.forEach(content => content.style.display = 'none');
            document.getElementById(`${type}-upload`).style.display = 'block';
        });
    });
    
    // File upload functionality
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    // Browse files
    if (browseBtn) {
        browseBtn.addEventListener('click', () => fileInput.click());
    }
    
    // File input change
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    // Drag and drop functionality
    if (dropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight() {
            dropZone.classList.add('drag-over');
        }
        
        function unhighlight() {
            dropZone.classList.remove('drag-over');
        }
        
        dropZone.addEventListener('drop', handleDrop, false);
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles(files);
        }
    }
    
    function handleFileSelect(e) {
        const files = e.target.files;
        handleFiles(files);
    }
    
    function handleFiles(files) {
        if (files.length > 0) {
            // Simulate upload progress
            simulateUpload(files[0]);
        }
    }
    
    function simulateUpload(file) {
        if (uploadProgress) {
            uploadProgress.style.display = 'flex';
        }
        let progress = 0;
        
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // Add note to grid after upload
                setTimeout(() => {
                    addNoteToGrid({
                        type: getFileType(file.name),
                        title: file.name,
                        date: 'Just now',
                        tags: ['New']
                    });
                    
                    if (uploadProgress) {
                        uploadProgress.style.display = 'none';
                    }
                    if (progressFill) {
                        progressFill.style.width = '0%';
                    }
                    if (progressText) {
                        progressText.textContent = '0%';
                    }
                    if (fileInput) {
                        fileInput.value = '';
                    }
                }, 500);
            }
            
            if (progressFill) {
                progressFill.style.width = `${progress}%`;
            }
            if (progressText) {
                progressText.textContent = `${Math.round(progress)}%`;
            }
        }, 200);
    }
    
    function getFileType(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        if (ext === 'pdf') return 'pdf';
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image';
        return 'text';
    }
    
    // URL and Text note saving
    const saveUrlBtn = document.getElementById('saveUrlBtn');
    const saveTextBtn = document.getElementById('saveTextBtn');
    
    if (saveUrlBtn) {
        saveUrlBtn.addEventListener('click', saveUrlNote);
    }
    
    if (saveTextBtn) {
        saveTextBtn.addEventListener('click', saveTextNote);
    }
    
    function saveUrlNote() {
        const title = document.getElementById('urlTitle')?.value;
        const url = document.getElementById('urlLink')?.value;
        
        if (!title || !url) {
            alert('Please fill in both title and URL');
            return;
        }
        
        addNoteToGrid({
            type: 'url',
            title: title,
            date: 'Just now',
            tags: ['URL']
        });
        
        // Reset form
        if (document.getElementById('urlTitle')) {
            document.getElementById('urlTitle').value = '';
        }
        if (document.getElementById('urlLink')) {
            document.getElementById('urlLink').value = '';
        }
        
        alert('URL note saved successfully!');
    }
    
    function saveTextNote() {
        const title = document.getElementById('textTitle')?.value;
        const content = document.getElementById('noteText')?.value;
        
        if (!title || !content) {
            alert('Please fill in both title and content');
            return;
        }
        
        addNoteToGrid({
            type: 'text',
            title: title,
            date: 'Just now',
            tags: ['Text']
        });
        
        // Reset form
        if (document.getElementById('textTitle')) {
            document.getElementById('textTitle').value = '';
        }
        if (document.getElementById('noteText')) {
            document.getElementById('noteText').value = '';
        }
        
        alert('Text note saved successfully!');
    }
    
    // View options
    const viewOptions = document.querySelectorAll('.view-option');
    const notesGrid = document.getElementById('notesContainer');
    
    viewOptions.forEach(option => {
        option.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            
            // Update active view option
            viewOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // Update grid view
            if (notesGrid) {
                notesGrid.className = `notes-grid ${view}-view animate-zoom-in`;
            }
        });
    });
    
    // Note actions
    document.addEventListener('click', function(e) {
        if (e.target.closest('.action-btn')) {
            const btn = e.target.closest('.action-btn');
            const noteCard = btn.closest('.note-card');
            const title = noteCard.querySelector('h3').textContent;
            
            if (btn.querySelector('.fa-eye')) {
                // Preview note
                openPreview(title);
            } else if (btn.querySelector('.fa-trash')) {
                // Delete note
                if (confirm('Are you sure you want to delete this note?')) {
                    noteCard.style.animation = 'fadeOut 0.3s ease forwards';
                    setTimeout(() => {
                        noteCard.remove();
                        checkEmptyState();
                    }, 300);
                }
            }
        }
    });
    
    // Preview modal
    const previewModal = document.getElementById('previewModal');
    const closePreview = document.getElementById('closePreview');
    
    function openPreview(title) {
        const previewTitle = document.getElementById('previewTitle');
        const previewContent = document.getElementById('previewContent');
        
        if (previewTitle) {
            previewTitle.textContent = title;
        }
        
        if (previewContent) {
            previewContent.innerHTML = `
                <div class="preview-header">
                    <div class="preview-meta">
                        <span><strong>Type:</strong> PDF Document</span>
                        <span><strong>Uploaded:</strong> 2 days ago</span>
                        <span><strong>Size:</strong> 2.4 MB</span>
                    </div>
                </div>
                <div class="preview-body">
                    <div class="pdf-preview">
                        <div class="pdf-page">
                            <h4>${title}</h4>
                            <p>This is a preview of your uploaded document. In the full version, you would see the actual content here.</p>
                            <p>You can use the AI tools to summarize this content, generate flashcards, or create quizzes from it.</p>
                        </div>
                    </div>
                    <div class="preview-actions">
                        <button class="btn primary">
                            <i class="fas fa-robot"></i> Generate Summary
                        </button>
                        <button class="btn secondary">
                            <i class="fas fa-layer-group"></i> Create Flashcards
                        </button>
                        <button class="btn secondary">
                            <i class="fas fa-question-circle"></i> Generate Quiz
                        </button>
                    </div>
                </div>
            `;
        }
        
        if (previewModal) {
            previewModal.classList.add('active');
        }
    }
    
    if (closePreview) {
        closePreview.addEventListener('click', function() {
            if (previewModal) {
                previewModal.classList.remove('active');
            }
        });
    }
    
    // Close modal when clicking outside
    if (previewModal) {
        previewModal.addEventListener('click', function(e) {
            if (e.target === previewModal) {
                previewModal.classList.remove('active');
            }
        });
    }
    
    // Add note to grid function
    function addNoteToGrid(note) {
        const emptyState = document.getElementById('emptyState');
        const notesGrid = document.getElementById('notesContainer');
        
        if (!notesGrid) return;
        
        if (emptyState && emptyState.style.display !== 'none') {
            emptyState.style.display = 'none';
        }
        
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card animate-zoom-in';
        noteCard.innerHTML = `
            <div class="note-header">
                <div class="note-type ${note.type}">
                    <i class="fas fa-${getTypeIcon(note.type)}"></i>
                </div>
                <div class="note-actions">
                    <button class="action-btn" title="Preview">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="note-content">
                <h3>${note.title}</h3>
                <p>${note.date}</p>
                <div class="note-tags">
                    ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;
        
        notesGrid.prepend(noteCard);
    }
    
    function getTypeIcon(type) {
        const icons = {
            'pdf': 'file-pdf',
            'url': 'link',
            'text': 'font',
            'image': 'image'
        };
        return icons[type] || 'file';
    }
    
    function checkEmptyState() {
        const notes = document.querySelectorAll('.note-card');
        const emptyState = document.getElementById('emptyState');
        
        if (emptyState && notes.length === 0) {
            emptyState.style.display = 'block';
        }
    }
    
    function showUploadSection() {
        const uploadSection = document.querySelector('.upload-section');
        if (uploadSection) {
            uploadSection.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }
    
    // Add fadeOut animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            to {
                opacity: 0;
                transform: scale(0.8);
            }
        }
    `;
    document.head.appendChild(style);
});

// Theme Toggle Functionality for Notes Page
function initializeThemeToggle() {
    const themeSwitch = document.getElementById('theme-switch');
    
    if (!themeSwitch) {
        console.log('Theme switch not found on this page');
        return;
    }
    
    // Check for saved theme or preferred color scheme
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const currentTheme = localStorage.getItem('theme');
    
    // Set initial theme
    if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeSwitch.checked = true;
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        themeSwitch.checked = false;
    }
    
    // Theme switch event
    themeSwitch.addEventListener('change', function() {
        if (this.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });
    
    console.log('Theme toggle initialized for notes page');
}

// Make sure theme works even if page loads slowly
window.addEventListener('load', function() {
    // Re-initialize theme toggle to ensure it works
    setTimeout(initializeThemeToggle, 100);
});

// Fallback: Check for theme every second for the first 5 seconds
let themeCheckAttempts = 0;
const themeCheckInterval = setInterval(() => {
    const themeSwitch = document.getElementById('theme-switch');
    if (themeSwitch || themeCheckAttempts >= 5) {
        clearInterval(themeCheckInterval);
        if (themeSwitch) {
            initializeThemeToggle();
        }
    }
    themeCheckAttempts++;
}, 1000);