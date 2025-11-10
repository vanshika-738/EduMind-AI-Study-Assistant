// AI Summary functionality
document.addEventListener('DOMContentLoaded', function() {
    // Input option switching
    const optionBtns = document.querySelectorAll('.option-btn');
    const inputContents = document.querySelectorAll('.input-content');
    
    optionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const option = this.getAttribute('data-option');
            
            // Update active option
            optionBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            inputContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${option}-input`).classList.add('active');
        });
    });
    
    // Word count for text input
    const notesText = document.getElementById('notesText');
    const wordCount = document.getElementById('wordCount');
    
    notesText.addEventListener('input', function() {
        const text = this.value.trim();
        const words = text ? text.split(/\s+/).length : 0;
        wordCount.textContent = words;
        
        // Update generate button state
        const generateBtn = document.getElementById('generateSummary');
        generateBtn.disabled = words < 50;
        generateBtn.title = words < 50 ? 'Please enter at least 50 words' : 'Generate summary';
    });
    
    // File upload functionality
    const browseDocument = document.getElementById('browseDocument');
    const documentFile = document.getElementById('documentFile');
    const selectedFile = document.getElementById('selectedFile');
    const fileName = document.getElementById('fileName');
    const removeFile = document.getElementById('removeFile');
    
    browseDocument.addEventListener('click', () => documentFile.click());
    
    documentFile.addEventListener('change', function() {
        if (this.files.length > 0) {
            const file = this.files[0];
            fileName.textContent = file.name;
            selectedFile.style.display = 'flex';
        }
    });
    
    removeFile.addEventListener('click', function() {
        documentFile.value = '';
        selectedFile.style.display = 'none';
    });
    
    // URL fetching
    const fetchArticle = document.getElementById('fetchArticle');
    const articleUrl = document.getElementById('articleUrl');
    const urlPreview = document.getElementById('urlPreview');
    const previewContent = document.getElementById('previewContent');
    
    fetchArticle.addEventListener('click', function() {
        const url = articleUrl.value.trim();
        if (!url) {
            alert('Please enter a URL');
            return;
        }
        
        // Simulate fetching content
        simulateUrlFetch(url);
    });
    
    function simulateUrlFetch(url) {
        fetchArticle.disabled = true;
        fetchArticle.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching...';
        
        setTimeout(() => {
            // Simulate successful fetch
            previewContent.innerHTML = `
                <p>This is a simulated preview of the content from ${url}. In a real application, 
                this would show the actual article content fetched from the provided URL.</p>
                <p>The AI would then process this content to generate a concise summary.</p>
            `;
            urlPreview.style.display = 'block';
            
            fetchArticle.disabled = false;
            fetchArticle.innerHTML = '<i class="fas fa-download"></i> Fetch Content';
        }, 2000);
    }
    
    // Generate summary
    const generateSummary = document.getElementById('generateSummary');
    const summaryPlaceholder = document.getElementById('summaryPlaceholder');
    const summaryContent = document.getElementById('summaryContent');
    const summaryLoading = document.getElementById('summaryLoading');
    
    generateSummary.addEventListener('click', function() {
        const activeOption = document.querySelector('.option-btn.active').getAttribute('data-option');
        let inputText = '';
        
        if (activeOption === 'text') {
            inputText = notesText.value.trim();
            if (inputText.split(/\s+/).length < 50) {
                alert('Please enter at least 50 words for a meaningful summary');
                return;
            }
        } else if (activeOption === 'file') {
            if (!documentFile.files.length) {
                alert('Please select a file to summarize');
                return;
            }
            inputText = "This is simulated content from the uploaded file. In a real application, the AI would extract and process text from PDF, DOCX, or other document formats.";
        } else if (activeOption === 'url') {
            if (!articleUrl.value.trim()) {
                alert('Please enter a URL to summarize');
                return;
            }
            inputText = "This is simulated content fetched from the provided URL. The AI would process the actual webpage content to generate a summary.";
        }
        
        // Show loading state
        summaryPlaceholder.style.display = 'none';
        summaryContent.style.display = 'none';
        summaryLoading.style.display = 'block';
        
        // Simulate AI processing
        simulateAISummary(inputText);
    });
    
    function simulateAISummary(inputText) {
        setTimeout(() => {
            // Generate simulated summary
            const originalWords = inputText.split(/\s+/).length;
            const summaryWords = Math.max(50, Math.floor(originalWords * 0.3));
            
            const summary = generateSimulatedSummary(inputText, summaryWords);
            const tags = generateTags(summary);
            
            // Update UI with results
            document.getElementById('originalLength').textContent = originalWords;
            document.getElementById('summaryLength').textContent = summaryWords;
            document.getElementById('reductionPercent').textContent = 
                Math.round(((originalWords - summaryWords) / originalWords) * 100) + '%';
            
            document.getElementById('summaryText').innerHTML = 
                `<p>${summary}</p>`;
            
            const tagsContainer = document.getElementById('summaryTags');
            tagsContainer.innerHTML = tags.map(tag => 
                `<span class="summary-tag">${tag}</span>`
            ).join('');
            
            // Show results
            summaryLoading.style.display = 'none';
            summaryContent.style.display = 'block';
            
            // Add to recent summaries
            addToRecentSummaries("Generated Summary", summary.substring(0, 150) + '...', originalWords, summaryWords);
            
        }, 3000);
    }
    
    function generateSimulatedSummary(text, targetWords) {
        // Simple simulation of AI summary
        const sentences = [
            "This summary highlights the key points from your content.",
            "The main concepts have been extracted and simplified for better understanding.",
            "Important details and relationships between ideas are preserved.",
            "This condensed version helps you focus on the most critical information.",
            "You can use this summary for quick review and memorization."
        ];
        
        let summary = "";
        let currentWords = 0;
        
        while (currentWords < targetWords && sentences.length > 0) {
            const sentence = sentences[Math.floor(Math.random() * sentences.length)];
            if (summary) summary += " ";
            summary += sentence;
            currentWords += sentence.split(/\s+/).length;
        }
        
        return summary;
    }
    
    function generateTags(summary) {
        const possibleTags = ['Key Concepts', 'Important', 'Study Guide', 'Condensed', 'AI Generated', 'Educational'];
        const numTags = Math.floor(Math.random() * 3) + 2; // 2-4 tags
        
        return Array.from({length: numTags}, () => 
            possibleTags[Math.floor(Math.random() * possibleTags.length)]
        ).filter((tag, index, self) => self.indexOf(tag) === index); // Remove duplicates
    }
    
    // Summary actions
    const copySummary = document.getElementById('copySummary');
    const downloadSummary = document.getElementById('downloadSummary');
    const saveSummary = document.getElementById('saveSummary');
    const regenerateSummary = document.getElementById('regenerateSummary');
    const createFlashcards = document.getElementById('createFlashcards');
    const createQuiz = document.getElementById('createQuiz');
    
    copySummary.addEventListener('click', function() {
        const summaryText = document.getElementById('summaryText').textContent;
        navigator.clipboard.writeText(summaryText).then(() => {
            showNotification('Summary copied to clipboard!');
        });
    });
    
    downloadSummary.addEventListener('click', function() {
        const summaryText = document.getElementById('summaryText').textContent;
        const blob = new Blob([summaryText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'edumind-summary.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Summary downloaded!');
    });
    
    saveSummary.addEventListener('click', function() {
        showNotification('Summary saved to your history!');
    });
    
    regenerateSummary.addEventListener('click', function() {
        const activeOption = document.querySelector('.option-btn.active').getAttribute('data-option');
        let inputText = '';
        
        if (activeOption === 'text') {
            inputText = notesText.value.trim();
        }
        
        if (inputText) {
            summaryContent.style.display = 'none';
            summaryLoading.style.display = 'block';
            simulateAISummary(inputText);
        }
    });
    
    createFlashcards.addEventListener('click', function() {
        showNotification('Redirecting to flashcards generator...');
        setTimeout(() => {
            window.location.href = 'flashcards.html';
        }, 1000);
    });
    
    createQuiz.addEventListener('click', function() {
        showNotification('Redirecting to quiz generator...');
        setTimeout(() => {
            window.location.href = 'quiz.html';
        }, 1000);
    });
    
    // Recent summaries functionality
    function addToRecentSummaries(title, content, originalWords, summaryWords) {
        const summariesGrid = document.getElementById('summariesGrid');
        const emptySummaries = document.getElementById('emptySummaries');
        
        if (emptySummaries.style.display !== 'none') {
            emptySummaries.style.display = 'none';
        }
        
        const summaryItem = document.createElement('div');
        summaryItem.className = 'summary-item animate-zoom-in';
        summaryItem.innerHTML = `
            <div class="summary-item-header">
                <h3>${title}</h3>
                <span class="summary-date">Just now</span>
            </div>
            <div class="summary-item-content">
                <p>${content}</p>
            </div>
            <div class="summary-item-footer">
                <div class="summary-stats">
                    <span>Original: ${originalWords} words</span>
                    <span>Summary: ${summaryWords} words</span>
                </div>
                <button class="btn small">View</button>
            </div>
        `;
        
        summariesGrid.prepend(summaryItem);
        
        // Limit to 5 recent summaries
        const items = summariesGrid.querySelectorAll('.summary-item');
        if (items.length > 5) {
            items[items.length - 1].remove();
        }
    }
    
    // Notification function
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
    
    // Add CSS for notification animation
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
    `;
    document.head.appendChild(style);
});