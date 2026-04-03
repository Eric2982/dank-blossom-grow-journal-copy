import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateNonce,
  isAndroidWebView,
  hasAndroidBridge,
  requestIntegrityToken,
  verifyIntegrityToken,
  performIntegrityCheck,
} from './playIntegrity.js';

// ─── generateNonce ────────────────────────────────────────────────────────────

describe('generateNonce', () => {
  it('returns a string', () => {
    expect(typeof generateNonce()).toBe('string');
  });

  it('returns a 43-character base64url string (32 bytes → 43 chars no padding)', () => {
    // 32 bytes → ceil(32 * 4/3) = 44, minus 1 padding char = 43
    expect(generateNonce()).toHaveLength(43);
  });

  it('contains only base64url-safe characters (no +, /, or =)', () => {
    for (let i = 0; i < 20; i++) {
      const nonce = generateNonce();
      expect(nonce).toMatch(/^[A-Za-z0-9\-_]+$/);
    }
  });

  it('generates a unique nonce on each call', () => {
    const nonces = new Set(Array.from({ length: 50 }, () => generateNonce()));
    expect(nonces.size).toBe(50);
  });
});

// ─── isAndroidWebView ─────────────────────────────────────────────────────────

describe('isAndroidWebView', () => {
  const originalUA = navigator.userAgent;

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUA,
      configurable: true,
    });
  });

  it('returns true for an Android WebView user agent', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/112.0.0.0 Mobile Safari/537.36 (wv)',
      configurable: true,
    });
    expect(isAndroidWebView()).toBe(true);
  });

  it('returns false for a regular Android Chrome browser (no wv marker)', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
      configurable: true,
    });
    expect(isAndroidWebView()).toBe(false);
  });

  it('returns false for a desktop browser user agent', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
      configurable: true,
    });
    expect(isAndroidWebView()).toBe(false);
  });

  it('returns false for an iOS Safari user agent', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16 Mobile/15E148 Safari/604.1',
      configurable: true,
    });
    expect(isAndroidWebView()).toBe(false);
  });
});

// ─── hasAndroidBridge ─────────────────────────────────────────────────────────

describe('hasAndroidBridge', () => {
  afterEach(() => {
    delete window.AndroidPlayIntegrity;
  });

  it('returns false when window.AndroidPlayIntegrity is not defined', () => {
    expect(hasAndroidBridge()).toBe(false);
  });

  it('returns false when AndroidPlayIntegrity exists but lacks requestIntegrityToken', () => {
    window.AndroidPlayIntegrity = {};
    expect(hasAndroidBridge()).toBe(false);
  });

  it('returns false when requestIntegrityToken is not a function', () => {
    window.AndroidPlayIntegrity = { requestIntegrityToken: 'not-a-function' };
    expect(hasAndroidBridge()).toBe(false);
  });

  it('returns true when AndroidPlayIntegrity.requestIntegrityToken is a function', () => {
    window.AndroidPlayIntegrity = { requestIntegrityToken: vi.fn() };
    expect(hasAndroidBridge()).toBe(true);
  });
});

// ─── requestIntegrityToken ────────────────────────────────────────────────────

describe('requestIntegrityToken', () => {
  afterEach(() => {
    delete window.AndroidPlayIntegrity;
    delete window.__playIntegrityCallbacks;
    vi.useRealTimers();
  });

  it('rejects immediately when the Android bridge is not available', async () => {
    await expect(requestIntegrityToken('test-nonce')).rejects.toThrow(
      'Android Play Integrity bridge is not available'
    );
  });

  it('resolves with the token when the bridge fires the success callback', async () => {
    window.AndroidPlayIntegrity = {
      requestIntegrityToken: vi.fn((nonce, callbackId) => {
        // Simulate the native bridge resolving the token asynchronously
        setTimeout(() => {
          window.__playIntegrityCallbacks[callbackId].resolve('fake-encrypted-token');
        }, 0);
      }),
    };

    const token = await requestIntegrityToken('my-nonce');
    expect(token).toBe('fake-encrypted-token');
    expect(window.AndroidPlayIntegrity.requestIntegrityToken).toHaveBeenCalledWith(
      'my-nonce',
      expect.stringMatching(/^pic_/)
    );
  });

  it('rejects when the bridge fires the error callback', async () => {
    window.AndroidPlayIntegrity = {
      requestIntegrityToken: vi.fn((nonce, callbackId) => {
        setTimeout(() => {
          window.__playIntegrityCallbacks[callbackId].reject(
            new Error('Play Integrity unavailable')
          );
        }, 0);
      }),
    };

    await expect(requestIntegrityToken('my-nonce')).rejects.toThrow(
      'Play Integrity unavailable'
    );
  });

  it('cleans up the callback entry after a successful resolution', async () => {
    let capturedCallbackId;
    window.AndroidPlayIntegrity = {
      requestIntegrityToken: vi.fn((nonce, callbackId) => {
        capturedCallbackId = callbackId;
        setTimeout(() => {
          window.__playIntegrityCallbacks[callbackId].resolve('token-abc');
        }, 0);
      }),
    };

    await requestIntegrityToken('my-nonce');
    expect(window.__playIntegrityCallbacks[capturedCallbackId]).toBeUndefined();
  });

  it('cleans up the callback entry after a rejection', async () => {
    let capturedCallbackId;
    window.AndroidPlayIntegrity = {
      requestIntegrityToken: vi.fn((nonce, callbackId) => {
        capturedCallbackId = callbackId;
        setTimeout(() => {
          window.__playIntegrityCallbacks[callbackId].reject(new Error('oops'));
        }, 0);
      }),
    };

    await expect(requestIntegrityToken('my-nonce')).rejects.toThrow('oops');
    expect(window.__playIntegrityCallbacks[capturedCallbackId]).toBeUndefined();
  });

  it('rejects after the 15-second timeout when the bridge never responds', async () => {
    vi.useFakeTimers();
    window.AndroidPlayIntegrity = {
      requestIntegrityToken: vi.fn(), // never calls back
    };

    const promise = requestIntegrityToken('my-nonce');
    vi.advanceTimersByTime(15_001);

    await expect(promise).rejects.toThrow('Play Integrity token request timed out');
  });

  it('uses unique callback IDs for concurrent requests', async () => {
    const callbackIds = [];
    window.AndroidPlayIntegrity = {
      requestIntegrityToken: vi.fn((nonce, callbackId) => {
        callbackIds.push(callbackId);
        setTimeout(() => {
          window.__playIntegrityCallbacks[callbackId].resolve(`token-for-${callbackId}`);
        }, 0);
      }),
    };

    const [t1, t2] = await Promise.all([
      requestIntegrityToken('nonce-1'),
      requestIntegrityToken('nonce-2'),
    ]);

    expect(callbackIds).toHaveLength(2);
    expect(callbackIds[0]).not.toBe(callbackIds[1]);
    expect(t1).toBe(`token-for-${callbackIds[0]}`);
    expect(t2).toBe(`token-for-${callbackIds[1]}`);
  });
});

// ─── verifyIntegrityToken ─────────────────────────────────────────────────────

describe('verifyIntegrityToken', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('POSTs token and nonce to /api/play-integrity/verify', async () => {
    const mockVerdict = { requestDetails: {}, appIntegrity: {}, deviceIntegrity: {}, accountDetails: {} };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockVerdict,
    });

    await verifyIntegrityToken('enc-token', 'my-nonce');

    expect(fetch).toHaveBeenCalledWith('/api/play-integrity/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'enc-token', nonce: 'my-nonce' }),
    });
  });

  it('returns the parsed verdict object on success', async () => {
    const mockVerdict = {
      requestDetails: { nonce: 'my-nonce', requestPackageName: 'com.example.app' },
      appIntegrity: { appRecognitionVerdict: 'PLAY_RECOGNIZED' },
      deviceIntegrity: { deviceRecognitionVerdict: ['MEETS_DEVICE_INTEGRITY'] },
      accountDetails: { appLicensingVerdict: 'LICENSED' },
    };
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockVerdict });

    const result = await verifyIntegrityToken('enc-token', 'my-nonce');
    expect(result).toEqual(mockVerdict);
  });

  it('throws with the server error message when the response is not ok', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ error: 'App not recognized by Play' }),
    });

    await expect(verifyIntegrityToken('bad-token', 'nonce')).rejects.toThrow(
      'App not recognized by Play'
    );
  });

  it('falls back to an HTTP status message when the error body has no error field', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    await expect(verifyIntegrityToken('bad-token', 'nonce')).rejects.toThrow(
      'Verification failed (HTTP 500)'
    );
  });

  it('falls back to HTTP status message when the error body is not valid JSON', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => { throw new SyntaxError('bad json'); },
    });

    await expect(verifyIntegrityToken('bad-token', 'nonce')).rejects.toThrow(
      'Verification failed (HTTP 503)'
    );
  });
});

// ─── performIntegrityCheck ────────────────────────────────────────────────────

describe('performIntegrityCheck', () => {
  afterEach(() => {
    delete window.AndroidPlayIntegrity;
    delete window.__playIntegrityCallbacks;
    vi.unstubAllGlobals();
  });

  it('returns { available: false } when the Android bridge is not present', async () => {
    const result = await performIntegrityCheck();
    expect(result).toEqual({ available: false });
  });

  it('returns the full verdict with available:true when the bridge and backend succeed', async () => {
    const mockVerdict = {
      requestDetails: { nonce: 'some-nonce' },
      appIntegrity: { appRecognitionVerdict: 'PLAY_RECOGNIZED' },
      deviceIntegrity: { deviceRecognitionVerdict: ['MEETS_DEVICE_INTEGRITY'] },
      accountDetails: { appLicensingVerdict: 'LICENSED' },
    };

    window.AndroidPlayIntegrity = {
      requestIntegrityToken: vi.fn((nonce, callbackId) => {
        setTimeout(() => {
          window.__playIntegrityCallbacks[callbackId].resolve('encrypted-token');
        }, 0);
      }),
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockVerdict,
    }));

    const result = await performIntegrityCheck();
    expect(result).toEqual({ available: true, ...mockVerdict });
  });

  it('propagates errors from requestIntegrityToken when the bridge fails', async () => {
    window.AndroidPlayIntegrity = {
      requestIntegrityToken: vi.fn((nonce, callbackId) => {
        setTimeout(() => {
          window.__playIntegrityCallbacks[callbackId].reject(new Error('Bridge error'));
        }, 0);
      }),
    };

    await expect(performIntegrityCheck()).rejects.toThrow('Bridge error');
  });

  it('propagates errors from verifyIntegrityToken when the backend fails', async () => {
    window.AndroidPlayIntegrity = {
      requestIntegrityToken: vi.fn((nonce, callbackId) => {
        setTimeout(() => {
          window.__playIntegrityCallbacks[callbackId].resolve('token');
        }, 0);
      }),
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Server error' }),
    }));

    await expect(performIntegrityCheck()).rejects.toThrow('Server error');
  });
});
