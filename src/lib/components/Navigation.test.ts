import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import Navigation from './Navigation.svelte';

vi.mock('$app/state', () => ({
  page: { url: new URL('http://localhost/') }
}));

vi.mock('$app/paths', () => ({
  resolve: (path: string) => path
}));

describe('Navigation', () => {
  it('renders the YGOSTATS title', () => {
    render(Navigation);
    expect(screen.getByText('YGOSTATS')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(Navigation);
    expect(screen.getByRole('link', { name: /MD/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /BO3/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /DC/i })).toBeInTheDocument();
  });

  it('applies active class to current path', async () => {
    vi.mock('$app/state', () => ({
      page: { url: new URL('http://localhost/md') }
    }));

    render(Navigation);
    const mdLink = screen.getByRole('link', { name: /MD/i });
    expect(mdLink).toHaveClass('active');
    expect(mdLink).toHaveAttribute('aria-current', 'page');

    const bo3Link = screen.getByRole('link', { name: /BO3/i });
    expect(bo3Link).not.toHaveClass('active');
  });
});
