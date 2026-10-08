# Assessly

Assessly is a responsive, single-page assessment application built with
**React**, **JavaScript/JSX**, **Vite**, and **Tailwind CSS**. It tests frontend
fundamentals with ten multiple-choice questions and provides an interactive
result review when the assessment is complete.

## Features

- Start screen with assessment instructions and duration.
- Ten locally defined questions stored in JSON.
- One React `useReducer` manages the full assessment state.
- Answer selection and question navigation.
- Ten-minute countdown timer.
- Automatic submission when the timer reaches zero.
- Progress saved to `localStorage`, including the current question and answers.
- Same-page results screen with score percentage.
- Review section showing selected answers, correct answers, and explanations.
- Restart assessment action.
- Responsive layout for desktop, tablet, and mobile screens.
- Tailwind CSS v4 integrated through the Vite plugin.

## Tech stack

- React 18
- JavaScript and JSX
- Vite
- Tailwind CSS 4
- Vitest

## Project structure

```text
.
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx                  # Assessment UI and useReducer logic
│       ├── App.test.jsx             # Frontend smoke test
│       ├── main.jsx                 # React entry point
│       ├── data/
│       │   └── questions.json       # Ten questions and explanations
│       ├── types/
│       │   └── assessment.js        # Initial reducer state
│       └── tailwind.css             # Internal Tailwind entry point
└── README.md
```

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Build and test

```bash
cd frontend
npm run build
npm test
```

## State management

The assessment state is kept in `App.jsx` and includes:

- `status`: `ready`, `in-progress`, or `submitted`
- `currentQuestion`: active question index
- `answers`: selected answer by question ID
- `secondsRemaining`: countdown value
- `score`: calculated score after submission

Every state update is serialized to `localStorage` under the key
`frontend-assessment-state`. A malformed saved value is ignored and logged,
allowing a fresh assessment to start safely.

## GitHub submission

From the project root:

```bash
git add .
git commit -m "Update assessment documentation and structure"
git push
```
