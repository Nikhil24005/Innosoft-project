import React, { useEffect, useMemo, useReducer } from "react";
import questions from "./data/questions.json";
import { initialState } from "./types/assessment.js";

const assessmentQuestions = questions;
const STORAGE_KEY = "frontend-assessment-state";
const ASSESSMENT_DURATION = 10 * 60;

function reducer(state, action) {
  switch (action.type) {
    case "START":
      return { ...state, status: "in-progress" };
    case "SELECT_ANSWER":
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.answer },
      };
    case "GO_TO_QUESTION":
      return {
        ...state,
        currentQuestion: Math.max(
          0,
          Math.min(action.index, assessmentQuestions.length - 1),
        ),
      };
    case "TICK":
      if (state.status !== "in-progress") return state;
      if (state.secondsRemaining <= 1) {
        return { ...state, secondsRemaining: 0, status: "submitted", score: null };
      }
      return { ...state, secondsRemaining: state.secondsRemaining - 1 };
    case "SUBMIT":
      return { ...state, status: "submitted", score: action.score };
    case "RESTART":
      return initialState;
    case "RESTORE":
      return action.state;
    default:
      return state;
  }
}

function loadSavedState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialState;
    const parsed = JSON.parse(saved);
    if (
      parsed &&
      ["ready", "in-progress", "submitted"].includes(parsed.status) &&
      typeof parsed.currentQuestion === "number" &&
      typeof parsed.answers === "object" &&
      typeof parsed.secondsRemaining === "number"
    ) {
      return parsed;
    }
  } catch (error) {
    console.error("Unable to restore the saved assessment state.", error);
  }
  return initialState;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function calculateScore(state) {
  return assessmentQuestions.reduce(
    (total, question) =>
      total + (state.answers[question.id] === question.answer ? 1 : 0),
    0,
  );
}

export function App() {
  const [state, dispatch] = useReducer(reducer, initialState, loadSavedState);
  const currentQuestion = assessmentQuestions[state.currentQuestion];
  const answeredCount = Object.keys(state.answers).length;
  const score = state.score ?? calculateScore(state);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (state.status !== "in-progress") return undefined;
    const timer = window.setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => window.clearInterval(timer);
  }, [state.status]);

  useEffect(() => {
    if (state.status === "submitted" && state.score === null) {
      dispatch({ type: "SUBMIT", score: calculateScore(state) });
    }
  }, [state]);

  const percentage = useMemo(
    () => Math.round((score / assessmentQuestions.length) * 100),
    [score],
  );

  function submitAssessment() {
    dispatch({ type: "SUBMIT", score: calculateScore(state) });
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Assessment home">
          <span className="brand-mark">A</span>
          <span>Assessly</span>
        </a>
        {state.status !== "ready" && (
          <span className="question-count">
            {assessmentQuestions.length} question assessment
          </span>
        )}
      </header>

      {state.status === "ready" && (
        <section className="start-card" aria-labelledby="welcome-title">
          <div className="eyebrow">Frontend fundamentals</div>
          <h1 id="welcome-title">Test your knowledge.<br /><span>Track your progress.</span></h1>
          <p className="intro">A focused assessment covering HTML, CSS, JavaScript, React, and web development essentials.</p>
          <div className="assessment-meta">
            <div><strong>{assessmentQuestions.length}</strong><span>Questions</span></div>
            <div><strong>10</strong><span>Minutes</span></div>
            <div><strong>1</strong><span>Attempt</span></div>
          </div>
          <button className="primary-button start-button" onClick={() => dispatch({ type: "START" })}>Start assessment <span aria-hidden="true">→</span></button>
          <p className="save-note">Your progress is saved automatically</p>
        </section>
      )}

      {state.status === "in-progress" && currentQuestion && (
        <section className="quiz-layout" aria-labelledby="question-title">
          <div className="quiz-main">
            <div className="quiz-heading">
              <div>
                <div className="eyebrow">Question {state.currentQuestion + 1} of {assessmentQuestions.length}</div>
                <div className="progress-track"><span style={{ width: `${((state.currentQuestion + 1) / assessmentQuestions.length) * 100}%` }} /></div>
              </div>
              <div className={`timer ${state.secondsRemaining < 60 ? "timer-warning" : ""}`} aria-label={`${formatTime(state.secondsRemaining)} remaining`}>
                <span aria-hidden="true">◷</span> {formatTime(state.secondsRemaining)}
              </div>
            </div>
            <div className="question-card">
              <h1 id="question-title">{currentQuestion.question}</h1>
              <div className="options" role="radiogroup" aria-label="Answer options">
                {currentQuestion.options.map((option, index) => {
                  const selected = state.answers[currentQuestion.id] === index;
                  return (
                    <button className={`option ${selected ? "option-selected" : ""}`} key={option} onClick={() => dispatch({ type: "SELECT_ANSWER", questionId: currentQuestion.id, answer: index })} role="radio" aria-checked={selected}>
                      <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                      <span>{option}</span>
                      {selected && <span className="option-check" aria-hidden="true">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="quiz-actions">
              <button className="secondary-button" disabled={state.currentQuestion === 0} onClick={() => dispatch({ type: "GO_TO_QUESTION", index: state.currentQuestion - 1 })}>← Previous</button>
              {state.currentQuestion === assessmentQuestions.length - 1 ? (
                <button className="primary-button" onClick={submitAssessment}>Submit assessment <span aria-hidden="true">→</span></button>
              ) : (
                <button className="primary-button" onClick={() => dispatch({ type: "GO_TO_QUESTION", index: state.currentQuestion + 1 })}>Next question <span aria-hidden="true">→</span></button>
              )}
            </div>
          </div>
          <aside className="question-nav" aria-label="Question navigation">
            <h2>Your progress</h2>
            <p>{answeredCount} of {assessmentQuestions.length} answered</p>
            <div className="question-grid">
              {assessmentQuestions.map((question, index) => (
                <button key={question.id} className={`number-button ${index === state.currentQuestion ? "number-current" : ""} ${state.answers[question.id] !== undefined ? "number-answered" : ""}`} onClick={() => dispatch({ type: "GO_TO_QUESTION", index })} aria-label={`Go to question ${index + 1}`}>{index + 1}</button>
              ))}
            </div>
            <button className="submit-link" onClick={submitAssessment}>Submit now</button>
          </aside>
        </section>
      )}

      {state.status === "submitted" && (
        <section className="results-page" aria-labelledby="results-title">
          <div className="result-hero">
            <div className="eyebrow">Assessment complete</div>
            <h1 id="results-title">Here’s your result.</h1>
            <div className="score-circle"><strong>{percentage}%</strong><span>{score} / {assessmentQuestions.length}</span></div>
            <p>{percentage >= 70 ? "Great work! You have a strong foundation." : "Keep practicing. Every attempt is progress."}</p>
            <button className="primary-button" onClick={() => dispatch({ type: "RESTART" })}>Restart assessment <span aria-hidden="true">↻</span></button>
          </div>
          <div className="review-section">
            <div className="review-heading"><div><div className="eyebrow">Answer review</div><h2>See what you got right.</h2></div><span>{score} correct · {assessmentQuestions.length - score} to review</span></div>
            <div className="review-list">
              {assessmentQuestions.map((question, index) => {
                const selected = state.answers[question.id];
                const correct = selected === question.answer;
                return (
                  <article className={`review-item ${correct ? "review-correct" : "review-incorrect"}`} key={question.id}>
                    <div className="review-status">{correct ? "✓" : "×"}</div>
                    <div className="review-content"><div className="review-number">Question {index + 1}</div><h3>{question.question}</h3><p><strong>Your answer:</strong> {selected === undefined ? "Not answered" : question.options[selected]}</p>{!correct && <p className="correct-answer"><strong>Correct answer:</strong> {question.options[question.answer]}</p>}<p className="explanation">{question.explanation}</p></div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
