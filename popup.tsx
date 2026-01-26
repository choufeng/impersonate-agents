import { useEffect, useState, useRef } from "react";
import { ConvexProvider } from "convex/react";
import { useStorage } from "@plasmohq/storage/hook";
import { convex } from "./lib/convex";
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
  injectOptyFeatures,
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
import { I18nProvider, useI18n } from "./lib/I18nProvider";
import CombinationSelector from "./components/popup/CombinationSelector";
import BasicInfoCard from "./components/popup/BasicInfoCard";
import ParameterSection from "./components/popup/ParameterSection";
import ActionButtons from "./components/popup/ActionButtons";
import AddressView from "./components/popup/AddressView";

type PopupView = "impersonate" | "address";
type RedirectMode = "full" | "paramsOnly" | "optyOnly" | "paramsAndOpty" | "optyInject";

function PopupContent() {
  const { t } = useI18n();
  // ===========================
  // 状态管理
  // ===========================

  const [currentView, setCurrentView] = useStorage<PopupView>(
    "popup.currentView",
    "impersonate",
  );

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

  // 用于控制是否允许自动保存临时状态（加载完成后才允许）
  const [enableAutoSave, setEnableAutoSave] = useState(false);

  // ===========================
  // 初始化数据加载
  // ===========================

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCombinationId) {
      setEnableAutoSave(false); // 加载新组合时暂时禁用自动保存
      loadCombinationData(selectedCombinationId);
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
      setEnableAutoSave(false);
    }
  }, [selectedCombinationId]);

  // 监听临时状态变化并自动保存
  useEffect(() => {
    if (selectedCombination && enableAutoSave) {
      console.log("💾 [POPUP] 临时状态变化，自动保存");
      saveTempState();
    }
  }, [tempAgentId, tempPortId, tempUriId, tempOverrides, tempValueOverrides]);

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

        // 尝试恢复临时状态
        const tempState = await getPopupTempState();
        console.log("🔄 [POPUP] 恢复临时状态:", tempState);

        // 用于构建 params 的临时变量
        let restoredTempOverrides = new Map<string, boolean>();
        let restoredTempValueOverrides = new Map<string, string>();

        if (tempState && tempState.combinationId === combinationId) {
          // 恢复临时基础信息状态
          console.log("🔄 [POPUP] 临时状态匹配，恢复临时修改");
          setTempAgentId(tempState.tempAgentId);
          setTempPortId(tempState.tempPortId);
          setTempUriId(tempState.tempUriId);

          // 恢复临时修改
          restoredTempOverrides = new Map(
            Object.entries(tempState.tempOverrides),
          );
          restoredTempValueOverrides = new Map(
            Object.entries(tempState.tempValueOverrides),
          );
          setTempOverrides(restoredTempOverrides);
          setTempValueOverrides(restoredTempValueOverrides);
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

        // 构建 TempOverride 数组（应用恢复的临时修改）
        const combinedParams: TempOverride[] = [
          ...selectedTailParams.map((param) => {
            const hasValueOverride = restoredTempValueOverrides.has(param.key);
            return {
              key: param.key,
              value: hasValueOverride
                ? (restoredTempValueOverrides.get(param.key) as string)
                : param.value,
              isOpty: false,
              enabled: true,
              isModified: hasValueOverride,
            };
          }),
          ...selectedOptyParams.map((param) => {
            const keyWithPrefix = `opty_${param.key}`;
            const hasToggleOverride = restoredTempOverrides.has(keyWithPrefix);
            return {
              key: keyWithPrefix,
              value: param.value.toString(),
              isOpty: true,
              enabled: hasToggleOverride
                ? (restoredTempOverrides.get(keyWithPrefix) as boolean)
                : param.value,
              isModified: hasToggleOverride,
            };
          }),
        ];

        setParams(combinedParams);

        // 数据加载完成后，延迟启用自动保存（避免立即触发保存覆盖刚恢复的状态）
        setTimeout(() => {
          setEnableAutoSave(true);
          console.log("✅ [POPUP] 启用自动保存");
        }, 100);
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
        param.key === key ? { ...param, enabled, isModified: true } : param,
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
  const handleRedirect = async (mode: RedirectMode = "full") => {
    console.log("📱 [POPUP] ========== 用户点击跳转按钮 ==========");
    console.log("📱 [POPUP] 跳转模式:", mode);
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

      // 根据模式过滤参数
      let filteredTailParams = baseTailParams;
      let filteredOptyParams = baseOptyParams;

      if (mode === "paramsOnly") {
        // 仅带参数
        filteredOptyParams = [];
      } else if (mode === "optyOnly") {
        // 仅带opty
        filteredTailParams = [];
      } else if (mode === "paramsAndOpty") {
        // 参数+opty（都保留，这是默认行为）
      } else if (mode === "optyInject") {
        // OPTY注入模式：不在URL中带opty参数，后续通过JS注入
        // 保留tail参数用于URL，opty参数稍后注入
      }

      // 应用临时修改
      const tempParams: TempOverride[] = [
        ...filteredTailParams.map((param) => {
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
        ...filteredOptyParams.map((param) => {
          const keyWithPrefix = `opty_${param.key}`;
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

      // 根据模式决定是否使用URI
      let finalUri = tempUri || uri!;
      if (
        mode === "paramsOnly" ||
        mode === "optyOnly" ||
        mode === "paramsAndOpty" ||
        mode === "optyInject"
      ) {
        // 非full模式，不使用URI，基于当前URL跳转
        // 通过传递null来表示不改变URI部分
        finalUri = null as any; // 我们需要修改executeRedirectFlow来支持这个
      }

      // OPTY注入模式的特殊处理
      if (mode === "optyInject") {
        console.log("📱 [POPUP] 🧪 使用OPTY注入模式（仅注入，不跳转）");
        
        // 提取OPTY features（去掉opty_前缀）
        const optyFeatures = filteredOptyParams
          .map((param) => {
            const enabled = tempOverrides.has(`opty_${param.key}`)
              ? (tempOverrides.get(`opty_${param.key}`) as boolean)
              : param.value;
            return enabled ? param.key : null;
          })
          .filter((key): key is string => key !== null);
        
        console.log("📱 [POPUP] 🧪 将要注入的OPTY features:", optyFeatures);
        
        // 直接注入OPTY features到当前页面，不进行跳转
        if (optyFeatures.length > 0) {
          await injectOptyFeatures(optyFeatures);
          console.log("📱 [POPUP] 🧪 OPTY features注入完成");
        } else {
          console.log("📱 [POPUP] 🧪 没有启用的OPTY features需要注入");
        }
      } else {
        // 执行完整的跳转流程（使用临时状态）
        await executeRedirectFlow({
          currentUrl,
          combination: tempCombination,
          agent: finalAgent,
          port: tempPort,
          uri: finalUri,
          params: tempParams,
          needImpersonate,
          skipUri: mode !== "full", // 新增标志，表示跳过URI变更
        });
      }

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

  const handleToggleView = () => {
    setCurrentView((prev) =>
      prev === "impersonate" ? "address" : "impersonate",
    );
  };

  return (
    <div
      data-theme="corporate"
      className="w-[360px] h-[600px] py-4 flex flex-col bg-base-300 overflow-x-hidden"
    >
      {currentView === "impersonate" ? (
        <>
          <div className="px-4">
            <CombinationSelector
              combinations={combinations}
              selectedCombinationId={selectedCombinationId}
              onCombinationChange={handleCombinationChange}
            />
          </div>

          {selectedCombination ? (
            <div className="space-y-4 flex-1 overflow-y-auto overflow-x-hidden">
              <div className="px-4">
                <BasicInfoCard
                  combination={selectedCombination}
                  agent={agent}
                  port={port}
                  uri={uri}
                  tempAgentId={tempAgentId}
                  tempPortId={tempPortId}
                  tempUriId={tempUriId}
                  onUpdate={handleSaveBasicInfo}
                  isUpdating={isLoading}
                />
              </div>

              <div className="px-4">
                <ParameterSection
                  title={t("popup.tailParameters")}
                  params={params.filter((p) => !p.isOpty)}
                  tempOverrides={tempOverrides}
                  tempValueOverrides={tempValueOverrides}
                  onValueChange={handleValueChange}
                  onToggleChange={handleToggleChange}
                  onResetParameter={handleResetParameter}
                  onResetAllParameters={handleResetAllParameters}
                />
              </div>

              <div className="px-4">
                <ParameterSection
                  title={t("popup.optyParameters")}
                  params={params.filter((p) => p.isOpty)}
                  tempOverrides={tempOverrides}
                  tempValueOverrides={tempValueOverrides}
                  onValueChange={handleValueChange}
                  onToggleChange={handleToggleChange}
                  onResetParameter={handleResetParameter}
                  onResetAllParameters={handleResetAllParameters}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}
        </>
      ) : (
        <AddressView />
      )}

      <div className="px-4">
        <ActionButtons
          selectedCombination={!!selectedCombination}
          isLoading={isLoading}
          onRedirect={handleRedirect}
          onOpenOptions={openOptions}
          currentView={currentView}
          onToggleView={handleToggleView}
        />
      </div>
    </div>
  );
}

export default function Popup() {
  return (
    <ConvexProvider client={convex}>
      <I18nProvider>
        <PopupContent />
      </I18nProvider>
    </ConvexProvider>
  );
}
