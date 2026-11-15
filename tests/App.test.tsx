import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

describe('App Integration (T-05 Mission Navigation & KPI Shell)', () => {
  it('renders TerraSpot Harmonizer header, Challenge 15 badge, and default Huánuco AOI', () => {
    render(<App />);
    expect(screen.getByText('TerraSpot Harmonizer')).toBeInTheDocument();
    expect(screen.getByText('Challenge 15')).toBeInTheDocument();
    expect(screen.getByTestId('active-aoi-name')).toHaveTextContent(
      'Huánuco & Central Peruvian Andes',
    );
    expect(screen.getByTestId('active-aoi-bbox')).toHaveTextContent(
      '[-10.60, -77.10] to [-8.40, -74.40]',
    );
    expect(screen.getByTestId('kpi-card-afcd')).toHaveTextContent('29,541');
  });

  it('synchronizes region selection and bilingual EN/ES toggling across Navbar and KPI cards', () => {
    render(<App />);

    const regionSelect = screen.getByTestId('region-select');
    fireEvent.change(regionSelect, { target: { value: 'US-CAL' } });

    expect(screen.getByTestId('active-aoi-name')).toHaveTextContent(
      'California Sierra & Coastal Ranges',
    );
    expect(screen.getByTestId('kpi-card-afcd')).toHaveTextContent('71,620');

    const langToggle = screen.getByTestId('language-toggle');
    fireEvent.click(langToggle);

    expect(screen.getByTestId('active-aoi-name')).toHaveTextContent(
      'Sierra de California y Cordilleras Costeras',
    );
    expect(screen.getByTestId('active-aoi-bbox')).toHaveTextContent(
      '[36.00, -123.80] a [41.50, -118.50]',
    );
    expect(screen.getByTestId('kpi-regime-badge')).toHaveTextContent('Incendio Forestal Severo');
  });
});
