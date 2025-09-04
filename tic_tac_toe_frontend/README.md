# Tic Tac Toe Frontend (React)

A modern, lightweight Tic Tac Toe game with a centered 3x3 grid, local two-player turns, restart option, and result modals.

## Features

- Local two-player gameplay (X and O alternate)
- Turn indicator with highlight
- Win/draw detection with modal popup
- Restart game option
- Modern light theme with optional dark mode
- Top menu with theme toggle and restart
- Supabase environment recognition (no network calls) via `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_KEY`

## Colors

- Primary: `#1976d2`
- Accent: `#f44336`
- Secondary (surface): `#ffffff`

## Environment Variables

Create a `.env` (or set in deployment) with:
```
REACT_APP_SUPABASE_URL=<your-supabase-url>
REACT_APP_SUPABASE_KEY=<your-supabase-anon-key>
```

These are read at runtime for future integration. The UI shows whether env vars are present.

## Scripts

- `npm start` — development server at http://localhost:3000
- `npm test` — run tests
- `npm run build` — production build

## Project Structure

- `src/App.js` — app shell, game logic, modals
- `src/App.css` — styles (topbar, grid, modal)
- `src/supabaseConfig.js` — env-based supabase config helper

## Notes

- No backend required for local play.
- This app avoids heavy UI frameworks to stay lightweight.
