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
  getCurrentImpersonatedAgentId,
  setCurrentImpersonatedAgentId,
  savePopupTempState,
  getPopupTempState,
  clearPopupTempState,
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

  // 监听临时状态变化并自动保存
  useEffect(() => {
    if (selectedCombination) {
      saveTempState();
    }
  }, [
    tempAgentId,
    tempPortId,
    tempUriId,
    tempOverrides,
    tempValueOverrides,
    selectedCombination,
  ]);

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

        // 尝试恢复临时状态
        const tempState = await getPopupTempState();
        console.log("🔄 [POPUP] 恢复临时状态:", tempState);

        if (tempState && tempState.combinationId === combinationId) {
          // 恢复临时基础信息状态
          console.log("🔄 [POPUP] 临时状态匹配，恢复临时修改");
          setTempAgentId(tempState.tempAgentId);
          setTempPortId(tempState.tempPortId);
          setTempUriId(tempState.tempUriId);

          // 恢复临时修改
          setTempOverrides(new Map(Object.entries(tempState.tempOverrides)));
          setTempValueOverrides(
            new Map(Object.entries(tempState.tempValueOverrides)),
          );
        } else {
          // 初始化临时基础信息状态
          console.log("🔄 [POPUP] 无临时状态或组合不匹配，使用默认值");
          setTempAgentId(combination.agentId);
          setTempPortId(combination.portId);
          setTempUriId(combination.uriId);

          // 清除临时修改
          setTempOverrides(new Map());
          setTempValueOverrides(new Map());
        }

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
      }
    } catch (error) {
      console.error("Failed to load combination data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ===========================
  // 临时状态持久化
  // ===========================

  /**
   * 保存当前的临时状态到存储
   */
  const saveTempState = async () => {
    if (!selectedCombination) return;

    const state = {
      combinationId: selectedCombination.id,
      tempAgentId,
      tempPortId,
      tempUriId,
      tempOverrides: Object.fromEntries(tempOverrides),
      tempValueOverrides: Object.fromEntries(tempValueOverrides),
    };

    await savePopupTempState(state);
    console.log("💾 [POPUP] 已保存临时状态:", state);
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
   * 跳转按钮处理（执行完整的跳转流程）
   */
  const handleRedirect = async () => {
    console.log("📱 [POPUP] ========== 用户点击跳转按钮 ==========");
    if (!selectedCombination) {
      console.warn("📱 [POPUP] ⚠️ 没有选择组合");
      return;
    }

    console.log("📱 [POPUP] 选中的组合:", selectedCombination);
    setIsLoading(true);

    try {
      // 获取当前标签页 URL
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab || !tab.url) {
        console.error("📱 [POPUP] ❌ 无法获取当前标签页");
        setIsLoading(false);
        return;
      }

      const currentUrl = tab.url;
      console.log("📱 [POPUP] 当前URL:", currentUrl);

      // 构建临时组合对象（使用临时状态）
      const tempCombination: Combination = {
        ...selectedCombination,
        agentId: tempAgentId,
        portId: tempPortId,
        uriId: tempUriId,
      };

      // 构建临时参数列表（包含临时修改）
      const allTailParams = await getTailParameters();
      const allOptyParams = await getOptyParameters();

      // 基础参数（来自当前组合选中的参数）
      const baseTailParams = allTailParams.filter((param) =>
        selectedCombination.tailParameterIds.includes(param.id),
      );
      const baseOptyParams = allOptyParams.filter((param) =>
        selectedCombination.optyParameterIds.includes(param.id),
      );

      // 应用临时修改
      const tempParams: TempOverride[] = [
        ...baseTailParams.map((param) => {
          const key = param.key;
          const value = tempValueOverrides.has(key)
            ? (tempValueOverrides.get(key) as string)
            : param.value;
          return {
            key,
            value,
            isOpty: false,
            enabled: true,
            isModified: false,
          };
        }),
        ...baseOptyParams.map((param) => {
          const keyWithPrefix = `OPTY_${param.key}`;
          const enabled = tempOverrides.has(keyWithPrefix)
            ? (tempOverrides.get(keyWithPrefix) as boolean)
            : param.value;
          return {
            key: keyWithPrefix,
            enabled,
            isOpty: true,
            isModified: false,
          };
        }),
      ];

      // 获取临时 agent, port, uri 数据
      const [tempAgent, tempPort, tempUri] = await Promise.all([
        tempAgentId ? getAgentById(tempAgentId) : null,
        tempPortId ? getPortById(tempPortId) : null,
        tempUriId ? getUriById(tempUriId) : null,
      ]);

      // 确定最终使用的 Agent
      const finalAgent = tempAgent || agent!;

      // 检查是否需要 impersonate（比较 Agent ID）
      const currentImpersonatedAgentId = await getCurrentImpersonatedAgentId();
      const needImpersonate = currentImpersonatedAgentId !== finalAgent.id;

      console.log(
        "📱 [POPUP] 当前已模拟的Agent ID:",
        currentImpersonatedAgentId,
      );
      console.log("📱 [POPUP] 即将使用的Agent ID:", finalAgent.id);
      console.log("📱 [POPUP] 即将使用的Agent:", finalAgent);
      console.log("📱 [POPUP] ✅ 需要Impersonate:", needImpersonate);

      // 执行完整的跳转流程（使用临时状态）
      await executeRedirectFlow({
        currentUrl,
        combination: tempCombination,
        agent: finalAgent,
        port: tempPort,
        uri: tempUri || uri!,
        params: tempParams,
        needImpersonate,
      });

      // 记录初始化标记
      await setCurrentCombinationInitialized(selectedCombination.id);
      // 记录当前已模拟的 Agent ID
      await setCurrentImpersonatedAgentId(finalAgent.id);
      console.log("📱 [POPUP] ✅ 已保存当前模拟的Agent ID:", finalAgent.id);
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
    </div>
  );
}
