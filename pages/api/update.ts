import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis/with-fetch";
import { ethers } from "ethers";
import { verifySignature } from "@upstash/qstash/nextjs";

const MAX_DATA_COUNT = 24 * 30; // 30日分のデータ

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const alchemyApiKey = process.env.ALCHEMY_API_KEY || "";
  if (alchemyApiKey === "") {
    res.status(500).send("ALCHEMY_API_KEY is empty");
    return;
  }
  const url = `https://eth-goerli.g.alchemy.com/v2/${alchemyApiKey}`;
  const provider = new ethers.providers.JsonRpcProvider(url);
  const feeHistory = await provider.send("eth_feeHistory", [
    1,
    "latest",
    [20, 50, 80],
  ]);
  const feeInfo = {
    block: Number(feeHistory.oldestBlock),
    time: new Date().setUTCMinutes(0, 0, 0),
    base: Number(feeHistory.baseFeePerGas[0]),
    rewards: feeHistory.reward[0].map((s: any) => Number(s)),
  };

  const redis = Redis.fromEnv();
  const redisKey = `goerli-hourly`;
  const lastFeeInfo = await redis.lindex(redisKey, 0);
  const lastTime = lastFeeInfo == null ? 0 : lastFeeInfo.time;
  if (lastTime !== feeInfo.time) {
    await redis.lpush(redisKey, feeInfo);
    await redis.ltrim(redisKey, 0, MAX_DATA_COUNT - 1);
  }

  res.status(200).json(feeInfo);
}

export default verifySignature(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
