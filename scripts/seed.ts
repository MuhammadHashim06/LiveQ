import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const CONFIRM_FLAG = "--confirm-seed";

function requiredEnv(name: string) {
    const value = process.env[name]?.trim();
    if (!value) throw new Error(`Missing required environment variable: ${name}`);
    return value;
}

function validatePassword(name: string, password: string) {
    if (password.length < 8) {
        throw new Error(`${name} must be at least 8 characters`);
    }
}

async function upsertUser(
    User: typeof import("../src/models/User.ts").default,
    config: { name: string; email: string; password: string; role: "admin" | "customer" | "business" }
) {
    const existing = await User.findOne({ email: config.email });
    if (existing && existing.role !== config.role) {
        throw new Error(`Existing user ${config.email} has role ${existing.role}, expected ${config.role}`);
    }

    const password = await bcrypt.hash(config.password, 10);
    return User.findOneAndUpdate(
        { email: config.email },
        {
            $set: {
                name: config.name,
                email: config.email,
                password,
                role: config.role,
                isEmailVerified: true,
                verifyAttempts: 0,
            },
            $unset: { verifyEmailToken: 1, verifyEmailExpire: 1, verifyLastSentAt: 1 },
        },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
}

async function main() {
    if (process.env.NODE_ENV === "production") {
        throw new Error("The seed script refuses to run with NODE_ENV=production");
    }
    if (!process.argv.includes(CONFIRM_FLAG)) {
        throw new Error(`Refusing to seed without ${CONFIRM_FLAG}`);
    }

    const mongoUri = requiredEnv("MONGODB_URI");
    const isLocalMongo = mongoUri.includes("localhost") || mongoUri.includes("127.0.0.1");
    if (!isLocalMongo && process.env.SEED_ALLOW_NONLOCAL !== "true") {
        throw new Error("MONGODB_URI is not local; set SEED_ALLOW_NONLOCAL=true only when this is intentional");
    }

    const [{ default: dbConnect }, { default: Business }, { default: User }] = await Promise.all([
        import("../src/lib/dbConnect.ts"),
        import("../src/models/Business.ts"),
        import("../src/models/User.ts"),
    ]);

    const adminPassword = requiredEnv("SEED_ADMIN_PASSWORD");
    const customerPassword = requiredEnv("SEED_CUSTOMER_PASSWORD");
    const businessPassword = requiredEnv("SEED_BUSINESS_PASSWORD");
    validatePassword("SEED_ADMIN_PASSWORD", adminPassword);
    validatePassword("SEED_CUSTOMER_PASSWORD", customerPassword);
    validatePassword("SEED_BUSINESS_PASSWORD", businessPassword);

    await dbConnect();

    const admin = await upsertUser(User, {
        name: "LiveQ Admin",
        email: requiredEnv("SEED_ADMIN_EMAIL").toLowerCase(),
        password: adminPassword,
        role: "admin",
    });
    const customer = await upsertUser(User, {
        name: "LiveQ Customer",
        email: requiredEnv("SEED_CUSTOMER_EMAIL").toLowerCase(),
        password: customerPassword,
        role: "customer",
    });
    const businessOwner = await upsertUser(User, {
        name: "LiveQ Business Owner",
        email: requiredEnv("SEED_BUSINESS_EMAIL").toLowerCase(),
        password: businessPassword,
        role: "business",
    });

    const business = await Business.findOneAndUpdate(
        { owner: businessOwner._id },
        {
            $set: {
                name: process.env.SEED_BUSINESS_NAME?.trim() || "LiveQ Demo Business",
                description: "Development seed business",
                address: "Local development",
                category: "General",
                email: businessOwner.email,
                isVerified: true,
                services: [{ name: "General Service", price: 0, duration: 30, description: "Seed service" }],
                availability: [
                    { day: "Monday", startTime: "09:00", endTime: "17:00", isClosed: false },
                ],
                lat: 0,
                lng: 0,
            },
        },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    console.log("Seed complete");
    console.log(`Admin: ${admin?.email}`);
    console.log(`Customer: ${customer?.email}`);
    console.log(`Business owner: ${businessOwner?.email}`);
    console.log(`Business: ${business?.name}`);
}

main()
    .catch((error) => {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
