/**
 * Configure and run Plasmo build with correct environment
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const isProduction = process.env.NODE_ENV === "production";

// Configuration
const config = {
  development: {
    name: "impersonate-agents-dev",
    displayName: "IA - Development",
    version: "2.0.0",
    buildDir: "build/chrome-mv3-dev",
  },
  production: {
    name: "impersonate-agents",
    displayName: "IA",
    version: "2.0.0",
    buildDir: "build/chrome-mv3-prod",
  },
}[isProduction ? "production" : "development"];

console.log(
  `\n🚀 Extension Configuration: ${isProduction ? "PRODUCTION" : "DEVELOPMENT"}`,
);
console.log(`   Extension ID: ${config.name}`);
console.log(`   Display Name: ${config.displayName}`);
console.log(`   Version: ${config.version}\n`);

// Update package.json
const packageJsonPath = path.join(__dirname, "..", "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

packageJson.name = config.name;
packageJson.displayName = config.displayName;
packageJson.version = config.version;

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// Run Plasmo build
const buildCommand = `cross-env NODE_ENV=${isProduction ? "production" : "development"} plasmo build`;
console.log(`🔨 Running: ${buildCommand}`);
execSync(buildCommand, { stdio: "inherit" });

// Run post-build script to update manifest
console.log(`\n📝 Updating manifest metadata...`);
require("./postbuild.cjs");
