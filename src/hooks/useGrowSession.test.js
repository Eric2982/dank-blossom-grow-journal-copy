import { describe, it, expect } from 'vitest';
import { generateSessionId, getElapsedMs } from './useGrowSession.js';

describe('useGrowSession utilities', () => {
  describe('generateSessionId', () => {
    it('should generate a session ID with the GS- prefix', () => {
      const id = generateSessionId();
      expect(id.startsWith('GS-')).toBe(true);
    });

    it('should generate a session ID with three hyphen-separated segments', () => {
      const id = generateSessionId();
      const parts = id.split('-');
      expect(parts).toHaveLength(3);
    });

    it('should generate unique session IDs on each call', () => {
      const ids = new Set(Array.from({ length: 50 }, () => generateSessionId()));
      expect(ids.size).toBe(50);
    });

    it('should generate uppercase alphanumeric session IDs', () => {
      const id = generateSessionId();
      expect(id).toMatch(/^GS-[0-9A-Z]+-[0-9A-Z]+$/);
    });

    it('should always produce a random segment of exactly 5 characters', () => {
      for (let i = 0; i < 20; i++) {
        const id = generateSessionId();
        const randomSegment = id.split('-')[2];
        expect(randomSegment).toHaveLength(5);
      }
    });
  });

  describe('getElapsedMs', () => {
    it('should return elapsed milliseconds since a past timestamp', () => {
      const past = new Date(Date.now() - 5000).toISOString();
      const elapsed = getElapsedMs(past);
      expect(elapsed).toBeGreaterThanOrEqual(5000);
    });

    it('should return a non-negative value', () => {
      const now = new Date().toISOString();
      const elapsed = getElapsedMs(now);
      expect(elapsed).toBeGreaterThanOrEqual(0);
    });
  });
});