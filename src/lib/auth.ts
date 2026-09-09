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

export type UserRole = "business" | "customer" | "admin";

export async function getUser(): Promise<DecodedUser | null> {
    const token = (await cookies()).get("token")?.value;
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
        if (
            typeof decoded.id !== "string" ||
            typeof decoded.role !== "string" ||
            !["business", "customer", "admin"].includes(decoded.role)
        ) {
            return null;
        }
        return decoded as DecodedUser;
    } catch (err) {
        return null;
    }
}

export async function requireUser(role?: UserRole): Promise<DecodedUser | null> {
    const user = await getUser();
    return user && (!role || user.role === role) ? user : null;
}

export function isSameOrigin(req: Request): boolean {
    const origin = req.headers.get("origin");
    return !origin || origin === new URL(req.url).origin;
}
