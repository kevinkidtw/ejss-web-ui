import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../lockCrypto';

describe('lockCrypto', () => {
  it('performs hash and verify round-trip successfully', async () => {
    const password = 'mySecretPassword2026!';
    const { hash, salt } = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(salt).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(typeof salt).toBe('string');
    expect(hash.length).toBeGreaterThan(20);
    expect(salt.length).toBeGreaterThan(10);

    const isValid = await verifyPassword(password, hash, salt);
    expect(isValid).toBe(true);
  });

  it('fails verification when password is wrong', async () => {
    const password = 'correctPassword';
    const { hash, salt } = await hashPassword(password);

    const isWrong = await verifyPassword('wrongPassword', hash, salt);
    expect(isWrong).toBe(false);

    const isClose = await verifyPassword('correctpassword', hash, salt);
    expect(isClose).toBe(false);

    const isBlank = await verifyPassword('', hash, salt);
    expect(isBlank).toBe(false);
  });

  it('generates different hashes for different salts with same password', async () => {
    const password = 'samePassword';
    const res1 = await hashPassword(password);
    const res2 = await hashPassword(password);

    // Random salts should differ
    expect(res1.salt).not.toBe(res2.salt);
    // Resulting hashes must differ because salts are different
    expect(res1.hash).not.toBe(res2.hash);

    // But each should verify against its own salt
    expect(await verifyPassword(password, res1.hash, res1.salt)).toBe(true);
    expect(await verifyPassword(password, res2.hash, res2.salt)).toBe(true);
  });

  it('produces deterministic hash when given identical salt', async () => {
    const password = 'deterministicTest';
    const res1 = await hashPassword(password);
    const res2 = await hashPassword(password, res1.salt);

    expect(res2.salt).toBe(res1.salt);
    expect(res2.hash).toBe(res1.hash);
  });
});
