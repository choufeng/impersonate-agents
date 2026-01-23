# 数据库导出导入快速指南

## 📦 导出数据（从开发环境）

### 方式 1: 导出到默认位置

```bash
pnpm db:export
```

生成文件: `data-export.zip`

### 方式 2: 导出到自定义位置

```bash
pnpm db:export backup/database/export-$(date +%Y%m%d).zip
```

### 查看导出的数据

```bash
# 列出 ZIP 内容
unzip -l data-export.zip

# 查看 README
unzip -p data-export.zip README.md

# 查看 partners 数据（格式化）
unzip -p data-export.zip partners/documents.zip | jq .
```

---

## 📥 导入数据

### ⚠️ 导入前必读

**导入操作会替换目标环境的所有数据！**

建议步骤：

1. 先备份目标环境的现有数据
2. 验证要导入的数据文件
3. 在低流量时段执行导入

### 导入到开发环境（测试）

```bash
pnpm db:import
```

### 导入到生产环境

```bash
# 第一步：备份生产数据
npx convex export --path backup/production-backup-$(date +%Y%m%d).zip --prod

# 第二步：导入数据（会有 5 秒确认时间）
pnpm db:import:prod
```

### 使用自定义文件导入

```bash
# 开发环境
node scripts/import-data.cjs backup/database/my-data.zip

# 生产环境
node scripts/import-data.cjs backup/database/my-data.zip --prod
```

---

## 📊 当前导出的数据

**文件**: `backup/database/dev-export-20260123-224051.zip`  
**大小**: 6.13 KB  
**包含表**:

- `partners`: 7 条记录

**数据结构**:

```json
{
  "_id": "...",
  "_creationTime": 1769165330948.4902,
  "name": "Partner Name",
  "addresses": ["address1", "address2", ...]
}
```

---

## 🔧 故障排除

### 问题：导出失败

- 检查 Convex 是否正在运行: `pnpm server`
- 检查网络连接
- 验证 `.env.local` 中的 `PLASMO_PUBLIC_CONVEX_URL`

### 问题：导入失败

- 确认文件存在且未损坏: `file data-export.zip`
- 检查 schema 兼容性
- 查看 Convex Dashboard 错误日志

### 问题：权限错误

- 确认已登录 Convex: `npx convex auth`
- 验证有正确的部署权限

---

## 📚 更多信息

- 详细迁移指南: [database-migration.md](./database-migration.md)
- 导出摘要: [EXPORT_SUMMARY.md](./EXPORT_SUMMARY.md)
- Convex 官方文档: https://docs.convex.dev/database/import-export
