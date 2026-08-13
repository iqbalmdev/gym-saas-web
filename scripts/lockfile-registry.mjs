#!/usr/bin/env node
/**
 * Keep package-lock.json resolvable from any machine.
 *
 * Some contributors install through a corporate npm mirror (e.g. an Azure
 * Artifacts / `pkgs.visualstudio.com` feed configured in a user-level .npmrc).
 * npm then records those private hosts in `resolved`, and `npm ci` fails
 * anywhere that cannot reach them — CI runners included.
 *
 * The mirrored artifacts are the public ones, so integrity hashes are
 * unchanged; only the host/path prefix needs rewriting. (This is not a checksum
 * problem — npm has no `YARN_CHECKSUM_BEHAVIOR=update` equivalent, and would not
 * need one here.)
 *
 * Why rewriting to the public host is safe for everyone: npm's
 * `replace-registry-host` defaults to `npmjs`, meaning it substitutes the
 * *configured* registry wherever the lockfile records `registry.npmjs.org`.
 * A mirror user still installs from their mirror; CI installs from public npm.
 * A recorded private host gets no such substitution, which is why it breaks CI.
 *
 *   node scripts/lockfile-registry.mjs --check   exit 1 if private hosts remain
 *   node scripts/lockfile-registry.mjs --fix     rewrite them to registry.npmjs.org
 */
import { readFileSync, writeFileSync } from "node:fs";

const PUBLIC_REGISTRY = "https://registry.npmjs.org/";
const LOCKFILE = "package-lock.json";

// Azure Artifacts upstream-mirror shape: <feed>/npm/registry/<pkg>/-/<file>.tgz
const MIRROR_PREFIX =
  /https:\/\/[^"/]*pkgs\.visualstudio\.com\/[^"]*?\/npm\/registry\//g;

const mode = process.argv.includes("--fix") ? "fix" : "check";
const original = readFileSync(LOCKFILE, "utf8");

const hosts = [
  ...new Set(
    [...original.matchAll(/"resolved":\s*"https?:\/\/([^/"]+)/g)]
      .map((m) => m[1])
      .filter((host) => host !== "registry.npmjs.org"),
  ),
];

if (hosts.length === 0) {
  console.log(`${LOCKFILE}: all resolved URLs use registry.npmjs.org`);
  process.exit(0);
}

if (mode === "check") {
  console.error(
    `${LOCKFILE} references non-public registries: ${hosts.join(", ")}\n` +
      `Run \`npm run lockfile:fix\` and commit the result.`,
  );
  process.exit(1);
}

const rewritten = original.replace(MIRROR_PREFIX, PUBLIC_REGISTRY);
const remaining = [
  ...new Set(
    [...rewritten.matchAll(/"resolved":\s*"https?:\/\/([^/"]+)/g)]
      .map((m) => m[1])
      .filter((host) => host !== "registry.npmjs.org"),
  ),
];

if (remaining.length > 0) {
  console.error(
    `Could not rewrite every entry. Unrecognized host(s): ${remaining.join(", ")}\n` +
      `Add the pattern to scripts/lockfile-registry.mjs.`,
  );
  process.exit(1);
}

writeFileSync(LOCKFILE, rewritten);
console.log(`${LOCKFILE}: rewrote ${hosts.join(", ")} → registry.npmjs.org`);
