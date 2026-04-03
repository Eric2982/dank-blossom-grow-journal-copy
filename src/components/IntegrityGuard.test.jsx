import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import IntegrityGuard, { IntegrityBadge } from './IntegrityGuard.jsx';
import { INTEGRITY_STATUS } from '@/hooks/usePlayIntegrity';

// Mock the hook so each test can control the status independently
vi.mock('@/hooks/usePlayIntegrity', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    usePlayIntegrity: vi.fn(),
  };
});

// Import AFTER the mock is set up
import { usePlayIntegrity } from '@/hooks/usePlayIntegrity';

function mockHook(overrides = {}) {
  usePlayIntegrity.mockReturnValue({
    status: INTEGRITY_STATUS.IDLE,
    verdict: null,
    error: null,
    checkIntegrity: vi.fn(),
    isVerified: false,
    isAvailable: false,
    ...overrides,
  });
}

// ─── IntegrityGuard ───────────────────────────────────────────────────────────

describe('IntegrityGuard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // ── loading states ───────────────────────────────────────────────────────

  it('shows the loading screen when status is IDLE', () => {
    mockHook({ status: INTEGRITY_STATUS.IDLE });
    render(<IntegrityGuard><p>Protected content</p></IntegrityGuard>);
    expect(screen.getByText('Verifying app integrity…')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('shows the loading screen when status is CHECKING', () => {
    mockHook({ status: INTEGRITY_STATUS.CHECKING });
    render(<IntegrityGuard><p>Protected content</p></IntegrityGuard>);
    expect(screen.getByText('Verifying app integrity…')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  // ── pass-through states ──────────────────────────────────────────────────

  it('renders children when status is VERIFIED', () => {
    mockHook({ status: INTEGRITY_STATUS.VERIFIED, isVerified: true });
    render(<IntegrityGuard><p>Protected content</p></IntegrityGuard>);
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('renders children when status is UNAVAILABLE (non-Android env)', () => {
    mockHook({ status: INTEGRITY_STATUS.UNAVAILABLE, isVerified: true });
    render(<IntegrityGuard><p>Protected content</p></IntegrityGuard>);
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  // ── failure state ────────────────────────────────────────────────────────

  it('shows the integrity-check-failed error screen when status is FAILED', () => {
    mockHook({ status: INTEGRITY_STATUS.FAILED, isVerified: false });
    render(<IntegrityGuard><p>Protected content</p></IntegrityGuard>);
    expect(screen.getByText('Integrity Check Failed')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('includes a "Try Again" button on the FAILED screen', () => {
    mockHook({ status: INTEGRITY_STATUS.FAILED });
    render(<IntegrityGuard><p>Protected content</p></IntegrityGuard>);
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('calls checkIntegrity when the "Try Again" button is clicked', () => {
    const mockCheckIntegrity = vi.fn();
    mockHook({ status: INTEGRITY_STATUS.FAILED, checkIntegrity: mockCheckIntegrity });
    render(<IntegrityGuard><p>Protected content</p></IntegrityGuard>);
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(mockCheckIntegrity).toHaveBeenCalledTimes(1);
  });

  // ── error state ──────────────────────────────────────────────────────────

  it('shows the verification-error screen when status is ERROR', () => {
    mockHook({ status: INTEGRITY_STATUS.ERROR, error: 'Network failure' });
    render(<IntegrityGuard><p>Protected content</p></IntegrityGuard>);
    expect(screen.getByText('Verification Error')).toBeInTheDocument();
    expect(screen.getByText('Network failure')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('shows a generic error message when error is null in ERROR state', () => {
    mockHook({ status: INTEGRITY_STATUS.ERROR, error: null });
    render(<IntegrityGuard><p>Protected content</p></IntegrityGuard>);
    expect(
      screen.getByText('An unexpected error occurred while verifying this app.')
    ).toBeInTheDocument();
  });

  it('shows a reinstall hint on the ERROR screen (not on FAILED)', () => {
    mockHook({ status: INTEGRITY_STATUS.ERROR, error: null });
    render(<IntegrityGuard><p>Protected content</p></IntegrityGuard>);
    expect(
      screen.getByText(/If this problem persists, please reinstall the app from Google Play/)
    ).toBeInTheDocument();
  });

  it('does NOT show the reinstall hint on the FAILED screen', () => {
    mockHook({ status: INTEGRITY_STATUS.FAILED });
    render(<IntegrityGuard><p>Protected content</p></IntegrityGuard>);
    expect(
      screen.queryByText(/If this problem persists/)
    ).not.toBeInTheDocument();
  });

  // ── custom fallback ──────────────────────────────────────────────────────

  it('renders the custom fallback element instead of the default error screen when provided', () => {
    mockHook({ status: INTEGRITY_STATUS.FAILED });
    render(
      <IntegrityGuard fallback={<p>Custom error UI</p>}>
        <p>Protected content</p>
      </IntegrityGuard>
    );
    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    expect(screen.queryByText('Integrity Check Failed')).not.toBeInTheDocument();
  });

  it('also uses custom fallback for ERROR status', () => {
    mockHook({ status: INTEGRITY_STATUS.ERROR, error: 'boom' });
    render(
      <IntegrityGuard fallback={<p>Custom error UI</p>}>
        <p>Protected content</p>
      </IntegrityGuard>
    );
    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
  });
});

// ─── IntegrityBadge ───────────────────────────────────────────────────────────

describe('IntegrityBadge', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows "Pending" label for IDLE status', () => {
    mockHook({ status: INTEGRITY_STATUS.IDLE });
    render(<IntegrityBadge />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('shows "Checking…" label for CHECKING status', () => {
    mockHook({ status: INTEGRITY_STATUS.CHECKING });
    render(<IntegrityBadge />);
    expect(screen.getByText('Checking…')).toBeInTheDocument();
  });

  it('shows "Verified" label for VERIFIED status', () => {
    mockHook({ status: INTEGRITY_STATUS.VERIFIED, isAvailable: false });
    render(<IntegrityBadge />);
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('shows "Web Mode" label for UNAVAILABLE status', () => {
    mockHook({ status: INTEGRITY_STATUS.UNAVAILABLE });
    render(<IntegrityBadge />);
    expect(screen.getByText('Web Mode')).toBeInTheDocument();
  });

  it('shows "Failed" label for FAILED status', () => {
    mockHook({ status: INTEGRITY_STATUS.FAILED });
    render(<IntegrityBadge />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('shows "Error" label for ERROR status', () => {
    mockHook({ status: INTEGRITY_STATUS.ERROR });
    render(<IntegrityBadge />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('shows "· Play Integrity" suffix when isAvailable=true and VERIFIED', () => {
    mockHook({ status: INTEGRITY_STATUS.VERIFIED, isAvailable: true });
    render(<IntegrityBadge />);
    expect(screen.getByText('· Play Integrity')).toBeInTheDocument();
  });

  it('does NOT show "· Play Integrity" suffix when isAvailable=false', () => {
    mockHook({ status: INTEGRITY_STATUS.VERIFIED, isAvailable: false });
    render(<IntegrityBadge />);
    expect(screen.queryByText('· Play Integrity')).not.toBeInTheDocument();
  });
});
