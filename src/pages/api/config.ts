import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const config = {
    backendUrl: process.env.BACKEND_URL || "http://localhost:8080",
    environment: process.env.ENVIRONMENT || "development",
    // Add other config values here - but never expose secrets!
  };

  // Set cache headers for performance
  res.setHeader("Cache-Control", "public, max-age=300"); // Cache for 5 minutes
  res.status(200).json(config);
}
