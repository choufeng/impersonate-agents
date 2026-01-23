# 生产环境导入详细步骤

## 前提条件检查

在开始导入前，请确认：

- [ ] 你有生产环境的 Convex 部署访问权限
- [ ] 已经设置好生产环境的 `.env.local` 配置
- [ ] 有开发环境导出的数据文件
- [ ] 已通知团队成员即将进行数据导入
- [ ] 选择在低流量时段执行

## 步骤 1: 验证 Convex 配置

首先确认你的 Convex 配置正确：

```bash
# 查看 Convex 状态
npx convex dev --once

# 查看当前部署信息
npx convex env list
```

## 步骤 2: 登录 Convex（如果需要）

```bash
# 登录 Convex 账号
npx convex login

# 验证登录状态
npx convex whoami
```

## 步骤 3: 备份生产环境现有数据 ⚠️

**这是最重要的步骤！**

```bash
# 创建生产环境备份
npx convex export --path backup/database/production-backup-$(date +%Y%m%d-%H%M%S).zip --prod

# 验证备份文件
ls -lh backup/database/production-backup-*.zip
```

## 步骤 4: 验证要导入的数据

```bash
# 查看导出文件内容
unzip -l backup/database/dev-export-20260123-224051.zip

# 查看数据记录数
unzip -p backup/database/dev-export-20260123-224051.zip partners/documents.zip | wc -l

# 预览数据（前3条）
unzip -p backup/database/dev-export-20260123-224051.zip partners/documents.zip | head -n 3 | jq .
```

## 步骤 5: 确认生产环境部署

```bash
# 查看生产部署的 URL
npx convex env list --prod

# 或者在 Convex Dashboard 中确认
# https://dashboard.convex.dev
```

## 步骤 6: 执行导入

### 方式 1: 使用项目脚本（推荐）

```bash
# 使用默认的导出文件
pnpm db:import:prod

# 或指定特定文件
node scripts/import-data.cjs backup/database/dev-export-20260123-224051.zip --prod
```

**脚本会：**

1. 显示文件信息和大小
2. 提示你即将导入到生产环境
3. 给你 5 秒钟时间考虑（可按 Ctrl+C 取消）
4. 执行导入操作
5. 显示导入结果

### 方式 2: 使用 Convex CLI 直接导入

```bash
npx convex import backup/database/dev-export-20260123-224051.zip --prod
```

## 步骤 7: 验证导入结果

导入完成后，验证数据：

### 7.1 在 Convex Dashboard 验证

1. 访问 https://dashboard.convex.dev
2. 选择你的生产部署
3. 进入 "Data" 标签
4. 检查 `partners` 表是否有 7 条记录
5. 抽查几条数据确认内容正确

### 7.2 通过扩展程序验证

1. 安装生产版本的扩展程序
2. 打开 popup 界面
3. 检查 partners 列表是否正确显示
4. 测试添加/删除地址等功能

### 7.3 使用 Convex CLI 验证

```bash
# 查看表中的记录数
npx convex run partners:list --prod

# 或者导出并查看
npx convex export --path verify-import.zip --prod
unzip -p verify-import.zip partners/documents.zip | wc -l
```

## 步骤 8: 回滚（如果需要）

如果导入后发现问题，可以从备份恢复：

```bash
# 使用之前的备份恢复
npx convex import backup/database/production-backup-YYYYMMDD-HHMMSS.zip --prod
```

## 完整命令流程示例

```bash
# 1. 备份生产环境
npx convex export --path backup/database/production-backup-$(date +%Y%m%d-%H%M%S).zip --prod

# 2. 验证开发数据
ls -lh backup/database/dev-export-20260123-224051.zip

# 3. 导入到生产环境
pnpm db:import:prod

# 4. 验证导入（导出并检查）
npx convex export --path verify-import.zip --prod
unzip -p verify-import.zip partners/documents.zip | wc -l

# 5. 清理验证文件
rm verify-import.zip
```

## 常见问题

### Q1: 显示 "Authentication required"

**解决方案**:

```bash
npx convex login
```

### Q2: 显示 "No deployment found"

**解决方案**:

- 确认生产环境已部署
- 检查 `convex.json` 配置
- 在 Convex Dashboard 创建生产部署

### Q3: 导入后数据不显示

**可能原因**:

1. Schema 不匹配 - 检查生产环境的 schema 是否已部署
2. 扩展程序连接到错误的环境 - 检查扩展的 `PLASMO_PUBLIC_CONVEX_URL`
3. 缓存问题 - 重新加载扩展程序

### Q4: 导入时显示 "Schema validation failed"

**解决方案**:

1. 先部署最新的 schema 到生产环境
2. 确认开发和生产的 schema 一致

### Q5: 想要增量导入而不是完全替换

**说明**:
Convex 的 `import` 命令会替换所有数据。如需增量导入：

1. 导出生产数据
2. 手动合并 JSON 文件
3. 导入合并后的数据

或使用 Convex 的 mutation 函数逐条插入。

## 安全检查清单

导入前请确认：

- [ ] ✅ 已备份生产环境数据
- [ ] ✅ 已验证导入文件完整性
- [ ] ✅ Schema 已部署到生产环境
- [ ] ✅ 已通知团队成员
- [ ] ✅ 在低流量时段执行
- [ ] ✅ 准备好回滚方案
- [ ] ✅ 有访问 Convex Dashboard 的权限

## 需要帮助？

- Convex Discord: https://convex.dev/community
- Convex 文档: https://docs.convex.dev/database/import-export
- 项目文档: [QUICK_START.md](./QUICK_START.md)
