import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { isSameOrigin, requireUser } from "@/lib/auth";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
    try {
        if (!isSameOrigin(req)) return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
        const user = await requireUser();
        if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        const limit = rateLimit("upload:" + user.id + ":" + getClientIp(req), 20, 15 * 60 * 1000);
        if (!limit.allowed) return NextResponse.json({ message: "Too many uploads" }, { status: 429 });

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ message: "No file provided" }, { status: 400 });
        }

        const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
        if (!allowedTypes.has(file.type)) {
            return NextResponse.json({ message: "Only JPEG, PNG, and WebP images are allowed" }, { status: 400 });
        }
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ message: "Image must be 5 MB or smaller" }, { status: 413 });
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
