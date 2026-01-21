/**
 * Post-build script to update manifest metadata
 */

const fs = require("fs");
const path = require("path");

const isProduction = process.env.NODE_ENV === "production";

// Configuration
const config = {
  development: {
    name: "impersonate-agents-dev",
    displayName: "IA - Development",
    version: "1.1.0-dev",
    buildDir: "build/chrome-mv3-dev",
  },
  production: {
    name: "impersonate-agents",
    displayName: "IA",
    version: "1.1.0",
    buildDir: "build/chrome-mv3-prod",
  },
}[isProduction ? "production" : "development"];

const manifestPath = path.join(
  __dirname,
  "..",
  config.buildDir,
  "manifest.json",
);

// Check if manifest exists
if (!fs.existsSync(manifestPath)) {
  console.log(`⚠️  Manifest not found at ${manifestPath}, skipping update`);
  process.exit(0);
}

// Update manifest
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

manifest.name = config.displayName;
manifest.version = config.version;

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`✅ Updated manifest:`);
console.log(`   Name: ${manifest.name}`);
console.log(`   Version: ${manifest.version}`);
