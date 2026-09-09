import test from "node:test";
import assert from "node:assert/strict";
import {
    VERIFICATION_CODE_TTL_MS,
    createVerificationCode,
    hashVerificationCode,
    normalizeEmail,
} from "../src/lib/authHelpers.ts";

test("normalizeEmail trims and lowercases valid input", () => {
    assert.equal(normalizeEmail("  User@Example.COM "), "user@example.com");
    assert.equal(normalizeEmail("   "), null);
    assert.equal(normalizeEmail(undefined), null);
});

test("verification codes are six digits, hashed, and expire in fifteen minutes", () => {
    const now = new Date("2026-09-10T12:00:00.000Z");
    const verification = createVerificationCode(now);

    assert.match(verification.code, /^\d{6}$/);
    assert.equal(verification.token, hashVerificationCode(verification.code));
    assert.equal(verification.expiresAt.getTime(), now.getTime() + VERIFICATION_CODE_TTL_MS);
});
