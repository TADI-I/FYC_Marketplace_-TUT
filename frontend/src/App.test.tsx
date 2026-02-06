import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders FYC Marketplace', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /FYC Marketplace/i });
  expect(heading).toBeInTheDocument();
});
