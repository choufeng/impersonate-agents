import { useEffect, useState } from "react";
import "./style.css";
import {
  getFormalCombinations,
  getCombinationById,
  getAgentById,
  getPortById,
  getUriById,
  getTailParameters,
  getOptyParameters,
  updateTailParameter,
  updateOptyParameter,
  updateCombination,
  setLastSelectedCombinationId,
  getLastSelectedCombinationId,
  getCurrentCombinationInitialized,
  setCurrentCombinationInitialized,
} from "./lib/storage";
import { SettingsIcon, SaveIcon, RocketIcon } from "./components/icons";
import {
  buildParametersWithOverrides,
  executeRedirectFlow,
} from "./lib/url-builder";
import type {
  Agent,
  Port,
  UriEntry,
  TailParameter,
  OptyParameter,
  Combination,
  TempOverride,
} from "./lib/types";

export default function Popup() {
  // ===========================
  // 状态管理
  // ===========================

  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [selectedCombinationId, setSelectedCombinationId] = useState<
    string | null
  >(null);
  const [selectedCombination, setSelectedCombination] =
    useState<Combination | null>(null);
  const [tempOverrides, setTempOverrides] = useState<Map<string, boolean>>(
    new Map(),
  );
  const [tempValueOverrides, setTempValueOverrides] = useState<
    Map<string, string>
  >(new Map());
  const [params, setParams] = useState<TempOverride[]>([]);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [port, setPort] = useState<Port | null>(null);
  const [uri, setUri] = useState<UriEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);

  // ===========================
  // 初始化：加载数据
  // ===========================

  useEffect(() => {
    // 加载所有正式组合
    loadCombinations();
    // 加载最后选择的组合 ID
    loadLastSelectedCombinationId();
  }, []);

  // ===========================
  // 监控组合变化，加载参数
  // ===========================

  useEffect(() => {
    if (!selectedCombinationId) {
      setSelectedCombination(null);
      setParams([]);
      setAgent(null);
      setPort(null);
      setUri(null);
      return;
    }

    // 加载选中的组合详情
    loadCombinationDetails(selectedCombinationId);
  }, [selectedCombinationId]);

  // ===========================
  // 监控临时修改，更新参数列表
  // ===========================

  useEffect(() => {
    if (!selectedCombination) {
      return;
    }

    const updateParameters = async () => {
      const allTailParams = await getTailParameters();
      const allOptyParams = await getOptyParameters();

      const tailParams = allTailParams.filter((p) =>
        selectedCombination.tailParameterIds.includes(p.id),
      );
      const optyParams = allOptyParams.filter((p) =>
        selectedCombination.optyParameterIds.includes(p.id),
      );

      const allParams = buildParametersWithOverrides(
        selectedCombination,
        tailParams,
        optyParams,
        tempOverrides,
        tempValueOverrides,
      );

      setParams(allParams);
    };

    updateParameters();
  }, [tempOverrides, tempValueOverrides]);

  // ===========================
  // 数据加载函数
  // ===========================

  const loadCombinations = async () => {
    const data = await getFormalCombinations();
    setCombinations(data);
  };

  const loadLastSelectedCombinationId = async () => {
    const lastId = await getLastSelectedCombinationId();
    if (lastId) {
      setSelectedCombinationId(lastId);
    }
  };

  const loadCombinationDetails = async (combinationId: string) => {
    const combination = await getCombinationById(combinationId);
    if (!combination) {
      console.error("Combination not found:", combinationId);
      return;
    }

    setSelectedCombination(combination);

    // 清空临时修改
    setTempOverrides(new Map());
    setTempValueOverrides(new Map());

    // 加载配置数据
    await loadCombinationData(combination);

    // 加载参数
    await loadParameters(combination);
  };

  const loadCombinationData = async (combination: Combination) => {
    // 加载 Agent
    if (combination.agentId) {
      const agentData = await getAgentById(combination.agentId);
      setAgent(agentData);
    } else {
      setAgent(null);
    }

    // 加载 Port
    if (combination.portId) {
      const portData = await getPortById(combination.portId);
      setPort(portData);
    } else {
      setPort(null);
    }

    // 加载 URI
    if (combination.uriId) {
      const uriData = await getUriById(combination.uriId);
      setUri(uriData);
    } else {
      setUri(null);
    }
  };

  const loadParameters = async (combination: Combination) => {
    // 加载所有尾部参数
    const allTailParams = await getTailParameters();

    // 加载所有 OPTY 参数
    const allOptyParams = await getOptyParameters();

    // 筛选组合中的参数
    const tailParams = allTailParams.filter((p) =>
      combination.tailParameterIds.includes(p.id),
    );
    const optyParams = allOptyParams.filter((p) =>
      combination.optyParameterIds.includes(p.id),
    );

    // 构建参数列表
    const allParams = buildParametersWithOverrides(
      combination,
      tailParams,
      optyParams,
      tempOverrides,
      tempValueOverrides,
    );

    setParams(allParams);
  };

  // ===========================
  // 事件处理函数
  // ===========================

  /**
   * 组合切换处理
   */
  const handleCombinationChange = async (newId: string) => {
    if (newId === "") {
      setSelectedCombinationId(null);
      return;
    }

    setSelectedCombinationId(newId);

    // 清空临时修改
    setTempOverrides(new Map());
    setTempValueOverrides(new Map());

    // 保存最后选择的组合 ID
    await setLastSelectedCombinationId(newId);

    // 清空初始化标记（下次跳转时需要 impersonate）
    await setCurrentCombinationInitialized(null);
  };

  /**
   * 参数 Toggle 切换处理（临时修改 - OPTY 参数）
   */
  const handleToggleChange = (key: string, enabled: boolean) => {
    // 获取参数的原始值
    const originalParam = params.find((p) => p.key === key);
    if (!originalParam) return;

    // 如果切换后的值等于原始值，则从 Map 中移除（恢复默认）
    // 否则，添加到 Map 中
    setTempOverrides((prev) => {
      const newMap = new Map(prev);
      if (enabled === (originalParam.enabled === true)) {
        newMap.delete(key);
      } else {
        newMap.set(key, enabled);
      }
      return newMap;
    });
  };

  /**
   * 参数值修改处理（临时修改 - Tail 参数）
   */
  const handleValueChange = (key: string, value: string) => {
    // 获取参数的原始值
    const originalParam = params.find((p) => p.key === key);
    if (!originalParam) return;

    // 如果修改后的值等于原始值，则从 Map 中移除（恢复默认）
    // 否则，添加到 Map 中
    setTempValueOverrides((prev) => {
      const newMap = new Map(prev);
      if (value === originalParam.value) {
        newMap.delete(key);
      } else {
        newMap.set(key, value);
      }
      return newMap;
    });
  };

  /**
   * 重置单个参数（恢复原始值）
   */
  const handleResetParameter = (key: string) => {
    setTempOverrides((prev) => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
    setTempValueOverrides((prev) => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  };

  /**
   * 重置所有参数（恢复原始值）
   */
  const handleResetAllParameters = () => {
    setTempOverrides(new Map());
    setTempValueOverrides(new Map());
  };

  /**
   * 保存配置（将临时修改持久化）
   */
  const handleSave = async () => {
    if (
      !selectedCombination ||
      (tempOverrides.size === 0 && tempValueOverrides.size === 0)
    ) {
      return;
    }

    setIsLoading(true);

    try {
      // 加载所有参数
      const allTailParams = await getTailParameters();
      const allOptyParams = await getOptyParameters();

      // 更新所有修改过的 OPTY 参数
      for (const [key, enabled] of tempOverrides) {
        if (key.startsWith("OPTY")) {
          // OPTY参数需要去掉前缀才能匹配
          const originalKey = key.replace(/^OPTY_/, "");
          const param = allOptyParams.find((p) => p.key === originalKey);
          if (param) {
            await updateOptyParameter(param.id, {
              value: enabled,
            });
          }
        }
      }

      // 更新所有修改过的 Tail 参数
      for (const [key, value] of tempValueOverrides) {
        const param = allTailParams.find((p) => p.key === key);
        if (param) {
          await updateTailParameter(param.id, {
            value,
          });
        }
      }

      // 更新组合的最后修改时间
      await updateCombination(selectedCombination.id, {
        updatedAt: new Date().toISOString(),
      });

      // 清除临时状态
      setTempOverrides(new Map());
      setTempValueOverrides(new Map());

      // 显示保存成功提示
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 2000);
    } catch (error) {
      console.error("Failed to save configuration:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 跳转按钮处理（执行完整的跳转流程）
   */
  const handleRedirect = async () => {
    if (!selectedCombination) {
      console.warn("No combination selected");
      return;
    }

    setIsLoading(true);

    try {
      // 获取当前标签页 URL
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab || !tab.url) {
        console.error("Failed to get current tab");
        setIsLoading(false);
        return;
      }

      const currentUrl = tab.url;

      // 检查是否需要 impersonate
      const initializedId = await getCurrentCombinationInitialized();
      const needImpersonate = initializedId !== selectedCombination.id;

      // 执行完整的跳转流程
      await executeRedirectFlow({
        currentUrl,
        combination: selectedCombination,
        agent: agent!,
        port,
        uri: uri!,
        params: params,
        needImpersonate,
      });

      // 记录初始化标记
      await setCurrentCombinationInitialized(selectedCombination.id);
    } catch (error) {
      console.error("Failed to execute redirect:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 打开 Options 页面
   */
  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  // ===========================
  // 渲染函数
  // ===========================

  const renderParameterRow = (param: TempOverride) => {
    const isOpty = param.isOpty;

    return (
      <div
        key={param.key}
        className="flex items-center justify-between p-2 hover:bg-base-200 rounded"
      >
        <span className="text-sm w-1/3 truncate" title={param.key}>
          {param.key}
        </span>
        <div className="flex items-center gap-2 flex-1">
          {isOpty ? (
            <>
              {param.isModified && (
                <button
                  className="text-xs btn btn-xs btn-ghost"
                  onClick={() => handleResetParameter(param.key)}
                  title="恢复原始值"
                >
                  ↩️
                </button>
              )}
              <input
                type="checkbox"
                className="toggle toggle-sm toggle-primary"
                checked={param.enabled}
                onChange={(e) =>
                  handleToggleChange(param.key, e.target.checked)
                }
              />
            </>
          ) : (
            <>
              <input
                type="text"
                className="input input-xs input-bordered flex-1"
                defaultValue={param.value || ""}
                placeholder="输入值"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const input = e.target as HTMLInputElement;
                    handleValueChange(param.key, input.value);
                    input.blur();
                  }
                }}
                onBlur={(e) => {
                  handleValueChange(param.key, e.target.value);
                }}
              />
              {param.isModified && (
                <button
                  className="text-xs btn btn-xs btn-ghost"
                  onClick={() => handleResetParameter(param.key)}
                  title="恢复原始值"
                >
                  ↩️
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // ===========================
  // 主渲染
  // ===========================

  return (
    <div data-theme="abyss" className="w-[360px] h-[600px] p-4 flex flex-col">
      {/* 固定顶部：组合选择和设置 */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <select
            className="select select-bordered w-full"
            value={selectedCombinationId ?? ""}
            onChange={(e) => handleCombinationChange(e.target.value)}
          >
            <option value="">选择配置...</option>
            {combinations.map((combo) => (
              <option key={combo.id} value={combo.id}>
                {combo.title}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={openOptions}
          className="btn btn-sm btn-ghost"
          title="打开设置"
        >
          <SettingsIcon size={16} />
        </button>
      </div>

      {/* 配置详情 */}
      {selectedCombination && (
        <div className="space-y-4 flex-1 overflow-auto">
          {/* 基础信息（只读展示） */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4">
              <h3 className="font-bold mb-2">基础信息</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-base-content/70">Agent:</span>
                  <span className="font-medium">
                    {agent?.username || "未选择"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/70">Port:</span>
                  <span className="font-medium">
                    {port?.port ? port.port.toString() : "未选择"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/70">URI:</span>
                  <span
                    className="font-medium truncate"
                    style={{ maxWidth: "200px" }}
                    title={uri?.uri || ""}
                  >
                    {uri?.uri || "未选择"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 尾部参数（可临时调整） */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">尾部参数</h3>
              {tempValueOverrides.size > 0 && (
                <button
                  className="text-xs btn btn-xs btn-ghost text-warning"
                  onClick={handleResetAllParameters}
                >
                  重置全部
                </button>
              )}
            </div>
            <div className="space-y-1">
              {params.filter((p) => !p.isOpty).map(renderParameterRow)}
            </div>
          </div>

          {/* OPTY 参数（可临时调整） */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">OPTY 参数</h3>
              {tempOverrides.size > 0 && (
                <button
                  className="text-xs btn btn-xs btn-ghost text-warning"
                  onClick={handleResetAllParameters}
                >
                  重置全部
                </button>
              )}
            </div>
            <div className="space-y-1">
              {params.filter((p) => p.isOpty).map(renderParameterRow)}
            </div>
          </div>
        </div>
      )}

      {/* 保存成功提示 */}
      {showSaveToast && (
        <div role="alert" className="alert alert-success">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>配置已保存</span>
        </div>
      )}

      {/* 固定底部：按钮 */}
      <div className="flex gap-2 mt-4">
        <button
          className="btn btn-primary flex-1"
          disabled={
            (tempOverrides.size === 0 && tempValueOverrides.size === 0) ||
            isLoading
          }
          onClick={handleSave}
        >
          {isLoading ? (
            "保存中..."
          ) : (
            <>
              <SaveIcon size={16} className="mr-2" />
              保存配置
            </>
          )}
        </button>
        <button
          className="btn btn-success flex-1"
          disabled={!selectedCombination || isLoading}
          onClick={handleRedirect}
        >
          {isLoading ? (
            "跳转中..."
          ) : (
            <>
              <RocketIcon size={16} className="mr-2" />
              跳转
            </>
          )}
        </button>
      </div>
    </div>
  );
}
