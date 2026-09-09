import crypto from "crypto";

export const VERIFICATION_CODE_TTL_MS = 15 * 60 * 1000;

export function normalizeEmail(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const email = value.trim().toLowerCase();
    return email || null;
}

export function createVerificationCode(now = new Date()) {
    const code = crypto.randomInt(100000, 1000000).toString();
    const token = hashVerificationCode(code);
    const expiresAt = new Date(now.getTime() + VERIFICATION_CODE_TTL_MS);

    return { code, token, expiresAt };
}

export function hashVerificationCode(code: string) {
    return crypto.createHash("sha256").update(code).digest("hex");
}
