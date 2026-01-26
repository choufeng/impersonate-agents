/**
 * Post-build script to update manifest metadata
 */

const fs = require("fs");
const path = require("path");

const isProduction = process.env.NODE_ENV === "production";

// Read package.json to get version
const packageJsonPath = path.join(__dirname, "..", "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

// Configuration - version comes from package.json for both environments
const config = {
  development: {
    name: "impersonate-agents-dev",
    displayName: "IA - Tools for Development",
    version: packageJson.version,
    buildDir: "build/chrome-mv3-dev",
  },
  production: {
    name: "impersonate-agents",
    displayName: "IA",
    version: packageJson.version,
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
