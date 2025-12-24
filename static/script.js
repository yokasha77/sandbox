
let questions = [];
let currentIndex = 0;
let score = 0;
let wrongAnswers = [];
let startTime = 0;
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

// Get level and category from URL
const urlParams = new URLSearchParams(window.location.search);
const level = urlParams.get('level') || 'Beginner';
const category = urlParams.get('category') || null;

const questionText = document.getElementById('question-text');
const feedbackDiv = document.getElementById('feedback');
const scoreText = document.getElementById('score-text');
const questionCounter = document.getElementById('question-counter');
const progressBar = document.getElementById('progress-bar');
const answerInput = document.getElementById('answer');
const multipleChoiceDiv = document.getElementById('multiple-choice');
const optionsContainer = document.getElementById('options-container');
const textInputDiv = document.getElementById('text-input');
const favoriteBtn = document.getElementById('favorite-btn');

// Add Enter key listener
answerInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        submitAnswer();
    }
});

// Fetch questions from Flask
fetch(`/get_questions/${level}${category ? `?category=${category}` : ''}`)
    .then(response => response.json())
    .then(data => {
        questions = data;
        startTime = Date.now();
        showQuestion();
    });


function showQuestion() {
    if (currentIndex >= questions.length) {
        endQuiz();
        return;
    }

    const questionNumber = currentIndex + 1;
    questionText.classList.remove('question-animate');
    void questionText.offsetWidth; // Trigger reflow to restart animation
    questionText.classList.add('question-animate');
    
    questionText.innerText = questions[currentIndex].question;
    questionCounter.innerText = `Question: [${questionNumber}/${questions.length}]`;
    feedbackDiv.innerHTML = '';
    feedbackDiv.classList.remove('feedback-animate');
    answerInput.value = '';
    answerInput.disabled = false;
    document.querySelector('button[onclick="submitAnswer()"]').disabled = false;
    updateProgress();
    
    // Check if question has multiple choice options
    const currentQuestion = questions[currentIndex];
    if (currentQuestion.options && currentQuestion.options.length > 0) {
        showMultipleChoice(currentQuestion.options);
    } else {
        showTextInput();
    }
    
    // Update favorite button state
    updateFavoriteButton();
}

function submitAnswer() {
    const answer = answerInput.value;
    if (answer.trim() === '') return;

    fetch(`/submit_answer/${currentIndex}/${encodeURIComponent(answer)}`)
        .then(response => response.json())
        .then(data => {
            feedbackDiv.classList.add('feedback-animate');
            if (data.correct) {
                feedbackDiv.innerHTML = `✅ Correct! ${data.explanation}`;
                feedbackDiv.style.color = 'green';
            } else {
                feedbackDiv.innerHTML = `❌ Incorrect! Correct: ${data.correct_answer}. ${data.explanation}`;
                feedbackDiv.style.color = 'red';
                wrongAnswers.push({
                    question: questions[currentIndex].question,
                    userAnswer: answer,
                    correctAnswer: data.correct_answer,
                    explanation: data.explanation
                });
            }
            score = data.score;
            scoreText.innerText = `Score: ${score}`;
            answerInput.disabled = true;
            document.querySelector('button[onclick="submitAnswer()"]').disabled = true;
            currentIndex++;
            setTimeout(showQuestion, 4500);
        });
}

function showHint() {
    const answer = questions[currentIndex].answer;
    const hintLength = Math.ceil(answer.length / 2);
    const hint = answer.substring(0, hintLength) + '*'.repeat(answer.length - hintLength);
    feedbackDiv.innerHTML = `<div class="hint">💡 Hint: ${hint}</div>`;
    +    feedbackDiv.classList.add('feedback-animate');
}

function endQuiz() {
    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - startTime) / 1000);
    const accuracy = Math.round((score / questions.length) * 100);
    
    sessionStorage.setItem('quizResults', JSON.stringify({
        score: score,
        total: questions.length,
        accuracy: accuracy,
        timeTaken: timeTaken,
        wrongAnswers: wrongAnswers,
        level: level,
        category: category
    }));
    
    window.location.href = '/results';
}


function updateProgress() {
    const percent = (currentIndex / questions.length) * 100;
    progressBar.style.width = `${percent}%`;
}

// Multiple Choice Functions
function showMultipleChoice(options) {
    textInputDiv.style.display = 'none';
    multipleChoiceDiv.style.display = 'block';
    optionsContainer.innerHTML = '';
    
    options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.innerText = option;
        button.onclick = () => selectMultipleChoice(option);
        optionsContainer.appendChild(button);
    });
}

function showTextInput() {
    multipleChoiceDiv.style.display = 'none';
    textInputDiv.style.display = 'block';
}

function selectMultipleChoice(selectedOption) {
    // Disable all options
    const options = document.querySelectorAll('.option-btn');
    options.forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'default';
    });
    
    // Submit the answer
    fetch(`/submit_answer/${currentIndex}/${encodeURIComponent(selectedOption)}`)
        .then(response => response.json())
        .then(data => {
            feedbackDiv.classList.add('feedback-animate');
            if (data.correct) {
                feedbackDiv.innerHTML = `✅ Correct! ${data.explanation}`;
                feedbackDiv.style.color = 'green';
                // Highlight correct answer
                options.forEach(btn => {
                    if (btn.innerText === selectedOption) {
                        btn.style.backgroundColor = '#4CAF50';
                        btn.style.color = 'white';
                    }
                });
            } else {
                feedbackDiv.innerHTML = `❌ Incorrect! Correct: ${data.correct_answer}. ${data.explanation}`;
                feedbackDiv.style.color = 'red';
                // Highlight correct and incorrect answers
                options.forEach(btn => {
                    if (btn.innerText === selectedOption) {
                        btn.style.backgroundColor = '#f44336';
                        btn.style.color = 'white';
                    } else if (btn.innerText === data.correct_answer) {
                        btn.style.backgroundColor = '#4CAF50';
                        btn.style.color = 'white';
                    }
                });
                wrongAnswers.push({
                    question: questions[currentIndex].question,
                    userAnswer: selectedOption,
                    correctAnswer: data.correct_answer,
                    explanation: data.explanation
                });
            }
            score = data.score;
            scoreText.innerText = `Score: ${score}`;
            currentIndex++;
            setTimeout(showQuestion, 4500);
        });
}

// Favorites Functions
function toggleFavorite() {
    const currentQuestion = questions[currentIndex];
    const questionId = currentQuestion.question; // Use question text as ID for simplicity
    
    const existingIndex = favorites.findIndex(fav => fav.question === questionId);
    
    if (existingIndex !== -1) {
        // Remove from favorites
        favorites.splice(existingIndex, 1);
        favoriteBtn.textContent = '⭐';
    } else {
        // Add to favorites
        favorites.push({
            question: questionId,
            answer: currentQuestion.answer,
            explanation: currentQuestion.explanation,
            level: currentQuestion.level,
            category: currentQuestion.category
        });
        favoriteBtn.textContent = '⭐️';
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function updateFavoriteButton() {
    const currentQuestion = questions[currentIndex];
    const questionId = currentQuestion.question;
    
    const isFavorite = favorites.some(fav => fav.question === questionId);
    favoriteBtn.textContent = isFavorite ? '⭐️' : '⭐';
}
