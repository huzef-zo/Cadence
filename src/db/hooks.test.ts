import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useToday } from './hooks';

describe('useToday logic unit test', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('hook function is exported', () => {
    expect(typeof useToday).toBe('function');
  });
});
