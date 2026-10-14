"use strict";

// Add more subjects and questions here. correctAnswer is the zero-based option index.
const subjects = [
  {
    id: "html", title: "HTML Basics", icon: "🌐", description: "Learn how web pages are structured.",
    questions: [
      { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Text Machine Language", "Hyper Tool Markup Language", "Home Text Markup Language"], correctAnswer: 0 },
      { question: "Which tag creates a hyperlink?", options: ["<link>", "<a>", "<href>", "<url>"], correctAnswer: 1 },
      { question: "Which HTML element represents the largest heading by default?", options: ["<h6>", "<head>", "<h1>", "<header>"], correctAnswer: 2 },
      { question: "Which attribute provides alternative text for an image?", options: ["src", "title", "href", "alt"], correctAnswer: 3 },
      { question: "Which tag is used for an unordered list?", options: ["<ul>", "<ol>", "<li>", "<dl>"], correctAnswer: 0 }
    ]
  },
  {
    id: "css", title: "CSS Fundamentals", icon: "🎨", description: "Style layouts, colors, and typography.",
    questions: [
      { question: "What does CSS stand for?", options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style System", "Color Style Syntax"], correctAnswer: 1 },
      { question: "Which property changes text color?", options: ["font-color", "text-style", "color", "background"], correctAnswer: 2 },
      { question: "Which selector targets an element with id=\"main\"?", options: [".main", "main", "*main", "#main"], correctAnswer: 3 },
      { question: "Which property controls the space inside an element's border?", options: ["padding", "margin", "gap", "outline"], correctAnswer: 0 },
      { question: "Which value makes an element a flex container?", options: ["position: flex", "display: flex", "layout: flex", "float: flex"], correctAnswer: 1 }
    ]
  },
  {
    id: "javascript", title: "JavaScript Essentials", icon: "⚡", description: "Practice variables, logic, and events.",
    questions: [
      { question: "Which keyword declares a variable that can be reassigned?", options: ["const", "static", "let", "fixed"], correctAnswer: 2 },
      { question: "What does === compare in JavaScript?", options: ["Only value", "Only type", "Variable names", "Value and type"], correctAnswer: 3 },
      { question: "Which method adds an item to the end of an array?", options: ["push()", "pop()", "shift()", "slice()"], correctAnswer: 0 },
      { question: "Which method selects the first element matching a CSS selector?", options: ["getElementsByClassName()", "querySelector()", "querySelectorAll()", "createElement()"], correctAnswer: 1 },
      { question: "What is the result of 2 + 3 * 4?", options: ["20", "24", "14", "9"], correctAnswer: 2 }
    ]
  }
];

const $ = (id) => document.getElementById(id);
const screens = ["home-screen", "quiz-screen", "result-screen"];
const LETTERS = ["A", "B", "C", "D"];
const QUIZ_SECONDS = 60;
let activeSubject = null;
let questionIndex = 0;
let answers = [];
let secondsLeft = QUIZ_SECONDS;
let timerInterval = null;
let finished = false;

function showScreen(screenId) {
  screens.forEach((id) => $(id).classList.toggle("hidden", id !== screenId));
  window.scrollTo(0, 0);
}

function getBestScore(subjectId) {
  try {
    const value = localStorage.getItem(`quizmaster-best-${subjectId}`);
    return value === null ? null : Number(value);
  } catch { return null; }
}

function saveBestScore(subjectId, score) {
  try {
    const previous = getBestScore(subjectId);
    if (previous === null || score > previous) localStorage.setItem(`quizmaster-best-${subjectId}`, String(score));
  } catch { /* The quiz still works when browser storage is disabled. */ }
}

function renderSubjects() {
  const list = $("subject-list");
  list.replaceChildren();
  subjects.forEach((subject) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "subject-card";
    const icon = document.createElement("span");
    icon.className = "subject-icon";
    icon.textContent = subject.icon;
    const heading = document.createElement("h3");
    heading.textContent = subject.title;
    const description = document.createElement("p");
    description.textContent = subject.description;
    const detail = document.createElement("small");
    const best = getBestScore(subject.id);
    detail.textContent = `${subject.questions.length} questions • Best: ${best === null ? "Not attempted" : `${best}/${subject.questions.length}`}`;
    card.append(icon, heading, description, detail);
    card.addEventListener("click", () => startQuiz(subject.id));
    list.append(card);
  });
}

function stopTimer() {
  if (timerInterval !== null) clearInterval(timerInterval);
  timerInterval = null;
}

function updateTimer() {
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");
  $("timer").textContent = `⏱ ${minutes}:${seconds}`;
  $("timer").classList.toggle("warning", secondsLeft <= 15);
}

function startQuiz(subjectId) {
  const subject = subjects.find((item) => item.id === subjectId);
  if (!subject) return;
  stopTimer();
  activeSubject = subject;
  questionIndex = 0;
  answers = Array(subject.questions.length).fill(null);
  secondsLeft = QUIZ_SECONDS;
  finished = false;
  $("quiz-subject").textContent = subject.title.toUpperCase();
  $("quiz-title").textContent = "Test your knowledge";
  updateTimer();
  renderQuestion();
  showScreen("quiz-screen");
  timerInterval = setInterval(() => {
    secondsLeft = Math.max(0, secondsLeft - 1);
    updateTimer();
    if (secondsLeft === 0) finishQuiz();
  }, 1000);
}

function renderQuestion() {
  if (!activeSubject || finished) return;
  const questions = activeSubject.questions;
  const current = questions[questionIndex];
  $("progress-text").textContent = `Question ${questionIndex + 1} of ${questions.length}`;
  $("answered-text").textContent = `${answers.filter((answer) => answer !== null).length} answered`;
  $("progress-fill").style.width = `${((questionIndex + 1) / questions.length) * 100}%`;
  $("question-text").textContent = current.question;
  const optionsContainer = $("options");
  optionsContainer.replaceChildren();
  current.options.forEach((optionText, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `option${answers[questionIndex] === index ? " selected" : ""}`;
    button.setAttribute("aria-pressed", String(answers[questionIndex] === index));
    const letter = document.createElement("span");
    letter.className = "option-letter";
    letter.textContent = LETTERS[index];
    const label = document.createElement("span");
    label.textContent = optionText;
    button.append(letter, label);
    button.addEventListener("click", () => {
      answers[questionIndex] = index;
      renderQuestion();
    });
    optionsContainer.append(button);
  });
  $("previous-btn").disabled = questionIndex === 0;
  $("next-btn").textContent = questionIndex === questions.length - 1 ? "Submit Quiz ✓" : "Next →";
}

function finishQuiz() {
  if (!activeSubject || finished) return;
  finished = true;
  stopTimer();
  const questions = activeSubject.questions;
  const score = questions.reduce((total, question, index) => total + Number(answers[index] === question.correctAnswer), 0);
  saveBestScore(activeSubject.id, score);
  const percentage = Math.round((score / questions.length) * 100);
  $("score-display").textContent = `${percentage}%`;
  $("score-detail").textContent = `You answered ${score} out of ${questions.length} questions correctly.`;
  $("result-message").textContent = percentage === 100 ? "Perfect score! Excellent work." : percentage >= 60 ? "Nice work! Keep practicing." : "Good effort! Review your answers and try again.";
  $("best-score").textContent = `Your best score: ${getBestScore(activeSubject.id)} / ${questions.length}`;
  const review = $("review-list");
  review.replaceChildren();
  questions.forEach((question, index) => {
    const answer = answers[index];
    const correct = answer === question.correctAnswer;
    const item = document.createElement("article");
    item.className = "review-item";
    const heading = document.createElement("h3");
    heading.textContent = `${index + 1}. ${question.question}`;
    const yourAnswer = document.createElement("p");
    yourAnswer.className = correct ? "correct" : "incorrect";
    yourAnswer.textContent = `Your answer: ${answer === null ? "Not answered" : question.options[answer]} ${correct ? "✓" : "✗"}`;
    const correctAnswer = document.createElement("p");
    correctAnswer.textContent = `Correct answer: ${question.options[question.correctAnswer]}`;
    item.append(heading, yourAnswer, correctAnswer);
    review.append(item);
  });
  showScreen("result-screen");
}

function goHome() {
  stopTimer();
  finished = true;
  activeSubject = null;
  renderSubjects();
  showScreen("home-screen");
}

$("previous-btn").addEventListener("click", () => {
  if (questionIndex > 0) { questionIndex--; renderQuestion(); }
});
$("next-btn").addEventListener("click", () => {
  if (!activeSubject || finished) return;
  if (questionIndex === activeSubject.questions.length - 1) finishQuiz();
  else { questionIndex++; renderQuestion(); }
});
$("quit-btn").addEventListener("click", () => {
  if (confirm("Quit this quiz? Your current answers will be lost.")) goHome();
});
$("retry-btn").addEventListener("click", () => {
  if (activeSubject) startQuiz(activeSubject.id);
});
$("home-btn").addEventListener("click", goHome);
$("logo").addEventListener("click", (event) => {
  event.preventDefault();
  if (activeSubject && !finished && !confirm("Leave this quiz? Your current answers will be lost.")) return;
  goHome();
});
renderSubjects();
