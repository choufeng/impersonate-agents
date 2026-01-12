# 技术实现方案

## 版本信息

- 创建日期: 2025-01-12
- 最后更新: 2025-01-12
- 状态: 设计阶段

---

## 核心逻辑汇总

### 1. 跳转流程（首次 vs 非首次）

#### 首次使用组合

```
1. 用户在 Popup 中选择组合 A
2. 检查 `currentCombinationInitialized` 标记
   - 标记不存在或与当前组合不匹配 → 需要 impersonate
3. 调用 impersonate 接口
   - 构建 impersonation URL: `{baseURL}/impersonate/{agent.username}`
   - 执行跳转
4. 等待冒充完成（500ms 延迟或监听 tab 更新）
5. 记录标记: `currentCombinationInitialized = combinationId`
6. 跳转到目标 URL（包含所有参数）
```

#### 非首次使用组合（只修改参数）

```
1. 用户在 Popup 中调整参数（Toggle 开关）
2. 检查 `currentCombinationInitialized` 标记
   - 标记存在且与当前组合匹配 → 不需要 impersonate
3. 直接跳转到目标 URL（包含临时修改的参数）
```

#### 切换组合

```
1. 用户切换到组合 B
2. 检查 `currentCombinationInitialized` 标记
   - 标记存在但与新组合不匹配 → 需要 impersonate
3. 调用 impersonate 接口
4. 记录新标记: `currentCombinationInitialized = combinationBId`
5. 跳转到目标 URL
```

---

### 2. T Force 功能（临时修改）

#### 临时修改机制

```
用户操作：
├─ 点击参数 Toggle → 改变 enabled 状态
├─ 点击 Redirect → 使用临时数据直接跳转
└─ 点击 Save → 将临时修改保存到永久配置

临时存储：
├─ 存储位置：内存
├─ 存储结构：Map<key, enabled>
└─ 生命周期：当前 Popup 会话

持久化：
├─ 触发条件：点击 Save 按钮
├─ 保存目标：Chrome Storage 中的参数表
└─ 保存后：Toast 提示 + 清除临时状态
```

#### Save 按钮状态

```tsx
// 只有存在临时修改时，Save 按钮才可用
<button disabled={tempOverrides.size === 0} onClick={handleSave}>
  保存配置
</button>
```

---

### 3. 草稿机制

#### 草稿判定规则

```typescript
const isDraft = (combination: Combination): boolean => {
  // 缺少任何必需字段 = 草稿
  return (
    !combination.agentId ||
    !combination.portId ||
    !combination.uriId ||
    combination.tailParameterIds.length === 0 ||
    combination.optyParameterIds.length === 0
  );
};
```

#### 草稿功能限制

- ❌ 草稿不出现在 Popup 的组合选项中
- ❌ 草稿不能用于执行跳转
- ✅ 草稿可以随时编辑
- ✅ 编辑草稿后，如果所有数据完整 → 自动转为正式组合
- ✅ 删除草稿需要确认对话框

#### 草稿 UI 标识

```tsx
// 在组合列表中标识草稿
<Card>
  <h3 className="card-title">
    {isDraft && <span className="badge badge-warning">草稿</span>}
    {title}
  </h3>
</Card>
```

---

### 4. 域名判断逻辑

#### 判断规则

```typescript
const isLocalDomain = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    // 只要有端口号，就认为是本地域名
    return !!urlObj.port;
  } catch {
    return false;
  }
};
```

#### 端口包含逻辑

```typescript
const buildBaseURL = (
  currentUrl: string,
  uriConfig: string,
  port: number | null,
): string => {
  const url = new URL(currentUrl);
  let base = `${url.protocol}//${url.hostname}`;

  // 只在本地域名（有端口号）且有配置端口时添加端口
  if (isLocalDomain(currentUrl) && port) {
    base = `${base}:${port}`;
  }

  return `${base}${uriConfig}`;
};
```

---

### 5. URL 参数构建逻辑

#### 参数规则

- ✅ 所有参数都包含在 URL 中
- ✅ 值为 `true` 或 `false`（字符串）
- ✅ 没有完全不包含的情况

#### 实现代码

```typescript
const buildQueryString = (params: TempOverride[]): string => {
  return params
    .map((p) => `${p.key}=${p.enabled ? "true" : "false"}`)
    .join("&");
};

// 示例
// 参数状态: { debug: true, verbose: false, lang: true }
// 生成 URL: ?debug=true&verbose=false&lang=true
```

---

## Chrome Storage 数据结构

### 完整的 Storage Schema

```typescript
interface StorageData {
  // === 基础数据表 ===

  // Agent 表
  agents: Agent[];

  // Port 表
  ports: Port[];

  // URI 表
  uris: UriEntry[];

  // 尾部参数表
  tailParameters: TailParameter[];

  // OPTY 参数表
  optyParameters: OptyParameter[];

  // 组合表
  combinations: Combination[];

  // === 运行时状态 ===

  // 当前组合的初始化标记（用于判断是否需要 impersonate）
  currentCombinationInitialized: string | null;

  // 最后选择的组合 ID（用于默认选中）
  lastSelectedCombinationId: string | null;

  // === UI 状态 ===

  // 侧边导航的当前选中项
  currentNavigation: NavigationType;
}

// === 数据模型 ===

interface Agent {
  id: string;
  username: string;
}

interface Port {
  id: string;
  port: number;
  description?: string;
}

interface UriEntry {
  id: string;
  uri: string;
  description?: string;
}

interface TailParameter {
  id: string;
  key: string;
  value: string;
}

interface OptyParameter {
  id: string;
  key: string; // Should start with "OPTY"
  value: string;
}

interface Combination {
  id: string;
  title: string;
  agentId: string | null;
  portId: string | null;
  uriId: string | null;
  tailParameterIds: string[];
  optyParameterIds: string[];
  createdAt: string;
  updatedAt: string;
}

// === 运行时类型 ===

type TempOverride = {
  key: string;
  enabled: boolean;
  isModified: boolean;
};

type NavigationType =
  | "agents"
  | "ports"
  | "uris"
  | "tail-parameters"
  | "opty-parameters"
  | "combinations";

// === 草稿判定 ===

const isDraft = (combination: Combination): boolean => {
  return (
    !combination.agentId ||
    !combination.portId ||
    !combination.uriId ||
    combination.tailParameterIds.length === 0 ||
    combination.optyParameterIds.length === 0
  );
};
```

---

## 核心功能实现

### 功能 1: Popup 页面

#### 功能需求

1. 组合选择下拉框
2. 完整配置展示（可编辑）
3. 参数列表（Toggle 开关）
4. Save 按钮（保存临时修改）
5. Redirect 按钮（执行跳转）

#### UI 结构

```tsx
<div className="w-[360px] p-4">
  {/* 标题栏 */}
  <div className="flex justify-between items-center mb-4">
    <h1 className="text-xl font-bold">IA</h1>
    <button onClick={openOptions}>⚙️ 设置</button>
  </div>

  {/* 组合选择 */}
  <select
    className="select select-bordered w-full mb-4"
    value={selectedCombinationId}
    onChange={handleCombinationChange}
  >
    <option disabled selected>
      选择配置...
    </option>
    {availableCombinations.map((combo) => (
      <option key={combo.id} value={combo.id}>
        {combo.title}
      </option>
    ))}
  </select>

  {/* 配置详情 */}
  {selectedCombination && (
    <div className="space-y-4">
      {/* 基础信息（可编辑） */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-4">
          <h3 className="font-bold mb-2">基础信息</h3>

          {/* Agent */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Agent</span>
            </label>
            <input
              type="text"
              className="input input-bordered input-sm"
              value={agent?.username || ""}
              onChange={(e) => handleAgentChange(e.target.value)}
            />
          </div>

          {/* Port */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Port</span>
            </label>
            <input
              type="text"
              className="input input-bordered input-sm"
              value={port?.port || ""}
              onChange={(e) => handlePortChange(e.target.value)}
            />
          </div>

          {/* URI */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">URI</span>
            </label>
            <input
              type="text"
              className="input input-bordered input-sm"
              value={uri?.uri || ""}
              onChange={(e) => handleUriChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 尾部参数（可临时调整） */}
      <div>
        <h3 className="font-bold mb-2">尾部参数</h3>
        <div className="space-y-2">
          {tailParams.map((param) => (
            <div key={param.key} className="flex items-center justify-between">
              <span className="text-sm">{param.key}</span>
              <div className="flex items-center gap-2">
                {param.isModified && <span>🔒</span>}
                <input
                  type="checkbox"
                  className="toggle toggle-sm"
                  checked={param.enabled}
                  onChange={(e) =>
                    handleToggleChange(param.key, e.target.checked)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* OPTY 参数（可临时调整） */}
      <div>
        <h3 className="font-bold mb-2">OPTY 参数</h3>
        <div className="space-y-2">
          {optyParams.map((param) => (
            <div key={param.key} className="flex items-center justify-between">
              <span className="text-sm">{param.key}</span>
              <div className="flex items-center gap-2">
                {param.isModified && <span>🔒</span>}
                <input
                  type="checkbox"
                  className="toggle toggle-sm"
                  checked={param.enabled}
                  onChange={(e) =>
                    handleToggleChange(param.key, e.target.checked)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 按钮 */}
      <div className="flex gap-2">
        <button
          className="btn btn-primary flex-1"
          disabled={tempOverrides.size === 0}
          onClick={handleSave}
        >
          💾 保存配置
        </button>
        <button className="btn btn-success flex-1" onClick={handleRedirect}>
          🚀 跳转
        </button>
      </div>
    </div>
  )}
</div>
```

#### 核心逻辑

```typescript
// === 状态管理 ===
const [selectedCombinationId, setSelectedCombinationId] = useState<
  string | null
>(null);
const [tempOverrides, setTempOverrides] = useState<Map<string, boolean>>(
  new Map(),
);
const [initializedCombination, setInitializedCombination] = useState<
  string | null
>(null);

// === 切换组合 ===
const handleCombinationChange = async (newId: string) => {
  setSelectedCombinationId(newId);

  // 清空临时修改
  setTempOverrides(new Map());

  // 保存最后选择的组合
  await storage.set("lastSelectedCombinationId", newId);

  // 清空初始化标记（下次跳转时需要 impersonate）
  await storage.set("currentCombinationInitialized", null);
};

// === 临时修改 ===
const handleToggleChange = (key: string, enabled: boolean) => {
  setTempOverrides((prev) => {
    const newMap = new Map(prev);
    if (enabled === getOriginalValue(key)) {
      newMap.delete(key); // 恢复原始值时，从 Map 中移除
    } else {
      newMap.set(key, enabled);
    }
    return newMap;
  });
};

// === 保存配置 ===
const handleSave = async () => {
  if (!selectedCombinationId) return;

  const combination = getCombinationById(selectedCombinationId);
  if (!combination) return;

  // 更新参数表
  for (const [key, value] of tempOverrides) {
    await updateParameter(key, value);
  }

  // 更新组合的最后修改时间
  await updateCombination(combination.id, {
    ...combination,
    updatedAt: new Date().toISOString(),
  });

  // 清除临时状态
  setTempOverrides(new Map());

  // Toast 提示
  showToast("配置已保存", "success");
};

// === 跳转逻辑 ===
const handleRedirect = async () => {
  if (!selectedCombinationId) return;

  const combination = getCombinationById(selectedCombinationId);
  if (!combination) return;

  const tab = await getCurrentTab();

  // 检查是否需要 impersonate
  const needImpersonate = await checkNeedImpersonate(selectedCombinationId);

  if (needImpersonate) {
    // 首次使用组合：调用 impersonate
    const baseURL = buildBaseURL(
      tab.url,
      getUriById(combination.uriId)?.uri || "",
      getPortById(combination.portId)?.port || null,
    );

    const agent = getAgentById(combination.agentId);
    const impersonationURL = buildImpersonationURL(baseURL, agent);

    // 执行 impersonate
    await chrome.tabs.update(tab.id, { url: impersonationURL });

    // 等待冒充完成
    await sleep(500);

    // 记录初始化标记
    await storage.set("currentCombinationInitialized", selectedCombinationId);
  }

  // 构建目标 URL
  const params = buildParametersWithOverrides(combination, tempOverrides);
  const queryString = buildQueryString(params);
  const targetURL = buildTargetURL(tab.url, combination, params, queryString);

  // 跳转到目标 URL
  await chrome.tabs.update(tab.id, { url: targetURL });
};

// === 检查是否需要 impersonate ===
const checkNeedImpersonate = async (
  combinationId: string,
): Promise<boolean> => {
  const initialized = await storage.get("currentCombinationInitialized");
  return initialized !== combinationId;
};
```

---

### 功能 2: Options 页面

#### 功能需求

1. 侧边导航（6 个类型）
2. 各类型数据的 CRUD 操作
3. 组合配置的 Wizard 分步表单
4. 实时保存到 Chrome Storage
5. 复制组合功能
6. 删除确认对话框

#### UI 结构

```tsx
<div className="flex h-screen">
  {/* 侧边导航 */}
  <aside className="w-64 bg-base-200">
    <nav className="menu p-4">
      <ul>
        <li>
          <a
            className={currentNav === "agents" ? "active" : ""}
            onClick={() => setCurrentNav("agents")}
          >
            Agents
          </a>
        </li>
        <li>
          <a
            className={currentNav === "ports" ? "active" : ""}
            onClick={() => setCurrentNav("ports")}
          >
            端口
          </a>
        </li>
        <li>
          <a
            className={currentNav === "uris" ? "active" : ""}
            onClick={() => setCurrentNav("uris")}
          >
            URI
          </a>
        </li>
        <li>
          <a
            className={currentNav === "tail-parameters" ? "active" : ""}
            onClick={() => setCurrentNav("tail-parameters")}
          >
            尾部参数
          </a>
        </li>
        <li>
          <a
            className={currentNav === "opty-parameters" ? "active" : ""}
            onClick={() => setCurrentNav("opty-parameters")}
          >
            OPTY 参数
          </a>
        </li>
        <li>
          <a
            className={currentNav === "combinations" ? "active" : ""}
            onClick={() => setCurrentNav("combinations")}
          >
            组合配置
          </a>
        </li>
      </ul>
    </nav>
  </aside>

  {/* 主内容区 */}
  <main className="flex-1 p-6 overflow-auto">
    {currentNav === "agents" && <AgentsList />}
    {currentNav === "ports" && <PortsList />}
    {currentNav === "uris" && <UrisList />}
    {currentNav === "tail-parameters" && <TailParametersList />}
    {currentNav === "opty-parameters" && <OptyParametersList />}
    {currentNav === "combinations" && <CombinationsList />}
  </main>
</div>
```

#### 组合配置的 Wizard 分步表单

```tsx
const CombinationWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [combination, setCombination] = useState<Partial<Combination>>({
    title: "",
    agentId: null,
    portId: null,
    uriId: null,
    tailParameterIds: [],
    optyParameterIds: [],
  });

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSave = async () => {
    const newCombination: Combination = {
      id: generateId(),
      ...(combination as Combination),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await storage.set("combinations", [...combinations, newCombination]);
    showToast("组合已保存", "success");
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* 步骤指示器 */}
      <div className="steps mb-8">
        <div className={`step step-${step >= 1 ? "primary" : ""}`}>
          1. 基本信息
        </div>
        <div className={`step step-${step >= 2 ? "primary" : ""}`}>
          2. 基础配置
        </div>
        <div className={`step step-${step >= 3 ? "primary" : ""}`}>
          3. 参数选择
        </div>
      </div>

      {/* 步骤 1：基本信息 */}
      {step === 1 && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="font-bold text-lg">基本信息</h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">组合标题 *</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={combination.title}
                onChange={(e) =>
                  setCombination((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="例如：开发环境配置"
              />
            </div>
            <div className="card-actions justify-end mt-4">
              <button className="btn" onClick={handleSave}>
                保存草稿
              </button>
              <button className="btn btn-primary" onClick={handleNext}>
                下一步
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 步骤 2：选择基础配置 */}
      {step === 2 && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="font-bold text-lg">选择基础配置</h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Agent</span>
              </label>
              <select
                className="select select-bordered"
                value={combination.agentId || ""}
                onChange={(e) =>
                  setCombination((prev) => ({
                    ...prev,
                    agentId: e.target.value || null,
                  }))
                }
              >
                <option value="">未选择</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.username}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Port</span>
              </label>
              <select
                className="select select-bordered"
                value={combination.portId || ""}
                onChange={(e) =>
                  setCombination((prev) => ({
                    ...prev,
                    portId: e.target.value || null,
                  }))
                }
              >
                <option value="">未选择</option>
                {ports.map((port) => (
                  <option key={port.id} value={port.id}>
                    {port.port} - {port.description}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">URI</span>
              </label>
              <select
                className="select select-bordered"
                value={combination.uriId || ""}
                onChange={(e) =>
                  setCombination((prev) => ({
                    ...prev,
                    uriId: e.target.value || null,
                  }))
                }
              >
                <option value="">未选择</option>
                {uris.map((uri) => (
                  <option key={uri.id} value={uri.id}>
                    {uri.uri}
                  </option>
                ))}
              </select>
            </div>
            <div className="card-actions justify-between mt-4">
              <button className="btn" onClick={handlePrev}>
                上一步
              </button>
              <div>
                <button className="btn mr-2" onClick={handleSave}>
                  保存草稿
                </button>
                <button className="btn btn-primary" onClick={handleNext}>
                  下一步
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 步骤 3：选择参数 */}
      {step === 3 && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="font-bold text-lg">选择参数</h3>

            {/* 尾部参数 */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">尾部参数</h4>
              <div className="space-y-2">
                {tailParameters.map((param) => (
                  <div key={param.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={combination.tailParameterIds?.includes(param.id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setCombination((prev) => ({
                          ...prev,
                          tailParameterIds: checked
                            ? [...(prev.tailParameterIds || []), param.id]
                            : (prev.tailParameterIds || []).filter(
                                (id) => id !== param.id,
                              ),
                        }));
                      }}
                    />
                    <span>
                      {param.key} = {param.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* OPTY 参数 */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">OPTY 参数</h4>
              <div className="space-y-2">
                {optyParameters.map((param) => (
                  <div key={param.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={combination.optyParameterIds?.includes(param.id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setCombination((prev) => ({
                          ...prev,
                          optyParameterIds: checked
                            ? [...(prev.optyParameterIds || []), param.id]
                            : (prev.optyParameterIds || []).filter(
                                (id) => id !== param.id,
                              ),
                        }));
                      }}
                    />
                    <span>
                      {param.key} = {param.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-actions justify-between mt-4">
              <button className="btn" onClick={handlePrev}>
                上一步
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                保存组合
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

#### 复制组合功能

```tsx
const handleCopyCombination = async (combination: Combination) => {
  const newCombination: Combination = {
    ...combination,
    id: generateId(),
    title: `${combination.title} - 副本`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await storage.set("combinations", [...combinations, newCombination]);
  showToast("组合已复制", "success");
};
```

#### 删除确认对话框

```tsx
const DeleteConfirmDialog: React.FC<{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  itemName: string;
}> = ({ isOpen, onConfirm, onCancel, itemName }) => {
  if (!isOpen) return null;

  return (
    <dialog open className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">确认删除</h3>
        <p className="py-4">确定要删除「{itemName}」吗？此操作无法撤销。</p>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn" onClick={onCancel}>
              取消
            </button>
            <button className="btn btn-error" onClick={onConfirm}>
              删除
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
};
```

---

## 核心工具函数（纯函数）

### URL 构建相关

```typescript
// 判断是否为本地域名
export const isLocalDomain = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return !!urlObj.port;
  } catch {
    return false;
  }
};

// 构建基础 URL
export const buildBaseURL = (
  currentUrl: string,
  uri: string,
  port: number | null,
): string => {
  const url = new URL(currentUrl);
  let base = `${url.protocol}//${url.hostname}`;

  if (isLocalDomain(currentUrl) && port) {
    base = `${base}:${port}`;
  }

  return `${base}${uri}`;
};

// 构建 impersonation URL
export const buildImpersonationURL = (
  baseURL: string,
  agent: Agent,
): string => {
  return `${baseURL}/impersonate/${agent.username}`;
};

// 构建查询字符串
export const buildQueryString = (params: TempOverride[]): string => {
  return params
    .map((p) => `${p.key}=${p.enabled ? "true" : "false"}`)
    .join("&");
};

// 构建目标 URL
export const buildTargetURL = (
  currentUrl: string,
  combination: Combination,
  params: TempOverride[],
  queryString: string,
): string => {
  const uri = getUriById(combination.uriId)?.uri || "";
  const port = getPortById(combination.portId)?.port || null;

  const baseURL = buildBaseURL(currentUrl, uri, port);
  return queryString ? `${baseURL}?${queryString}` : baseURL;
};
```

### 参数处理相关

```typescript
// 从组合获取参数列表（包含临时修改）
export const buildParametersWithOverrides = (
  combination: Combination,
  tempOverrides: Map<string, boolean>,
): TempOverride[] => {
  // 获取尾部参数
  const tailParams = combination.tailParameterIds
    .map((id) => getTailParameterById(id))
    .filter(Boolean)
    .map((p) => ({
      key: p.key,
      enabled: p.value === "true",
      isModified: tempOverrides.has(p.key),
    }));

  // 获取 OPTY 参数
  const optyParams = combination.optyParameterIds
    .map((id) => getOptyParameterById(id))
    .filter(Boolean)
    .map((p) => ({
      key: p.key,
      enabled: p.value === "true",
      isModified: tempOverrides.has(p.key),
    }));

  // 应用临时修改
  const allParams = [...tailParams, ...optyParams];
  return allParams.map((p) => ({
    ...p,
    enabled: tempOverrides.has(p.key) ? tempOverrides.get(p.key)! : p.enabled,
  }));
};
```

### Chrome Storage 操作（副作用隔离）

```typescript
import { Storage } from "@plasmohq/storage";

const storage = new Storage();

// 查询函数
export const getAgents = (): Promise<Agent[]> => {
  return storage.get("agents");
};

export const getAgentById = (id: string): Promise<Agent | null> => {
  return getAgents().then((agents) => agents.find((a) => a.id === id) || null);
};

export const getCombinations = (): Promise<Combination[]> => {
  return storage.get("combinations");
};

export const getCombinationById = (id: string): Promise<Combination | null> => {
  return getCombinations().then(
    (combinations) => combinations.find((c) => c.id === id) || null,
  );
};

// 创建函数
export const createAgent = async (agent: Omit<Agent, "id">): Promise<Agent> => {
  const newAgent: Agent = {
    id: generateId(),
    ...agent,
  };

  const agents = await getAgents();
  await storage.set("agents", [...agents, newAgent]);

  return newAgent;
};

// 更新函数
export const updateAgent = async (
  id: string,
  updates: Partial<Agent>,
): Promise<void> => {
  const agents = await getAgents();
  const updated = agents.map((a) => (a.id === id ? { ...a, ...updates } : a));
  await storage.set("agents", updated);
};

// 删除函数
export const deleteAgent = async (id: string): Promise<void> => {
  const agents = await getAgents();
  const filtered = agents.filter((a) => a.id !== id);
  await storage.set("agents", filtered);
};
```

---

## Plasmo 项目集成

### 项目结构

```
impersonate-agents/
├── .claude/
│   └── skills/
│       ├── plasmo/
│       │   └── SKILL.md
│       └── daisyui/
│           └── SKILL.md
├── docs/
│   ├── data-structure-design.md
│   ├── ui-design.md
│   └── implementation-plan.md  (本文件）
├── popup.tsx
├── options.tsx
├── background/
│   └── index.ts
├── lib/
│   ├── storage.ts        # Chrome Storage 操作
│   ├── url-builder.ts    # URL 构建工具函数
│   └── types.ts         # TypeScript 类型定义
└── style.css
```

### 使用 Plasmo Storage API

```typescript
// lib/storage.ts
import { Storage } from "@plasmohq/storage";

// 初始化 Storage（带默认值）
const storage = new Storage({
  config: {
    agents: [],
    ports: [],
    uris: [],
    tailParameters: [],
    optyParameters: [],
    combinations: [],
    currentCombinationInitialized: null,
    lastSelectedCombinationId: null,
  },
});

// 导出实例
export { storage };

// 导出类型
export type StorageData = typeof storage.config;
```

### Popup 组件集成

```typescript
// popup.tsx
import "style.css";
import { useEffect, useState } from "react";
import { storage, type StorageData } from "~lib/storage";

function Popup() {
  const [agents, setAgents] = useState<StorageData['agents']>([]);

  useEffect(() => {
    storage.watch({
      agents: (value) => setAgents(value)
    });
  }, []);

  return (
    // ... UI 渲染
  );
}

export default Popup;
```

### Options 组件集成

```typescript
// options.tsx
import "style.css";
import { useEffect, useState } from "react";
import { storage, type StorageData } from "~lib/storage";

function Options() {
  const [combinations, setCombinations] = useState<StorageData['combinations']>([]);

  useEffect(() => {
    storage.watch({
      combinations: (value) => setCombinations(value)
    });
  }, []);

  return (
    // ... UI 渲染
  );
}

export default Options;
```

---

## 技术栈总结

### 核心技术

- **框架**: React (TypeScript)
- **构建工具**: Plasmo
- **样式**: Tailwind CSS + DaisyUI
- **状态管理**: React Hooks
- **持久化**: Chrome Storage API (via Plasmo Storage)
- **标签页操作**: Chrome Tabs API

### 关键设计原则

1. **纯函数优先** - URL 构建逻辑使用纯函数
2. **副作用隔离** - Chrome Storage 操作封装在单独的模块
3. **类型安全** - 完整的 TypeScript 类型定义
4. **实时保存** - Options 页面修改立即持久化
5. **响应式设计** - Popup 适配小尺寸，Options 适配桌面
6. **无障碍支持** - 使用 ARIA 属性和语义化 HTML

---

## 下一步行动

### 阶段 1: 基础设施搭建

1. 创建 `lib/` 目录结构
2. 实现 `lib/storage.ts`
3. 实现 `lib/types.ts`
4. 实现 `lib/url-builder.ts`

### 阶段 2: Popup 页面实现

1. 创建 Popup 组件骨架
2. 实现组合选择功能
3. 实现参数展示和 Toggle 功能
4. 实现临时修改逻辑
5. 实现 Save 和 Redirect 功能

### 阶段 3: Options 页面实现

1. 创建 Options 组件骨架
2. 实现侧边导航
3. 实现各类型数据的 CRUD
4. 实现组合 Wizard 分步表单
5. 实现复制和删除功能

### 阶段 4: 测试和优化

1. 单元测试（纯函数）
2. 集成测试（Chrome Storage）
3. E2E 测试（Popup 和 Options 交互）
4. 性能优化和用户体验改进

---

## 参考文档

- [DaisyUI 组件库技能](../.claude/skills/daisyui/SKILL.md)
- [Plasmo 技能](../.claude/skills/plasmo/SKILL.md)
- [数据结构设计](./data-structure-design.md)
- [UI 设计方案](./ui-design.md)

---

**文档结束**
