// Flashcards functionality
document.addEventListener('DOMContentLoaded', function() {
    let currentCards = [];
    let currentCardIndex = 0;
    let studyStartTime = null;
    let studyTimer = null;
    
    // Initialize
    initializeFlashcards();
    
    function initializeFlashcards() {
        setupEventListeners();
        updateStats();
        startStudyTimer();
    }
    
    function setupEventListeners() {
        // Generator option switching
        const optionBtns = document.querySelectorAll('.option-btn');
        const generatorContents = document.querySelectorAll('.generator-content');
        
        optionBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const option = this.getAttribute('data-option');
                
                // Update active option
                optionBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Show corresponding content
                generatorContents.forEach(content => content.classList.remove('active'));
                document.getElementById(`${option}-${option === 'ai' ? 'generate' : 'create'}`).classList.add('active');
            });
        });
        
        // Card count slider
        const cardCount = document.getElementById('cardCount');
        const countValue = document.getElementById('countValue');
        
        cardCount.addEventListener('input', function() {
            countValue.textContent = this.value;
        });
        
        // Word count for AI input
        const flashcardText = document.getElementById('flashcardText');
        const fcWordCount = document.getElementById('fcWordCount');
        
        flashcardText.addEventListener('input', function() {
            const text = this.value.trim();
            const words = text ? text.split(/\s+/).length : 0;
            fcWordCount.textContent = words;
        });
        
        // Generate flashcards
        const generateFlashcards = document.getElementById('generateFlashcards');
        generateFlashcards.addEventListener('click', generateAIFlashcards);
        
        // Manual card creation
        const addCard = document.getElementById('addCard');
        addCard.addEventListener('click', createManualCard);
        
        // Flashcard navigation
        const prevCard = document.getElementById('prevCard');
        const nextCard = document.getElementById('nextCard');
        const shuffleCards = document.getElementById('shuffleCards');
        const resetProgress = document.getElementById('resetProgress');
        
        prevCard.addEventListener('click', showPreviousCard);
        nextCard.addEventListener('click', showNextCard);
        shuffleCards.addEventListener('click', shuffleFlashcards);
        resetProgress.addEventListener('click', resetStudyProgress);
        
        // Card actions
        const markKnown = document.getElementById('markKnown');
        const markReview = document.getElementById('markReview');
        const deleteCard = document.getElementById('deleteCard');
        
        markKnown.addEventListener('click', () => markCardStatus('known'));
        markReview.addEventListener('click', () => markCardStatus('review'));
        deleteCard.addEventListener('click', deleteCurrentCard);
        
        // Flashcard flip
        const currentCard = document.getElementById('currentCard');
        currentCard.addEventListener('click', flipCard);
        
        // Set creation
        const createNewSet = document.getElementById('createNewSet');
        const createSetModal = document.getElementById('createSetModal');
        const closeSetModal = document.getElementById('closeSetModal');
        const cancelSet = document.getElementById('cancelSet');
        const saveSet = document.getElementById('saveSet');
        
        createNewSet.addEventListener('click', () => createSetModal.classList.add('active'));
        closeSetModal.addEventListener('click', () => createSetModal.classList.remove('active'));
        cancelSet.addEventListener('click', () => createSetModal.classList.remove('active'));
        saveSet.addEventListener('click', createFlashcardSet);
        
        // Study set buttons
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('study-set')) {
                const setCard = e.target.closest('.set-card');
                const setName = setCard.querySelector('h3').textContent;
                loadSetForStudy(setName);
            }
        });
    }
    
    function generateAIFlashcards() {
        const text = document.getElementById('flashcardText').value.trim();
        if (!text) {
            alert('Please enter some text to generate flashcards');
            return;
        }
        
        const cardCount = parseInt(document.getElementById('cardCount').value);
        const difficulty = document.getElementById('difficulty').value;
        
        // Show loading state
        const generateBtn = document.getElementById('generateFlashcards');
        const originalText = generateBtn.innerHTML;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        generateBtn.disabled = true;
        
        // Simulate AI generation
        setTimeout(() => {
            const generatedCards = simulateAICardGeneration(text, cardCount, difficulty);
            currentCards = generatedCards;
            currentCardIndex = 0;
            
            displayCurrentCard();
            updateNavigation();
            updateStats();
            
            // Restore button
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
            
            showNotification(`Generated ${cardCount} flashcards successfully!`);
        }, 2000);
    }
    
    function simulateAICardGeneration(text, count, difficulty) {
        const cards = [];
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        
        for (let i = 0; i < count && i < sentences.length; i++) {
            const sentence = sentences[i].trim();
            const words = sentence.split(/\s+/);
            
            // Create question by removing key words
            const questionWords = [...words];
            const removedIndices = [];
            
            // Remove 1-3 key words based on difficulty
            const wordsToRemove = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
            for (let j = 0; j < wordsToRemove && j < questionWords.length; j++) {
                const removeIndex = Math.floor(Math.random() * questionWords.length);
                if (questionWords[removeIndex].length > 3 && !removedIndices.includes(removeIndex)) {
                    questionWords[removeIndex] = '______';
                    removedIndices.push(removeIndex);
                }
            }
            
            const question = questionWords.join(' ') + '?';
            const answer = sentence;
            
            cards.push({
                question: question,
                answer: answer,
                category: 'AI Generated',
                status: 'new',
                id: Date.now() + i
            });
        }
        
        // Fill remaining cards with generic content if needed
        while (cards.length < count) {
            cards.push({
                question: `Sample question ${cards.length + 1} about the content?`,
                answer: `This is a detailed answer explaining concept ${cards.length + 1} from your notes.`,
                category: 'AI Generated',
                status: 'new',
                id: Date.now() + cards.length
            });
        }
        
        return cards;
    }
    
    function createManualCard() {
        const question = document.getElementById('cardQuestion').value.trim();
        const answer = document.getElementById('cardAnswer').value.trim();
        const category = document.getElementById('cardCategory').value.trim() || 'General';
        
        if (!question || !answer) {
            alert('Please fill in both question and answer');
            return;
        }
        
        const newCard = {
            question: question,
            answer: answer,
            category: category,
            status: 'new',
            id: Date.now()
        };
        
        currentCards.push(newCard);
        currentCardIndex = currentCards.length - 1;
        
        displayCurrentCard();
        updateNavigation();
        updateStats();
        
        // Clear form
        document.getElementById('cardQuestion').value = '';
        document.getElementById('cardAnswer').value = '';
        
        showNotification('Flashcard added successfully!');
    }
    
    function displayCurrentCard() {
        const card = currentCards[currentCardIndex];
        const currentCard = document.getElementById('currentCard');
        
        if (card) {
            document.getElementById('cardFrontText').textContent = card.question;
            document.getElementById('cardBackText').textContent = card.answer;
            document.getElementById('cardCategoryDisplay').textContent = card.category;
            
            // Reset card to front
            currentCard.classList.remove('flipped');
        } else {
            document.getElementById('cardFrontText').textContent = 'No flashcards available';
            document.getElementById('cardBackText').textContent = 'Create or generate flashcards to start studying';
            document.getElementById('cardCategoryDisplay').textContent = '';
        }
        
        updateProgressBar();
    }
    
    function flipCard() {
        const currentCard = document.getElementById('currentCard');
        currentCard.classList.toggle('flipped');
    }
    
    function showPreviousCard() {
        if (currentCardIndex > 0) {
            currentCardIndex--;
            displayCurrentCard();
            updateNavigation();
        }
    }
    
    function showNextCard() {
        if (currentCardIndex < currentCards.length - 1) {
            currentCardIndex++;
            displayCurrentCard();
            updateNavigation();
        }
    }
    
    function updateNavigation() {
        const prevCard = document.getElementById('prevCard');
        const nextCard = document.getElementById('nextCard');
        const cardProgress = document.getElementById('cardProgress');
        
        prevCard.disabled = currentCardIndex === 0;
        nextCard.disabled = currentCardIndex === currentCards.length - 1;
        cardProgress.textContent = `${currentCardIndex + 1}/${currentCards.length}`;
    }
    
    function updateProgressBar() {
        const progressFill = document.getElementById('cardProgressFill');
        const progress = currentCards.length > 0 ? ((currentCardIndex + 1) / currentCards.length) * 100 : 0;
        progressFill.style.width = `${progress}%`;
    }
    
    function shuffleFlashcards() {
        if (currentCards.length > 0) {
            // Fisher-Yates shuffle
            for (let i = currentCards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [currentCards[i], currentCards[j]] = [currentCards[j], currentCards[i]];
            }
            currentCardIndex = 0;
            displayCurrentCard();
            updateNavigation();
            showNotification('Flashcards shuffled!');
        }
    }
    
    function resetStudyProgress() {
        currentCards.forEach(card => {
            card.status = 'new';
        });
        updateStats();
        showNotification('Study progress reset!');
    }
    
    function markCardStatus(status) {
        if (currentCards[currentCardIndex]) {
            currentCards[currentCardIndex].status = status;
            updateStats();
            
            if (status === 'known') {
                showNotification('Marked as known!');
                // Auto-advance to next card
                if (currentCardIndex < currentCards.length - 1) {
                    setTimeout(() => {
                        currentCardIndex++;
                        displayCurrentCard();
                        updateNavigation();
                    }, 500);
                }
            } else {
                showNotification('Marked for review!');
            }
        }
    }
    
    function deleteCurrentCard() {
        if (currentCards[currentCardIndex] && confirm('Are you sure you want to delete this flashcard?')) {
            currentCards.splice(currentCardIndex, 1);
            
            if (currentCardIndex >= currentCards.length) {
                currentCardIndex = Math.max(0, currentCards.length - 1);
            }
            
            displayCurrentCard();
            updateNavigation();
            updateStats();
            showNotification('Flashcard deleted!');
        }
    }
    
    function updateStats() {
        const totalCards = document.getElementById('totalCards');
        const masteredCards = document.getElementById('masteredCards');
        
        totalCards.textContent = currentCards.length;
        const mastered = currentCards.filter(card => card.status === 'known').length;
        masteredCards.textContent = mastered;
    }
    
    function startStudyTimer() {
        studyStartTime = Date.now();
        studyTimer = setInterval(() => {
            const studyTime = document.getElementById('studyTime');
            const elapsed = Math.floor((Date.now() - studyStartTime) / 60000); // minutes
            studyTime.textContent = `${elapsed}m`;
        }, 60000);
    }
    
    function createFlashcardSet() {
        const setName = document.getElementById('setName').value.trim();
        const description = document.getElementById('setDescription').value.trim();
        const category = document.getElementById('setCategory').value.trim();
        
        if (!setName) {
            alert('Please enter a set name');
            return;
        }
        
        if (currentCards.length === 0) {
            alert('Please create some flashcards first');
            return;
        }
        
        const setsGrid = document.getElementById('setsGrid');
        const emptySets = document.getElementById('emptySets');
        
        if (emptySets.style.display !== 'none') {
            emptySets.style.display = 'none';
        }
        
        const setCard = document.createElement('div');
        setCard.className = 'set-card animate-zoom-in';
        setCard.innerHTML = `
            <div class="set-header">
                <h3>${setName}</h3>
                <span class="set-date">Created: Just now</span>
            </div>
            <div class="set-stats">
                <div class="set-stat">
                    <i class="fas fa-layer-group"></i>
                    <span>${currentCards.length} cards</span>
                </div>
                <div class="set-stat">
                    <i class="fas fa-check-circle"></i>
                    <span>0 mastered</span>
                </div>
            </div>
            <div class="set-actions">
                <button class="btn small primary study-set">Study</button>
                <button class="btn small secondary edit-set">Edit</button>
            </div>
        `;
        
        setsGrid.prepend(setCard);
        
        // Close modal and reset form
        document.getElementById('createSetModal').classList.remove('active');
        document.getElementById('setName').value = '';
        document.getElementById('setDescription').value = '';
        document.getElementById('setCategory').value = '';
        
        showNotification('Flashcard set created successfully!');
    }
    
    function loadSetForStudy(setName) {
        // In a real app, this would load the set from storage
        // For demo, we'll use the current cards or generate some
        if (currentCards.length === 0) {
            // Generate sample cards for the set
            const sampleCards = [
                {
                    question: "What is the powerhouse of the cell?",
                    answer: "Mitochondria",
                    category: "Biology",
                    status: "new",
                    id: 1
                },
                {
                    question: "Who wrote 'Romeo and Juliet'?",
                    answer: "William Shakespeare",
                    category: "Literature",
                    status: "new",
                    id: 2
                },
                {
                    question: "What is the chemical symbol for gold?",
                    answer: "Au",
                    category: "Chemistry",
                    status: "new",
                    id: 3
                }
            ];
            
            currentCards = sampleCards;
            currentCardIndex = 0;
            displayCurrentCard();
            updateNavigation();
            updateStats();
        }
        
        showNotification(`Loading ${setName}...`);
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
});