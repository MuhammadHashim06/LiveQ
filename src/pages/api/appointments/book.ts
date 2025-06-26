import type { NextApiRequest, NextApiResponse } from "next"
import dbConnect from "@/lib/dbConnect"
import Appointment from "@/models/Appointment"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end()

  await dbConnect()

  const token = req.cookies.token
  if (!token) return res.status(401).json({ message: "Unauthorized" })

  let decoded: any
  try {
    decoded = jwt.verify(token, JWT_SECRET)
  } catch {
    return res.status(401).json({ message: "Invalid token" })
  }

  const { businessId, service, date, time } = req.body

  if (!businessId || !service || !date || !time)
    return res.status(400).json({ message: "All fields required" })

  const appointment = await Appointment.create({
    customerId: decoded.id,
    businessId,
    service,
    date,
    time,
  })

  res.status(201).json({ message: "Booked", appointment })
}
