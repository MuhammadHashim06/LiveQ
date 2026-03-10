import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: Request) {
    try {
        // Simple auth check
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        // Verify User
        jwt.verify(token, JWT_SECRET) as any;

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ message: "No file provided" }, { status: 400 });
        }

        // Convert the File object to a Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary using a Promise wrapper around the upload_stream
        const uploadResult: any = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "liveq-uploads" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            // Write the buffer to the stream and indicate end
            uploadStream.end(buffer);
        });

        return NextResponse.json({
            message: "Upload successful",
            url: uploadResult.secure_url
        });

    } catch (error: any) {
        console.error("Upload Route Error:", error);
        return NextResponse.json({ message: "Failed to upload image" }, { status: 500 });
    }
}
