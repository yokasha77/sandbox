Language Learning Sandbox

A web-based interactive system that helps learners practice Python syntax and semantics through guided questions, feedback, and scoring.

Features

Practice Python syntax and semantics

Beginner and advanced levels

Instant feedback

Hints for each question

Syntax and meaning checks

Score tracking

Clean and simple UI

Flask backend + JavaScript frontend

Project Structure
language_sandbox/
│
├── app.py                 # Flask backend
├── questions.py           # All questions, answers, explanations
│
├── static/
│   ├── styles.css         # UI styling
│   ├── script.js          # Frontend logic
│
├── templates/
│   ├── index.html         # Home page
│   ├── quiz.html          # Quiz interface
│   ├── results.html       # Final score page
│
├── docs/
│   ├── structure of programming 2.docx
│   ├── structure.pptx
│
└── README.md

How to Run the Project
1. Install Python (3.9+ recommended)

Check version:

python3 --version

2. Install Flask
pip install flask

3. Run the application

Inside the project folder:

python3 app.py


The app will run at:

http://127.0.0.1:5000


Documentation Included

Inside docs/:

Full Word report
/Users/yousraokasha/Downloads/language_sandbox/docs/structure of programming 2.docx

PowerPoint presentation
/Users/yousraokasha/Downloads/language_sandbox/docs/structure.pptx
