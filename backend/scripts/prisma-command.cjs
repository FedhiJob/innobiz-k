const { spawnSync } = require("node:child_process");

const args = process.argv.slice(2);
const env = { ...process.env };

if (!env.DIRECT_DATABASE_URL && env.DATABASE_URL) {
  env.DIRECT_DATABASE_URL = env.DATABASE_URL;
}

const prismaCli = require.resolve("prisma/build/index.js");
const result = spawnSync(process.execPath, [prismaCli, ...args], {
  stdio: "inherit",
  env,
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
