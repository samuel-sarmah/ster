import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Minimal .env.local loader for contexts Next.js doesn't bootstrap — tsx
 * scripts and the Vitest runner. Existing process.env values win, so real
 * environment configuration always overrides the file.
 */
export function loadLocalEnv(file = ".env.local") {
  try {
    const raw = readFileSync(resolve(process.cwd(), file), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const i = trimmed.indexOf("=");
      const key = trimmed.slice(0, i).trim();
      const val = trimmed.slice(i + 1).trim().replace(/^["']|["']$/g, "");
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {
    // fall back to whatever is already in process.env
  }
}
