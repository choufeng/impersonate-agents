# Options 页面 UI/UX 设计方案

## 功能需求

为 Chrome 扩展的 Options 页面设计一套完整的用户界面，用于管理各类配置数据。

### 核心功能

1. **数据管理** - 对以下 6 张表进行 CRUD 操作
   - Agent 表
   - 端口表
   - URI 表
   - 尾部参数表
   - OPTY 参数表
   - 组合表

2. **快速切换** - 通过组合表快速切换配置并应用到运行环境

---

## UI 结构设计

### 整体布局

采用 **侧边导航 + 主内容区** 的经典布局：

```
┌─────────────────────────────────────────────┐
│  IA Configuration Options              [保存] │
├──────────────────┬──────────────────────────┤
│                  │                          │
│   侧边导航       │       主内容区           │
│                  │                          │
│  • Agents        │   [当前选中类型的内容]  │
│  • 端口          │                          │
│  • URI           │                          │
│  • 尾部参数      │                          │
│  • OPTY 参数     │                          │
│  • 组合配置      │                          │
│                  │                          │
└──────────────────┴──────────────────────────┘
```

---

## 各类型数据的 UI 设计

### 1. 通用表格视图（适用于所有类型）

采用 **卡片式列表** 或 **表格视图** 两种呈现方式：

#### 方案 A：卡片式列表

```
┌────────────────────────────────────┐
│  添加新 Agent      [搜索框]        │
├────────────────────────────────────┤
│  ┌──────────────────────────────┐  │
│  │  Agent #1                  │  │
│  │  用户名: user_123           │  │
│  │  ID: 550e8400-e29b...       │  │
│  │  [编辑] [删除] [复制ID]     │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │  Agent #2                  │  │
│  │  用户名: user_456           │  │
│  │  ID: 660e8400-e29c...       │  │
│  │  [编辑] [删除] [复制ID]     │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

#### 方案 B：表格视图

```
┌────────────────────────────────────────────────┐
│  添加新 Agent                      [搜索]      │
├──────────┬──────────────┬───────────┬──────────┤
│ ID       │ 用户名       │ 操作       │          │
├──────────┼──────────────┼───────────┼──────────┤
│ 550e84... │ user_123     │ [编辑][删除][复制]  │
│ 660e84... │ user_456     │ [编辑][删除][复制]  │
└──────────┴──────────────┴───────────┴──────────┘
```

**推荐**：卡片式列表更适合数据量不大的场景，视觉效果更好，操作更直观。

---

### 2. Agent 管理

#### 添加/编辑表单

```
┌────────────────────────────────────┐
│  添加 / 编辑 Agent                  │
├────────────────────────────────────┤
│  用户名 *                           │
│  [__________________________]      │
│                                      │
│  ID *                               │
│  [__________________________]       │
│  [生成随机ID]                       │
│                                      │
│  [取消]           [保存]            │
└────────────────────────────────────┘
```

---

### 3. 端口管理

#### 添加/编辑表单

```
┌────────────────────────────────────┐
│  添加 / 编辑 端口                   │
├────────────────────────────────────┤
│  端口号 *                           │
│  [__________________________]      │
│  (常见端口: [8080] [5432] [3000])  │
│                                      │
│  描述说明                           │
│  [__________________________]      │
│                                      │
│  [取消]           [保存]            │
└────────────────────────────────────┘
```

---

### 4. URI 管理

#### 添加/编辑表单

```
┌────────────────────────────────────┐
│  添加 / 编辑 URI                    │
├────────────────────────────────────┤
│  URI *                              │
│  [__________________________]      │
│  (示例: https://api.example.com)   │
│                                      │
│  描述说明                           │
│  [__________________________]      │
│                                      │
│  [取消]           [保存]            │
└────────────────────────────────────┘
```

---

### 5. 键值对参数管理（尾部参数 & OPTY 参数）

由于需要存储多个键值对，采用 **动态表单** 设计：

#### 添加/编辑表单

```
┌────────────────────────────────────┐
│  添加 / 编辑 尾部参数              │
├────────────────────────────────────┤
│  参数名 *                           │
│  [__________________________]      │
│                                      │
│  参数值 *                           │
│  [__________________________]      │
│                                      │
│  [取消]           [保存]            │
└────────────────────────────────────┘
```

#### OPTY 参数特殊提示

在添加/编辑 OPTY 参数时，添加验证和提示：

```
┌────────────────────────────────────┐
│  添加 / 编辑 OPTY 参数            │
├────────────────────────────────────┤
│  参数名 *                           │
│  [OPTY__________]                  │
│  ⚠️ 必须以 "OPTY" 开头              │
│                                      │
│  参数值 *                           │
│  [__________________________]      │
│                                      │
│  [取消]           [保存]            │
└────────────────────────────────────┘
```

---

### 6. 组合配置管理（核心交互）

#### 组合列表视图

```
┌────────────────────────────────────┐
│  添加新组合          [搜索框]       │
├────────────────────────────────────┤
│  ┌──────────────────────────────┐  │
│  │  📦 开发环境配置             │  │
│  │  Agent: user_123             │  │
│  │  Port: 8080                 │  │
│  │  URI: https://dev.api.com   │  │
│  │  尾部参数: 2个               │  │
│  │  OPTY 参数: 1个              │  │
│  │  [编辑] [删除] [应用配置]    │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │  📦 生产环境配置             │  │
│  │  Agent: user_prod            │  │
│  │  Port: 443                   │  │
│  │  URI: https://api.example.com│  │
│  │  尾部参数: 3个               │  │
│  │  OPTY 参数: 2个              │  │
│  │  [编辑] [删除] [应用配置]    │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

#### 创建/编辑组合表单（分步引导）

采用 **分步式表单**（Wizard）来降低认知负担：

**第一步：基本信息**

```
┌────────────────────────────────────┐
│  步骤 1/3: 基本信息    [<] [>]      │
├────────────────────────────────────┤
│  组合标题 *                         │
│  [开发环境配置]                    │
│                                      │
│  描述说明                           │
│  [用于本地开发环境的配置]          │
│                                      │
│              [下一步]               │
└────────────────────────────────────┘
```

**第二步：选择基础配置**

```
┌────────────────────────────────────┐
│  步骤 2/3: 选择基础配置  [<] [>]   │
├────────────────────────────────────┤
│  Agent                              │
│  [选择 Agent ▼] → user_123          │
│                                      │
│  Port                               │
│  [选择端口 ▼] → 8080                │
│                                      │
│  URI                                │
│  [选择 URI ▼] → https://dev.api.com│
│                                      │
│  [上一步]       [下一步]            │
└────────────────────────────────────┘
```

**第三步：选择参数**

```
┌────────────────────────────────────┐
│  步骤 3/3: 选择参数      [<] [>]   │
├────────────────────────────────────┤
│  尾部参数                           │
│  ☑ debug_mode=on                  │
│  ☑ verbose_logging=true            │
│  ☐ cache_ttl=300                   │
│  [+ 添加更多参数]                  │
│                                      │
│  OPTY 参数                          │
│  ☑ OPTY_TIMEOUT=30                 │
│  ☐ OPTY_RETRY=3                    │
│  [+ 添加更多参数]                  │
│                                      │
│  [上一步]       [保存配置]          │
└────────────────────────────────────┘
```

---

## 运行界面设计（应用组合）

当用户点击"应用配置"时，展示一个确认界面：

```
┌────────────────────────────────────────────┐
│                                             │
│     ✓ 应用配置成功                          │
│                                             │
│     已应用: "开发环境配置"                  │
│                                             │
│     ┌──────────────────────────────────┐   │
│     │ Agent: user_123                 │   │
│     │ Port: 8080                      │   │
│     │ URI: https://dev.api.com        │   │
│     │ 尾部参数: 2个                   │   │
│     │ OPTY 参数: 1个                  │   │
│     └──────────────────────────────────┘   │
│                                             │
│     [确定]                                  │
│                                             │
└────────────────────────────────────────────┘
```

---

## 交互细节

### 1. 拖拽排序

参数列表支持拖拽排序，调整参数的优先级。

### 2. 复制功能

所有 ID 字段提供一键复制功能：

- Hover 显示"复制"按钮
- 点击复制后显示"已复制"提示

### 3. 搜索和过滤

每个列表页面顶部提供搜索框，支持实时过滤：

- Agent: 按用户名或 ID 搜索
- 其他类型: 按名称或描述搜索

### 4. 确认对话框

删除操作需要二次确认：

```
┌────────────────────────────────────┐
│  ⚠️ 确认删除                       │
├────────────────────────────────────┤
│  确定要删除这个配置吗？             │
│  此操作无法撤销。                   │
│                                      │
│  [取消]           [删除]            │
└────────────────────────────────────┘
```

### 5. 表单验证

- 必填字段实时验证
- 提交前整体检查
- 错误信息清晰提示
- OPTY 参数前缀验证

---

## 颜色和主题建议

### 主色调

- Primary: `#3B82F6` (蓝色) - 主要按钮、选中状态
- Success: `#10B981` (绿色) - 保存成功、应用成功
- Danger: `#EF4444` (红色) - 删除操作
- Warning: `#F59E0B` (橙色) - 警告提示

### 间距规范

- Section 间距: 16px
- 表单项间距: 12px
- 按钮间距: 8px
- 卡片间距: 12px

---

## 技术实现建议

### 使用组件库

推荐使用 **shadcn/ui** 组件库，它提供：

- Card, Button, Input, Select 等基础组件
- Dialog/Modal 对话框
- Form 表单组件
- Toast 消息提示
- 完整的 TypeScript 类型支持

### 状态管理

- 使用 React Context 或 Zustand 管理全局状态
- 本地存储使用 Chrome Storage API
- 实时保存，避免数据丢失

### 导航方案

- 使用 URL hash 路由（如 `#agents`, `#combinations`）
- 或使用状态驱动的视图切换

---

## 下一步

需要委托 `frontend-ui-ux-engineer` 来：

1. 优化视觉设计细节
2. 提供具体的组件代码
3. 设计响应式布局
4. 添加动画和过渡效果

---

## Popup 页面设计

Popup 页面是浏览器扩展的核心交互界面，用于快速选择和应用组合配置。

### 整体布局

采用 **紧凑型垂直布局**，适配 Popup 的小尺寸（通常 350-400px 宽度）：

```
┌───────────────────────────────────────┐
│         IA                [设置按钮]   │
├───────────────────────────────────────┤
│                                       │
│  选择配置                              │
│  ┌─────────────────────────────────┐  │
│  │ 开发环境配置               ▼     │  │
│  │ 生产环境配置                      │  │
│  │ 测试环境配置                      │  │
│  └─────────────────────────────────┘  │
│                                       │
│  当前配置详情                          │
│  ┌─────────────────────────────────┐  │
│  │ Agent: user_123                 │  │
│  │ Port: 8080                     │  │
│  │ URI: https://dev.api.com       │  │
│  │                                │  │
│  │ 尾部参数（可临时调整）           │  │
│  │ ┌─────────────────────────────┐ │  │
│  │ │ debug: [on           ] 🔒   │ │  │
│  │ │ verbose: [true        ] 🔒   │ │  │
│  │ └─────────────────────────────┘ │  │
│  │                                │  │
│  │ OPTY 参数（可临时调整）          │  │
│  │ ┌─────────────────────────────┐ │  │
│  │ │ OPTY_TIMEOUT: [30      ] 🔒 │ │  │
│  │ │ OPTY_RETRY: [3        ] 🔒   │ │  │
│  │ └─────────────────────────────┘ │  │
│  └─────────────────────────────────┘  │
│                                       │
│  [🔒 表示已临时修改]                    │
│                                       │
│  [   保存配置   ]  [  🚀 跳转  ]      │
│                                       │
└───────────────────────────────────────┘
```

---

## 功能设计

### 1. 配置选择

- **下拉框**：显示所有可用的组合配置
- 默认选择最近使用的配置（记录在 Chrome Storage 中）
- 选项格式：`title (Agent: xxx, Port: xxx)` 提供快速识别

```typescript
interface CombinationOption {
  id: string;
  title: string;
  preview: string; // 例如 "user_123 : 8080"
}
```

### 2. 配置详情展示

当选中一个组合时，展示其完整配置：

#### 基础信息

```
Agent: user_123
Port: 8080
URI: https://dev.api.com
```

#### 参数列表（可编辑）

每个参数显示：

- 参数名（key）
- 当前值（value）
- 锁定图标（🔒）表示该值已被临时修改

**交互细节：**

- 点击参数值 → 变为输入框进行编辑
- 失去焦点或按 Enter → 保存临时值
- 按 Esc → 取消修改，恢复原始值
- 实时显示修改状态（🔒 图标）

### 3. 临时调整功能（Temporary Force）

**概念**：用户可以临时修改参数值，不需要保存到原始配置中。

#### 实现机制

使用纯函数式编程：

```typescript
// 类型定义
type TempOverride = {
  key: string;
  value: string;
  isModified: boolean;
};

// 从组合获取参数列表（纯函数）
const getParametersFromCombination = (
  combination: Combination,
): TempOverride[] => {
  const tailParams = combination.tailParameterIds
    .map((id) => getTailParameterById(id))
    .map((p) => ({ key: p.key, value: p.value, isModified: false }));

  const optyParams = combination.optyParameterIds
    .map((id) => getOptyParameterById(id))
    .map((p) => ({ key: p.key, value: p.value, isModified: false }));

  return [...tailParams, ...optyParams];
};

// 应用临时修改（纯函数）
const applyTempOverride = (
  params: TempOverride[],
  key: string,
  newValue: string,
): TempOverride[] => {
  return params.map((p) =>
    p.key === key ? { ...p, value: newValue, isModified: true } : p,
  );
};

// 重置单个参数（纯函数）
const resetParameter = (
  params: TempOverride[],
  originalParams: TempOverride[],
  key: string,
): TempOverride[] => {
  const originalValue = originalParams.find((p) => p.key === key)?.value;
  if (!originalValue) return params;

  return params.map((p) =>
    p.key === key ? { ...p, value: originalValue, isModified: false } : p,
  );
};

// 重置所有参数（纯函数）
const resetAllParameters = (originalParams: TempOverride[]): TempOverride[] => {
  return originalParams.map((p) => ({ ...p, isModified: false }));
};

// 构建最终的参数查询字符串（纯函数）
const buildQueryString = (params: TempOverride[]): string => {
  return params.map((p) => `${p.key}=${p.value}`).join("&");
};
```

#### 临时存储

临时修改存储在内存中（不持久化），但可以在当前会话中保持：

```typescript
interface SessionState {
  selectedCombinationId: string | null;
  tempOverrides: Map<string, string>; // key -> temp value
}

// 更新临时状态（纯函数）
const updateTempOverride = (
  state: SessionState,
  key: string,
  value: string,
): SessionState => ({
  ...state,
  tempOverrides: new Map(state.tempOverrides).set(key, value),
});
```

### 4. Save 按钮

将临时修改保存到原始配置中：

```typescript
// 保存临时修改到配置（纯函数）
const saveTempOverridesToCombination = async (
  combination: Combination,
  tempOverrides: Map<string, string>,
): Promise<Combination> => {
  // 更新尾部参数
  const updatedTailParams = combination.tailParameterIds.map((id) => {
    const param = getTailParameterById(id);
    const tempValue = tempOverrides.get(param.key);

    if (tempValue) {
      const updated = { ...param, value: tempValue };
      updateTailParameter(id, updated);
      return updated;
    }
    return param;
  });

  // 更新 OPTY 参数
  const updatedOptyParams = combination.optyParameterIds.map((id) => {
    const param = getOptyParameterById(id);
    const tempValue = tempOverrides.get(param.key);

    if (tempValue) {
      const updated = { ...param, value: tempValue };
      updateOptyParameter(id, updated);
      return updated;
    }
    return param;
  });

  // 更新组合的最后修改时间
  return {
    ...combination,
    updatedAt: new Date().toISOString(),
  };
};
```

**保存流程：**

1. 检查是否有临时修改
2. 如果有 → 确认对话框："确定要保存这些修改到配置吗？"
3. 确认后 → 更新参数表和组合表
4. 成功提示："✓ 配置已保存"
5. 清除临时状态

### 5. 跳转按钮

根据当前配置（包含临时修改）构建 URL 并跳转：

```typescript
// 判断是否为本地域名（纯函数）
const isLocalDomain = (url: string): boolean => {
  try {
    const hostname = new URL(url).hostname;
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.")
    );
  } catch {
    return false;
  }
};

// 构建基础 URL（纯函数）
const buildBaseURL = (
  currentUrl: string,
  uriConfig: string,
  port: number | null,
): string => {
  const url = new URL(currentUrl);
  let base = `${url.protocol}//${url.hostname}`;

  // 只在本地域名且有端口时添加端口
  if (isLocalDomain(currentUrl) && port) {
    base = `${base}:${port}`;
  }

  return `${base}${uriConfig}`;
};

// 构建 Agent 冒充 URL（纯函数）
const buildAgentImpersonationURL = (baseURL: string, agent: Agent): string => {
  return `${baseURL}/impersonate/${agent.username}`;
};

// 构建完整跳转 URL（纯函数）
const buildRedirectURL = (
  currentUrl: string,
  combination: Combination,
  params: TempOverride[],
): string => {
  // 获取组合中的配置
  const agent = getAgentById(combination.agentId);
  const port = getPortById(combination.portId);
  const uri = getUriById(combination.uriId);

  // 构建基础 URL
  const baseURL = buildBaseURL(currentUrl, uri.uri, port?.port || null);

  // 构建参数字符串
  const queryString = buildQueryString(params);

  // 组合完整 URL
  return queryString ? `${baseURL}?${queryString}` : baseURL;
};
```

**跳转流程：**

```
1. 检查域名权限（是否允许使用）
   ↓
2. 构建 Agent 冒充 URL → 调用 /impersonate/
   ↓
3. 构建目标 URL（包含参数）
   ↓
4. 执行跳转
```

---

## 完整的函数式架构

### 数据层（纯函数）

```typescript
// ============ 查询函数 ============

const getAgentById = (id: string): Agent | null => {
  /* ... */
};
const getPortById = (id: string): Port | null => {
  /* ... */
};
const getUriById = (id: string): UriEntry | null => {
  /* ... */
};
const getTailParameterById = (id: string): TailParameter | null => {
  /* ... */
};
const getOptyParameterById = (id: string): OptyParameter | null => {
  /* ... */
};
const getCombinationById = (id: string): Combination | null => {
  /* ... */
};
const getAllCombinations = (): Combination[] => {
  /* ... */
};

// ============ 转换函数 ============

const combinationsToOptions = (
  combinations: Combination[],
): CombinationOption[] => {
  return combinations.map((combo) => {
    const agent = getAgentById(combo.agentId);
    const port = getPortById(combo.portId);
    return {
      id: combo.id,
      title: combo.title,
      preview: `${agent?.username || "N/A"} : ${port?.port || "N/A"}`,
    };
  });
};

const combinationToParameters = (combination: Combination): TempOverride[] => {
  return getParametersFromCombination(combination);
};

// ============ 业务逻辑函数 ============

const isLocalDomain = (url: string): boolean => {
  /* ... */
};
const buildBaseURL = (
  currentUrl: string,
  uri: string,
  port: number | null,
): string => {
  /* ... */
};
const buildQueryString = (params: TempOverride[]): string => {
  /* ... */
};
const buildRedirectURL = (
  currentUrl: string,
  combination: Combination,
  params: TempOverride[],
): string => {
  /* ... */
};

const applyTempOverride = (
  params: TempOverride[],
  key: string,
  value: string,
): TempOverride[] => {
  /* ... */
};
const resetParameter = (
  params: TempOverride[],
  original: TempOverride[],
  key: string,
): TempOverride[] => {
  /* ... */
};
const resetAllParameters = (original: TempOverride[]): TempOverride[] => {
  /* ... */
};

// ============ 存储操作（副作用隔离） ============

const updateTailParameter = async (
  id: string,
  param: TailParameter,
): Promise<void> => {
  const storage = await getStorage();
  const updated = storage.tailParameters.map((p) => (p.id === id ? param : p));
  await setStorage({ tailParameters: updated });
};

const updateOptyParameter = async (
  id: string,
  param: OptyParameter,
): Promise<void> => {
  const storage = await getStorage();
  const updated = storage.optyParameters.map((p) => (p.id === id ? param : p));
  await setStorage({ optyParameters: updated });
};

const saveTempOverridesToCombination = async (
  combination: Combination,
  tempOverrides: Map<string, string>,
): Promise<Combination> => {
  /* ... */
};

// ============ Chrome API 封装 ============

const getStorage = async (): Promise<StorageData> => {
  return (await chrome.storage.local.get()) as Promise<StorageData>;
};

const setStorage = async (data: Partial<StorageData>): Promise<void> => {
  return await chrome.storage.local.set(data);
};

const getCurrentTab = async (): Promise<chrome.tabs.Tab> => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
};

const redirectTab = async (url: string): Promise<void> => {
  const tab = await getCurrentTab();
  await chrome.tabs.update(tab.id, { url });
};
```

### UI 层（React 组件）

```typescript
// ============ Hooks ============

const useCombinationOptions = (): CombinationOption[] => {
  return useMemo(() => {
    const combinations = getAllCombinations();
    return combinationsToOptions(combinations);
  }, []);
};

const useSessionState = (combinationId: string | null): {
  params: TempOverride[];
  originalParams: TempOverride[];
  tempOverrides: Map<string, string>;
  updateOverride: (key: string, value: string) => void;
  resetOverride: (key: string) => void;
  resetAll: () => void;
} => {
  const [state, setState] = useState<SessionState>({
    selectedCombinationId: combinationId,
    tempOverrides: new Map()
  });

  const originalParams = useMemo(() => {
    if (!combinationId) return [];
    const combination = getCombinationById(combinationId);
    return combination ? combinationToParameters(combination) : [];
  }, [combinationId]);

  const params = useMemo(() => {
    return originalParams.map(p => {
      const tempValue = state.tempOverrides.get(p.key);
      return tempValue
        ? { ...p, value: tempValue, isModified: true }
        : p;
    });
  }, [originalParams, state.tempOverrides]);

  const updateOverride = useCallback((key: string, value: string) => {
    setState(prev => ({
      ...prev,
      tempOverrides: new Map(prev.tempOverrides).set(key, value)
    }));
  }, []);

  const resetOverride = useCallback((key: string) => {
    setState(prev => {
      const newOverrides = new Map(prev.tempOverrides);
      newOverrides.delete(key);
      return { ...prev, tempOverrides: newOverrides };
    });
  }, []);

  const resetAll = useCallback(() => {
    setState(prev => ({ ...prev, tempOverrides: new Map() }));
  }, []);

  return { params, originalParams, state.tempOverrides, updateOverride, resetOverride, resetAll };
};

// ============ 组件 ============

const ParameterRow: React.FC<{
  param: TempOverride;
  onUpdate: (key: string, value: string) => void;
  onReset: (key: string) => void;
}> = ({ param, onUpdate, onReset }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(param.value);

  const handleSave = () => {
    onUpdate(param.key, value);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="w-32 truncate">{param.key}:</span>
      {isEditing ? (
        <>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') {
                setValue(param.value);
                setIsEditing(false);
              }
            }}
            autoFocus
            className="flex-1 px-2 py-1 border rounded"
          />
          <button onClick={handleSave}>✓</button>
        </>
      ) : (
        <>
          <span
            className="flex-1 px-2 py-1 cursor-pointer hover:bg-gray-100"
            onClick={() => setIsEditing(true)}
          >
            {param.value}
          </span>
          {param.isModified && (
            <>
              <span>🔒</span>
              <button onClick={() => onReset(param.key)}>↩️</button>
            </>
          )}
        </>
      )}
    </div>
  );
};

const PopupContent: React.FC = () => {
  const options = useCombinationOptions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { params, tempOverrides, updateOverride, resetOverride } = useSessionState(selectedId);
  const [isSaving, setIsSaving] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSave = async () => {
    if (!selectedId) return;
    const combination = getCombinationById(selectedId);
    if (!combination) return;

    setIsSaving(true);
    await saveTempOverridesToCombination(combination, tempOverrides);
    setIsSaving(false);
    // 清除临时状态或刷新
    window.location.reload();
  };

  const handleRedirect = async () => {
    if (!selectedId) return;
    const combination = getCombinationById(selectedId);
    if (!combination) return;

    const tab = await getCurrentTab();
    const url = buildRedirectURL(tab.url, combination, params);

    setIsRedirecting(true);

    // 先执行冒充
    const agent = getAgentById(combination.agentId);
    if (agent) {
      const baseURL = buildBaseURL(tab.url, getUriById(combination.uriId)?.uri || '', getPortById(combination.portId)?.port || null);
      const impersonationURL = buildAgentImpersonationURL(baseURL, agent);
      await redirectTab(impersonationURL);

      // 等待冒充完成后跳转到目标 URL
      setTimeout(() => {
        redirectTab(url);
      }, 500);
    } else {
      await redirectTab(url);
    }
  };

  return (
    <div className="w-[360px] p-4">
      {/* 下拉框 */}
      <select
        value={selectedId || ''}
        onChange={(e) => setSelectedId(e.target.value || null)}
        className="w-full mb-4 p-2 border rounded"
      >
        <option value="">选择配置...</option>
        {options.map(opt => (
          <option key={opt.id} value={opt.id}>{opt.title}</option>
        ))}
      </select>

      {/* 参数列表 */}
      {selectedId && (
        <div className="space-y-4">
          {/* 尾部参数 */}
          <div>
            <h3 className="font-semibold mb-2">尾部参数</h3>
            <div className="space-y-2">
              {params.filter(p => !p.key.startsWith('OPTY')).map(param => (
                <ParameterRow
                  key={param.key}
                  param={param}
                  onUpdate={updateOverride}
                  onReset={resetOverride}
                />
              ))}
            </div>
          </div>

          {/* OPTY 参数 */}
          <div>
            <h3 className="font-semibold mb-2">OPTY 参数</h3>
            <div className="space-y-2">
              {params.filter(p => p.key.startsWith('OPTY')).map(param => (
                <ParameterRow
                  key={param.key}
                  param={param}
                  onUpdate={updateOverride}
                  onReset={resetOverride}
                />
              ))}
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={tempOverrides.size === 0 || isSaving}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              {isSaving ? '保存中...' : '保存配置'}
            </button>
            <button
              onClick={handleRedirect}
              disabled={isRedirecting}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
            >
              {isRedirecting ? '跳转中...' : '🚀 跳转'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## 核心逻辑总结

### 域名判断逻辑

参考旧代码（backup/popup.tsx.bak）：

```typescript
// 检查当前页面是否在允许的域名下
const checkDomainPermission = async (
  configuredDomain: string,
): Promise<boolean> => {
  const tab = await getCurrentTab();
  return tab.url.includes(configuredDomain);
};

// 判断是否为本地域名
const isLocalDomain = (url: string): boolean => {
  try {
    const hostname = new URL(url).hostname;
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.")
    );
  } catch {
    return false;
  }
};
```

### 端口包含逻辑

参考旧代码（backup/popup.tsx.bak）的三条件判断：

```typescript
const buildBaseURL = (
  currentUrl: string,
  uri: string,
  port: number | null,
  autoPortConversion: boolean = true,
): string => {
  const url = new URL(currentUrl);
  let base = `${url.protocol}//${url.hostname}`;

  // 条件1: 本地域名 + 开启自动端口转换 + 配置了端口 + 当前URL有端口
  if (isLocalDomain(currentUrl) && autoPortConversion && port && url.port) {
    base = `${base}:${port}`;
  }
  // 条件2: 当前URL有端口
  else if (url.port) {
    base = `${base}:${url.port}`;
  }
  // 条件3: 不包含端口

  return `${base}${uri}`;
};
```

### 参数构建逻辑

```typescript
const buildQueryString = (params: TempOverride[]): string => {
  return params.map((p) => `${p.key}=${p.value}`).join("&");
};

// 旧代码中，OPTY 参数会添加 opty_ 前缀
const buildLegacyQueryString = (params: TempOverride[]): string => {
  const optyParams = params
    .filter((p) => p.key.startsWith("OPTY"))
    .map((p) => `opty_${p.key}=${p.value}`);

  const tailParams = params
    .filter((p) => !p.key.startsWith("OPTY"))
    .map((p) => `${p.key}=${p.value}`);

  return [...optyParams, ...tailParams].join("&");
};
```

---

## 下一步行动

1. **实现数据层** - 所有纯函数和存储操作
2. **实现 UI 层** - React 组件和 Hooks
3. **集成测试** - 测试 URL 构建逻辑
4. **委托 UI/UX 工程师** - 优化视觉效果和动画
