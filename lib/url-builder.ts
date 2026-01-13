/**
 * URL 构建工具函数
 *
 * 包含所有 URL 构建相关的纯函数
 */

import type {
  Agent,
  Port,
  UriEntry,
  TailParameter,
  OptyParameter,
  Combination,
  TempOverride,
} from "./types";

// ============================================================================
// 域名判断
// ============================================================================

/**
 * 判断是否为本地域名
 *
 * 规则：只要 URL 有端口号，就认为是本地域名
 */
const isLocalDomain = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    // 只要有端口号，就认为是本地域名
    return !!urlObj.port;
  } catch {
    return false;
  }
};

// ============================================================================
// URL 构建基础函数
// ============================================================================

/**
 * 构建基础 URL
 *
 * @param currentUrl - 当前页面的 URL
 * @param uri - URI 配置（如 /api/v1/data）
 * @param port - 端口号（可选）
 * @returns 完整的基础 URL
 */
const buildBaseURL = (
  currentUrl: string,
  uri: string,
  port: number | null,
): string => {
  const url = new URL(currentUrl);
  let base = `${url.protocol}//${url.hostname}`;

  // 只在本地域名（有端口号）且有配置端口时添加端口
  if (isLocalDomain(currentUrl) && port) {
    base = `${base}:${port}`;
  }

  return `${base}${uri}`;
};

/**
 * 构建 Impersonation URL
 *
 * @param baseURL - 基础 URL
 * @param agent - Agent 配置
 * @returns Impersonation URL（如 https://example.com:8080/impersonate/user123）
 */
const buildImpersonationURL = (baseURL: string, agent: Agent): string => {
  // 确保 baseURL 不以 / 结尾
  const cleanBaseURL = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
  return `${cleanBaseURL}/impersonate/${agent.username}`;
};

/**
 * 构建查询字符串
 *
 * @param params - 参数列表
 * @returns 查询字符串（如 ?debug=true&verbose=false&lang=true）
 *
 * 规则：
 * - 所有参数都包含在 URL 中
 * - 值为 "true" 或 "false"（字符串）
 */
const buildQueryString = (params: TempOverride[]): string => {
  return params
    .map((p) => `${p.key}=${p.enabled ? "true" : "false"}`)
    .join("&");
};

/**
 * 构建目标 URL
 *
 * @param currentUrl - 当前页面的 URL
 * @param combination - 组合配置
 * @param params - 参数列表（包含临时修改）
 * @returns 完整的目标 URL
 */
const buildTargetURL = (
  currentUrl: string,
  combination: Combination,
  params: TempOverride[],
): string => {
  // 获取 URI 配置
  // 注意：这里需要从外部传入 URI，因为 Storage 操作在别处
  // 为了纯函数设计，我们假设 URI 作为参数传入
  const uri = ""; // 占位符，实际使用时需要传入

  // 获取端口配置
  const port = null; // 占位符，实际使用时需要传入

  // 构建基础 URL
  const baseURL = buildBaseURL(currentUrl, uri, port);

  // 构建查询字符串
  const queryString = buildQueryString(params);

  // 组合完整 URL
  return queryString ? `${baseURL}?${queryString}` : baseURL;
};

// ============================================================================
// 参数处理
// ============================================================================

/**
 * 从组合获取参数列表（包含临时修改）
 *
 * @param combination - 组合配置
 * @param tailParams - 尾部参数列表
 * @param optyParams - OPTY 参数列表
 * @param tempOverrides - 临时修改（Map<key, enabled>）
 * @returns 参数列表（TempOverride[]）
 */
const buildParametersWithOverrides = (
  combination: Combination,
  tailParams: TailParameter[],
  optyParams: OptyParameter[],
  tempOverrides: Map<string, boolean>,
): TempOverride[] => {
  // 获取尾部参数
  const tailOverrides = tailParams.map((p) => {
    const isModified = tempOverrides.has(p.key);
    const enabled = isModified
      ? (tempOverrides.get(p.key) as boolean)
      : p.value === "true";
    return {
      key: p.key,
      enabled,
      isModified,
    };
  });

  // 获取 OPTY 参数（构建URL时自动添加OPTY_前缀）
  const optyOverrides = optyParams.map((p) => {
    const keyWithPrefix = `OPTY_${p.key}`;
    const isModified = tempOverrides.has(keyWithPrefix);
    const enabled = isModified
      ? (tempOverrides.get(keyWithPrefix) as boolean)
      : p.value;
    return {
      key: keyWithPrefix,
      enabled,
      isModified,
    };
  });

  return [...tailOverrides, ...optyOverrides];
};

// ============================================================================
// Chrome API 辅助函数
// ============================================================================

/**
 * 获取当前标签页
 */
const getCurrentTab = async (): Promise<chrome.tabs.Tab> => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  return tab;
};

/**
 * 跳转标签页
 *
 * @param url - 目标 URL
 * @param tabId - 标签页 ID（可选，默认使用当前标签页）
 */
const redirectTab = async (url: string, tabId?: number): Promise<void> => {
  if (tabId) {
    await chrome.tabs.update(tabId, { url });
  } else {
    const tab = await getCurrentTab();
    await chrome.tabs.update(tab.id!, { url });
  }
};

/**
 * 睡眠函数（用于等待）
 *
 * @param ms - 睡眠时间（毫秒）
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// ============================================================================
// 完整的跳转流程
// ============================================================================

/**
 * 执行完整的跳转流程
 *
 * @param currentUrl - 当前页面的 URL
 * @param combination - 组合配置
 * @param agent - Agent 配置
 * @param port - Port 配置（可选）
 * @param uri - URI 配置
 * @param params - 参数列表（包含临时修改）
 * @param needImpersonate - 是否需要执行 impersonate
 */
const executeRedirectFlow = async (options: {
  currentUrl: string;
  combination: Combination;
  agent: Agent;
  port?: Port | null;
  uri: UriEntry;
  params: TempOverride[];
  needImpersonate: boolean;
}): Promise<void> => {
  const { currentUrl, combination, agent, port, uri, params, needImpersonate } =
    options;

  // 获取当前标签页
  const tab = await getCurrentTab();

  // 如果需要 impersonate
  if (needImpersonate) {
    // 构建基础 URL
    const baseURL = buildBaseURL(currentUrl, uri.uri, port?.port ?? null);

    // 构建 impersonation URL
    const impersonationURL = buildImpersonationURL(baseURL, agent);

    // 执行 impersonate
    await redirectTab(impersonationURL);

    // 等待冒充完成（500ms 延迟）
    await sleep(500);

    // 记录初始化标记（这个需要在 storage.ts 中处理）
    // 这里只负责跳转，不负责存储标记
  }

  // 构建目标 URL
  const targetURL = buildTargetURL(currentUrl, combination, params);

  // 跳转到目标 URL
  await redirectTab(targetURL);
};

// ============================================================================
// 导出所有函数
// ============================================================================

export {
  isLocalDomain,
  buildBaseURL,
  buildImpersonationURL,
  buildQueryString,
  buildTargetURL,
  buildParametersWithOverrides,
  getCurrentTab,
  redirectTab,
  sleep,
  executeRedirectFlow,
};
