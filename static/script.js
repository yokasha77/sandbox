let questions = [];
let currentIndex = 0;
let score = 0;
let wrongAnswers = [];
let startTime = 0;

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
