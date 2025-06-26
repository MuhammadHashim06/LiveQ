import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Clear the token cookie
  res.setHeader("Set-Cookie", "token=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict");

  return res.status(200).json({ message: "Logged out successfully" });
}
