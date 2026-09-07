import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const JWT_SECRET: string = process.env.JWT_SECRET ?? (() => {
    throw new Error("JWT_SECRET is required");
})();

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
        const decoded = jwt.verify(token, JWT_SECRET) as unknown as DecodedUser;
        return decoded;
    } catch (err) {
        return null;
    }
}
