import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AdminAnalyticsDashboard } from '@/components/admin/AdminAnalyticsDashboard';

describe('AdminAnalyticsDashboard', () => {
  it('renders dashboard components', () => {
    render(<AdminAnalyticsDashboard />);
    expect(screen.getByText(/User Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Analytics/i)).toBeInTheDocument();
  });
}); 