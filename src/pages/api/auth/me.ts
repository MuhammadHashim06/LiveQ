import type { NextApiRequest, NextApiResponse } from "next"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.token
  if (!token) return res.status(401).json({ message: "Not authenticated" })

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return res.status(200).json(decoded)
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" })
  }
}
