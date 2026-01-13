/**
 * 数据模型类型定义
 *
 * 包含所有数据表、运行时状态和工具函数的类型
 */

// ============================================================================
// 基础数据表
// ============================================================================

/**
 * Agent 数据模型
 * 存储用户代理的用户名和 ID
 */
export interface Agent {
  id: string;
  username: string;
}

/**
 * Port 数据模型
 * 存储端口号和描述
 */
export interface Port {
  id: string;
  port: number;
  description?: string;
}

/**
 * URI 数据模型
 * 存储 URI 地址和描述
 */
export interface UriEntry {
  id: string;
  uri: string;
  description?: string;
}

/**
 * Tail Parameter 数据模型
 * 存储尾部参数的键值对
 */
export interface TailParameter {
  id: string;
  key: string;
  value: string;
}

/**
 * OPTY Parameter 数据模型
 * 存储以 OPTY 开头的参数键值对
 */
export interface OptyParameter {
  id: string;
  key: string; // Should start with "OPTY"
  value: boolean;
}

/**
 * Combination 数据模型
 * 存储组合配置，引用其他表的数据
 */
export interface Combination {
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

// ============================================================================
// 运行时状态类型
// ============================================================================

/**
 * TempOverride 类型
 * 用于 Popup 页面的临时参数修改
 */
export type TempOverride = {
  key: string;
  enabled: boolean;
  isModified: boolean;
};

/**
 * Navigation Type 类型
 * Options 页面的导航类型
 */
export type NavigationType =
  | "agents"
  | "ports"
  | "uris"
  | "tail-parameters"
  | "opty-parameters"
  | "combinations";

// ============================================================================
// Chrome Storage Schema
// ============================================================================

/**
 * StorageData 接口
 * Chrome Storage 的完整数据结构
 */
export interface StorageData {
  // 基础数据表
  agents: Agent[];
  ports: Port[];
  uris: UriEntry[];
  tailParameters: TailParameter[];
  optyParameters: OptyParameter[];
  combinations: Combination[];

  // 运行时状态
  currentCombinationInitialized: string | null;
  lastSelectedCombinationId: string | null;

  // UI 状态
  currentNavigation: NavigationType;
}

// ============================================================================
// 工具函数类型
// ============================================================================

/**
 * 用于创建和更新操作的类型
 */
export type CreateAgent = Agent;
export type CreatePort = Omit<Port, "id">;
export type CreateUri = Omit<UriEntry, "id">;
export type CreateTailParameter = Omit<TailParameter, "id">;
export type CreateOptyParameter = Omit<OptyParameter, "id">;
export type CreateCombination = Omit<
  Combination,
  "id" | "createdAt" | "updatedAt"
>;

/**
 * 用于更新操作的类型
 */
export type UpdateAgent = Partial<Agent>;
export type UpdatePort = Partial<Omit<Port, "id">>;
export type UpdateUri = Partial<Omit<UriEntry, "id">>;
export type UpdateTailParameter = Partial<Omit<TailParameter, "id">>;
export type UpdateOptyParameter = Partial<Omit<OptyParameter, "id">>;
export type UpdateCombination = Partial<Omit<Combination, "id">>;

// ============================================================================
// 草稿判定
// ============================================================================

/**
 * 判断组合是否为草稿
 *
 * 规则：缺少任何必需字段 = 草稿
 * - agentId 为 null
 * - portId 为 null
 * - uriId 为 null
 * - tailParameterIds 为空
 * - optyParameterIds 为空
 */
export const isDraft = (combination: Combination): boolean => {
  return (
    !combination.agentId ||
    !combination.portId ||
    !combination.uriId ||
    combination.tailParameterIds.length === 0 ||
    combination.optyParameterIds.length === 0
  );
};

// ============================================================================
// 工具函数：生成 ID
// ============================================================================

/**
 * 生成随机 ID
 * 使用 crypto.randomUUID() 或生成 36 字符的随机字符串
 */
export const generateId = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: 生成 36 字符的随机字符串（类似 UUID 格式）
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * 生成 ISO 格式的当前时间戳
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};
