// Quiz functionality
document.addEventListener('DOMContentLoaded', function() {
    // Quiz state
    let quizState = {
        isActive: false,
        currentQuestion: 0,
        userAnswers: [],
        startTime: null,
        timerInterval: null,
        timeRemaining: 600, // 10 minutes in seconds
        totalTime: 600
    };

    // Current quiz data
    let currentQuiz = {
        title: '',
        questions: [],
        settings: {}
    };

    // Initialize quiz
    initializeQuiz();

    function initializeQuiz() {
        setupEventListeners();
        updateQuestionCount();
        loadQuizHistory();
    }

    function setupEventListeners() {
        // Source option switching
        const sourceOptions = document.querySelectorAll('.source-option');
        const sourceContents = document.querySelectorAll('.source-content');
        
        sourceOptions.forEach(option => {
            option.addEventListener('click', function() {
                const source = this.getAttribute('data-source');
                
                // Update active option
                sourceOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                // Show corresponding content
                sourceContents.forEach(content => content.style.display = 'none');
                document.getElementById(`${source}-source`).style.display = 'block';
            });
        });

        // Note selection
        const noteItems = document.querySelectorAll('.note-item');
        noteItems.forEach(item => {
            item.addEventListener('click', function() {
                noteItems.forEach(note => note.classList.remove('selected'));
                this.classList.add('selected');
            });
        });

        // Summary selection
        const summaryItems = document.querySelectorAll('.summary-item');
        summaryItems.forEach(item => {
            item.addEventListener('click', function() {
                summaryItems.forEach(summary => summary.classList.remove('selected'));
                this.classList.add('selected');
            });
        });

        // Question count slider
        const questionCount = document.getElementById('questionCount');
        const questionCountValue = document.getElementById('questionCountValue');
        
        questionCount.addEventListener('input', function() {
            questionCountValue.textContent = `${this.value} questions`;
        });

        // Generate quiz button
        const generateQuiz = document.getElementById('generateQuiz');
        generateQuiz.addEventListener('click', generateNewQuiz);

        // Quiz navigation
        const prevQuestion = document.getElementById('prevQuestion');
        const nextQuestion = document.getElementById('nextQuestion');
        const submitQuiz = document.getElementById('submitQuiz');
        
        prevQuestion.addEventListener('click', showPreviousQuestion);
        nextQuestion.addEventListener('click', showNextQuestion);
        submitQuiz.addEventListener('click', submitQuizResults);

        // Results actions
        const reviewAnswers = document.getElementById('reviewAnswers');
        const newQuiz = document.getElementById('newQuiz');
        const saveResults = document.getElementById('saveResults');
        
        reviewAnswers.addEventListener('click', reviewQuizAnswers);
        newQuiz.addEventListener('click', resetQuiz);
        saveResults.addEventListener('click', saveQuizResults);
    }

    function updateQuestionCount() {
        const questionCount = document.getElementById('questionCount');
        const questionCountValue = document.getElementById('questionCountValue');
        questionCountValue.textContent = `${questionCount.value} questions`;
    }

    function generateNewQuiz() {
        const source = document.querySelector('.source-option.active').getAttribute('data-source');
        const questionCount = parseInt(document.getElementById('questionCount').value);
        const difficulty = document.getElementById('quizDifficulty').value;
        const questionType = document.getElementById('questionType').value;
        const timeLimit = parseInt(document.getElementById('timeLimit').value);

        // Get quiz title based on source
        let quizTitle = '';
        switch (source) {
            case 'notes':
                const selectedNote = document.querySelector('.note-item.selected');
                quizTitle = selectedNote ? selectedNote.querySelector('span').textContent : 'General Knowledge';
                break;
            case 'summary':
                const selectedSummary = document.querySelector('.summary-item.selected');
                quizTitle = selectedSummary ? selectedSummary.querySelector('h5').textContent : 'AI Summary';
                break;
            case 'topic':
                const topic = document.getElementById('quizTopic').value.trim();
                quizTitle = topic || 'General Knowledge';
                break;
        }

        // Set quiz settings
        currentQuiz = {
            title: quizTitle,
            questions: [],
            settings: {
                questionCount,
                difficulty,
                questionType,
                timeLimit: timeLimit * 60 // Convert to seconds
            }
        };

        // Generate questions based on settings
        currentQuiz.questions = generateQuestions(questionCount, difficulty, questionType);

        // Initialize quiz state
        quizState = {
            isActive: true,
            currentQuestion: 0,
            userAnswers: new Array(questionCount).fill(null),
            startTime: new Date(),
            timerInterval: null,
            timeRemaining: timeLimit * 60,
            totalTime: timeLimit * 60
        };

        // Start the quiz
        startQuiz();
    }

    function generateQuestions(count, difficulty, type) {
        const questions = [];
        const questionTemplates = getQuestionTemplates();

        for (let i = 0; i < count; i++) {
            const template = questionTemplates[Math.floor(Math.random() * questionTemplates.length)];
            const question = {
                id: i + 1,
                text: template.question,
                options: [...template.options],
                correctAnswer: template.correctAnswer,
                explanation: template.explanation,
                type: 'mcq'
            };

            // Shuffle options
            question.options = shuffleArray(question.options);
            questions.push(question);
        }

        return questions;
    }

    function getQuestionTemplates() {
        return [
            {
                question: "What is the powerhouse of the cell?",
                options: [
                    "Nucleus",
                    "Mitochondria",
                    "Ribosome",
                    "Endoplasmic Reticulum"
                ],
                correctAnswer: 1,
                explanation: "Mitochondria are known as the powerhouse of the cell because they generate most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy."
            },
            {
                question: "Which programming language is primarily used for web development?",
                options: [
                    "Python",
                    "JavaScript",
                    "C++",
                    "Java"
                ],
                correctAnswer: 1,
                explanation: "JavaScript is the primary language for web development, enabling interactive web pages and is an essential part of web applications."
            },
            {
                question: "What is the chemical symbol for gold?",
                options: [
                    "Go",
                    "Gd",
                    "Au",
                    "Ag"
                ],
                correctAnswer: 2,
                explanation: "The chemical symbol for gold is Au, derived from the Latin word 'aurum' meaning gold."
            },
            {
                question: "Who wrote 'Romeo and Juliet'?",
                options: [
                    "Charles Dickens",
                    "William Shakespeare",
                    "Jane Austen",
                    "Mark Twain"
                ],
                correctAnswer: 1,
                explanation: "William Shakespeare, the English playwright and poet, wrote the famous tragedy 'Romeo and Juliet'."
            },
            {
                question: "What is the largest planet in our solar system?",
                options: [
                    "Earth",
                    "Saturn",
                    "Jupiter",
                    "Neptune"
                ],
                correctAnswer: 2,
                explanation: "Jupiter is the largest planet in our solar system, with a mass more than two and a half times that of all other planets combined."
            },
            {
                question: "What does HTML stand for?",
                options: [
                    "Hyper Text Markup Language",
                    "High Tech Modern Language",
                    "Hyper Transfer Markup Language",
                    "Home Tool Markup Language"
                ],
                correctAnswer: 0,
                explanation: "HTML stands for Hyper Text Markup Language, which is the standard markup language for documents designed to be displayed in a web browser."
            },
            {
                question: "Which element has the atomic number 1?",
                options: [
                    "Helium",
                    "Oxygen",
                    "Hydrogen",
                    "Carbon"
                ],
                correctAnswer: 2,
                explanation: "Hydrogen has the atomic number 1, making it the first and lightest element on the periodic table."
            },
            {
                question: "What is the capital of France?",
                options: [
                    "London",
                    "Berlin",
                    "Paris",
                    "Madrid"
                ],
                correctAnswer: 2,
                explanation: "Paris is the capital and most populous city of France, known for its cultural landmarks like the Eiffel Tower and Louvre Museum."
            }
        ];
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function startQuiz() {
        // Hide instructions, show quiz
        document.getElementById('quizInstructions').style.display = 'none';
        document.getElementById('quizProgress').style.display = 'block';
        document.getElementById('questionContainer').style.display = 'flex';
        document.getElementById('quizResults').style.display = 'none';

        // Update quiz title
        document.getElementById('quizTitle').textContent = currentQuiz.title;

        // Start timer if time limit is set
        if (currentQuiz.settings.timeLimit > 0) {
            startTimer();
        } else {
            document.getElementById('quizTimer').style.display = 'none';
        }

        // Show first question
        showCurrentQuestion();
    }

    function startTimer() {
        const timerElement = document.getElementById('timeRemaining');
        const timerContainer = document.getElementById('quizTimer');

        quizState.timerInterval = setInterval(() => {
            quizState.timeRemaining--;

            const minutes = Math.floor(quizState.timeRemaining / 60);
            const seconds = quizState.timeRemaining % 60;
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            // Update timer appearance based on remaining time
            if (quizState.timeRemaining <= 60) {
                timerContainer.classList.add('danger');
            } else if (quizState.timeRemaining <= 180) {
                timerContainer.classList.add('warning');
            }

            if (quizState.timeRemaining <= 0) {
                clearInterval(quizState.timerInterval);
                submitQuizResults();
            }
        }, 1000);
    }

    function showCurrentQuestion() {
        const question = currentQuiz.questions[quizState.currentQuestion];
        
        // Update progress
        document.getElementById('progressText').textContent = 
            `Question ${quizState.currentQuestion + 1} of ${currentQuiz.questions.length}`;
        
        const progressPercent = ((quizState.currentQuestion + 1) / currentQuiz.questions.length) * 100;
        document.getElementById('quizProgressFill').style.width = `${progressPercent}%`;

        // Update question text
        document.getElementById('questionText').textContent = question.text;

        // Update options
        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = `option ${quizState.userAnswers[quizState.currentQuestion] === index ? 'selected' : ''}`;
            optionElement.innerHTML = `
                <div class="option-marker">${String.fromCharCode(65 + index)}</div>
                <div class="option-text">${option}</div>
            `;
            
            optionElement.addEventListener('click', () => selectOption(index));
            optionsContainer.appendChild(optionElement);
        });

        // Update navigation buttons
        document.getElementById('prevQuestion').disabled = quizState.currentQuestion === 0;
        
        const isLastQuestion = quizState.currentQuestion === currentQuiz.questions.length - 1;
        document.getElementById('nextQuestion').style.display = isLastQuestion ? 'none' : 'block';
        document.getElementById('submitQuiz').style.display = isLastQuestion ? 'block' : 'none';
    }

    function selectOption(optionIndex) {
        // Remove selection from all options
        const options = document.querySelectorAll('.option');
        options.forEach(option => option.classList.remove('selected'));
        
        // Add selection to clicked option
        options[optionIndex].classList.add('selected');
        
        // Save user's answer
        quizState.userAnswers[quizState.currentQuestion] = optionIndex;
    }

    function showPreviousQuestion() {
        if (quizState.currentQuestion > 0) {
            quizState.currentQuestion--;
            showCurrentQuestion();
        }
    }

    function showNextQuestion() {
        if (quizState.currentQuestion < currentQuiz.questions.length - 1) {
            quizState.currentQuestion++;
            showCurrentQuestion();
        }
    }

    function submitQuizResults() {
        // Stop timer
        if (quizState.timerInterval) {
            clearInterval(quizState.timerInterval);
        }

        // Calculate results
        const results = calculateResults();
        
        // Show results
        showResults(results);
        
        // Add to history
        addToQuizHistory(results);
    }

    function calculateResults() {
        let correctAnswers = 0;
        const results = [];

        currentQuiz.questions.forEach((question, index) => {
            const isCorrect = quizState.userAnswers[index] === question.correctAnswer;
            if (isCorrect) correctAnswers++;
            
            results.push({
                question: question.text,
                userAnswer: question.options[quizState.userAnswers[index]],
                correctAnswer: question.options[question.correctAnswer],
                isCorrect: isCorrect,
                explanation: question.explanation
            });
        });

        const score = Math.round((correctAnswers / currentQuiz.questions.length) * 100);
        const timeTaken = Math.floor((new Date() - quizState.startTime) / 1000);

        return {
            score: score,
            correctAnswers: correctAnswers,
            totalQuestions: currentQuiz.questions.length,
            timeTaken: timeTaken,
            details: results,
            quizTitle: currentQuiz.title,
            date: new Date().toISOString()
        };
    }

    function showResults(results) {
        // Hide question container, show results
        document.getElementById('questionContainer').style.display = 'none';
        document.getElementById('quizProgress').style.display = 'none';
        document.getElementById('quizResults').style.display = 'block';

        // Update results display
        document.getElementById('finalScore').textContent = results.score;
        document.getElementById('correctAnswers').textContent = results.correctAnswers;
        document.getElementById('incorrectAnswers').textContent = results.totalQuestions - results.correctAnswers;
        
        const minutes = Math.floor(results.timeTaken / 60);
        const seconds = results.timeTaken % 60;
        document.getElementById('timeTaken').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Update chart
        updateResultsChart(results);
    }

    function updateResultsChart(results) {
        const ctx = document.getElementById('resultsChart').getContext('2d');
        
        if (window.resultsChart) {
            window.resultsChart.destroy();
        }

        window.resultsChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Correct', 'Incorrect'],
                datasets: [{
                    data: [results.correctAnswers, results.totalQuestions - results.correctAnswers],
                    backgroundColor: ['#4caf50', '#f44336'],
                    borderWidth: 2,
                    borderColor: 'var(--card-bg)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'var(--text)',
                            font: {
                                family: 'Delius'
                            }
                        }
                    }
                }
            }
        });
    }

    function reviewQuizAnswers() {
        // This would show a detailed review of all questions and answers
        alert('Review feature would show detailed answers and explanations for each question.');
    }

    function resetQuiz() {
        // Reset to initial state
        document.getElementById('quizInstructions').style.display = 'flex';
        document.getElementById('quizProgress').style.display = 'none';
        document.getElementById('questionContainer').style.display = 'none';
        document.getElementById('quizResults').style.display = 'none';
        document.getElementById('quizTimer').style.display = 'flex';
        document.getElementById('quizTimer').className = 'quiz-timer';
        
        quizState.isActive = false;
        currentQuiz = {
            title: '',
            questions: [],
            settings: {}
        };
    }

    function saveQuizResults() {
        const results = calculateResults();
        const quizHistory = JSON.parse(localStorage.getItem('edumind_quiz_history') || '[]');
        
        quizHistory.unshift({
            title: results.quizTitle,
            score: results.score,
            correctAnswers: results.correctAnswers,
            totalQuestions: results.totalQuestions,
            timeTaken: results.timeTaken,
            date: results.date
        });

        // Keep only last 20 quizzes
        if (quizHistory.length > 20) {
            quizHistory.pop();
        }

        localStorage.setItem('edumind_quiz_history', JSON.stringify(quizHistory));
        loadQuizHistory();
        showNotification('Quiz results saved successfully!');
    }

    function addToQuizHistory(results) {
        const quizHistory = JSON.parse(localStorage.getItem('edumind_quiz_history') || '[]');
        
        quizHistory.unshift({
            title: results.quizTitle,
            score: results.score,
            correctAnswers: results.correctAnswers,
            totalQuestions: results.totalQuestions,
            timeTaken: results.timeTaken,
            date: results.date
        });

        // Keep only last 20 quizzes
        if (quizHistory.length > 20) {
            quizHistory.pop();
        }

        localStorage.setItem('edumind_quiz_history', JSON.stringify(quizHistory));
        loadQuizHistory();
    }

    function loadQuizHistory() {
        const quizHistory = JSON.parse(localStorage.getItem('edumind_quiz_history') || '[]');
        const historyGrid = document.getElementById('historyGrid');
        const emptyHistory = document.getElementById('emptyHistory');

        if (quizHistory.length === 0) {
            historyGrid.style.display = 'none';
            emptyHistory.style.display = 'block';
        } else {
            historyGrid.style.display = 'grid';
            emptyHistory.style.display = 'none';

            historyGrid.innerHTML = quizHistory.map((quiz, index) => {
                if (index >= 6) return ''; // Show only 6 most recent
                
                const date = new Date(quiz.date);
                const formattedDate = date.toLocaleDateString();
                
                let scoreClass = 'score-medium';
                if (quiz.score >= 80) scoreClass = 'score-high';
                else if (quiz.score < 60) scoreClass = 'score-low';

                const minutes = Math.floor(quiz.timeTaken / 60);
                const seconds = quiz.timeTaken % 60;

                return `
                    <div class="history-item animate-zoom-in">
                        <div class="history-header">
                            <h3>${quiz.title}</h3>
                            <span class="history-date">${formattedDate}</span>
                        </div>
                        <div class="history-stats">
                            <div class="score-badge ${scoreClass}">${quiz.score}%</div>
                            <div class="history-details">
                                <span>${quiz.totalQuestions} questions</span>
                                <span>${quiz.correctAnswers} correct</span>
                                <span>${minutes}:${seconds.toString().padStart(2, '0')} min</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
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
    `;
    document.head.appendChild(style);
});