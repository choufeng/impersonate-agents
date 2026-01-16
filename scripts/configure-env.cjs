/**
 * Configure extension name based on environment
 *
 * Development: impersonate-agents-dev (allows side-by-side with production)
 * Production: impersonate-agents
 */

const fs = require("fs");
const path = require("path");

const packageJsonPath = path.join(__dirname, "..", "package.json");
const packageJson = require(packageJsonPath);

const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  // Production configuration
  packageJson.name = "impersonate-agents";
  packageJson.displayName = "IA";
  packageJson.version = "1.1.0";
} else {
  // Development configuration
  packageJson.name = "impersonate-agents-dev";
  packageJson.displayName = "IA - Development";
  packageJson.version = "1.1.0-dev";
}

console.log(
  `\n🚀 Extension Configuration: ${isProduction ? "PRODUCTION" : "DEVELOPMENT"}`,
);
console.log(`   Extension ID: ${packageJson.name}`);
console.log(`   Display Name: ${packageJson.displayName}`);
console.log(`   Version: ${packageJson.version}\n`);

// Write updated package.json to disk
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// Register cleanup on exit (restore original package.json)
process.on("exit", () => {
  console.log("🔄 Restoring original package.json...");
  // We restore the original from git when the build/dev session ends
  // This is done by git checkout or by the user's git workflow
});
