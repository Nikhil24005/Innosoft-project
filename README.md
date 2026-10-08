# Assessly — frontend assessment

Assessly is a responsive single-page assessment application built with React and
plain JavaScript. It presents ten frontend fundamentals questions, gives the user ten
minutes to complete them, persists progress in `localStorage`, and shows a score
and answer review after submission.

## Assessment behavior

- Questions are defined in [frontend/src/data/questions.json](./frontend/src/data/questions.json).
- One `useReducer` in `frontend/src/App.jsx` owns the assessment status, selected
  answers, active question, timer, and score.
- The timer dispatches one `TICK` action per second and automatically submits at
  zero.
- State is saved under `frontend-assessment-state` after every reducer update,
  so refreshing the page does not lose progress.
- The results and review are rendered on the same page; **Restart assessment**
  clears the reducer state and starts a fresh attempt.

## Structure

```text
.
├── frontend/                 # React client application
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── data/              # Local assessment question JSON
│       ├── components/       # Reusable UI components
│       ├── hooks/            # Reusable React hooks
│       ├── layouts/          # Page-level layouts
│       ├── pages/            # Route-level screens
│       ├── services/         # API clients and remote calls
│       ├── types/            # Shared frontend types
│       └── utils/            # Pure helper functions
├── backend/                  # Express API
│   └── src/
│       ├── config/           # Environment and app configuration
│       ├── controllers/      # HTTP request handlers
│       ├── middleware/       # Auth, errors, validation, logging
│       ├── models/           # Persistence models
│       ├── routes/           # API route definitions
│       ├── services/         # Business logic
│       └── utils/            # Backend helpers
├── .env.example
└── package.json
```

## Development

```bash
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and the API on `http://localhost:4000`.

To run the frontend checks:

```bash
cd frontend
npm run build
npm test
```

## GitHub submission

Create an empty public repository on GitHub, then connect and push this project:

```bash
git init
git add .
git commit -m "Build assessment SPA"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repository>.git
git push -u origin main
```

Replace the remote URL with the public repository URL created in your GitHub
account.
