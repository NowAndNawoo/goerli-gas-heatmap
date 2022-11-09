import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis/with-fetch";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const redis = Redis.fromEnv();
  const key = "goerli-hourly";
  const data = await redis.lrange(key, 0, -1);

  res.status(200).json(data);
}
