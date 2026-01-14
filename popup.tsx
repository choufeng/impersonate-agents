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
import CombinationSelector from "./components/popup/CombinationSelector";
import BasicInfoCard from "./components/popup/BasicInfoCard";
import ParameterSection from "./components/popup/ParameterSection";
import ActionButtons from "./components/popup/ActionButtons";

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

  // 临时基础信息状态
  const [tempAgentId, setTempAgentId] = useState<string | null>(null);
  const [tempPortId, setTempPortId] = useState<string | null>(null);
  const [tempUriId, setTempUriId] = useState<string | null>(null);

  const [agent, setAgent] = useState<Agent | null>(null);
  const [port, setPort] = useState<Port | null>(null);
  const [uri, setUri] = useState<UriEntry | null>(null);
  const [params, setParams] = useState<TempOverride[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);

  // ===========================
  // 初始化数据加载
  // ===========================

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCombinationId) {
      loadCombinationData(selectedCombinationId);
      loadInitialData();
    } else {
      setSelectedCombination(null);
      setAgent(null);
      setPort(null);
      setUri(null);
      setParams([]);
      setTempOverrides(new Map());
      setTempValueOverrides(new Map());

      // 清空临时基础信息状态
      setTempAgentId(null);
      setTempPortId(null);
      setTempUriId(null);
    }
  }, [selectedCombinationId]);

  const loadInitialData = async () => {
    try {
      const allCombinations = await getFormalCombinations();
      setCombinations(allCombinations);

      const lastSelectedId = await getLastSelectedCombinationId();
      if (lastSelectedId && !selectedCombinationId) {
        setSelectedCombinationId(lastSelectedId);
      }
    } catch (error) {
      console.error("Failed to load initial data:", error);
    }
  };

  const loadCombinationData = async (combinationId: string) => {
    try {
      setIsLoading(true);

      // 加载组合基本信息
      const combination = await getCombinationById(combinationId);
      if (combination) {
        setSelectedCombination(combination);

        // 加载关联数据
        const [agentData, portData, uriData] = await Promise.all([
          combination.agentId ? getAgentById(combination.agentId) : null,
          combination.portId ? getPortById(combination.portId) : null,
          combination.uriId ? getUriById(combination.uriId) : null,
        ]);

        setAgent(agentData);
        setPort(portData);
        setUri(uriData);

        // 初始化临时基础信息状态
        setTempAgentId(combination.agentId);
        setTempPortId(combination.portId);
        setTempUriId(combination.uriId);

        // 加载所有参数
        const [allTailParams, allOptyParams] = await Promise.all([
          getTailParameters(),
          getOptyParameters(),
        ]);

        // 过滤出当前组合中选中的参数
        const selectedTailParams = allTailParams.filter((param) =>
          combination.tailParameterIds.includes(param.id),
        );
        const selectedOptyParams = allOptyParams.filter((param) =>
          combination.optyParameterIds.includes(param.id),
        );

        // 构建 TempOverride 数组
        const combinedParams: TempOverride[] = [
          ...selectedTailParams.map((param) => ({
            key: param.key,
            value: param.value,
            isOpty: false,
            enabled: true,
            isModified: false,
          })),
          ...selectedOptyParams.map((param) => ({
            key: `OPTY_${param.key}`,
            value: param.value.toString(),
            isOpty: true,
            enabled: param.value,
            isModified: false,
          })),
        ];

        setParams(combinedParams);

        // 清除临时修改
        setTempOverrides(new Map());
        setTempValueOverrides(new Map());
      }
    } catch (error) {
      console.error("Failed to load combination data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ===========================
  // 事件处理函数
  // ===========================

  const handleCombinationChange = async (value: string) => {
    setSelectedCombinationId(value || null);
    if (value) {
      await setLastSelectedCombinationId(value);
    }
  };

  const handleValueChange = (key: string, value: string) => {
    const newOverrides = new Map(tempValueOverrides);
    newOverrides.set(key, value);
    setTempValueOverrides(newOverrides);

    setParams((prevParams) =>
      prevParams.map((param) =>
        param.key === key ? { ...param, isModified: true } : param,
      ),
    );
  };

  const handleToggleChange = (key: string, enabled: boolean) => {
    const newOverrides = new Map(tempOverrides);
    newOverrides.set(key, enabled);
    setTempOverrides(newOverrides);

    setParams((prevParams) =>
      prevParams.map((param) =>
        param.key === key ? { ...param, isModified: true } : param,
      ),
    );
  };

  const handleResetParameter = (key: string) => {
    setTempOverrides((prev) => {
      const newOverrides = new Map(prev);
      newOverrides.delete(key);
      return newOverrides;
    });

    setTempValueOverrides((prev) => {
      const newOverrides = new Map(prev);
      newOverrides.delete(key);
      return newOverrides;
    });

    setParams((prevParams) =>
      prevParams.map((param) =>
        param.key === key ? { ...param, isModified: false } : param,
      ),
    );
  };

  const handleResetAllParameters = () => {
    setTempOverrides(new Map());
    setTempValueOverrides(new Map());
    setParams((prevParams) =>
      prevParams.map((param) => ({ ...param, isModified: false })),
    );
  };

  /**
   * 更新基础信息临时状态
   */
  const handleSaveBasicInfo = (data: {
    agentId: string | null;
    portId: string | null;
    uriId: string | null;
  }) => {
    setTempAgentId(data.agentId);
    setTempPortId(data.portId);
    setTempUriId(data.uriId);
  };

  /**
   * 保存配置（将临时修改持久化）
   */
  const handleSave = async () => {
    if (!selectedCombination) {
      return;
    }

    setIsLoading(true);

    try {
      // 保存基础信息（如果有修改）
      if (
        tempAgentId !== selectedCombination.agentId ||
        tempPortId !== selectedCombination.portId ||
        tempUriId !== selectedCombination.uriId
      ) {
        await updateCombination(selectedCombination.id, {
          agentId: tempAgentId,
          portId: tempPortId,
          uriId: tempUriId,
          updatedAt: new Date().toISOString(),
        });
      }

      // 保存参数修改（如果有修改）
      if (tempOverrides.size > 0 || tempValueOverrides.size > 0) {
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
      }

      // 更新组合的最后修改时间
      await updateCombination(selectedCombination.id, {
        updatedAt: new Date().toISOString(),
      });

      // 重新加载组合数据
      await loadCombinationData(selectedCombination.id);
      await loadInitialData();

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
      // 保存所有修改（基础信息和参数）
      if (
        tempAgentId !== selectedCombination.agentId ||
        tempPortId !== selectedCombination.portId ||
        tempUriId !== selectedCombination.uriId ||
        tempOverrides.size > 0 ||
        tempValueOverrides.size > 0
      ) {
        // 保存基础信息（如果有修改）
        if (
          tempAgentId !== selectedCombination.agentId ||
          tempPortId !== selectedCombination.portId ||
          tempUriId !== selectedCombination.uriId
        ) {
          await updateCombination(selectedCombination.id, {
            agentId: tempAgentId,
            portId: tempPortId,
            uriId: tempUriId,
            updatedAt: new Date().toISOString(),
          });
        }

        // 保存参数修改（如果有修改）
        if (tempOverrides.size > 0 || tempValueOverrides.size > 0) {
          const allTailParams = await getTailParameters();
          const allOptyParams = await getOptyParameters();

          for (const [key, enabled] of tempOverrides) {
            if (key.startsWith("OPTY")) {
              const originalKey = key.replace(/^OPTY_/, "");
              const param = allOptyParams.find((p) => p.key === originalKey);
              if (param) {
                await updateOptyParameter(param.id, {
                  value: enabled,
                });
              }
            }
          }

          for (const [key, value] of tempValueOverrides) {
            const param = allTailParams.find((p) => p.key === key);
            if (param) {
              await updateTailParameter(param.id, {
                value,
              });
            }
          }
        }

        await updateCombination(selectedCombination.id, {
          updatedAt: new Date().toISOString(),
        });

        // 重新加载数据
        await loadCombinationData(selectedCombination.id);
        await loadInitialData();
      }

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

      // 执行完整的跳转流程（使用临时基础信息）
      await executeRedirectFlow({
        currentUrl,
        combination: selectedCombination,
        agent: agent!,
        port,
        uri: uri!,
        params,
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
  // 主渲染
  // ===========================

  return (
    <div
      data-theme="corporate"
      className="w-[360px] h-[600px] p-4 flex flex-col bg-base-300"
    >
      <CombinationSelector
        combinations={combinations}
        selectedCombinationId={selectedCombinationId}
        onCombinationChange={handleCombinationChange}
      />

      {selectedCombination && (
        <div className="space-y-4 flex-1 overflow-auto">
          <BasicInfoCard
            combination={selectedCombination}
            agent={agent}
            port={port}
            uri={uri}
            onUpdate={handleSaveBasicInfo}
            isUpdating={isLoading}
          />

          <ParameterSection
            title="尾部参数"
            params={params.filter((p) => !p.isOpty)}
            tempOverrides={tempOverrides}
            tempValueOverrides={tempValueOverrides}
            onValueChange={handleValueChange}
            onToggleChange={handleToggleChange}
            onResetParameter={handleResetParameter}
            onResetAllParameters={handleResetAllParameters}
          />

          <ParameterSection
            title="OPTY 参数"
            params={params.filter((p) => p.isOpty)}
            tempOverrides={tempOverrides}
            tempValueOverrides={tempValueOverrides}
            onValueChange={handleValueChange}
            onToggleChange={handleToggleChange}
            onResetParameter={handleResetParameter}
            onResetAllParameters={handleResetAllParameters}
          />
        </div>
      )}

      <ActionButtons
        selectedCombination={!!selectedCombination}
        isLoading={isLoading}
        onRedirect={handleRedirect}
        onOpenOptions={openOptions}
      />

      {/* 保存成功提示 */}
      {showSaveToast && (
        <div className="toast toast-top toast-center">
          <div className="alert alert-success">
            <span>保存成功</span>
          </div>
        </div>
      )}
    </div>
  );
}
