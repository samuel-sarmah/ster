import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

const EXCLUDE = ["**/node_modules/**", "**/.next/**"];

const shared = {
  environment: "node" as const,
  setupFiles: ["./vitest.setup.ts"],
  // BigQuery jobs are far slower than the 5s default.
  testTimeout: 60_000,
  hookTimeout: 60_000,
};

/**
 * Three tiers, so the credentialed tests can be opted out of:
 *   npm run test:unit  — pure logic. No network, no credentials.
 *   npm test           — the above plus BigQuery dry runs (billed at $0).
 *   npm run test:live  — the above plus actually executing each report.
 *
 * The dry-run and live tiers need Application Default Credentials:
 *   gcloud auth application-default login
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    projects: [
      {
        plugins: [tsconfigPaths()],
        test: {
          ...shared,
          name: "unit",
          include: ["**/__tests__/**/*.test.ts"],
          exclude: [...EXCLUDE, "**/*.dryrun.test.ts", "**/*.live.test.ts"],
        },
      },
      {
        plugins: [tsconfigPaths()],
        test: {
          ...shared,
          name: "dryrun",
          include: ["**/__tests__/**/*.dryrun.test.ts"],
          exclude: EXCLUDE,
        },
      },
      {
        plugins: [tsconfigPaths()],
        test: {
          ...shared,
          name: "live",
          include: ["**/__tests__/**/*.live.test.ts"],
          exclude: EXCLUDE,
        },
      },
    ],
  },
});
