import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App Component', () => {
  it('renders TerraSpot Harmonizer header successfully', () => {
    render(<App />);
    expect(screen.getByText('TerraSpot Harmonizer')).toBeInTheDocument();
  });

  it('renders NASA Challenge 15 badge', () => {
    render(<App />);
    expect(screen.getByText('Challenge 15')).toBeInTheDocument();
  });

  it('renders Active AOI banner with Huánuco region', () => {
    render(<App />);
    expect(screen.getByText('Huánuco & Central Andes')).toBeInTheDocument();
  });
});
