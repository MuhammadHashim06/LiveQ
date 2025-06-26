import dbConnect from "@/lib/dbConnect"
import Queue from "@/models/Queue"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end()

  await dbConnect()
  const { businessId, customerName } = req.body

  const item = await Queue.create({ businessId, customerName })
  res.status(201).json(item)
}
