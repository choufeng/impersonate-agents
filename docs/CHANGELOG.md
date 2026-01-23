# 更新日志

## 2026-01-23 - 修复 Convex Import 命令格式

### 🐛 修复的问题

修复了 Convex CLI 导入命令的参数格式错误。

**问题**: 使用了 `--path` 选项，但 Convex CLI 要求路径作为位置参数。

**错误命令**:

```bash
npx convex import --path file.zip --prod  # ❌ 错误
```

**正确命令**:

```bash
npx convex import file.zip --prod  # ✅ 正确
```

### 📝 更新的文件

**脚本文件**:

- `scripts/import-data.cjs` - 修复导入命令
- `scripts/export-data.cjs` - 更新提示信息
- `scripts/production-import-helper.cjs` - 修复交互式导入命令

**文档文件**:

- `docs/PRODUCTION_IMPORT_GUIDE.md`
- `docs/EXPORT_SUMMARY.md`
- `docs/QUICK_START.md`
- `docs/database-migration.md`
- `IMPORT_TO_PRODUCTION.md`

### ✅ 验证

现在所有导入命令都使用正确的格式：

```bash
# 导出（使用 --path 选项）
npx convex export --path output.zip

# 导入（路径作为位置参数）
npx convex import input.zip --prod
```

### 🚀 现在可以使用

所有导入方式现在都能正常工作：

```bash
# 方式 1: 交互式向导
pnpm db:deploy

# 方式 2: 快速导入
pnpm db:import:prod

# 方式 3: Convex CLI
npx convex import backup/database/dev-export-*.zip --prod
```
