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

## Project setup instructions

The project is a frontend-only React application. The runnable project is
inside the `frontend` directory. Node.js 18 or newer is recommended because
the project uses modern Vite and Tailwind tooling.

Clone the repository and enter the frontend directory:

```bash
git clone https://github.com/Nikhil24005/Innosoft-project.git
cd Innosoft-project/frontend
```

## How to install dependencies

Install the dependencies from the `frontend` directory:

```bash
npm install
```

## How to run the project locally

Start the Vite development server:

```bash
npm run dev
```

Open the URL printed in the terminal, usually:

```text
http://localhost:5173
```

To create a production build:

```bash
npm run build
```

To run the automated tests:

```bash
npm test
```

## Technologies used

- **React** for the single-page user interface.
- **JavaScript and JSX** for application logic and components.
- **Vite** for development, bundling, and production builds.
- **Tailwind CSS** for utility-first responsive styling.
- **Vitest** for frontend tests.
- **Browser localStorage** for saving assessment progress locally.
- **Local JSON** for the ten assessment questions and explanations.

## Important implementation details

- `frontend/src/App.jsx` contains the assessment UI and the single
  `useReducer` used to manage status, current question, selected answers,
  remaining time, and score.
- `frontend/src/data/questions.json` is the local source for all ten questions,
  answer options, correct answers, and explanations.
- The timer dispatches a reducer action every second and automatically submits
  the assessment when it reaches zero.
- The current reducer state is serialized to `localStorage` after every state
  change, allowing progress to be restored after a page refresh.
- The result screen is rendered on the same page and includes the percentage,
  correct/incorrect counts, selected answers, correct answers, and explanations.
- The restart action resets the reducer to its initial state and starts a new
  attempt.
- Tailwind is loaded internally through `frontend/src/tailwind.css` and the
  `@tailwindcss/vite` plugin in `frontend/vite.config.js`; no custom
  `index.css` file is required.

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
