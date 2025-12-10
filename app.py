# app.py
from flask import Flask, render_template, session, jsonify, request
from questions import questions
import random

app = Flask(__name__)
app.secret_key = "sandbox_secret"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/quiz")
def quiz():
    return render_template("quiz.html")

@app.route("/results")
def results():
    return render_template("results.html")

@app.route("/get_questions/<level>")
def get_questions(level):
    category = request.args.get('category')
    filtered_questions = [q for q in questions if q["level"].lower() == level.lower()]
    
    if category:
        filtered_questions = [q for q in filtered_questions if q.get("category") == category]
    
    random.shuffle(filtered_questions)
    session["questions"] = filtered_questions
    session["score"] = 0
    return jsonify(filtered_questions)

@app.route("/submit_answer/<int:question_index>/<answer>")
def submit_answer(question_index, answer):
    filtered_questions = session.get("questions", [])
    score = session.get("score", 0)

    if question_index >= len(filtered_questions):
        return jsonify({"status": "finished", "score": score, "total": len(filtered_questions)})

    correct_answer = filtered_questions[question_index]["answer"]
    explanation = filtered_questions[question_index]["explanation"]

    if answer.strip().lower() == correct_answer.lower():
        score += 1
        session["score"] = score
        return jsonify({"correct": True, "explanation": explanation, "score": score})
    else:
        return jsonify({"correct": False, "explanation": explanation, "correct_answer": correct_answer, "score": score})

if __name__ == "__main__":
    app.run(debug=True)
