import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Appointment from "@/models/Appointment";
import { getUser } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        await dbConnect();

        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const appointments = await Appointment.find({ user: user.id })
            .populate('business', 'name category address')
            .sort({ scheduledTime: -1 })
            .lean();

        return NextResponse.json(appointments);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
