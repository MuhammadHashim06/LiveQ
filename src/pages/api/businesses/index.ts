import type { NextApiRequest, NextApiResponse } from "next"
import dbConnect from "@/lib/dbConnect"
import Business from "@/models/Business"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()

  const businesses = await Business.find({})
  res.status(200).json(businesses)
}
