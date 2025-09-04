import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Tic Tac Toe title and grid', () => {
  render(<App />);
  expect(screen.getByText(/Tic Tac Toe/i)).toBeInTheDocument();
  const grid = screen.getByRole('grid', { name: /tic tac toe board/i });
  expect(grid).toBeInTheDocument();
});
