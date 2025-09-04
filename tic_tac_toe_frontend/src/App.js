import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import { logCompletedGame } from './supabaseClient';

/**
 * Top-level Tic Tac Toe App with a modern light design.
 * - Displays a top menu with title and Restart action.
 * - Centers a 3x3 grid board for local two-player play.
 * - Shows turn-based state, and modal popups for win/draw.
 * - Logs completed games to Supabase if environment variables are configured.
 */

// Helpers
const INITIAL_BOARD = Array(9).fill(null);
const PLAYERS = { X: 'X', O: 'O' };

// Square component
function Square({ value, onClick, highlight }) {
  return (
    <button
      className={`ttt-square ${highlight ? 'highlight' : ''}`}
      onClick={onClick}
      aria-label={`square ${value ?? 'empty'}`}
    >
      {value}
    </button>
  );
}

// Board component
function Board({ board, onSquareClick, winningLine }) {
  const renderSquare = (i) => {
    const isHighlight = winningLine?.includes(i);
    return (
      <Square
        key={i}
        value={board[i]}
        onClick={() => onSquareClick(i)}
        highlight={isHighlight}
      />
    );
  };

  return (
    <div className="ttt-grid" role="grid" aria-label="tic tac toe board">
      {board.map((_, i) => renderSquare(i))}
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  // Theme handling (light by default)
  const [theme, setTheme] = useState('light');

  // Game state
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [xIsNext, setXIsNext] = useState(true);
  const [modal, setModal] = useState({ open: false, title: '', subtitle: '' });
  // Track moves for logging: { index, player, moveNumber }
  const [moves, setMoves] = useState([]);

  // Supabase env recognition (for footer indicator)
  const supabaseConfig = useMemo(() => {
    return {
      url: process.env.REACT_APP_SUPABASE_URL || '',
      key: process.env.REACT_APP_SUPABASE_KEY || '',
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Determine winner and game status
  const { winner, winningLine } = useMemo(() => calculateWinner(board), [board]);

  const isDraw = useMemo(() => !winner && board.every((c) => c !== null), [board, winner]);
  const currentPlayer = xIsNext ? PLAYERS.X : PLAYERS.O;

  // When game ends, show modal and log to Supabase
  useEffect(() => {
    async function handleGameEnd() {
      if (winner || isDraw) {
        // Show modal
        if (winner) {
          setModal({
            open: true,
            title: 'We have a winner 🎉',
            subtitle: `Player ${winner} wins!`,
          });
        } else if (isDraw) {
          setModal({
            open: true,
            title: 'It’s a draw 🤝',
            subtitle: 'No more moves left.',
          });
        }

        // Log to Supabase (non-blocking UI)
        try {
          const { success, error } = await logCompletedGame({
            moves,
            winner,
          });
          if (!success) {
            // Keep logging minimal to console to avoid UI noise
            // eslint-disable-next-line no-console
            console.warn('Supabase log failed:', error);
          } else {
            // eslint-disable-next-line no-console
            console.log('Game logged to Supabase');
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('Supabase log threw error:', e?.message || e);
        }
      }
    }
    handleGameEnd();
    // Only run when game ends or moves list changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winner, isDraw]);

  const handleSquareClick = (index) => {
    if (winner || board[index] !== null || isDraw) return;

    const next = board.slice();
    next[index] = currentPlayer;
    setBoard(next);
    setXIsNext(!xIsNext);
    setMoves((prev) => [
      ...prev,
      { index, player: currentPlayer, moveNumber: prev.length + 1 },
    ]);
  };

  // PUBLIC_INTERFACE
  const restartGame = () => {
    setBoard(INITIAL_BOARD);
    setXIsNext(true);
    setModal({ open: false, title: '', subtitle: '' });
    setMoves([]);
  };

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="App app-shell">
      {/* Top Menu */}
      <nav className="topbar">
        <div className="brand">
          <span className="brand-dot" />
          <span className="brand-title">Tic Tac Toe</span>
        </div>
        <div className="menu-actions">
          <button className="btn ghost" onClick={toggleTheme} aria-label="toggle theme">
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
          <button className="btn danger" onClick={restartGame} aria-label="restart game">
            Restart
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="content">
        <div className="game-card">
          <div className="status-bar">
            {!winner && !isDraw ? (
              <span className="turn-indicator">
                Turn: <strong className="pill">{currentPlayer}</strong>
              </span>
            ) : (
              <span className="turn-indicator">
                Game Over
              </span>
            )}
          </div>
          <Board board={board} onSquareClick={handleSquareClick} winningLine={winningLine} />

          {/* Footer tips */}
          <div className="footer-bar">
            <span className="hint">Play locally: players alternate as X and O.</span>
            {supabaseConfig.url && supabaseConfig.key ? (
              <span className="env-ok" title="Supabase environment detected">
                Supabase env OK
              </span>
            ) : (
              <span className="env-missing" title="Supabase env not set">
                Supabase env not set
              </span>
            )}
          </div>
        </div>
      </main>

      {/* Result Modal */}
      {modal.open && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <h2 className="modal-title">{modal.title}</h2>
            <p className="modal-subtitle">{modal.subtitle}</p>
            <div className="modal-actions">
              <button className="btn primary" onClick={restartGame}>Play Again</button>
              <button className="btn ghost" onClick={() => setModal({ open: false, title: '', subtitle: '' })}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

// Calculate winner and return winner + winning line indices
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], // rows
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6], // cols
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8], // diagonals
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], winningLine: [a, b, c] };
    }
  }
  return { winner: null, winningLine: null };
}
