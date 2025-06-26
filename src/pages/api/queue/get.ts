import dbConnect from "@/lib/dbConnect"
import Queue from "@/models/Queue"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()

  const { businessId } = req.query
  const queue = await Queue.find({ businessId }).sort({ createdAt: 1 })

  res.status(200).json(queue)
}
