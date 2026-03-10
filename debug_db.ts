import mongoose from 'mongoose';
import crypto from 'crypto';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI as string).then(async () => {
    // We don't have the mongoose model compiled, but we can query raw
    const users = await mongoose.connection.collection('users').find({}).sort({ createdAt: -1 }).limit(1).toArray();
    const user = users[0];
    console.log("Last user:", user?.email);
    console.log("isEmailVerified:", user?.isEmailVerified);
    console.log("verifyEmailToken:", user?.verifyEmailToken);
    console.log("verifyEmailExpire:", user?.verifyEmailExpire);

    const urlToken = "590ab5202826f7de24080cb04ed5adf725a65a64f48996206c8e11bc0457f1f5";
    const hashed = crypto.createHash('sha256').update(urlToken).digest('hex');
    console.log("Hashed URL token:", hashed);
    console.log("Match?", hashed === user?.verifyEmailToken);

    process.exit(0);
});
