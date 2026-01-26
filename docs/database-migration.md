# 数据库数据导出导入指南

本文档说明如何在开发环境和生产环境之间迁移 Convex 数据库数据。

## 快速开始

### 1. 从开发环境导出数据

```bash
pnpm db:export
```

这将导出开发数据库的所有数据到 `data-export.zip` 文件。

你也可以指定自定义文件名：

```bash
node scripts/export-data.cjs my-backup.zip
```

### 2. 导入数据到生产环境

⚠️ **警告**: 导入操作会替换目标环境中的现有数据，请务必先备份！

```bash
pnpm db:import:prod
```

或者使用自定义文件：

```bash
node scripts/import-data.cjs my-backup.zip --prod
```

## 详细说明

### 导出数据

导出脚本会使用 Convex CLI 的 `convex export` 命令导出数据。

**命令格式:**

```bash
node scripts/export-data.cjs [输出文件名]
```

**参数:**

- `输出文件名` (可选): 导出文件的路径，默认为 `data-export.zip`

**示例:**

```bash
# 导出到默认文件
pnpm db:export

# 导出到指定文件
node scripts/export-data.cjs backup-2026-01-23.zip

# 导出到特定目录
node scripts/export-data.cjs backup/dev-data.zip
```

### 导入数据

导入脚本会使用 Convex CLI 的 `convex import` 命令导入数据。

**命令格式:**

```bash
node scripts/import-data.cjs [输入文件名] [--prod]
```

**参数:**

- `输入文件名` (可选): 要导入的文件路径，默认为 `data-export.zip`
- `--prod` (可选): 导入到生产环境，不加此参数则导入到开发环境

**示例:**

```bash
# 导入到开发环境（用于测试）
pnpm db:import

# 导入到生产环境
pnpm db:import:prod

# 从指定文件导入到生产环境
node scripts/import-data.cjs backup-2026-01-23.zip --prod
```

## 数据格式

导出的数据使用 JSONLines 格式（.zip），每行是一个 JSON 对象，代表数据库中的一条记录。

示例：

```jsonl
{"_id":"123","_creationTime":1234567890,"name":"Partner 1","addresses":["0x123..."]}
{"_id":"124","_creationTime":1234567891,"name":"Partner 2","addresses":["0x456..."]}
```

## 安全提示

1. **生产环境导入前务必备份**: 在导入数据到生产环境前，先导出一份生产环境的备份

   ```bash
   # 切换到生产环境并导出备份
   npx convex export --path production-backup.zip --prod
   ```

2. **验证数据**: 导出后检查 .zip 文件，确保数据正确

3. **测试导入**: 可以先在开发环境测试导入流程

   ```bash
   # 导入到开发环境测试
   pnpm db:import
   ```

4. **版本控制**: 不要将导出的数据文件提交到 git，它们可能包含敏感信息

## 常见问题

### Q: 导入会覆盖现有数据吗？

A: 是的，`convex import` 会替换目标环境中的所有数据。导入前请务必备份。

### Q: 如何只导出特定表的数据？

A: Convex CLI 目前导出所有表。如需筛选，可以在导出后手动编辑 .zip 文件，或使用 Convex 的查询功能。

### Q: 可以在不同 schema 版本之间迁移数据吗？

A: 可以，但如果 schema 有重大变更（如必填字段），可能需要先迁移 schema 或手动转换数据格式。

### Q: 导入失败了怎么办？

A: 检查：

1. Convex 部署是否正常运行
2. .zip 文件格式是否正确
3. schema 是否兼容
4. 是否有足够的权限

## 相关资源

- [Convex 数据导入导出文档](https://docs.convex.dev/cli#import-and-export)
- [Convex Schema 文档](https://docs.convex.dev/database/schemas)
