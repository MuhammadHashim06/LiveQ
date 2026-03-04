import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Test signing
const payload = { id: 'test', role: 'business', name: 'Test User', email: 'test@example.com' };
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

console.log("Token generated:", token);

// Test verifying
try {
    const verified = jwt.verify(token, JWT_SECRET);
    console.log("Verification success:", verified);
} catch (error) {
    console.error("Verification failed:", error);
}
