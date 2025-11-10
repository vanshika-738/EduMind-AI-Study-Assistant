// Whiteboard functionality
document.addEventListener('DOMContentLoaded', function() {
    let canvas, ctx;
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let currentTool = 'pen';
    let currentColor = '#000000';
    let brushSize = 5;
    let savedWhiteboards = JSON.parse(localStorage.getItem('edumind_whiteboards')) || [];
    let drawingHistory = [];
    let historyIndex = -1;
    let startX, startY; // For shapes
    
    // Initialize whiteboard
    initializeWhiteboard();

    function initializeWhiteboard() {
        setupCanvas();
        setupEventListeners();
        updateBrushPreview();
        renderSavedWhiteboards();
        console.log('Whiteboard initialized successfully');
    }

    function setupCanvas() {
        canvas = document.getElementById('whiteboardCanvas');
        ctx = canvas.getContext('2d');
        
        // Set canvas size to container size
        const container = document.querySelector('.canvas-container');
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        // Set initial canvas style
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = brushSize;
        ctx.strokeStyle = currentColor;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Save initial state
        saveState();
        
        console.log('Canvas setup completed');
    }

    function setupEventListeners() {
        // Mouse events
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        // Touch events for mobile
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', stopDrawing);
        
        // Tool buttons
        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                toolButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentTool = this.getAttribute('data-tool');
                updateCursor();
                console.log('Tool changed to:', currentTool);
            });
        });
        
        // Color buttons
        const colorButtons = document.querySelectorAll('.color-btn');
        colorButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                colorButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentColor = this.getAttribute('data-color');
                ctx.strokeStyle = currentColor;
                document.getElementById('customColor').value = currentColor;
                console.log('Color changed to:', currentColor);
            });
        });
        
        // Custom color picker
        const customColor = document.getElementById('customColor');
        customColor.addEventListener('input', function() {
            currentColor = this.value;
            ctx.strokeStyle = currentColor;
            console.log('Custom color selected:', currentColor);
            
            // Update active color button
            colorButtons.forEach(btn => btn.classList.remove('active'));
        });
        
        // Brush size slider
        const brushSizeSlider = document.getElementById('brushSize');
        const brushSizeValue = document.getElementById('brushSizeValue');
        
        brushSizeSlider.addEventListener('input', function() {
            brushSize = parseInt(this.value);
            ctx.lineWidth = brushSize;
            brushSizeValue.textContent = `${brushSize}px`;
            updateBrushPreview();
            console.log('Brush size changed to:', brushSize);
        });
        
        // Template buttons
        const templateButtons = document.querySelectorAll('.template-btn');
        templateButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const template = this.getAttribute('data-template');
                applyTemplate(template);
                console.log('Template applied:', template);
            });
        });
        
        // Action buttons
        document.getElementById('clearCanvas').addEventListener('click', clearCanvas);
        document.getElementById('saveCanvas').addEventListener('click', showSaveModal);
        document.getElementById('newBoardBtn').addEventListener('click', newWhiteboard);
        document.getElementById('downloadBtn').addEventListener('click', downloadCanvas);
        document.getElementById('undoBtn').addEventListener('click', undo);
        document.getElementById('redoBtn').addEventListener('click', redo);
        document.getElementById('refreshSaved').addEventListener('click', renderSavedWhiteboards);
        
        // Save modal
        const saveModal = document.getElementById('saveModal');
        const closeSaveModal = document.getElementById('closeSaveModal');
        const cancelSave = document.getElementById('cancelSave');
        const saveForm = document.getElementById('saveWhiteboardForm');
        
        if (closeSaveModal) {
            closeSaveModal.addEventListener('click', () => saveModal.classList.remove('active'));
        }
        if (cancelSave) {
            cancelSave.addEventListener('click', () => saveModal.classList.remove('active'));
        }
        if (saveForm) {
            saveForm.addEventListener('submit', handleSaveWhiteboard);
        }
        
        // Close modal when clicking outside
        if (saveModal) {
            saveModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    saveModal.classList.remove('active');
                }
            });
        }
        
        // Load and delete whiteboard buttons - Event delegation
        document.addEventListener('click', function(e) {
            if (e.target.closest('.load-btn') || e.target.classList.contains('load-whiteboard')) {
                const savedItem = e.target.closest('.saved-item');
                if (savedItem) {
                    const whiteboardName = savedItem.querySelector('h4').textContent;
                    loadWhiteboard(whiteboardName);
                }
            }
            
            if (e.target.closest('.delete-btn') || e.target.classList.contains('delete-whiteboard')) {
                const savedItem = e.target.closest('.saved-item');
                if (savedItem) {
                    const whiteboardName = savedItem.querySelector('h4').textContent;
                    deleteWhiteboard(whiteboardName);
                }
            }
        });
        
        // Window resize
        window.addEventListener('resize', handleResize);
        
        console.log('All event listeners setup successfully');
    }

    function startDrawing(e) {
        e.preventDefault();
        isDrawing = true;
        
        const coords = getCoordinates(e);
        [lastX, lastY] = coords;
        [startX, startY] = coords;
        
        // Hide overlay on first interaction
        const overlay = document.getElementById('canvasOverlay');
        if (overlay && overlay.style.display !== 'none') {
            overlay.style.display = 'none';
        }
        
        if (currentTool === 'pen' || currentTool === 'eraser') {
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
        }
        
        console.log('Started drawing at:', lastX, lastY);
    }

    function draw(e) {
        if (!isDrawing) return;
        
        e.preventDefault();
        
        const [x, y] = getCoordinates(e);
        
        switch (currentTool) {
            case 'pen':
                ctx.strokeStyle = currentColor;
                ctx.lineTo(x, y);
                ctx.stroke();
                break;
                
            case 'eraser':
                ctx.strokeStyle = '#ffffff';
                ctx.lineTo(x, y);
                ctx.stroke();
                break;
                
            case 'line':
                // Redraw canvas and draw temporary line
                restoreState();
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(x, y);
                ctx.stroke();
                break;
                
            case 'rectangle':
                // Redraw canvas and draw temporary rectangle
                restoreState();
                const rectWidth = x - startX;
                const rectHeight = y - startY;
                ctx.strokeRect(startX, startY, rectWidth, rectHeight);
                break;
                
            case 'circle':
                // Redraw canvas and draw temporary circle
                restoreState();
                const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
                ctx.beginPath();
                ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
                ctx.stroke();
                break;
        }
        
        [lastX, lastY] = [x, y];
    }

    function stopDrawing(e) {
        if (!isDrawing) return;
        
        isDrawing = false;
        ctx.beginPath();
        
        const [x, y] = getCoordinates(e);
        
        switch (currentTool) {
            case 'line':
                drawLine(startX, startY, x, y);
                break;
                
            case 'rectangle':
                drawRectangle(startX, startY, x, y);
                break;
                
            case 'circle':
                drawCircle(startX, startY, x, y);
                break;
                
            case 'text':
                addText(startX, startY);
                break;
                
            case 'pen':
            case 'eraser':
                // Save state after freehand drawing
                saveState();
                break;
        }
        
        console.log('Stopped drawing');
    }

    function getCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        let x, y;
        
        if (e.type.includes('touch')) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }
        
        return [x, y];
    }

    function drawLine(x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        saveState();
        console.log('Line drawn from', x1, y1, 'to', x2, y2);
    }

    function drawRectangle(x1, y1, x2, y2) {
        const width = x2 - x1;
        const height = y2 - y1;
        ctx.strokeRect(x1, y1, width, height);
        saveState();
        console.log('Rectangle drawn at', x1, y1, 'size', width, 'x', height);
    }

    function drawCircle(x1, y1, x2, y2) {
        const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        ctx.beginPath();
        ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
        ctx.stroke();
        saveState();
        console.log('Circle drawn at', x1, y1, 'radius', radius);
    }

    function addText(x, y) {
        const text = prompt('Enter text:');
        if (text) {
            ctx.font = `bold ${brushSize * 4}px Delius`;
            ctx.fillStyle = currentColor;
            ctx.fillText(text, x, y);
            saveState();
            console.log('Text added:', text);
        }
    }

    function handleTouchStart(e) {
        e.preventDefault();
        startDrawing(e.touches[0]);
    }

    function handleTouchMove(e) {
        e.preventDefault();
        draw(e.touches[0]);
    }

    function updateCursor() {
        switch (currentTool) {
            case 'pen':
                canvas.style.cursor = 'crosshair';
                break;
            case 'eraser':
                canvas.style.cursor = 'cell';
                break;
            case 'line':
            case 'rectangle':
            case 'circle':
                canvas.style.cursor = 'crosshair';
                break;
            case 'text':
                canvas.style.cursor = 'text';
                break;
            default:
                canvas.style.cursor = 'default';
        }
        console.log('Cursor updated for tool:', currentTool);
    }

    function updateBrushPreview() {
        const brushSample = document.getElementById('brushSample');
        if (brushSample) {
            brushSample.style.width = `${brushSize * 2}px`;
            brushSample.style.height = `${brushSize * 2}px`;
            brushSample.style.background = currentColor;
            console.log('Brush preview updated');
        }
    }

    function applyTemplate(template) {
        saveState(); // Save current state before applying template
        
        switch (template) {
            case 'formula':
                drawFormulaTemplate();
                break;
            case 'diagram':
                drawDiagramTemplate();
                break;
            case 'mindmap':
                drawMindMapTemplate();
                break;
            case 'grid':
                toggleGrid();
                break;
        }
        
        saveState(); // Save state after applying template
        console.log('Template applied:', template);
    }

    function drawFormulaTemplate() {
        ctx.font = 'bold 24px Delius';
        ctx.fillStyle = currentColor;
        ctx.fillText('a² + b² = c²', canvas.width / 2 - 60, canvas.height / 2 - 40);
        ctx.fillText('E = mc²', canvas.width / 2 - 40, canvas.height / 2);
        ctx.fillText('y = mx + b', canvas.width / 2 - 50, canvas.height / 2 + 40);
        console.log('Formula template drawn');
    }

    function drawDiagramTemplate() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Draw circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Draw labels
        ctx.font = '16px Delius';
        ctx.fillStyle = currentColor;
        ctx.fillText('Process', centerX - 25, centerY - 70);
        ctx.fillText('Input', centerX - 120, centerY);
        ctx.fillText('Output', centerX + 80, centerY);
        
        // Draw arrows
        drawLine(centerX - 150, centerY, centerX - 60, centerY);
        drawLine(centerX + 60, centerY, centerX + 150, centerY);
        
        console.log('Diagram template drawn');
    }

    function drawMindMapTemplate() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Draw central node
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.font = '14px Delius';
        ctx.fillText('Main Topic', centerX - 35, centerY + 5);
        
        // Draw branches
        const branches = [
            { x: centerX - 150, y: centerY - 100, text: 'Branch 1' },
            { x: centerX + 150, y: centerY - 100, text: 'Branch 2' },
            { x: centerX - 150, y: centerY + 100, text: 'Branch 3' },
            { x: centerX + 150, y: centerY + 100, text: 'Branch 4' }
        ];
        
        branches.forEach(branch => {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(branch.x, branch.y);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(branch.x, branch.y, 20, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fillText(branch.text, branch.x - 25, branch.y + 5);
        });
        
        console.log('Mind map template drawn');
    }

    function toggleGrid() {
        const container = canvas.parentElement;
        container.classList.toggle('with-grid');
        console.log('Grid toggled');
    }

    function clearCanvas() {
        if (confirm('Are you sure you want to clear the canvas?')) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            saveState();
            showNotification('Canvas cleared!');
            console.log('Canvas cleared');
        }
    }

    function newWhiteboard() {
        if (confirm('Start a new whiteboard? Any unsaved changes will be lost.')) {
            clearCanvas();
            const overlay = document.getElementById('canvasOverlay');
            if (overlay) {
                overlay.style.display = 'flex';
            }
            drawingHistory = [];
            historyIndex = -1;
            saveState();
            showNotification('New whiteboard created!');
            console.log('New whiteboard created');
        }
    }

    function downloadCanvas() {
        try {
            const link = document.createElement('a');
            link.download = `edumind-whiteboard-${new Date().getTime()}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showNotification('Whiteboard downloaded successfully!');
            console.log('Canvas downloaded');
        } catch (error) {
            console.error('Download failed:', error);
            showNotification('Download failed. Please try again.');
        }
    }

    function saveState() {
        // Remove any future states if we're not at the end
        drawingHistory = drawingHistory.slice(0, historyIndex + 1);
        
        // Save current canvas state
        drawingHistory.push(canvas.toDataURL());
        historyIndex++;
        
        // Limit history size
        if (drawingHistory.length > 50) {
            drawingHistory.shift();
            historyIndex--;
        }
        
        console.log('State saved. History length:', drawingHistory.length);
    }

    function undo() {
        if (historyIndex > 0) {
            historyIndex--;
            restoreState();
            showNotification('Undo performed');
            console.log('Undo performed. History index:', historyIndex);
        } else {
            showNotification('Nothing to undo');
        }
    }

    function redo() {
        if (historyIndex < drawingHistory.length - 1) {
            historyIndex++;
            restoreState();
            showNotification('Redo performed');
            console.log('Redo performed. History index:', historyIndex);
        } else {
            showNotification('Nothing to redo');
        }
    }

    function restoreState() {
        if (drawingHistory[historyIndex]) {
            const img = new Image();
            img.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = drawingHistory[historyIndex];
            console.log('State restored');
        }
    }

    function showSaveModal() {
        const saveModal = document.getElementById('saveModal');
        if (saveModal) {
            saveModal.classList.add('active');
            document.getElementById('whiteboardName').focus();
            console.log('Save modal shown');
        }
    }

    function handleSaveWhiteboard(e) {
        e.preventDefault();
        
        const nameInput = document.getElementById('whiteboardName');
        const descriptionInput = document.getElementById('whiteboardDescription');
        
        if (!nameInput || !nameInput.value.trim()) {
            alert('Please enter a name for your whiteboard');
            return;
        }
        
        const name = nameInput.value.trim();
        const description = descriptionInput ? descriptionInput.value.trim() : '';

        // Check if name already exists
        const existingIndex = savedWhiteboards.findIndex(wb => wb.name === name);
        if (existingIndex !== -1) {
            if (!confirm('A whiteboard with this name already exists. Overwrite?')) {
                return;
            }
            // Remove existing one
            savedWhiteboards.splice(existingIndex, 1);
        }

        // Create thumbnail (lower quality for performance)
        const thumbnailCanvas = document.createElement('canvas');
        const thumbnailCtx = thumbnailCanvas.getContext('2d');
        thumbnailCanvas.width = 100;
        thumbnailCanvas.height = 60;
        thumbnailCtx.drawImage(canvas, 0, 0, 100, 60);

        // Save whiteboard data
        const whiteboardData = {
            id: Date.now(),
            name: name,
            description: description,
            data: canvas.toDataURL(),
            thumbnail: thumbnailCanvas.toDataURL(),
            createdAt: new Date().toISOString()
        };

        savedWhiteboards.unshift(whiteboardData);
        saveWhiteboards();
        renderSavedWhiteboards();

        // Close modal and reset form
        const saveModal = document.getElementById('saveModal');
        if (saveModal) {
            saveModal.classList.remove('active');
        }
        if (nameInput) {
            nameInput.value = '';
        }
        if (descriptionInput) {
            descriptionInput.value = '';
        }

        showNotification('Whiteboard saved successfully!');
        console.log('Whiteboard saved:', name);
    }

    function loadWhiteboard(name) {
        const whiteboard = savedWhiteboards.find(wb => wb.name === name);
        
        if (whiteboard) {
            const img = new Image();
            img.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                
                // Hide overlay
                const overlay = document.getElementById('canvasOverlay');
                if (overlay) {
                    overlay.style.display = 'none';
                }
                
                // Reset history for new whiteboard
                drawingHistory = [canvas.toDataURL()];
                historyIndex = 0;
                
                showNotification(`Loaded whiteboard: ${name}`);
                console.log('Whiteboard loaded:', name);
            };
            img.onerror = function() {
                showNotification('Error loading whiteboard');
                console.error('Error loading whiteboard image');
            };
            img.src = whiteboard.data;
        } else {
            showNotification('Whiteboard not found');
            console.error('Whiteboard not found:', name);
        }
    }

    function deleteWhiteboard(name) {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            savedWhiteboards = savedWhiteboards.filter(wb => wb.name !== name);
            saveWhiteboards();
            renderSavedWhiteboards();
            showNotification('Whiteboard deleted!');
            console.log('Whiteboard deleted:', name);
        }
    }

    function saveWhiteboards() {
        try {
            localStorage.setItem('edumind_whiteboards', JSON.stringify(savedWhiteboards));
            console.log('Whiteboards saved to localStorage');
        } catch (error) {
            console.error('Error saving whiteboards:', error);
            showNotification('Error saving whiteboards');
        }
    }

    function renderSavedWhiteboards() {
        const savedList = document.getElementById('savedList');
        const emptySaved = document.getElementById('emptySaved');
        
        if (!savedList || !emptySaved) {
            console.error('Saved whiteboards elements not found');
            return;
        }

        if (savedWhiteboards.length === 0) {
            savedList.style.display = 'none';
            emptySaved.style.display = 'block';
        } else {
            savedList.style.display = 'flex';
            emptySaved.style.display = 'none';
            
            savedList.innerHTML = savedWhiteboards.map(whiteboard => {
                const date = new Date(whiteboard.createdAt);
                const formattedDate = date.toLocaleDateString() + ', ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                
                return `
                    <div class="saved-item">
                        <div class="saved-thumbnail">
                            <img src="${whiteboard.thumbnail || whiteboard.data}" alt="${whiteboard.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div class="thumbnail-placeholder" style="display: ${whiteboard.thumbnail ? 'none' : 'flex'};">
                                <i class="fas fa-paint-brush"></i>
                            </div>
                        </div>
                        <div class="saved-info">
                            <h4>${whiteboard.name}</h4>
                            <span class="saved-date">${formattedDate}</span>
                        </div>
                        <div class="saved-actions">
                            <button class="btn-icon load-btn" title="Load">
                                <i class="fas fa-play"></i>
                            </button>
                            <button class="btn-icon delete-btn" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        console.log('Saved whiteboards rendered:', savedWhiteboards.length);
    }

    function handleResize() {
        // Save current canvas content
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        tempCtx.drawImage(canvas, 0, 0);
        
        // Resize canvas
        const container = document.querySelector('.canvas-container');
        if (container) {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            
            // Restore content
            ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
            
            // Update history with new size
            if (drawingHistory[historyIndex]) {
                drawingHistory[historyIndex] = canvas.toDataURL();
            }
            
            console.log('Canvas resized to:', canvas.width, 'x', canvas.height);
        }
    }

    function showNotification(message) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.whiteboard-notification');
        existingNotifications.forEach(notification => notification.remove());
        
        const notification = document.createElement('div');
        notification.className = 'whiteboard-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--primary);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow);
            z-index: 3000;
            animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 2.7s;
            font-family: 'Delius', cursive;
            font-size: 14px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
        
        console.log('Notification shown:', message);
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
        
        .whiteboard-notification {
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--primary);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow);
            z-index: 3000;
            animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 2.7s;
            font-family: 'Delius', cursive;
        }
    `;
    document.head.appendChild(style);

    // Debug info
    console.log('Whiteboard JS loaded successfully');
    console.log('Available tools: pen, eraser, line, rectangle, circle, text');
    console.log('Available templates: formula, diagram, mindmap, grid');
});