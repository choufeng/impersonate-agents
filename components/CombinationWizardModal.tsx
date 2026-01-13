/**
 * 组合配置向导模态框
 *
 * 三步向导流程：
 * Step 1: 基础信息（标题）
 * Step 2: 基础配置（Agent, Port, URI）
 * Step 3: 参数选择（Tail + OPTY）
 */

import { useState, useEffect } from "react";
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
      alert("创建失败，请重试");
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
      <h3 className="font-bold text-lg">步骤 1: 基础信息</h3>
      <div className="form-control">
        <label className="label">
          <span className="label-text">组合标题</span>
          <span className="label-text-alt text-error"> *</span>
        </label>
        <input
          type="text"
          className="input input-bordered"
          placeholder="例如：开发环境配置"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">步骤 2: 基础配置</h3>
      <p className="text-sm opacity-70 mb-4">
        选择基础配置（可选，留空可稍后填写）
      </p>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Agent（用户名）</span>
          <span className="label-text-alt">
            <button
              className="btn btn-xs btn-primary"
              onClick={() => handleOpenCreateDialog("agent")}
            >
              + 添加
            </button>
          </span>
        </label>
        <select
          className="select select-bordered"
          value={selectedAgentId || ""}
          onChange={(e) => setSelectedAgentId(e.target.value || null)}
        >
          <option value="">请选择 Agent（可选）</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.username}
            </option>
          ))}
        </select>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">端口</span>
          <span className="label-text-alt">
            <button
              className="btn btn-xs btn-primary"
              onClick={() => handleOpenCreateDialog("port")}
            >
              + 添加
            </button>
          </span>
        </label>
        <select
          className="select select-bordered"
          value={selectedPortId || ""}
          onChange={(e) => setSelectedPortId(e.target.value || null)}
        >
          <option value="">请选择端口（可选）</option>
          {ports.map((port) => (
            <option key={port.id} value={port.id}>
              {port.port} {port.description ? `- ${port.description}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">URI</span>
          <span className="label-text-alt">
            <button
              className="btn btn-xs btn-primary"
              onClick={() => handleOpenCreateDialog("uri")}
            >
              + 添加
            </button>
          </span>
        </label>
        <select
          className="select select-bordered"
          value={selectedUriId || ""}
          onChange={(e) => setSelectedUriId(e.target.value || null)}
        >
          <option value="">请选择 URI（可选）</option>
          {uris.map((uri) => (
            <option key={uri.id} value={uri.id}>
              {uri.uri.length > 50 ? `${uri.uri.slice(0, 50)}...` : uri.uri}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">步骤 3: 参数选择</h3>
      <p className="text-sm opacity-70 mb-4">
        选择参数（可选，留空可稍后填写）
      </p>

      {/* Tail Parameters */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold">尾部参数</h4>
          <button
            className="btn btn-xs btn-primary"
            onClick={() => handleOpenCreateDialog("tail")}
          >
            + 添加
          </button>
        </div>
        {tailParams.length === 0 ? (
          <div className="text-sm opacity-50">暂无尾部参数数据</div>
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
          <h4 className="font-semibold">OPTY 参数</h4>
          <button
            className="btn btn-xs btn-primary"
            onClick={() => handleOpenCreateDialog("opty")}
          >
            + 添加
          </button>
        </div>
        {optyParams.length === 0 ? (
          <div className="text-sm opacity-50">暂无 OPTY 参数数据</div>
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
                  <div className="font-medium text-sm">OPTY_{param.key}</div>
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
          {editingCombination ? "编辑组合配置" : "创建组合配置"}
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
            <span className="ml-2">基础信息</span>
          </div>
          <div
            className={`join-item flex items-center justify-center p-3 ${
              currentStep === 2
                ? "bg-primary text-primary-content"
                : "bg-base-200"
            }`}
          >
            <span className="font-bold">2</span>
            <span className="ml-2">基础配置</span>
          </div>
          <div
            className={`join-item flex items-center justify-center p-3 ${
              currentStep === 3
                ? "bg-primary text-primary-content"
                : "bg-base-200"
            }`}
          >
            <span className="font-bold">3</span>
            <span className="ml-2">参数选择</span>
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
            取消
          </button>
          {currentStep > 1 && (
            <button className="btn" onClick={handlePrev} disabled={isLoading}>
              上一步
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
              下一步
            </button>
          )}
          {currentStep === 3 && (
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isLoading || !isStep3Valid()}
            >
              {isLoading ? "保存中..." : "保存"}
            </button>
          )}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>

      {/* 创建对话框 */}
      {createDialogOpen.type && (
        <dialog open className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {createDialogOpen.type === "agent" && "添加 Agent"}
              {createDialogOpen.type === "port" && "添加端口"}
              {createDialogOpen.type === "uri" && "添加 URI"}
              {createDialogOpen.type === "tail" && "添加尾部参数"}
              {createDialogOpen.type === "opty" && "添加 OPTY 参数"}
            </h3>

            <div className="space-y-4">
              {createDialogOpen.type === "agent" && (
                <>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Agent ID *</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      placeholder="请输入 Agent ID"
                      value={createForm.id || ""}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, id: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">用户名 *</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      placeholder="请输入用户名"
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
                      <span className="label-text">端口号 *</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered"
                      placeholder="请输入端口号"
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
                      <span className="label-text">描述</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      placeholder="描述（可选）"
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
                      <span className="label-text">URI 地址 *</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      placeholder="请输入 URI 地址，如 /api/v1/data"
                      value={createForm.uri || ""}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, uri: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">描述</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      placeholder="URI 用途说明（可选）"
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
                      <span className="label-text">参数名 *</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      placeholder="请输入参数名"
                      value={createForm.key || ""}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, key: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">参数值 *</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      placeholder="请输入参数值"
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
                      <span className="label-text">参数名 *</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      placeholder="如 TIMEOUT（自动添加OPTY_前缀）"
                      value={createForm.key || ""}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, key: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">参数值</span>
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
                取消
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={isCreating}
              >
                {isCreating ? "创建中..." : "创建"}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={handleCloseCreateDialog}>close</button>
          </form>
        </dialog>
      )}
    </dialog>
  );
}
