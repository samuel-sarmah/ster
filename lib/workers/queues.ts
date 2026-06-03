import { Queue } from "bullmq";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

const defaultJobOptions = {
  attempts: 3,
  backoff: { type: "exponential" as const, delay: 5000 },
};

export const viewTrackingQueue = new Queue("view-tracking", {
  connection: { url: REDIS_URL },
  defaultJobOptions: {
    ...defaultJobOptions,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

export const payoutQueue = new Queue("payout", {
  connection: { url: REDIS_URL },
  defaultJobOptions: {
    ...defaultJobOptions,
    backoff: { type: "exponential" as const, delay: 10000 },
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 25 },
  },
});
