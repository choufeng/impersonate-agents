#!/usr/bin/env node
/**
 * Import data to Convex production database
 * Usage: node scripts/import-data.cjs [input-file] [--prod]
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Parse arguments
const args = process.argv.slice(2);
const isProd = args.includes("--prod");
const inputFile =
  args.find((arg) => !arg.startsWith("--")) || "data-export.zip";
const inputPath = path.resolve(process.cwd(), inputFile);

// Check if file exists
if (!fs.existsSync(inputPath)) {
  console.error(`❌ 找不到数据文件: ${inputPath}`);
  process.exit(1);
}

console.log("开始导入数据到 Convex 数据库...");
console.log(`输入文件: ${inputPath}`);
console.log(
  `目标环境: ${isProd ? "生产环境 (production)" : "开发环境 (development)"}`,
);

// Show file size
const stats = fs.statSync(inputPath);
console.log(`文件大小: ${(stats.size / 1024).toFixed(2)} KB`);

// Confirm for production
if (isProd) {
  console.log("\n⚠️  警告: 你即将导入数据到生产环境！");
  console.log("这将替换现有数据。请确认你已经备份了生产数据。");
  console.log("\n如果要继续，请在 5 秒内按 Ctrl+C 取消...");

  // Simple countdown
  for (let i = 5; i > 0; i--) {
    process.stdout.write(`\r${i}... `);
    execSync("sleep 1");
  }
  console.log("\n");
}

try {
  // Use convex CLI to import data
  // Note: path is a positional argument, not --path option
  const prodFlag = isProd ? "--prod" : "";
  const command = `npx convex import "${inputPath}" ${prodFlag}`.trim();

  console.log(`执行命令: ${command}`);
  execSync(command, {
    stdio: "inherit",
    cwd: process.cwd(),
  });

  console.log("\n✅ 数据导入成功！");
} catch (error) {
  console.error("\n❌ 导入失败:", error.message);
  process.exit(1);
}
