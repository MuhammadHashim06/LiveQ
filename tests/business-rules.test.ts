import test from "node:test";
import assert from "node:assert/strict";
import { validateAvailability, validateService } from "../src/lib/businessValidation.ts";
import User from "../src/models/User.ts";
import Appointment from "../src/models/Appointment.ts";
import Queue from "../src/models/Queue.ts";

test("service validation accepts valid input and rejects empty numeric values", () => {
    assert.deepEqual(validateService({ name: "Haircut", price: "25", duration: "30" }).value, {
        name: "Haircut",
        price: 25,
        duration: 30,
    });
    assert.equal(validateService({ name: "Haircut", price: "", duration: 30 }).error, "Invalid service price");
});

test("availability validation rejects duplicate days and invalid time ranges", () => {
    const monday = { day: "Monday", startTime: "09:00", endTime: "17:00", isClosed: false };
    assert.ok(validateAvailability([monday]).value);
    assert.equal(validateAvailability([monday, monday]).error, "Availability days must be unique and valid");
    assert.equal(
        validateAvailability([{ ...monday, startTime: "18:00" }]).error,
        "Start time must be before end time"
    );
});

test("user schema rejects unsupported roles", async () => {
    const user = new User({
        name: "Test User",
        email: "test@example.com",
        password: "hashed-password",
        role: "unsupported",
    });

    await assert.rejects(user.validate(), /role/);
});

test("appointment and queue schemas reject unsupported lifecycle states", async () => {
    const appointment = new Appointment({
        user: "507f1f77bcf86cd799439011",
        business: "507f1f77bcf86cd799439012",
        serviceName: "Haircut",
        scheduledTime: new Date(),
        status: "serving",
    });
    const queueItem = new Queue({
        business: "507f1f77bcf86cd799439012",
        name: "Test Customer",
        status: "pending",
    });

    await assert.rejects(appointment.validate(), /status/);
    await assert.rejects(queueItem.validate(), /status/);
});
