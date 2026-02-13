/**
 * 组合配置向导模态框
 *
 * 三步向导流程：
 * Step 1: 基础信息（标题）
 * Step 2: 基础配置（Agent, Port, URI）
 * Step 3: 参数选择（Tail + OPTY）
 */

import { useState, useEffect } from "react";
import { useI18n } from "../lib/I18nProvider";
import SearchableSelect from "./popup/SearchableSelect";
import type {
  Agent,
  Port,
  UriEntry,
  TailParameter,
  OptyParameter,
  Combination,
} from "../lib/types";
import { getCurrentTimestamp, generateId } from "../lib/types";

interface CombinationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Combination) => Promise<void>;
  editingCombination: Combination | null;
  agents: Agent[];
  ports: Port[];
  uris: UriEntry[];
  tailParams: TailParameter[];
  optyParams: OptyParameter[];
  onCreateAgent: (data: Agent) => Promise<void>;
  onCreatePort: (data: Port) => Promise<void>;
  onCreateUri: (data: UriEntry) => Promise<void>;
  onCreateTailParam: (data: TailParameter) => Promise<void>;
  onCreateOptyParam: (data: OptyParameter) => Promise<void>;
  onRefreshData: () => Promise<void>;
}

type WizardStep = 1 | 2 | 3;

export default function CombinationWizardModal({
  isOpen,
  onClose,
  onSave,
  editingCombination,
  agents,
  ports,
  uris,
  tailParams,
  optyParams,
  onCreateAgent,
  onCreatePort,
  onCreateUri,
  onCreateTailParam,
  onCreateOptyParam,
  onRefreshData,
}: CombinationWizardModalProps) {
  const { t } = useI18n();

  // ===========================
  // 状态管理
  // ===========================

  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: 基础信息
  const [title, setTitle] = useState("");

  // Step 2: 基础配置
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedPortId, setSelectedPortId] = useState<string | null>(null);
  const [selectedUriId, setSelectedUriId] = useState<string | null>(null);

  // Step 3: 参数选择
  const [selectedTailParamIds, setSelectedTailParamIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedOptyParamIds, setSelectedOptyParamIds] = useState<Set<string>>(
    new Set(),
  );

  // 创建对话框状态
  const [createDialogOpen, setCreateDialogOpen] = useState<{
    type: "agent" | "port" | "uri" | "tail" | "opty" | null;
  }>({ type: null });
  const [isCreating, setIsCreating] = useState(false);

  // 创建表单数据
  const [createForm, setCreateForm] = useState<Record<string, any>>({});

  // ===========================
  // 初始化和重置
  // ===========================

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, editingCombination?.id]);

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedAgentId(null);
    setSelectedPortId(null);
    setSelectedUriId(null);
    setSelectedTailParamIds(new Set());
    setSelectedOptyParamIds(new Set());

    if (editingCombination) {
      setTitle(editingCombination.title);
      setSelectedAgentId(editingCombination.agentId);
      setSelectedPortId(editingCombination.portId);
      setSelectedUriId(editingCombination.uriId);
      setSelectedTailParamIds(new Set(editingCombination.tailParameterIds));
      setSelectedOptyParamIds(new Set(editingCombination.optyParameterIds));
    } else {
      setTitle("");
    }
  };

  // ===========================
  // 步骤导航
  // ===========================

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as WizardStep);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      const combinationData: Combination = {
        id: editingCombination?.id || generateId(),
        title,
        agentId: selectedAgentId,
        portId: selectedPortId,
        uriId: selectedUriId,
        tailParameterIds: Array.from(selectedTailParamIds),
        optyParameterIds: Array.from(selectedOptyParamIds),
        createdAt: editingCombination?.createdAt || getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
      };

      await onSave(combinationData);
      onClose();
      resetForm();
    } catch (error) {
      console.error("Failed to save combination:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ===========================
  // 参数选择处理
  // ===========================

  const handleTailParamToggle = (id: string) => {
    setSelectedTailParamIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleOptyParamToggle = (id: string) => {
    setSelectedOptyParamIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // ===========================
  // 快速创建处理
  // ===========================

  const handleOpenCreateDialog = (
    type: "agent" | "port" | "uri" | "tail" | "opty",
  ) => {
    setCreateForm({});
    setCreateDialogOpen({ type });
  };

  const handleCloseCreateDialog = () => {
    setCreateForm({});
    setCreateDialogOpen({ type: null });
  };

  const handleCreate = async () => {
    try {
      setIsCreating(true);
      const { type } = createDialogOpen;
      if (!type) return;

      let newItemId: string = generateId();

      switch (type) {
        case "agent":
          newItemId = createForm.id;
          await onCreateAgent({
            id: newItemId,
            username: createForm.username,
          });
          setSelectedAgentId(newItemId);
          break;
        case "port":
          await onCreatePort({
            id: newItemId,
            port: createForm.port,
            description: createForm.description,
          });
          setSelectedPortId(newItemId);
          break;
        case "uri":
          await onCreateUri({
            id: newItemId,
            uri: createForm.uri,
            description: createForm.description,
          });
          setSelectedUriId(newItemId);
          break;
        case "tail":
          await onCreateTailParam({
            id: newItemId,
            key: createForm.key,
            value: createForm.value,
          });
          setSelectedTailParamIds((prev) => new Set([...prev, newItemId]));
          break;
        case "opty":
          await onCreateOptyParam({
            id: newItemId,
            key: createForm.key,
            value: createForm.value,
          });
          setSelectedOptyParamIds((prev) => new Set([...prev, newItemId]));
          break;
      }

      // 刷新数据
      await onRefreshData();

      // 关闭对话框
      handleCloseCreateDialog();
    } catch (error) {
      console.error("Failed to create item:", error);
      alert(t("wizard.createFailed"));
    } finally {
      setIsCreating(false);
    }
  };

  // ===========================
  // 步骤验证
  // ===========================

  const isStep1Valid = () => {
    return title.trim().length > 0;
  };

  const isStep2Valid = () => {
    // Step 2 不强制要求填写，可以为空
    return true;
  };

  const isStep3Valid = () => {
    // Step 3 不强制要求填写，可以为空
    return true;
  };

  // ===========================
  // 渲染步骤内容
  // ===========================

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">{t("wizard.step1Title")}</h3>
      <div className="form-control">
        <label className="label">
          <span className="label-text">{t("wizard.combinationTitle")}</span>
          <span className="label-text-alt text-error"> *</span>
        </label>
        <input
          type="text"
          className="input input-bordered"
          placeholder={t("wizard.combinationTitlePlaceholder")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">{t("wizard.step2Title")}</h3>
      <p className="text-sm opacity-70 mb-4">{t("wizard.basicConfigDesc")}</p>

      <div className="form-control">
        <label className="label">
          <span className="label-text">{t("wizard.selectAgent")}</span>
          <span className="label-text-alt">
            <button
              className="btn btn-xs btn-primary"
              onClick={() => handleOpenCreateDialog("agent")}
            >
              {t("wizard.add")}
            </button>
          </span>
        </label>
        <SearchableSelect
          options={agents.map((agent) => ({
            id: agent.id,
            label: agent.username,
          }))}
          value={selectedAgentId || ""}
          onChange={(value) => setSelectedAgentId(value || null)}
          placeholder={t("wizard.selectAgentPlaceholder")}
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">{t("wizard.selectPort")}</span>
          <span className="label-text-alt">
            <button
              className="btn btn-xs btn-primary"
              onClick={() => handleOpenCreateDialog("port")}
            >
              {t("wizard.add")}
            </button>
          </span>
        </label>
        <SearchableSelect
          options={ports.map((port) => ({
            id: port.id,
            label: `${port.port}`,
            description: port.description,
          }))}
          value={selectedPortId || ""}
          onChange={(value) => setSelectedPortId(value || null)}
          placeholder={t("wizard.selectPortPlaceholder")}
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">{t("wizard.selectUri")}</span>
          <span className="label-text-alt">
            <button
              className="btn btn-xs btn-primary"
              onClick={() => handleOpenCreateDialog("uri")}
            >
              {t("wizard.add")}
            </button>
          </span>
        </label>
        <SearchableSelect
          options={uris.map((uri) => ({
            id: uri.id,
            label: uri.uri,
            description: uri.description,
          }))}
          value={selectedUriId || ""}
          onChange={(value) => setSelectedUriId(value || null)}
          placeholder={t("wizard.selectUriPlaceholder")}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">{t("wizard.step3Title")}</h3>
      <p className="text-sm opacity-70 mb-4">{t("wizard.parametersDesc")}</p>

      {/* Tail Parameters */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold">{t("wizard.tailParams")}</h4>
          <button
            className="btn btn-xs btn-primary"
            onClick={() => handleOpenCreateDialog("tail")}
          >
            {t("wizard.add")}
          </button>
        </div>
        {tailParams.length === 0 ? (
          <div className="text-sm opacity-50">{t("wizard.noTailParams")}</div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto border border-base-300 rounded-lg p-2">
            {tailParams.map((param) => (
              <div key={param.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={selectedTailParamIds.has(param.id)}
                  onChange={() => handleTailParamToggle(param.id)}
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">{param.key}</div>
                  <div className="text-xs opacity-70">{param.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* OPTY Parameters */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold">{t("wizard.optyParams")}</h4>
          <button
            className="btn btn-xs btn-primary"
            onClick={() => handleOpenCreateDialog("opty")}
          >
            {t("wizard.add")}
          </button>
        </div>
        {optyParams.length === 0 ? (
          <div className="text-sm opacity-50">{t("wizard.noOptyParams")}</div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto border border-base-300 rounded-lg p-2">
            {optyParams.map((param) => (
              <div key={param.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={selectedOptyParamIds.has(param.id)}
                  onChange={() => handleOptyParamToggle(param.id)}
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">{param.key}</div>
                  <div className="text-xs opacity-70">
                    {param.value ? "true" : "false"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ===========================
  // 主渲染
  // ===========================

  if (!isOpen) return null;

  return (
    <dialog open className="modal">
      <div className="modal-box w-11/12 max-w-3xl">
        <h3 className="font-bold text-xl mb-6">
          {editingCombination
            ? t("wizard.editCombination")
            : t("wizard.createCombination")}
        </h3>

        {/* 步骤指示器 */}
        <div className="join w-full mb-6">
          <div
            className={`join-item flex items-center justify-center p-3 ${
              currentStep === 1
                ? "bg-primary text-primary-content"
                : "bg-base-200"
            }`}
          >
            <span className="font-bold">1</span>
            <span className="ml-2">{t("wizard.basicInfo")}</span>
          </div>
          <div
            className={`join-item flex items-center justify-center p-3 ${
              currentStep === 2
                ? "bg-primary text-primary-content"
                : "bg-base-200"
            }`}
          >
            <span className="font-bold">2</span>
            <span className="ml-2">{t("wizard.basicConfig")}</span>
          </div>
          <div
            className={`join-item flex items-center justify-center p-3 ${
              currentStep === 3
                ? "bg-primary text-primary-content"
                : "bg-base-200"
            }`}
          >
            <span className="font-bold">3</span>
            <span className="ml-2">{t("wizard.parameterSelection")}</span>
          </div>
        </div>

        {/* 步骤内容 */}
        <div className="min-h-[300px]">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* 底部按钮 */}
        <div className="modal-action">
          <button className="btn" onClick={onClose} disabled={isLoading}>
            {t("common.cancel")}
          </button>
          {currentStep > 1 && (
            <button className="btn" onClick={handlePrev} disabled={isLoading}>
              {t("wizard.previous")}
            </button>
          )}
          {currentStep < 3 && (
            <button
              className="btn btn-primary"
              onClick={handleNext}
              disabled={
                isLoading ||
                (currentStep === 1 && !isStep1Valid()) ||
                (currentStep === 2 && !isStep2Valid())
              }
            >
              {t("wizard.next")}
            </button>
          )}
          {currentStep === 3 && (
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isLoading || !isStep3Valid()}
            >
              {isLoading ? t("wizard.saving") : t("wizard.save")}
            </button>
          )}
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </div>

      {/* 创建对话框 */}
      {createDialogOpen.type && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {createDialogOpen.type === "agent" && t("wizard.addAgent")}
              {createDialogOpen.type === "port" && t("wizard.addPort")}
              {createDialogOpen.type === "uri" && t("wizard.addUri")}
              {createDialogOpen.type === "tail" && t("wizard.addTailParam")}
              {createDialogOpen.type === "opty" && t("wizard.addOptyParam")}
            </h3>

            <div className="space-y-4">
              {createDialogOpen.type === "agent" && (
                <>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">{t("wizard.agentId")}</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      placeholder={t("agents.agentId")}
                      value={createForm.id || ""}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, id: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">{t("wizard.username")}</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      placeholder={t("agents.username")}
                      value={createForm.username || ""}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          username: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </>
              )}

              {createDialogOpen.type === "port" && (
                <>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">
                        {t("wizard.portNumber")}
                      </span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered"
                      placeholder={t("ports.port")}
                      value={createForm.port || ""}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          port: Number(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">
                        {t("ports.description")}{" "}
                        {t("wizard.descriptionOptional")}
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      placeholder={t("wizard.description")}
                      value={createForm.description || ""}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </>
              )}

              {createDialogOpen.type === "uri" && (
                <>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">
                        {t("wizard.uriAddress")}
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      placeholder="/api/v1/data {t('wizard.uriOptional')}"
                      value={createForm.uri || ""}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, uri: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">
                        {t("ports.description")}{" "}
                        {t("wizard.descriptionOptional")}
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      placeholder={t("wizard.uriDescription")}
                      value={createForm.description || ""}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </>
              )}

              {createDialogOpen.type === "tail" && (
                <>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">
                        {t("wizard.paramName")}
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      placeholder={t("tailParameters.key")}
                      value={createForm.key || ""}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, key: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">
                        {t("wizard.paramValue")}
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      placeholder={t("tailParameters.value")}
                      value={createForm.value || ""}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, value: e.target.value })
                      }
                      required
                    />
                  </div>
                </>
              )}

              {createDialogOpen.type === "opty" && (
                <>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">
                        {t("wizard.paramName")}
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      placeholder={t("wizard.optyParamPlaceholder")}
                      value={createForm.key || ""}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, key: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">
                        {t("wizard.paramValue")}
                      </span>
                    </label>
                    <input
                      type="checkbox"
                      className="toggle toggle-bordered"
                      checked={createForm.value || false}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          value: e.target.checked,
                        })
                      }
                    />
                  </div>
                </>
              )}
            </div>

            <div className="modal-action">
              <button
                className="btn"
                onClick={handleCloseCreateDialog}
                disabled={isCreating}
              >
                {t("common.cancel")}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={isCreating}
              >
                {isCreating ? t("wizard.creating") : t("wizard.create")}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={handleCloseCreateDialog}>
            <button>close</button>
          </div>
        </div>
      )}
    </dialog>
  );
}
