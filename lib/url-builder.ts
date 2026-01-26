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
 * @returns 查询字符串（如 ?debug=true&verbose=false&lang=en）
 *
 * 规则：
 * - OPTY 参数：输出布尔值 "true" 或 "false"
 * - Tail 参数：输出实际值（字符串）
 */
const buildQueryString = (params: TempOverride[]): string => {
  return params
    .map((p) => {
      // OPTY 参数：使用 enabled 属性（布尔值）
      if (p.isOpty) {
        return `${p.key}=${p.enabled ? "true" : "false"}`;
      }
      // Tail 参数：使用 value 属性（实际值）
      return `${p.key}=${p.value || ""}`;
    })
    .join("&");
};

/**
 * 构建目标 URL
 *
 * @param currentUrl - 当前页面的 URL
 * @param uri - URI 路径（如 /app/lab），如果为null则使用当前URL的路径
 * @param port - 端口号（可选）
 * @param params - 参数列表（包含临时修改）
 * @param skipUri - 是否跳过URI变更，直接使用当前URL
 * @returns 完整的目标 URL
 */
const buildTargetURL = (
  currentUrl: string,
  uri: string | null,
  port: number | null,
  params: TempOverride[],
  skipUri: boolean = false,
): string => {
  let baseURL: string;

  if (skipUri || uri === null) {
    // 使用当前URL的协议、主机名、端口和路径
    const url = new URL(currentUrl);
    baseURL = `${url.protocol}//${url.hostname}`;

    // 处理端口
    if (isLocalDomain(currentUrl) && port) {
      baseURL = `${baseURL}:${port}`;
    } else if (url.port) {
      baseURL = `${baseURL}:${url.port}`;
    }

    // 保留原有路径
    baseURL = `${baseURL}${url.pathname}`;
  } else {
    // 构建基础 URL（使用指定的URI）
    baseURL = buildBaseURL(currentUrl, uri, port);
  }

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
 * @param tempOverrides - 临时修改（Map<key, boolean> - 用于 OPTY 参数）
 * @param tempValueOverrides - 临时值修改（Map<key, string> - 用于 Tail 参数）
 * @returns 参数列表（TempOverride[]）
 */
const buildParametersWithOverrides = (
  combination: Combination,
  tailParams: TailParameter[],
  optyParams: OptyParameter[],
  tempOverrides: Map<string, boolean>,
  tempValueOverrides: Map<string, string>,
): TempOverride[] => {
  // 获取尾部参数（文本值）
  const tailOverrides = tailParams.map((p) => {
    const isModified = tempValueOverrides.has(p.key);
    const currentValue = isModified
      ? (tempValueOverrides.get(p.key) as string)
      : p.value;
    return {
      key: p.key,
      enabled: currentValue === "true",
      isModified,
      isOpty: false,
      value: currentValue,
    };
  });

  // 获取 opty 参数（布尔值，构建URL时自动添加opty_前缀）
  const optyOverrides = optyParams.map((p) => {
    const keyWithPrefix = `opty_${p.key}`;
    const isModified = tempOverrides.has(keyWithPrefix);
    const enabled = isModified
      ? (tempOverrides.get(keyWithPrefix) as boolean)
      : p.value;
    return {
      key: keyWithPrefix,
      enabled,
      isModified,
      isOpty: true,
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

/**
 * 在页面上下文中执行 impersonate
 *
 * @param targetUrl - 目标URL（impersonate成功后跳转的地址）
 * @param userId - 要模拟的用户ID
 */
const executeImpersonateInPage = async (
  targetUrl: string,
  userId: string,
): Promise<void> => {
  console.log("🔵 [IMPERSONATE] 开始执行 impersonate");
  console.log("🔵 [IMPERSONATE] 目标URL:", targetUrl);
  console.log("🔵 [IMPERSONATE] 用户ID:", userId);

  const tab = await getCurrentTab();
  console.log("🔵 [IMPERSONATE] 当前Tab ID:", tab.id);

  await chrome.scripting.executeScript({
    target: { tabId: tab.id! },
    world: "MAIN" as chrome.scripting.ExecutionWorld,
    func: (url: string, user: string) => {
      console.log("🟢 [PAGE] 进入页面上下文");
      console.log("🟢 [PAGE] 目标URL:", url);
      console.log("🟢 [PAGE] 用户ID:", user);

      // 在页面上下文中执行
      function postRequest(endpoint: string, data: any) {
        console.log("🟡 [POST] 发送POST请求:", endpoint, data);
        return fetch(endpoint, {
          headers: { "content-type": "application/json" },
          body: JSON.stringify(data),
          method: "POST",
          credentials: "same-origin",
        })
          .then((response) => {
            console.log("🟡 [POST] 响应状态:", response.status);
            console.log("🟡 [POST] 响应OK:", response.ok);
            return response;
          })
          .catch((error) => {
            console.error("🔴 [POST] 请求失败:", error);
            throw error;
          });
      }

      function impersonateUser(userId: string) {
        console.log("🟢 [PAGE] 开始 impersonate user:", userId);
        postRequest("/impersonate/", {
          impersonation_tool: "a3g",
          targetUserId: userId,
        })
          .then(() => {
            console.log("🟢 [PAGE] Impersonate成功，准备跳转到:", url);
            window.location.href = url;
          })
          .catch((error) => {
            console.error("🔴 [PAGE] Impersonate失败:", error);
          });
      }

      // 检查是否已经处于impersonate状态
      const impersonationBanner = document.querySelector(
        "header.uc-impersonationBanner",
      );
      console.log(
        "🟢 [PAGE] 检测到 impersonation banner:",
        !!impersonationBanner,
      );

      if (impersonationBanner) {
        console.log("🟢 [PAGE] 先取消当前 impersonate");
        // 先取消当前impersonate
        postRequest("/unimpersonate/", {
          impersonation_tool: "impersonation_banner",
        })
          .then(() => {
            console.log("🟢 [PAGE] 取消成功，现在执行新的 impersonate");
            impersonateUser(user);
          })
          .catch((error) => {
            console.error("🔴 [PAGE] 取消 impersonate 失败:", error);
          });
      } else {
        console.log("🟢 [PAGE] 直接执行 impersonate");
        impersonateUser(user);
      }
    },
    args: [targetUrl, userId],
  });

  console.log("🔵 [IMPERSONATE] executeScript 调用完成");
};

// ============================================================================
// 完整的跳转流程
// ============================================================================

/**
 * 执行完整的跳转流程
 *
 * @param currentUrl - 当前页面的 URL
 * @param combination - Combination 配置
 * @param agent - Agent 配置
 * @param port - Port 配置（可选）
 * @param uri - URI 配置（可选，如果skipUri为true则忽略）
 * @param params - 参数列表（包含临时修改）
 * @param needImpersonate - 是否需要执行 impersonate
 * @param skipUri - 是否跳过URI变更，基于当前URL跳转
 */
const executeRedirectFlow = async (options: {
  currentUrl: string;
  combination: Combination;
  agent: Agent;
  port?: Port | null;
  uri: UriEntry | null;
  params: TempOverride[];
  needImpersonate: boolean;
  skipUri?: boolean;
}): Promise<void> => {
  console.log("🚀 [REDIRECT] ========== 开始执行跳转流程 ==========");
  const {
    currentUrl,
    combination,
    agent,
    port,
    uri,
    params,
    needImpersonate,
    skipUri = false,
  } = options;

  console.log("🚀 [REDIRECT] 当前URL:", currentUrl);
  console.log("🚀 [REDIRECT] 组合ID:", combination.id);
  console.log("🚀 [REDIRECT] Agent:", agent);
  console.log("🚀 [REDIRECT] Port:", port);
  console.log("🚀 [REDIRECT] URI:", uri);
  console.log("🚀 [REDIRECT] 跳过URI变更:", skipUri);
  console.log("🚀 [REDIRECT] 参数数量:", params.length);
  console.log("🚀 [REDIRECT] 需要Impersonate:", needImpersonate);

  // 构建目标 URL（使用正确的参数）
  const targetURL = buildTargetURL(
    currentUrl,
    skipUri ? null : (uri?.uri ?? null),
    port?.port ?? null,
    params,
    skipUri,
  );
  console.log("🚀 [REDIRECT] 构建的目标URL:", targetURL);

  // 如果需要 impersonate，使用页面上下文执行POST请求
  if (needImpersonate) {
    console.log("🚀 [REDIRECT] ✅ 需要执行 impersonate");
    await executeImpersonateInPage(targetURL, agent.id);
  } else {
    console.log("🚀 [REDIRECT] ⏭️  跳过 impersonate，直接跳转");
    // 不需要 impersonate，直接跳转
    await redirectTab(targetURL);
  }

  console.log("🚀 [REDIRECT] ========== 跳转流程结束 ==========");
};

/**
 * 通过 JS 注入方式设置 OPTY features
 * 
 * @param featuresToAdd - 要添加/启用的 features（不带 opty_ 前缀）
 * @param featuresToRemove - 要移除/禁用的 features（不带 opty_ 前缀）
 */
const injectOptyFeatures = async (
  featuresToAdd: string[],
  featuresToRemove: string[] = [],
): Promise<void> => {
  console.log("💉 [OPTY-INJECT] ========== 开始注入 OPTY features ==========");
  console.log("💉 [OPTY-INJECT] 要添加的 Features:", featuresToAdd);
  console.log("💉 [OPTY-INJECT] 要移除的 Features:", featuresToRemove);

  const tab = await getCurrentTab();
  
  await chrome.scripting.executeScript({
    target: { tabId: tab.id! },
    world: "MAIN" as chrome.scripting.ExecutionWorld,
    func: (toAdd, toRemove) => {
      console.log("💉 [PAGE] 页面上下文中注入 OPTY features");
      console.log("💉 [PAGE] 要添加:", toAdd);
      console.log("💉 [PAGE] 要移除:", toRemove);
      
      // 确保 window.uc.opty 存在
      const w = window as any;
      if (!w.uc) {
        w.uc = {};
      }
      if (!w.uc.opty) {
        w.uc.opty = {};
      }
      
      // 获取现有的 features 对象（如果不存在或不是对象则初始化为空对象）
      let currentFeatures: Record<string, boolean> = 
        typeof w.uc.opty.features === 'object' && !Array.isArray(w.uc.opty.features)
          ? { ...w.uc.opty.features } 
          : {};
      
      console.log("💉 [PAGE] 现有 features:", currentFeatures);
      
      // 禁用 features（设置为 false）
      toRemove.forEach(feature => {
        currentFeatures[feature] = false;
      });
      
      // 启用 features（设置为 true）
      toAdd.forEach(feature => {
        currentFeatures[feature] = true;
      });
      
      // 更新 features 对象
      w.uc.opty.features = currentFeatures;
      
      console.log("💉 [PAGE] 更新后的 features:", w.uc.opty.features);
    },
    args: [featuresToAdd, featuresToRemove],
  });

  console.log("💉 [OPTY-INJECT] ========== OPTY features 注入完成 ==========");
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
  injectOptyFeatures,
};
