#!/usr/bin/env node
/**
 * Export data from Convex development database
 * Usage: node scripts/export-data.cjs [output-file]
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Default output file
// Note: Convex export creates a ZIP file, so we use .zip extension
const outputFile = process.argv[2] || "data-export.zip";
const outputPath = path.resolve(process.cwd(), outputFile);

console.log("开始导出 Convex 开发数据库数据...");
console.log(`输出文件: ${outputPath}`);

try {
  // Use convex CLI to export data
  // The 'npx convex export' command exports all data in JSONLines format
  // Note: --path is used for export, but path is positional for import
  const command = `npx convex export --path "${outputPath}"`;

  console.log(`执行命令: ${command}`);
  execSync(command, {
    stdio: "inherit",
    cwd: process.cwd(),
  });

  console.log("\n✅ 数据导出成功！");
  console.log(`文件位置: ${outputPath}`);

  // Show file size
  const stats = fs.statSync(outputPath);
  console.log(`文件大小: ${(stats.size / 1024).toFixed(2)} KB`);

  console.log("\n要将数据导入到生产环境，请使用:");
  console.log(`npx convex import "${outputPath}" --prod`);
} catch (error) {
  console.error("\n❌ 导出失败:", error.message);
  process.exit(1);
}
