const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load env vars if managing via dotenv, typically Nextjs handles this differently, 
// so hardcoding DB URI or passing via cli is easier for a script.
// Assuming local or env:
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/liveq";

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["business", "customer", "admin"], required: true },
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seedAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        const adminEmail = "admin@liveq.com";
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log("Admin account already exists.");
        } else {
            const hashedPassword = await bcrypt.hash("admin123", 10);
            await User.create({
                name: "Super Admin",
                email: adminEmail,
                password: hashedPassword,
                role: "admin",
            });
            console.log("Admin account created successfully!");
            console.log("Email: admin@liveq.com");
            console.log("Password: admin123");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error seeding admin:", error);
        process.exit(1);
    }
}

seedAdmin();
