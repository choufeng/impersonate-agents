/**
 * Configure and run Plasmo build with correct environment
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const isProduction = process.env.NODE_ENV === "production";

// Read package.json
const packageJsonPath = path.join(__dirname, "..", "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

// Configuration (only name and displayName, version comes from package.json)
const config = {
  development: {
    name: "impersonate-agents-dev",
    displayName: "IA - Development",
    buildDir: "build/chrome-mv3-dev",
  },
  production: {
    name: "impersonate-agents",
    displayName: "IA",
    buildDir: "build/chrome-mv3-prod",
  },
}[isProduction ? "production" : "development"];

console.log(
  `\n🚀 Extension Configuration: ${isProduction ? "PRODUCTION" : "DEVELOPMENT"}`,
);
console.log(`   Extension ID: ${config.name}`);
console.log(`   Display Name: ${config.displayName}`);
console.log(`   Version: ${packageJson.version}\n`);

// Only update name and displayName, keep version from package.json
packageJson.name = config.name;
packageJson.displayName = config.displayName;

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
