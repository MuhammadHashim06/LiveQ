import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface DecodedUser {
    id: string;
    role: string;
    name: string;
    email: string;
    isEmailVerified?: boolean;
}

export async function getUser(): Promise<DecodedUser | null> {
    const token = (await cookies()).get("token")?.value;
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        return decoded;
    } catch (err) {
        return null;
    }
}
