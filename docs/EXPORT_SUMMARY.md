# 数据库导出总结

## 导出完成 ✅

**导出时间**: 2026-01-23  
**导出文件**: `data-export.zip` (实际上是 ZIP 格式)  
**文件大小**: 6.13 KB  
**数据表数量**: 2 个表 (partners, \_tables)

## 导出内容

导出的 ZIP 文件包含以下内容：

```
data-export.zip/
├── README.md                           # Convex 导出说明
├── _tables/documents.zip             # 表元数据
├── partners/documents.zip            # partners 表数据
└── partners/generated_schema.zip     # partners 表 schema
```

### 数据表详情

1. **partners 表**: 包含合作伙伴信息
   - 字段: `_id`, `_creationTime`, `name`, `addresses`
   - 数据量: ~28 KB (未压缩)

## 下一步操作

### 方法 1: 使用提供的脚本（推荐）

导入到生产环境：

```bash
pnpm db:import:prod
```

导入到开发环境（测试用）：

```bash
pnpm db:import
```

### 方法 2: 使用 Convex CLI 直接操作

导入到生产环境：

```bash
npx convex import data-export.zip --prod
```

导入到开发环境：

```bash
npx convex import data-export.zip
```

## 重要提示

⚠️ **在导入到生产环境前：**

1. **备份生产数据库**

   ```bash
   npx convex export --path production-backup-$(date +%Y%m%d).zip --prod
   ```

2. **验证导出数据**
   - 解压 ZIP 文件查看内容
   - 确认数据完整性

3. **确认 Schema 兼容**
   - 确保生产环境的 schema 与导出数据兼容
   - 如有 schema 更新，先部署 schema

4. **选择合适的时间窗口**
   - 在低流量时段进行导入
   - 通知团队成员

## 数据查看

要查看导出的数据内容：

```bash
# 解压文件
unzip -d data-export-extracted data-export.zip

# 查看 partners 数据
cat data-export-extracted/partners/documents.zip | jq .

# 或者直接从 ZIP 中读取
unzip -p data-export.zip partners/documents.zip | jq .
```

## 故障排除

如果导入失败：

1. 检查 Convex 部署状态
2. 验证文件完整性（重新导出）
3. 确认有正确的权限
4. 查看 Convex Dashboard 的错误日志

## 相关文档

- [数据库迁移完整指南](./database-migration.md)
- [Convex 导入导出文档](https://docs.convex.dev/database/import-export)
