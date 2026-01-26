#!/usr/bin/env node
/**
 * Production Import Helper - 生产环境导入辅助工具
 * 提供交互式的、安全的生产环境数据导入流程
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ANSI 颜色代码
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function print(text, color = "reset") {
  console.log(colorize(text, color));
}

function execCommand(command, silent = false) {
  try {
    const result = execSync(command, {
      encoding: "utf8",
      stdio: silent ? "pipe" : "inherit",
    });
    return result;
  } catch (error) {
    throw new Error(`命令执行失败: ${error.message}`);
  }
}

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function confirm(message) {
  const answer = await question(colorize(`${message} (yes/no): `, "yellow"));
  return answer.toLowerCase() === "yes" || answer.toLowerCase() === "y";
}

async function main() {
  console.clear();
  print("╔══════════════════════════════════════════════════════════╗", "cyan");
  print("║     Convex 生产环境数据导入辅助工具                     ║", "cyan");
  print("╚══════════════════════════════════════════════════════════╝", "cyan");
  console.log();

  try {
    // 步骤 1: 选择数据文件
    print("📁 步骤 1: 选择要导入的数据文件", "bold");
    print("─────────────────────────────────────────────────────────", "cyan");

    const backupDir = path.resolve(process.cwd(), "backup/database");
    if (!fs.existsSync(backupDir)) {
      print(`❌ 备份目录不存在: ${backupDir}`, "red");
      process.exit(1);
    }

    const files = fs
      .readdirSync(backupDir)
      .filter((f) => f.endsWith(".jsonl") || f.endsWith(".zip"))
      .sort()
      .reverse();

    if (files.length === 0) {
      print("❌ 没有找到可导入的数据文件", "red");
      print("请先运行: pnpm db:export", "yellow");
      process.exit(1);
    }

    print("\n可用的数据文件:", "green");
    files.forEach((file, index) => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      const size = (stats.size / 1024).toFixed(2);
      print(`  ${index + 1}. ${file} (${size} KB)`, "cyan");
    });

    const fileIndex = await question("\n选择文件编号（或输入完整路径）: ");
    let dataFile;

    if (fileIndex.match(/^\d+$/)) {
      const index = parseInt(fileIndex) - 1;
      if (index < 0 || index >= files.length) {
        print("❌ 无效的文件编号", "red");
        process.exit(1);
      }
      dataFile = path.join(backupDir, files[index]);
    } else {
      dataFile = path.resolve(process.cwd(), fileIndex);
    }

    if (!fs.existsSync(dataFile)) {
      print(`❌ 文件不存在: ${dataFile}`, "red");
      process.exit(1);
    }

    const stats = fs.statSync(dataFile);
    print(`\n✅ 选择的文件: ${path.basename(dataFile)}`, "green");
    print(`   大小: ${(stats.size / 1024).toFixed(2)} KB`, "cyan");

    // 步骤 2: 预览数据
    print("\n📊 步骤 2: 预览数据内容", "bold");
    print("─────────────────────────────────────────────────────────", "cyan");

    const shouldPreview = await confirm("是否要预览数据内容？");
    if (shouldPreview) {
      try {
        print("\n数据文件内容:", "cyan");
        execCommand(`unzip -l "${dataFile}"`);

        const showData = await confirm("\n是否查看 partners 表的数据？");
        if (showData) {
          print("\nPartners 表前 2 条记录:", "cyan");
          execCommand(
            `unzip -p "${dataFile}" partners/documents.jsonl | head -n 2 | jq .`,
          );
        }
      } catch (error) {
        print(`⚠️  预览失败: ${error.message}`, "yellow");
      }
    }

    // 步骤 3: 检查认证状态
    print("\n🔐 步骤 3: 检查 Convex 认证状态", "bold");
    print("─────────────────────────────────────────────────────────", "cyan");

    try {
      const whoami = execCommand("npx convex whoami", true);
      print(`✅ 已登录: ${whoami.trim()}`, "green");
    } catch (error) {
      print("❌ 未登录 Convex", "red");
      const shouldLogin = await confirm("是否现在登录？");
      if (shouldLogin) {
        execCommand("npx convex login");
      } else {
        print("导入已取消", "yellow");
        process.exit(0);
      }
    }

    // 步骤 4: 备份生产环境
    print("\n💾 步骤 4: 备份生产环境数据", "bold");
    print("─────────────────────────────────────────────────────────", "cyan");
    print("⚠️  导入操作会替换生产环境的所有数据！", "red");
    print("强烈建议先备份生产环境的现有数据", "yellow");

    const shouldBackup = await confirm("是否现在备份生产环境？");
    if (shouldBackup) {
      const timestamp = new Date()
        .toISOString()
        .replace(/:/g, "-")
        .replace(/\..+/, "");
      const backupFile = path.join(
        backupDir,
        `production-backup-${timestamp}.jsonl`,
      );

      print(`\n正在备份到: ${path.basename(backupFile)}`, "cyan");
      try {
        execCommand(`npx convex export --path "${backupFile}" --prod`);
        print(`✅ 备份成功: ${backupFile}`, "green");
      } catch (error) {
        print(`❌ 备份失败: ${error.message}`, "red");
        const continueAnyway = await confirm("是否继续导入（不推荐）？");
        if (!continueAnyway) {
          print("导入已取消", "yellow");
          process.exit(0);
        }
      }
    } else {
      print("⚠️  跳过备份步骤", "yellow");
      const confirmSkip = await confirm("确定要在没有备份的情况下继续？");
      if (!confirmSkip) {
        print("导入已取消", "yellow");
        process.exit(0);
      }
    }

    // 步骤 5: 最终确认
    print("\n⚡ 步骤 5: 最终确认", "bold");
    print("─────────────────────────────────────────────────────────", "cyan");
    print("\n即将执行的操作:", "yellow");
    print(`  • 数据文件: ${path.basename(dataFile)}`, "cyan");
    print(`  • 目标环境: 生产环境 (PRODUCTION)`, "red");
    print(`  • 操作类型: 完全替换现有数据`, "red");

    print("\n⚠️  这是最后一次确认！", "red");
    const finalConfirm = await confirm("确定要导入到生产环境吗？");

    if (!finalConfirm) {
      print("✅ 导入已取消", "green");
      process.exit(0);
    }

    // 步骤 6: 执行导入
    print("\n🚀 步骤 6: 执行导入", "bold");
    print("─────────────────────────────────────────────────────────", "cyan");

    print("\n开始导入数据到生产环境...", "cyan");
    print("请稍候，这可能需要几分钟时间...\n", "yellow");

    try {
      execCommand(`npx convex import "${dataFile}" --prod`);

      print(
        "\n╔══════════════════════════════════════════════════════════╗",
        "green",
      );
      print(
        "║              ✅ 导入成功完成！                          ║",
        "green",
      );
      print(
        "╚══════════════════════════════════════════════════════════╝",
        "green",
      );

      // 步骤 7: 验证建议
      print("\n📋 后续步骤建议:", "bold");
      print(
        "─────────────────────────────────────────────────────────",
        "cyan",
      );
      print("1. 访问 Convex Dashboard 验证数据", "cyan");
      print("   https://dashboard.convex.dev", "blue");
      print("2. 测试扩展程序功能", "cyan");
      print("3. 监控应用运行状态", "cyan");
      print("4. 如有问题，使用备份文件回滚", "cyan");
    } catch (error) {
      print("\n❌ 导入失败！", "red");
      print(`错误信息: ${error.message}`, "red");

      print("\n🔄 故障排除建议:", "yellow");
      print("1. 检查网络连接", "cyan");
      print("2. 验证 Convex 认证状态: npx convex whoami", "cyan");
      print("3. 检查数据文件完整性", "cyan");
      print("4. 查看详细文档: docs/PRODUCTION_IMPORT_GUIDE.md", "cyan");

      process.exit(1);
    }
  } catch (error) {
    print(`\n❌ 发生错误: ${error.message}`, "red");
    process.exit(1);
  } finally {
    rl.close();
  }
}

// 运行主程序
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
