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
    <main className="min-h-screen bg-slate-50 bg-[radial-gradient(circle_at_85%_8%,#eff6ff_0,transparent_27rem)] text-slate-800">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <a className="flex items-center gap-2.5 font-['Plus_Jakarta_Sans'] text-xl font-bold" href="/" aria-label="Assessment home">
          <span className="grid size-8 place-items-center rounded-[10px] bg-indigo-600 font-['Plus_Jakarta_Sans'] text-[17px] font-extrabold text-white">A</span>
          <span>Assessly</span>
        </a>
        {state.status !== "ready" && (
          <span className="text-sm text-slate-500">
            {assessmentQuestions.length} question assessment
          </span>
        )}
      </header>

      {state.status === "ready" && (
        <section className="mx-auto mt-[6vh] max-w-3xl px-5 pb-20 text-center sm:mt-[8vh] sm:px-8" aria-labelledby="welcome-title">
          <div className="text-xs font-bold uppercase tracking-[.13em] text-indigo-600">Frontend fundamentals</div>
          <h1 id="welcome-title" className="my-5 font-['Plus_Jakarta_Sans'] text-4xl font-extrabold leading-tight tracking-[-.045em] sm:text-6xl">Test your knowledge.<br /><span className="text-indigo-600">Track your progress.</span></h1>
          <p className="mx-auto mb-10 max-w-xl text-[17px] leading-7 text-slate-500">A focused assessment covering HTML, CSS, JavaScript, React, and web development essentials.</p>
          <div className="mb-10 flex justify-center">
            <div className="flex min-w-0 flex-col border-r border-slate-200 px-4 py-2 sm:min-w-32 sm:px-6"><strong className="font-['Plus_Jakarta_Sans'] text-2xl">10</strong><span className="mt-1 text-xs text-slate-400">Questions</span></div>
            <div className="flex min-w-0 flex-col border-r border-slate-200 px-4 py-2 sm:min-w-32 sm:px-6"><strong className="font-['Plus_Jakarta_Sans'] text-2xl">10</strong><span className="mt-1 text-xs text-slate-400">Minutes</span></div>
            <div className="flex min-w-0 flex-col px-4 py-2 sm:min-w-32 sm:px-6"><strong className="font-['Plus_Jakarta_Sans'] text-2xl">1</strong><span className="mt-1 text-xs text-slate-400">Attempt</span></div>
          </div>
          <button className="rounded-[10px] bg-indigo-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:shadow-xl" onClick={() => dispatch({ type: "START" })}>Start assessment <span className="ml-3" aria-hidden="true">→</span></button>
          <p className="mt-4 text-xs text-slate-400">Your progress is saved automatically</p>
        </section>
      )}

      {state.status === "in-progress" && currentQuestion && (
        <section className="mx-auto grid max-w-6xl gap-6 px-5 py-8 pb-16 sm:px-8 lg:grid-cols-[minmax(0,760px)_270px] lg:gap-12" aria-labelledby="question-title">
          <div className="quiz-main">
            <div className="mb-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <div className="text-xs font-bold uppercase tracking-[.13em] text-indigo-600">Question {state.currentQuestion + 1} of {assessmentQuestions.length}</div>
                <div className="mt-3 h-1.5 w-56 overflow-hidden rounded bg-slate-200"><span className="block h-full rounded bg-indigo-600" style={{ width: `${((state.currentQuestion + 1) / assessmentQuestions.length) * 100}%` }} /></div>
              </div>
              <div className={`rounded-lg border px-3 py-2 font-bold tracking-wider ${state.secondsRemaining < 60 ? "border-red-200 bg-red-50 text-red-600" : "border-slate-200 bg-white text-indigo-600"}`} aria-label={`${formatTime(state.secondsRemaining)} remaining`}>
                <span aria-hidden="true">◷</span> {formatTime(state.secondsRemaining)}
              </div>
            </div>
            <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-9">
              <h1 id="question-title" className="mb-8 font-['Plus_Jakarta_Sans'] text-2xl font-bold leading-relaxed sm:text-3xl">{currentQuestion.question}</h1>
              <div className="grid gap-3" role="radiogroup" aria-label="Answer options">
                {currentQuestion.options.map((option, index) => {
                  const selected = state.answers[currentQuestion.id] === index;
                  return (
                    <button className={`flex w-full items-center gap-4 rounded-[10px] border p-4 text-left transition ${selected ? "border-indigo-600 bg-indigo-50 text-indigo-900 shadow-[0_0_0_1px_#4f46e5]" : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/30"}`} key={option} onClick={() => dispatch({ type: "SELECT_ANSWER", questionId: currentQuestion.id, answer: index })} role="radio" aria-checked={selected}>
                      <span className={`grid size-7 shrink-0 place-items-center rounded-lg text-sm font-bold ${selected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>{String.fromCharCode(65 + index)}</span>
                      <span>{option}</span>
                      {selected && <span className="ml-auto font-bold text-indigo-600" aria-hidden="true">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-6 flex justify-between gap-4">
              <button className="rounded-[10px] border border-slate-200 px-4 py-3 text-sm font-bold text-slate-500" disabled={state.currentQuestion === 0} onClick={() => dispatch({ type: "GO_TO_QUESTION", index: state.currentQuestion - 1 })}>← Previous</button>
              {state.currentQuestion === assessmentQuestions.length - 1 ? (
                <button className="rounded-[10px] bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20" onClick={submitAssessment}>Submit assessment <span className="ml-3" aria-hidden="true">→</span></button>
              ) : (
                <button className="rounded-[10px] bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20" onClick={() => dispatch({ type: "GO_TO_QUESTION", index: state.currentQuestion + 1 })}>Next question <span className="ml-3" aria-hidden="true">→</span></button>
              )}
            </div>
          </div>
          <aside className="order-last self-start rounded-[14px] border border-slate-200 bg-white p-4 lg:order-none lg:p-6" aria-label="Question navigation">
            <h2 className="font-['Plus_Jakarta_Sans'] text-base font-bold">Your progress</h2>
            <p className="my-2 mb-5 text-sm text-slate-400">{answeredCount} of {assessmentQuestions.length} answered</p>
            <div className="grid grid-cols-10 gap-1.5 lg:grid-cols-5 lg:gap-2">
              {assessmentQuestions.map((question, index) => (
                <button key={question.id} className={`aspect-square max-w-9 rounded-md border text-xs font-semibold lg:max-w-none lg:rounded-lg lg:text-sm ${index === state.currentQuestion ? "border-indigo-600 bg-indigo-600 text-white" : state.answers[question.id] !== undefined ? "border-indigo-300 bg-indigo-300 text-white" : "border-slate-200 bg-white text-slate-500"}`} onClick={() => dispatch({ type: "GO_TO_QUESTION", index })} aria-label={`Go to question ${index + 1}`}>{index + 1}</button>
              ))}
            </div>
            <button className="mt-4 border-0 bg-transparent p-0 text-sm font-bold text-indigo-600" onClick={submitAssessment}>Submit now</button>
          </aside>
        </section>
      )}

      {state.status === "submitted" && (
        <section className="mx-auto max-w-5xl px-5 pb-16 sm:px-8" aria-labelledby="results-title">
          <div className="rounded-[18px] bg-gradient-to-br from-blue-950 to-indigo-600 px-6 py-12 text-center text-white">
            <div className="text-xs font-bold uppercase tracking-[.13em] text-indigo-200">Assessment complete</div>
            <h1 id="results-title" className="my-4 font-['Plus_Jakarta_Sans'] text-3xl font-bold sm:text-4xl">Here’s your result.</h1>
            <div className="mx-auto mb-5 grid size-36 place-items-center rounded-full border-8 border-white/25 bg-white/10"><strong className="font-['Plus_Jakarta_Sans'] text-4xl">{percentage}%</strong><span className="-mt-7 text-xs text-indigo-100">{score} / {assessmentQuestions.length}</span></div>
            <p className="mb-6 text-indigo-100">{percentage >= 70 ? "Great work! You have a strong foundation." : "Keep practicing. Every attempt is progress."}</p>
            <button className="rounded-[10px] bg-white px-5 py-3 font-bold text-indigo-800" onClick={() => dispatch({ type: "RESTART" })}>Restart assessment <span className="ml-3" aria-hidden="true">↻</span></button>
          </div>
          <div className="mt-12">
            <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end"><div><div className="text-xs font-bold uppercase tracking-[.13em] text-indigo-600">Answer review</div><h2 className="mt-2 font-['Plus_Jakarta_Sans'] text-2xl font-bold">See what you got right.</h2></div><span className="text-sm text-slate-400">{score} correct · {assessmentQuestions.length - score} to review</span></div>
            <div className="grid gap-3">
              {assessmentQuestions.map((question, index) => {
                const selected = state.answers[question.id];
                const correct = selected === question.answer;
                return (
                  <article className="flex gap-4 rounded-[13px] border border-slate-200 bg-white p-5" key={question.id}>
                    <div className={`grid size-7 shrink-0 place-items-center rounded-full font-bold text-white ${correct ? "bg-emerald-600" : "bg-red-500"}`}>{correct ? "✓" : "×"}</div>
                    <div className="min-w-0"><div className="mb-2 text-[11px] font-bold uppercase tracking-[.1em] text-slate-400">Question {index + 1}</div><h3 className="mb-3 font-['Plus_Jakarta_Sans'] text-base font-bold">{question.question}</h3><p className="my-1 text-sm text-slate-500"><strong>Your answer:</strong> {selected === undefined ? "Not answered" : question.options[selected]}</p>{!correct && <p className="my-1 text-sm text-red-600"><strong>Correct answer:</strong> {question.options[question.answer]}</p>}<p className="mt-3 text-sm italic text-slate-400">{question.explanation}</p></div>
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
