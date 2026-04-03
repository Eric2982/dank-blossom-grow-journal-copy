import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlayIntegrity, INTEGRITY_STATUS } from './usePlayIntegrity.js';
import * as playIntegrityLib from '@/lib/playIntegrity';

// Mock the whole playIntegrity module so we can control performIntegrityCheck
// and hasAndroidBridge without hitting the Android bridge or network.
vi.mock('@/lib/playIntegrity', () => ({
  performIntegrityCheck: vi.fn(),
  hasAndroidBridge: vi.fn(),
}));

// ─── INTEGRITY_STATUS constants ───────────────────────────────────────────────

describe('INTEGRITY_STATUS', () => {
  it('is frozen (immutable)', () => {
    expect(Object.isFrozen(INTEGRITY_STATUS)).toBe(true);
  });

  it('exposes all required status values', () => {
    expect(INTEGRITY_STATUS.IDLE).toBe('idle');
    expect(INTEGRITY_STATUS.CHECKING).toBe('checking');
    expect(INTEGRITY_STATUS.VERIFIED).toBe('verified');
    expect(INTEGRITY_STATUS.FAILED).toBe('failed');
    expect(INTEGRITY_STATUS.UNAVAILABLE).toBe('unavailable');
    expect(INTEGRITY_STATUS.ERROR).toBe('error');
  });
});

// ─── usePlayIntegrity hook ────────────────────────────────────────────────────

describe('usePlayIntegrity', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    playIntegrityLib.hasAndroidBridge.mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── initial state ────────────────────────────────────────────────────────

  it('starts with IDLE status when autoCheck is false', async () => {
    playIntegrityLib.performIntegrityCheck.mockResolvedValue({ available: false });
    const { result } = renderHook(() => usePlayIntegrity({ autoCheck: false }));
    expect(result.current.status).toBe(INTEGRITY_STATUS.IDLE);
    expect(result.current.verdict).toBeNull();
    expect(result.current.error).toBeNull();
  });

  // ── unavailable (non-Android env) ────────────────────────────────────────

  it('transitions to UNAVAILABLE when performIntegrityCheck returns { available: false }', async () => {
    playIntegrityLib.performIntegrityCheck.mockResolvedValue({ available: false });

    const { result } = renderHook(() => usePlayIntegrity());

    await vi.waitFor(() =>
      expect(result.current.status).toBe(INTEGRITY_STATUS.UNAVAILABLE)
    );

    expect(result.current.verdict).toEqual({ available: false });
    expect(result.current.error).toBeNull();
  });

  it('sets isVerified to true when status is UNAVAILABLE', async () => {
    playIntegrityLib.performIntegrityCheck.mockResolvedValue({ available: false });
    const { result } = renderHook(() => usePlayIntegrity());
    await vi.waitFor(() =>
      expect(result.current.status).toBe(INTEGRITY_STATUS.UNAVAILABLE)
    );
    expect(result.current.isVerified).toBe(true);
  });

  // ── verified ─────────────────────────────────────────────────────────────

  it('transitions to VERIFIED when both app and device integrity pass', async () => {
    playIntegrityLib.hasAndroidBridge.mockReturnValue(true);
    playIntegrityLib.performIntegrityCheck.mockResolvedValue({
      available: true,
      appIntegrity: { appRecognitionVerdict: 'PLAY_RECOGNIZED' },
      deviceIntegrity: { deviceRecognitionVerdict: ['MEETS_DEVICE_INTEGRITY'] },
    });

    const { result } = renderHook(() => usePlayIntegrity());
    await vi.waitFor(() =>
      expect(result.current.status).toBe(INTEGRITY_STATUS.VERIFIED)
    );

    expect(result.current.isVerified).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('accepts MEETS_STRONG_INTEGRITY as a passing device verdict', async () => {
    playIntegrityLib.hasAndroidBridge.mockReturnValue(true);
    playIntegrityLib.performIntegrityCheck.mockResolvedValue({
      available: true,
      appIntegrity: { appRecognitionVerdict: 'PLAY_RECOGNIZED' },
      deviceIntegrity: { deviceRecognitionVerdict: ['MEETS_STRONG_INTEGRITY'] },
    });

    const { result } = renderHook(() => usePlayIntegrity());
    await vi.waitFor(() =>
      expect(result.current.status).toBe(INTEGRITY_STATUS.VERIFIED)
    );
  });

  // ── failed ───────────────────────────────────────────────────────────────

  it('transitions to FAILED when appRecognitionVerdict is not PLAY_RECOGNIZED', async () => {
    playIntegrityLib.hasAndroidBridge.mockReturnValue(true);
    playIntegrityLib.performIntegrityCheck.mockResolvedValue({
      available: true,
      appIntegrity: { appRecognitionVerdict: 'UNRECOGNIZED_VERSION' },
      deviceIntegrity: { deviceRecognitionVerdict: ['MEETS_DEVICE_INTEGRITY'] },
    });

    const { result } = renderHook(() => usePlayIntegrity());
    await vi.waitFor(() =>
      expect(result.current.status).toBe(INTEGRITY_STATUS.FAILED)
    );

    expect(result.current.isVerified).toBe(false);
  });

  it('transitions to FAILED when device verdict does not include required integrity', async () => {
    playIntegrityLib.hasAndroidBridge.mockReturnValue(true);
    playIntegrityLib.performIntegrityCheck.mockResolvedValue({
      available: true,
      appIntegrity: { appRecognitionVerdict: 'PLAY_RECOGNIZED' },
      deviceIntegrity: { deviceRecognitionVerdict: [] },
    });

    const { result } = renderHook(() => usePlayIntegrity());
    await vi.waitFor(() =>
      expect(result.current.status).toBe(INTEGRITY_STATUS.FAILED)
    );
  });

  it('transitions to FAILED when deviceIntegrity is missing', async () => {
    playIntegrityLib.hasAndroidBridge.mockReturnValue(true);
    playIntegrityLib.performIntegrityCheck.mockResolvedValue({
      available: true,
      appIntegrity: { appRecognitionVerdict: 'PLAY_RECOGNIZED' },
    });

    const { result } = renderHook(() => usePlayIntegrity());
    await vi.waitFor(() =>
      expect(result.current.status).toBe(INTEGRITY_STATUS.FAILED)
    );
  });

  // ── error ────────────────────────────────────────────────────────────────

  it('transitions to ERROR when performIntegrityCheck throws', async () => {
    playIntegrityLib.performIntegrityCheck.mockRejectedValue(
      new Error('Network failure')
    );

    const { result } = renderHook(() => usePlayIntegrity());
    await vi.waitFor(() =>
      expect(result.current.status).toBe(INTEGRITY_STATUS.ERROR)
    );

    expect(result.current.error).toBe('Network failure');
    expect(result.current.isVerified).toBe(false);
  });

  it('uses a fallback error message when the thrown error has no message', async () => {
    playIntegrityLib.performIntegrityCheck.mockRejectedValue({});

    const { result } = renderHook(() => usePlayIntegrity());
    await vi.waitFor(() =>
      expect(result.current.status).toBe(INTEGRITY_STATUS.ERROR)
    );

    expect(result.current.error).toBe('Integrity check failed');
  });

  // ── autoCheck disabled ───────────────────────────────────────────────────

  it('does not call performIntegrityCheck when autoCheck is false', async () => {
    playIntegrityLib.performIntegrityCheck.mockResolvedValue({ available: false });

    renderHook(() => usePlayIntegrity({ autoCheck: false }));

    // Wait a tick to ensure any unwanted side-effects would have had time to fire
    await new Promise((r) => setTimeout(r, 10));
    expect(playIntegrityLib.performIntegrityCheck).not.toHaveBeenCalled();
  });

  // ── manual trigger ───────────────────────────────────────────────────────

  it('allows re-triggering the check via checkIntegrity()', async () => {
    playIntegrityLib.performIntegrityCheck
      .mockResolvedValueOnce({ available: false })
      .mockResolvedValueOnce({
        available: true,
        appIntegrity: { appRecognitionVerdict: 'PLAY_RECOGNIZED' },
        deviceIntegrity: { deviceRecognitionVerdict: ['MEETS_DEVICE_INTEGRITY'] },
      });

    const { result } = renderHook(() => usePlayIntegrity());

    // Wait for the first auto-check to complete (UNAVAILABLE)
    await vi.waitFor(() =>
      expect(result.current.status).toBe(INTEGRITY_STATUS.UNAVAILABLE)
    );

    // Manually re-trigger
    act(() => { result.current.checkIntegrity(); });

    await vi.waitFor(() =>
      expect(result.current.status).toBe(INTEGRITY_STATUS.VERIFIED)
    );

    expect(playIntegrityLib.performIntegrityCheck).toHaveBeenCalledTimes(2);
  });

  it('resets verdict and error to null when a new check begins', async () => {
    playIntegrityLib.performIntegrityCheck.mockRejectedValueOnce(new Error('fail'));

    const { result } = renderHook(() => usePlayIntegrity());
    await vi.waitFor(() =>
      expect(result.current.status).toBe(INTEGRITY_STATUS.ERROR)
    );
    expect(result.current.error).toBe('fail');

    // Set up the next call to hang so we can observe CHECKING state
    let resolve;
    playIntegrityLib.performIntegrityCheck.mockImplementationOnce(
      () => new Promise((r) => { resolve = r; })
    );

    act(() => { result.current.checkIntegrity(); });

    await vi.waitFor(() =>
      expect(result.current.status).toBe(INTEGRITY_STATUS.CHECKING)
    );

    expect(result.current.error).toBeNull();
    expect(result.current.verdict).toBeNull();

    // Clean up
    act(() => resolve({ available: false }));
  });

  // ── isAvailable ──────────────────────────────────────────────────────────

  it('sets isAvailable to true when the Android bridge is present', async () => {
    playIntegrityLib.hasAndroidBridge.mockReturnValue(true);
    playIntegrityLib.performIntegrityCheck.mockResolvedValue({
      available: true,
      appIntegrity: { appRecognitionVerdict: 'PLAY_RECOGNIZED' },
      deviceIntegrity: { deviceRecognitionVerdict: ['MEETS_DEVICE_INTEGRITY'] },
    });

    const { result } = renderHook(() => usePlayIntegrity());
    await vi.waitFor(() =>
      expect(result.current.status).toBe(INTEGRITY_STATUS.VERIFIED)
    );

    expect(result.current.isAvailable).toBe(true);
  });

  it('sets isAvailable to false when the Android bridge is absent', async () => {
    playIntegrityLib.hasAndroidBridge.mockReturnValue(false);
    playIntegrityLib.performIntegrityCheck.mockResolvedValue({ available: false });

    const { result } = renderHook(() => usePlayIntegrity());
    await vi.waitFor(() =>
      expect(result.current.status).toBe(INTEGRITY_STATUS.UNAVAILABLE)
    );

    expect(result.current.isAvailable).toBe(false);
  });
});
