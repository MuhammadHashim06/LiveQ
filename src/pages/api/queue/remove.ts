import dbConnect from "@/lib/dbConnect"
import Queue from "@/models/Queue"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") return res.status(405).end()

  await dbConnect()
  const { id } = req.query

  await Queue.findByIdAndDelete(id)
  res.status(200).json({ message: "Removed" })
}
