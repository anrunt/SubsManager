import { Redis } from "@upstash/redis";

export const redis_client = Redis.fromEnv();