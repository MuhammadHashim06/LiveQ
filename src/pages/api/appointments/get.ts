import dbConnect from "@/lib/dbConnect"
import Appointment from "@/models/Appointment"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()
  const { customerId } = req.query

  const appointments = await Appointment.find({ customerId }).sort({ date: 1, time: 1 })
  res.status(200).json(appointments)
}
