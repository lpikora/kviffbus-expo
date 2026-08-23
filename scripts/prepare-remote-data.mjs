import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const IMPORT_VERSION_PATTERN = /^[0-9A-Za-z._-]+$/;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(root, "assets/data/data.json");
const destDir = path.join(root, "remote-data");

const sourceJson = fs.readFileSync(sourcePath, "utf8");
const data = JSON.parse(sourceJson);
const importVersion = data?.appConfig?.importVersion;

if (typeof importVersion !== "string" || importVersion.length === 0) {
  throw new Error("assets/data/data.json is missing appConfig.importVersion");
}

if (!IMPORT_VERSION_PATTERN.test(importVersion)) {
  throw new Error(
    `Unsafe appConfig.importVersion "${importVersion}". Use only letters, numbers, dots, underscores, and hyphens.`,
  );
}

fs.mkdirSync(destDir, { recursive: true });

const versionPath = path.join(destDir, "version.json");
const snapshotPath = path.join(destDir, `data-${importVersion}.json`);

fs.writeFileSync(
  versionPath,
  `${JSON.stringify({ importVersion }, null, 2)}\n`,
);
fs.writeFileSync(snapshotPath, sourceJson);

console.log(`Wrote ${path.relative(root, versionPath)}`);
console.log(`Wrote ${path.relative(root, snapshotPath)}`);
