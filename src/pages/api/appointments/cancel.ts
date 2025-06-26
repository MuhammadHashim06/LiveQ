import dbConnect from "@/lib/dbConnect"
import Appointment from "@/models/Appointment"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") return res.status(405).end()

  await dbConnect()
  const { id } = req.query

  await Appointment.findByIdAndDelete(id)
  res.status(200).json({ message: "Appointment cancelled" })
}
