# 🚀 导入数据到生产环境

## 最简单的方式（推荐）

使用交互式导入助手：

```bash
pnpm db:deploy
```

这个命令会启动一个交互式向导，引导你完成整个导入过程：

- ✅ 自动列出可用的数据文件
- ✅ 预览数据内容
- ✅ 检查认证状态
- ✅ 提示备份生产环境
- ✅ 多重确认保护
- ✅ 友好的错误提示

---

## 快速导入（适合有经验的用户）

如果你已经熟悉流程，可以直接使用：

```bash
# 1. 备份生产环境（重要！）
npx convex export --path backup/database/production-backup-$(date +%Y%m%d).zip --prod

# 2. 导入数据
pnpm db:import:prod
```

---

## 完整手动流程

### 步骤 1: 准备工作

确认你有：

- 开发环境导出的数据文件（位于 `backup/database/`）
- Convex 生产环境的访问权限
- 足够的时间（选择低流量时段）

### 步骤 2: 登录 Convex

```bash
npx convex login
```

### 步骤 3: 备份生产数据

⚠️ **这是最重要的步骤！**

```bash
npx convex export --path backup/database/production-backup-$(date +%Y%m%d-%H%M%S).zip --prod
```

### 步骤 4: 验证数据文件

```bash
# 查看可用的导出文件
ls -lh backup/database/

# 预览数据内容
unzip -l backup/database/dev-export-20260123-224051.zip

# 查看记录数
unzip -p backup/database/dev-export-20260123-224051.zip partners/documents.zip | wc -l
```

### 步骤 5: 执行导入

```bash
# 使用默认的导出文件
pnpm db:import:prod

# 或指定特定文件
node scripts/import-data.cjs backup/database/dev-export-20260123-224051.zip --prod
```

脚本会给你 5 秒钟确认时间，可以按 `Ctrl+C` 取消。

### 步骤 6: 验证导入结果

**在 Convex Dashboard:**

1. 访问 https://dashboard.convex.dev
2. 选择生产部署
3. 进入 "Data" 标签
4. 检查 `partners` 表（应该有 7 条记录）

**使用扩展程序:**

1. 安装/重新加载生产版扩展
2. 测试 partners 列表显示
3. 测试添加/删除地址功能

**使用 CLI:**

```bash
# 导出验证
npx convex export --path verify.zip --prod
unzip -p verify.zip partners/documents.zip | jq . | head -n 20
rm verify.zip
```

---

## 回滚数据（如果需要）

如果导入后发现问题：

```bash
# 使用之前的备份恢复
npx convex import backup/database/production-backup-YYYYMMDD-HHMMSS.zip --prod
```

---

## 三种导入方式对比

| 方式       | 命令                       | 适合场景             | 安全性     |
| ---------- | -------------------------- | -------------------- | ---------- |
| 交互式向导 | `pnpm db:deploy`           | 首次使用、不熟悉流程 | ⭐⭐⭐⭐⭐ |
| 项目脚本   | `pnpm db:import:prod`      | 熟悉流程、快速导入   | ⭐⭐⭐⭐   |
| Convex CLI | `npx convex import --prod` | 高级用户、自定义需求 | ⭐⭐⭐     |

---

## 当前可导入的数据

**文件**: `backup/database/dev-export-20260123-224051.zip`

- **大小**: 6.13 KB
- **表**: partners (7 条记录)
- **导出时间**: 2026-01-23 22:40

---

## 常见问题

### ❓ 导入会覆盖现有数据吗？

✅ 是的，会完全替换。所以必须先备份！

### ❓ 可以只导入特定表吗？

❌ Convex 的 import 会导入所有表。需要手动编辑 .zip 文件。

### ❓ 导入需要多长时间？

⏱️ 通常几秒到几分钟，取决于数据量。当前数据很小，应该很快。

### ❓ 导入失败怎么办？

🔧 查看详细指南: `docs/PRODUCTION_IMPORT_GUIDE.md`

---

## 详细文档

- 📘 [完整导入指南](./docs/PRODUCTION_IMPORT_GUIDE.md)
- 📗 [快速开始](./docs/QUICK_START.md)
- 📙 [数据库迁移指南](./docs/database-migration.md)
- 📕 [导出总结](./docs/EXPORT_SUMMARY.md)

---

## 需要帮助？

如果遇到问题：

1. 查看 `docs/PRODUCTION_IMPORT_GUIDE.md` 的故障排除部分
2. 检查 Convex Dashboard 的日志
3. 访问 Convex Discord: https://convex.dev/community
