/**
 * Chrome Storage 封装
 *
 * 使用 Plasmo 的 Storage API 进行类型安全的存储操作
 */

import { Storage } from "@plasmohq/storage";
import type {
  Agent,
  Port,
  UriEntry,
  TailParameter,
  OptyParameter,
  Combination,
  CreateAgent,
  CreatePort,
  CreateUri,
  CreateTailParameter,
  CreateOptyParameter,
  CreateCombination,
  UpdateAgent,
  UpdatePort,
  UpdateUri,
  UpdateTailParameter,
  UpdateOptyParameter,
  UpdateCombination,
} from "./types";

// ============================================================================
// Storage 实例初始化
// ============================================================================

/**
 * Storage 实例
 * 使用 Chrome 的 local storage
 */
const storage = new Storage({
  area: "local",
});

// 导出 storage 实例，供其他模块使用
export { storage };

// ============================================================================
// 辅助函数：生成 ID
// ============================================================================

/**
 * 生成随机 ID
 */
const generateId = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * 获取当前时间戳
 */
const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * 判断组合是否为草稿
 */
const isDraft = (combination: Combination): boolean => {
  return (
    !combination.agentId ||
    !combination.portId ||
    !combination.uriId ||
    combination.tailParameterIds.length === 0 ||
    combination.optyParameterIds.length === 0
  );
};

// ============================================================================
// Agent 操作
// ============================================================================

/**
 * 获取所有 Agents
 */
export const getAgents = async (): Promise<Agent[]> => {
  const data = await storage.get<Agent[]>("agents");
  return data ?? [];
};

/**
 * 根据 ID 获取单个 Agent
 */
export const getAgentById = async (id: string): Promise<Agent | null> => {
  const agents = await getAgents();
  return agents.find((agent) => agent.id === id) || null;
};

/**
 * 创建新的 Agent
 */
export const createAgent = async (data: CreateAgent): Promise<Agent> => {
  const agents = await getAgents();

  // 检查 ID 是否已存在
  if (agents.some((agent) => agent.id === data.id)) {
    throw new Error(`Agent ID "${data.id}" 已存在`);
  }

  await storage.set("agents", [...agents, data]);

  return data;
};

/**
 * 更新 Agent
 */
export const updateAgent = async (
  id: string,
  updates: UpdateAgent,
): Promise<void> => {
  const agents = await getAgents();

  // 如果更新包含 ID，检查新 ID 是否已存在
  if (updates.id && updates.id !== id) {
    if (agents.some((agent) => agent.id === updates.id)) {
      throw new Error(`Agent ID "${updates.id}" 已存在`);
    }
  }

  const updated = agents.map((agent) =>
    agent.id === id ? { ...agent, ...updates } : agent,
  );
  await storage.set("agents", updated);
};

/**
 * 删除 Agent
 */
export const deleteAgent = async (id: string): Promise<void> => {
  const agents = await getAgents();
  const filtered = agents.filter((agent) => agent.id !== id);
  await storage.set("agents", filtered);
};

// ============================================================================
// Port 操作
// ============================================================================

/**
 * 获取所有 Ports
 */
export const getPorts = async (): Promise<Port[]> => {
  const data = await storage.get<Port[]>("ports");
  return data ?? [];
};

/**
 * 根据 ID 获取单个 Port
 */
export const getPortById = async (id: string): Promise<Port | null> => {
  const ports = await getPorts();
  return ports.find((port) => port.id === id) || null;
};

/**
 * 创建新的 Port
 */
export const createPort = async (data: CreatePort): Promise<Port> => {
  const newPort: Port = {
    id: generateId(),
    ...data,
  };

  const ports = await getPorts();
  await storage.set("ports", [...ports, newPort]);

  return newPort;
};

/**
 * 更新 Port
 */
export const updatePort = async (
  id: string,
  updates: UpdatePort,
): Promise<void> => {
  const ports = await getPorts();
  const updated = ports.map((port) =>
    port.id === id ? { ...port, ...updates } : port,
  );
  await storage.set("ports", updated);
};

/**
 * 删除 Port
 */
export const deletePort = async (id: string): Promise<void> => {
  const ports = await getPorts();
  const filtered = ports.filter((port) => port.id !== id);
  await storage.set("ports", filtered);
};

// ============================================================================
// URI 操作
// ============================================================================

/**
 * 获取所有 URIs
 */
export const getUris = async (): Promise<UriEntry[]> => {
  const data = await storage.get<UriEntry[]>("uris");
  return data ?? [];
};

/**
 * 根据 ID 获取单个 URI
 */
export const getUriById = async (id: string): Promise<UriEntry | null> => {
  const uris = await getUris();
  return uris.find((uri) => uri.id === id) || null;
};

/**
 * 创建新的 URI
 */
export const createUri = async (data: CreateUri): Promise<UriEntry> => {
  const newUri: UriEntry = {
    id: generateId(),
    ...data,
  };

  const uris = await getUris();
  await storage.set("uris", [...uris, newUri]);

  return newUri;
};

/**
 * 更新 URI
 */
export const updateUri = async (
  id: string,
  updates: UpdateUri,
): Promise<void> => {
  const uris = await getUris();
  const updated = uris.map((uri) =>
    uri.id === id ? { ...uri, ...updates } : uri,
  );
  await storage.set("uris", updated);
};

/**
 * 删除 URI
 */
export const deleteUri = async (id: string): Promise<void> => {
  const uris = await getUris();
  const filtered = uris.filter((uri) => uri.id !== id);
  await storage.set("uris", filtered);
};

// ============================================================================
// Tail Parameter 操作
// ============================================================================

/**
 * 获取所有 Tail Parameters
 */
export const getTailParameters = async (): Promise<TailParameter[]> => {
  const data = await storage.get<TailParameter[]>("tailParameters");
  return data ?? [];
};

/**
 * 根据 ID 获取单个 Tail Parameter
 */
export const getTailParameterById = async (
  id: string,
): Promise<TailParameter | null> => {
  const tailParameters = await getTailParameters();
  return tailParameters.find((param) => param.id === id) || null;
};

/**
 * 根据 key 获取 Tail Parameter
 */
export const getTailParameterByKey = async (
  key: string,
): Promise<TailParameter | null> => {
  const tailParameters = await getTailParameters();
  return tailParameters.find((param) => param.key === key) || null;
};

/**
 * 创建新的 Tail Parameter
 */
export const createTailParameter = async (
  data: CreateTailParameter,
): Promise<TailParameter> => {
  const newParameter: TailParameter = {
    id: generateId(),
    ...data,
  };

  const tailParameters = await getTailParameters();
  await storage.set("tailParameters", [...tailParameters, newParameter]);

  return newParameter;
};

/**
 * 更新 Tail Parameter
 */
export const updateTailParameter = async (
  id: string,
  updates: UpdateTailParameter,
): Promise<void> => {
  const tailParameters = await getTailParameters();
  const updated = tailParameters.map((param) =>
    param.id === id ? { ...param, ...updates } : param,
  );
  await storage.set("tailParameters", updated);
};

/**
 * 删除 Tail Parameter
 */
export const deleteTailParameter = async (id: string): Promise<void> => {
  const tailParameters = await getTailParameters();
  const filtered = tailParameters.filter((param) => param.id !== id);
  await storage.set("tailParameters", filtered);
};

// ============================================================================
// OPTY Parameter 操作
// ============================================================================

/**
 * 获取所有 OPTY Parameters
 */
export const getOptyParameters = async (): Promise<OptyParameter[]> => {
  const data = await storage.get<OptyParameter[]>("optyParameters");
  return data ?? [];
};

/**
 * 根据 ID 获取单个 OPTY Parameter
 */
export const getOptyParameterById = async (
  id: string,
): Promise<OptyParameter | null> => {
  const optyParameters = await getOptyParameters();
  return optyParameters.find((param) => param.id === id) || null;
};

/**
 * 根据 key 获取 OPTY Parameter
 */
export const getOptyParameterByKey = async (
  key: string,
): Promise<OptyParameter | null> => {
  const optyParameters = await getOptyParameters();
  return optyParameters.find((param) => param.key === key) || null;
};

/**
 * 创建新的 OPTY Parameter
 */
export const createOptyParameter = async (
  data: CreateOptyParameter,
): Promise<OptyParameter> => {
  const newParameter: OptyParameter = {
    id: generateId(),
    ...data,
  };

  const optyParameters = await getOptyParameters();
  await storage.set("optyParameters", [...optyParameters, newParameter]);

  return newParameter;
};

/**
 * 更新 OPTY Parameter
 */
export const updateOptyParameter = async (
  id: string,
  updates: UpdateOptyParameter,
): Promise<void> => {
  const optyParameters = await getOptyParameters();
  const updated = optyParameters.map((param) =>
    param.id === id ? { ...param, ...updates } : param,
  );
  await storage.set("optyParameters", updated);
};

/**
 * 删除 OPTY Parameter
 */
export const deleteOptyParameter = async (id: string): Promise<void> => {
  const optyParameters = await getOptyParameters();
  const filtered = optyParameters.filter((param) => param.id !== id);
  await storage.set("optyParameters", filtered);
};

// ============================================================================
// Combination 操作
// ============================================================================

/**
 * 获取所有 Combinations（包括草稿）
 */
export const getCombinations = async (): Promise<Combination[]> => {
  const data = await storage.get<Combination[]>("combinations");
  return data ?? [];
};

/**
 * 获取所有正式 Combinations（不再过滤草稿）
 */
export const getFormalCombinations = async (): Promise<Combination[]> => {
  const combinations = await getCombinations();
  // 不再过滤草稿，所有组合都可以在 Popup 中显示
  return combinations;
};

/**
 * 根据 ID 获取单个 Combination
 */
export const getCombinationById = async (
  id: string,
): Promise<Combination | null> => {
  const combinations = await getCombinations();
  return combinations.find((comb) => comb.id === id) || null;
};

/**
 * 创建新的 Combination（草稿或正式）
 */
export const createCombination = async (
  data: CreateCombination,
): Promise<Combination> => {
  const now = getCurrentTimestamp();
  const newCombination: Combination = {
    id: generateId(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  const combinations = await getCombinations();
  await storage.set("combinations", [...combinations, newCombination]);

  return newCombination;
};

/**
 * 更新 Combination
 */
export const updateCombination = async (
  id: string,
  updates: UpdateCombination,
): Promise<void> => {
  const combinations = await getCombinations();
  const updated = combinations.map((comb) =>
    comb.id === id
      ? { ...comb, ...updates, updatedAt: getCurrentTimestamp() }
      : comb,
  );
  await storage.set("combinations", updated);
};

/**
 * 删除 Combination
 */
export const deleteCombination = async (id: string): Promise<void> => {
  const combinations = await getCombinations();
  const filtered = combinations.filter((comb) => comb.id !== id);
  await storage.set("combinations", filtered);
};

/**
 * 复制 Combination
 * 创建一个新的组合，复制所有配置，但生成新的 ID 和标题
 */
export const copyCombination = async (
  original: Combination,
): Promise<Combination> => {
  const now = getCurrentTimestamp();
  const copied: Combination = {
    ...original,
    id: generateId(),
    title: `${original.title} - 副本`,
    createdAt: now,
    updatedAt: now,
  };

  const combinations = await getCombinations();
  await storage.set("combinations", [...combinations, copied]);

  return copied;
};

// ============================================================================
// 运行时状态操作
// ============================================================================

/**
 * 设置当前组合的初始化标记
 */
export const setCurrentCombinationInitialized = async (
  combinationId: string | null,
): Promise<void> => {
  await storage.set("currentCombinationInitialized", combinationId);
};

/**
 * 获取当前组合的初始化标记
 */
export const getCurrentCombinationInitialized = async (): Promise<
  string | null
> => {
  const data = await storage.get<string | null>(
    "currentCombinationInitialized",
  );
  return data ?? null;
};

/**
 * 设置当前已模拟的 Agent ID
 */
export const setCurrentImpersonatedAgentId = async (
  agentId: string | null,
): Promise<void> => {
  await storage.set("currentImpersonatedAgentId", agentId);
};

/**
 * 获取当前已模拟的 Agent ID
 */
export const getCurrentImpersonatedAgentId = async (): Promise<
  string | null
> => {
  const data = await storage.get<string | null>("currentImpersonatedAgentId");
  return data ?? null;
};

/**
 * 设置最后选择的组合 ID
 */
export const setLastSelectedCombinationId = async (
  combinationId: string | null,
): Promise<void> => {
  await storage.set("lastSelectedCombinationId", combinationId);
};

/**
 * 获取最后选择的组合 ID
 */
export const getLastSelectedCombinationId = async (): Promise<
  string | null
> => {
  const data = await storage.get<string | null>("lastSelectedCombinationId");
  return data ?? null;
};

// ============================================================================
// UI 状态操作
// ============================================================================

type NavigationType =
  | "agents"
  | "ports"
  | "uris"
  | "tail-parameters"
  | "opty-parameters"
  | "combinations";

/**
 * 设置当前导航类型
 */
export const setCurrentNavigation = async (
  navigation: NavigationType,
): Promise<void> => {
  await storage.set("currentNavigation", navigation);
};

/**
 * 获取当前导航类型
 */
export const getCurrentNavigation = async (): Promise<NavigationType> => {
  const data = await storage.get<NavigationType>("currentNavigation");
  return data ?? "agents";
};

// ============================================================================
// 批量操作
// ============================================================================

/**
 * 清空所有数据
 */
export const clearAllData = async (): Promise<void> => {
  await storage.set("agents", []);
  await storage.set("ports", []);
  await storage.set("uris", []);
  await storage.set("tailParameters", []);
  await storage.set("optyParameters", []);
  await storage.set("combinations", []);
  await storage.set("currentCombinationInitialized", null);
  await storage.set("lastSelectedCombinationId", null);
  await storage.set("currentNavigation", "agents");
};

// ============================================================================
// 导入导出功能
// ============================================================================

/**
 * 导出配置数据
 *
 * @returns 导出的 JSON 数据对象
 */
export const exportData = async (): Promise<{
  version: string;
  exportedAt: string;
  data: {
    agents: Agent[];
    ports: Port[];
    uris: UriEntry[];
    tailParameters: TailParameter[];
    optyParameters: OptyParameter[];
    combinations: Combination[];
  };
}> => {
  const [agents, ports, uris, tailParameters, optyParameters, combinations] =
    await Promise.all([
      getAgents(),
      getPorts(),
      getUris(),
      getTailParameters(),
      getOptyParameters(),
      getCombinations(),
    ]);

  return {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    data: {
      agents,
      ports,
      uris,
      tailParameters,
      optyParameters,
      combinations,
    },
  };
};

/**
 * 冲突检测结果
 */
export interface ImportConflictResult {
  hasConflicts: boolean;
  conflicts: {
    agents: string[];
    ports: string[];
    uris: string[];
    tailParameters: string[];
    optyParameters: string[];
    combinations: string[];
  };
}

/**
 * 检测导入数据的冲突
 *
 * @param importedData - 导入的数据
 * @returns 冲突检测结果
 */
export const detectImportConflicts = async (importedData: {
  agents: Agent[];
  ports: Port[];
  uris: UriEntry[];
  tailParameters: TailParameter[];
  optyParameters: OptyParameter[];
  combinations: Combination[];
}): Promise<ImportConflictResult> => {
  const [
    existingAgents,
    existingPorts,
    existingUris,
    existingTailParams,
    existingOptyParams,
    existingCombinations,
  ] = await Promise.all([
    getAgents(),
    getPorts(),
    getUris(),
    getTailParameters(),
    getOptyParameters(),
    getCombinations(),
  ]);

  const existingAgentIds = new Set(existingAgents.map((a) => a.id));
  const existingPortIds = new Set(existingPorts.map((p) => p.id));
  const existingUriIds = new Set(existingUris.map((u) => u.id));
  const existingTailParamIds = new Set(existingTailParams.map((p) => p.id));
  const existingOptyParamIds = new Set(existingOptyParams.map((p) => p.id));
  const existingCombinationIds = new Set(existingCombinations.map((c) => c.id));

  const conflicts = {
    agents: importedData.agents
      .filter((a) => existingAgentIds.has(a.id))
      .map((a) => a.username || a.id),
    ports: importedData.ports
      .filter((p) => existingPortIds.has(p.id))
      .map((p) => `${p.port}`),
    uris: importedData.uris
      .filter((u) => existingUriIds.has(u.id))
      .map((u) => u.uri),
    tailParameters: importedData.tailParameters
      .filter((p) => existingTailParamIds.has(p.id))
      .map((p) => p.key),
    optyParameters: importedData.optyParameters
      .filter((p) => existingOptyParamIds.has(p.id))
      .map((p) => p.key),
    combinations: importedData.combinations
      .filter((c) => existingCombinationIds.has(c.id))
      .map((c) => c.title),
  };

  const hasConflicts =
    conflicts.agents.length > 0 ||
    conflicts.ports.length > 0 ||
    conflicts.uris.length > 0 ||
    conflicts.tailParameters.length > 0 ||
    conflicts.optyParameters.length > 0 ||
    conflicts.combinations.length > 0;

  return { hasConflicts, conflicts };
};

/**
 * 导入配置数据
 *
 * @param importedData - 导入的数据
 * @param overwriteConflicts - 是否覆盖冲突的数据
 */
export const importData = async (
  importedData: {
    agents: Agent[];
    ports: Port[];
    uris: UriEntry[];
    tailParameters: TailParameter[];
    optyParameters: OptyParameter[];
    combinations: Combination[];
  },
  overwriteConflicts: boolean,
): Promise<void> => {
  const [
    existingAgents,
    existingPorts,
    existingUris,
    existingTailParams,
    existingOptyParams,
    existingCombinations,
  ] = await Promise.all([
    getAgents(),
    getPorts(),
    getUris(),
    getTailParameters(),
    getOptyParameters(),
    getCombinations(),
  ]);

  const existingAgentIds = new Set(existingAgents.map((a) => a.id));
  const existingPortIds = new Set(existingPorts.map((p) => p.id));
  const existingUriIds = new Set(existingUris.map((u) => u.id));
  const existingTailParamIds = new Set(existingTailParams.map((p) => p.id));
  const existingOptyParamIds = new Set(existingOptyParams.map((p) => p.id));
  const existingCombinationIds = new Set(existingCombinations.map((c) => c.id));

  // 导入 Agents
  const newAgents = overwriteConflicts
    ? importedData.agents
    : [
        ...existingAgents,
        ...importedData.agents.filter((a) => !existingAgentIds.has(a.id)),
      ];
  await storage.set("agents", newAgents);

  // 导入 Ports
  const newPorts = overwriteConflicts
    ? importedData.ports
    : [
        ...existingPorts,
        ...importedData.ports.filter((p) => !existingPortIds.has(p.id)),
      ];
  await storage.set("ports", newPorts);

  // 导入 URIs
  const newUris = overwriteConflicts
    ? importedData.uris
    : [
        ...existingUris,
        ...importedData.uris.filter((u) => !existingUriIds.has(u.id)),
      ];
  await storage.set("uris", newUris);

  // 导入 Tail Parameters
  const newTailParams = overwriteConflicts
    ? importedData.tailParameters
    : [
        ...existingTailParams,
        ...importedData.tailParameters.filter(
          (p) => !existingTailParamIds.has(p.id),
        ),
      ];
  await storage.set("tailParameters", newTailParams);

  // 导入 OPTY Parameters
  const newOptyParams = overwriteConflicts
    ? importedData.optyParameters
    : [
        ...existingOptyParams,
        ...importedData.optyParameters.filter(
          (p) => !existingOptyParamIds.has(p.id),
        ),
      ];
  await storage.set("optyParameters", newOptyParams);

  // 导入 Combinations
  const newCombinations = overwriteConflicts
    ? importedData.combinations
    : [
        ...existingCombinations,
        ...importedData.combinations.filter(
          (c) => !existingCombinationIds.has(c.id),
        ),
      ];
  await storage.set("combinations", newCombinations);
};
