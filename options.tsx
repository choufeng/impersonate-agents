import { useEffect, useState } from "react";
import "./options.css";
import CombinationWizardModal from "./components/CombinationWizardModal";
import {
  // Agent 操作
  getAgents,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
  // Port 操作
  getPorts,
  getPortById,
  createPort,
  updatePort,
  deletePort,
  // URI 操作
  getUris,
  getUriById,
  createUri,
  updateUri,
  deleteUri,
  // Tail Parameter 操作
  getTailParameters,
  createTailParameter,
  updateTailParameter,
  deleteTailParameter,
  // OPTY Parameter 操作
  getOptyParameters,
  createOptyParameter,
  updateOptyParameter,
  deleteOptyParameter,
  // Combination 操作
  getCombinations,
  getCombinationById,
  createCombination,
  updateCombination,
  deleteCombination,
  copyCombination,
  // 导入导出操作
  exportData,
  detectImportConflicts,
  importData,
  type ImportConflictResult,
} from "./lib/storage";
import { isDraft, getCurrentTimestamp, generateId } from "./lib/types";
import type {
  Agent,
  Port,
  UriEntry,
  TailParameter,
  OptyParameter,
  Combination,
} from "./lib/types";

// ============================================================================
// 子组件
// ============================================================================

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSubmit: (data: any) => void;
  fields: {
    name: string;
    label: string;
    type: "text" | "number" | "switch";
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
  }[];
  initialValues?: Record<string, any>;
  isLoading?: boolean;
}

const FormModal = ({
  isOpen,
  onClose,
  title,
  onSubmit,
  fields,
  initialValues = {},
  isLoading = false,
}: FormModalProps) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialValues);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialValues || {});
    }
  }, [isOpen]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData(initialValues);
  };

  if (!isOpen) return null;

  return (
    <dialog open className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">{title}</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.name} className="form-control">
                <label className="label">
                  <span className="label-text">
                    {field.label}
                    {field.required && <span className="text-error"> *</span>}
                  </span>
                </label>
                {field.type === "switch" ? (
                  <input
                    type="checkbox"
                    className="toggle toggle-bordered"
                    checked={formData[field.name] || false}
                    onChange={(e) => handleChange(field.name, e.target.checked)}
                    disabled={isLoading || field.disabled}
                  />
                ) : (
                  <input
                    type={field.type}
                    className="input input-bordered"
                    placeholder={field.placeholder}
                    required={field.required}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    disabled={isLoading || field.disabled}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={onClose}
              disabled={isLoading}
            >
              取消
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </div>
    </dialog>
  );
};

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  itemName: string;
  title?: string;
}

const ConfirmDialog = ({
  isOpen,
  onConfirm,
  onCancel,
  itemName,
  title = "确认删除",
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <dialog open className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-4">确定要删除「{itemName}」吗？此操作无法撤销。</p>
        <div className="modal-action">
          <button className="btn" onClick={onCancel}>
            取消
          </button>
          <button className="btn btn-error" onClick={onConfirm}>
            删除
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

interface ToastProps {
  show: boolean;
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

const Toast = ({ show, message, type = "success", onClose }: ToastProps) => {
  if (!show) return null;

  return (
    <div
      role="alert"
      className={`alert alert-${type} fixed top-4 right-4 w-80 z-50`}
    >
      <span>{message}</span>
    </div>
  );
};

interface ImportConfirmDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onSkipConflicts: () => void;
  onOverwriteConflicts: () => void;
  conflicts: ImportConflictResult | null;
  isImporting: boolean;
}

const ImportConfirmDialog = ({
  isOpen,
  onCancel,
  onSkipConflicts,
  onOverwriteConflicts,
  conflicts,
  isImporting,
}: ImportConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <dialog open className="modal">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">导入配置</h3>

        {conflicts && conflicts.hasConflicts ? (
          <>
            <div role="alert" className="alert alert-warning mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>检测到冲突！部分配置已存在。</span>
            </div>

            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              {conflicts.conflicts.agents.length > 0 && (
                <div className="text-sm">
                  <strong>Agents ({conflicts.conflicts.agents.length}):</strong>{" "}
                  {conflicts.conflicts.agents.join(", ")}
                </div>
              )}
              {conflicts.conflicts.ports.length > 0 && (
                <div className="text-sm">
                  <strong>Ports ({conflicts.conflicts.ports.length}):</strong>{" "}
                  {conflicts.conflicts.ports.join(", ")}
                </div>
              )}
              {conflicts.conflicts.uris.length > 0 && (
                <div className="text-sm">
                  <strong>URIs ({conflicts.conflicts.uris.length}):</strong>{" "}
                  {conflicts.conflicts.uris.join(", ")}
                </div>
              )}
              {conflicts.conflicts.tailParameters.length > 0 && (
                <div className="text-sm">
                  <strong>
                    尾部参数 ({conflicts.conflicts.tailParameters.length}):
                  </strong>{" "}
                  {conflicts.conflicts.tailParameters.join(", ")}
                </div>
              )}
              {conflicts.conflicts.optyParameters.length > 0 && (
                <div className="text-sm">
                  <strong>
                    OPTY 参数 ({conflicts.conflicts.optyParameters.length}):
                  </strong>{" "}
                  {conflicts.conflicts.optyParameters.join(", ")}
                </div>
              )}
              {conflicts.conflicts.combinations.length > 0 && (
                <div className="text-sm">
                  <strong>
                    组合配置 ({conflicts.conflicts.combinations.length}):
                  </strong>{" "}
                  {conflicts.conflicts.combinations.join(", ")}
                </div>
              )}
            </div>

            <div className="modal-action">
              <button className="btn" onClick={onCancel} disabled={isImporting}>
                取消
              </button>
              <button
                className="btn btn-outline"
                onClick={onSkipConflicts}
                disabled={isImporting}
              >
                跳过冲突
              </button>
              <button
                className="btn btn-warning"
                onClick={onOverwriteConflicts}
                disabled={isImporting}
              >
                {isImporting ? "导入中..." : "覆盖冲突"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div role="alert" className="alert alert-success mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
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
              <span>没有检测到冲突，将直接导入所有配置。</span>
            </div>

            <div className="modal-action">
              <button className="btn" onClick={onCancel} disabled={isImporting}>
                取消
              </button>
              <button
                className="btn btn-primary"
                onClick={onSkipConflicts}
                disabled={isImporting}
              >
                {isImporting ? "导入中..." : "开始导入"}
              </button>
            </div>
          </>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onCancel}>close</button>
      </form>
    </dialog>
  );
};

// ============================================================================
// 主组件
// ============================================================================

export default function Options() {
  // ===========================
  // 状态管理
  // ===========================

  const [currentNav, setCurrentNavState] = useState<
    | "agents"
    | "ports"
    | "uris"
    | "tail-parameters"
    | "opty-parameters"
    | "combinations"
  >("agents");

  // Agents
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  // Ports
  const [ports, setPorts] = useState<Port[]>([]);
  const [portModalOpen, setPortModalOpen] = useState(false);
  const [editingPort, setEditingPort] = useState<Port | null>(null);

  // URIs
  const [uris, setUris] = useState<UriEntry[]>([]);
  const [uriModalOpen, setUriModalOpen] = useState(false);
  const [editingUri, setEditingUri] = useState<UriEntry | null>(null);

  // Tail Parameters
  const [tailParams, setTailParams] = useState<TailParameter[]>([]);
  const [tailParamModalOpen, setTailParamModalOpen] = useState(false);
  const [editingTailParam, setEditingTailParam] =
    useState<TailParameter | null>(null);

  // OPTY Parameters
  const [optyParams, setOptyParams] = useState<OptyParameter[]>([]);
  const [optyParamModalOpen, setOptyParamModalOpen] = useState(false);
  const [editingOptyParam, setEditingOptyParam] =
    useState<OptyParameter | null>(null);

  // Combinations
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [combinationModalOpen, setCombinationModalOpen] = useState(false);
  const [editingCombination, setEditingCombination] =
    useState<Combination | null>(null);

  // Delete Confirm
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: string;
    id: string;
    name: string;
  } | null>(null);

  // Toast
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  // Import/Export
  const [importConfirmOpen, setImportConfirmOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importConflicts, setImportConflicts] =
    useState<ImportConflictResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importedData, setImportedData] = useState<any>(null);

  // ===========================
  // 初始化
  // ===========================

  useEffect(() => {
    loadData();
  }, []);

  // ===========================
  // 数据加载函数
  // ===========================

  const loadData = async () => {
    try {
      const [dataAgents] = await Promise.all([
        loadAgents(),
        loadPorts(),
        loadUris(),
        loadTailParameters(),
        loadOptyParameters(),
        loadCombinations(),
      ]);

      console.log("✅ Data loaded successfully");
    } catch (error) {
      console.error("❌ Failed to load data:", error);
    }
  };

  const loadAgents = async () => {
    const data = await getAgents();
    setAgents(data);
  };

  const loadPorts = async () => {
    const data = await getPorts();
    setPorts(data);
  };

  const loadUris = async () => {
    const data = await getUris();
    setUris(data);
  };

  const loadTailParameters = async () => {
    const data = await getTailParameters();
    setTailParams(data);
  };

  const loadOptyParameters = async () => {
    const data = await getOptyParameters();
    setOptyParams(data);
  };

  const loadCombinations = async () => {
    const data = await getCombinations();
    setCombinations(data);
  };

  // 刷新所有数据
  const loadAllData = async () => {
    await Promise.all([
      loadAgents(),
      loadPorts(),
      loadUris(),
      loadTailParameters(),
      loadOptyParameters(),
    ]);
  };

  // 创建包装函数（用于CombinationWizardModal）
  const handleCreateAgent = async (data: Agent) => {
    await createAgent(data);
  };

  const handleCreatePort = async (data: Port) => {
    await createPort(data);
  };

  const handleCreateUri = async (data: UriEntry) => {
    await createUri(data);
  };

  const handleCreateTailParam = async (data: TailParameter) => {
    await createTailParameter(data);
  };

  const handleCreateOptyParam = async (data: OptyParameter) => {
    await createOptyParameter(data);
  };

  // ===========================
  // Toast 处理
  // ===========================

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // ===========================
  // Agent 处理函数
  // ===========================

  const handleAddAgent = () => {
    setEditingAgent(null);
    setAgentModalOpen(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setAgentModalOpen(true);
  };

  const handleSaveAgent = async (data: Agent) => {
    if (editingAgent) {
      await updateAgent(editingAgent.id, data);
      showToast("Agent 已更新");
    } else {
      await createAgent(data);
      showToast("Agent 已创建");
    }
    await loadAgents();
    setAgentModalOpen(false);
  };

  const handleDeleteAgent = (agent: Agent) => {
    setItemToDelete({ type: "Agent", id: agent.id, name: agent.username });
    setDeleteConfirmOpen(true);
  };

  // ===========================
  // Port 处理函数
  // ===========================

  const handleAddPort = () => {
    setEditingPort(null);
    setPortModalOpen(true);
  };

  const handleEditPort = (port: Port) => {
    setEditingPort(port);
    setPortModalOpen(true);
  };

  const handleSavePort = async (data: {
    port: number;
    description?: string;
  }) => {
    if (editingPort) {
      await updatePort(editingPort.id, data);
      showToast("端口已更新");
    } else {
      await createPort(data);
      showToast("端口已创建");
    }
    await loadPorts();
    setPortModalOpen(false);
  };

  const handleDeletePort = (port: Port) => {
    setItemToDelete({
      type: "Port",
      id: port.id,
      name: `${port.port}${port.description ? ` - ${port.description}` : ""}`,
    });
    setDeleteConfirmOpen(true);
  };

  // ===========================
  // URI 处理函数
  // ===========================

  const handleAddUri = () => {
    setEditingUri(null);
    setUriModalOpen(true);
  };

  const handleEditUri = (uri: UriEntry) => {
    setEditingUri(uri);
    setUriModalOpen(true);
  };

  const handleSaveUri = async (data: { uri: string; description?: string }) => {
    if (editingUri) {
      await updateUri(editingUri.id, data);
      showToast("URI 已更新");
    } else {
      await createUri(data);
      showToast("URI 已创建");
    }
    await loadUris();
    setUriModalOpen(false);
  };

  const handleDeleteUri = (uri: UriEntry) => {
    setItemToDelete({ type: "URI", id: uri.id, name: uri.uri });
    setDeleteConfirmOpen(true);
  };

  // ===========================
  // Tail Parameter 处理函数
  // ===========================

  const handleAddTailParam = () => {
    setEditingTailParam(null);
    setTailParamModalOpen(true);
  };

  const handleEditTailParam = (param: TailParameter) => {
    setEditingTailParam(param);
    setTailParamModalOpen(true);
  };

  const handleSaveTailParam = async (data: { key: string; value: string }) => {
    if (editingTailParam) {
      await updateTailParameter(editingTailParam.id, data);
      showToast("尾部参数已更新");
    } else {
      await createTailParameter(data);
      showToast("尾部参数已创建");
    }
    await loadTailParameters();
    setTailParamModalOpen(false);
  };

  const handleDeleteTailParam = (param: TailParameter) => {
    setItemToDelete({
      type: "尾部参数",
      id: param.id,
      name: `${param.key} = ${param.value}`,
    });
    setDeleteConfirmOpen(true);
  };

  // ===========================
  // OPTY Parameter 处理函数
  // ===========================

  const handleAddOptyParam = () => {
    setEditingOptyParam(null);
    setOptyParamModalOpen(true);
  };

  const handleEditOptyParam = (param: OptyParameter) => {
    setEditingOptyParam(param);
    setOptyParamModalOpen(true);
  };

  const handleSaveOptyParam = async (data: { key: string; value: boolean }) => {
    if (editingOptyParam) {
      await updateOptyParameter(editingOptyParam.id, data);
      showToast("OPTY 参数已更新");
    } else {
      await createOptyParameter(data);
      showToast("OPTY 参数已创建");
    }
    await loadOptyParameters();
    setOptyParamModalOpen(false);
  };

  const handleDeleteOptyParam = (param: OptyParameter) => {
    setItemToDelete({
      type: "OPTY 参数",
      id: param.id,
      name: `${param.key} = ${param.value}`,
    });
    setDeleteConfirmOpen(true);
  };

  // ===========================
  // Combination 处理函数
  // ===========================

  const handleAddCombination = () => {
    setEditingCombination(null);
    setCombinationModalOpen(true);
  };

  const handleEditCombination = (combination: Combination) => {
    setEditingCombination(combination);
    setCombinationModalOpen(true);
  };

  const handleSaveCombination = async (data: Combination) => {
    try {
      if (editingCombination) {
        // 更新现有组合
        await updateCombination(editingCombination.id, {
          title: data.title,
          agentId: data.agentId,
          portId: data.portId,
          uriId: data.uriId,
          tailParameterIds: data.tailParameterIds,
          optyParameterIds: data.optyParameterIds,
          updatedAt: getCurrentTimestamp(),
        });
        showToast("组合已更新");
      } else {
        // 创建新组合
        await createCombination({
          title: data.title,
          agentId: data.agentId,
          portId: data.portId,
          uriId: data.uriId,
          tailParameterIds: data.tailParameterIds,
          optyParameterIds: data.optyParameterIds,
        });
        showToast("组合已创建");
      }
      await loadCombinations();
      setCombinationModalOpen(false);
    } catch (error) {
      console.error("Failed to save combination:", error);
      showToast("保存失败", "error");
    }
  };

  const handleCopyCombination = async (combination: Combination) => {
    await copyCombination(combination);
    showToast("组合已复制", "success");
    await loadCombinations();
  };

  const handleDeleteCombination = (combination: Combination) => {
    setItemToDelete({
      type: "组合",
      id: combination.id,
      name: combination.title,
    });
    setDeleteConfirmOpen(true);
  };

  // ===========================
  // 删除处理函数
  // ===========================

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      switch (itemToDelete.type) {
        case "Agent":
          await deleteAgent(itemToDelete.id);
          break;
        case "Port":
          await deletePort(itemToDelete.id);
          break;
        case "URI":
          await deleteUri(itemToDelete.id);
          break;
        case "尾部参数":
          await deleteTailParameter(itemToDelete.id);
          break;
        case "OPTY 参数":
          await deleteOptyParameter(itemToDelete.id);
          break;
        case "组合":
          await deleteCombination(itemToDelete.id);
          break;
      }

      showToast("已删除", "success");
      await loadData();
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Failed to delete:", error);
      showToast("删除失败", "error");
    }
  };

  // ===========================
  // 导入导出处理函数
  // ===========================

  /**
   * 导出配置
   */
  const handleExport = async () => {
    try {
      const data = await exportData();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, 19);
      a.download = `impersonate-agents-config-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("配置已导出", "success");
    } catch (error) {
      console.error("Export failed:", error);
      showToast("导出失败", "error");
    }
  };

  /**
   * 处理文件选择
   */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // 验证数据格式
      if (!data.version || !data.data) {
        throw new Error("无效的配置文件格式");
      }

      setImportedData(data.data);
      setImportFile(file);

      // 检测冲突
      const conflicts = await detectImportConflicts(data.data);
      setImportConflicts(conflicts);

      setImportConfirmOpen(true);
    } catch (error) {
      console.error("File parsing failed:", error);
      showToast("文件解析失败", "error");
    }

    // 清空 input 以便重新选择同一文件
    e.target.value = "";
  };

  /**
   * 取消导入
   */
  const handleCancelImport = () => {
    setImportConfirmOpen(false);
    setImportFile(null);
    setImportedData(null);
    setImportConflicts(null);
  };

  /**
   * 执行导入（跳过冲突）
   */
  const handleImportSkipConflicts = async () => {
    if (!importedData) return;

    try {
      setIsImporting(true);
      await importData(importedData, false);
      showToast("导入成功（跳过冲突）", "success");
      await loadData();
      handleCancelImport();
    } catch (error) {
      console.error("Import failed:", error);
      showToast("导入失败", "error");
    } finally {
      setIsImporting(false);
    }
  };

  /**
   * 执行导入（覆盖冲突）
   */
  const handleImportOverwriteConflicts = async () => {
    if (!importedData) return;

    try {
      setIsImporting(true);
      await importData(importedData, true);
      showToast("导入成功（覆盖冲突）", "success");
      await loadData();
      handleCancelImport();
    } catch (error) {
      console.error("Import failed:", error);
      showToast("导入失败", "error");
    } finally {
      setIsImporting(false);
    }
  };

  // ===========================
  // 主渲染
  // ===========================

  return (
    <div
      data-theme="abyss"
      className="flex h-screen"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {/* 侧边导航 */}
      <aside
        className={`w-64 bg-base-300 transition-all duration-300 fixed left-0 top-0 h-full z-10 ${
          currentNav === "agents" && "translate-x-0"
        }`}
      >
        <nav className="menu p-4">
          <ul>
            <li className={currentNav === "agents" ? "active" : ""}>
              <a onClick={() => setCurrentNavState("agents")}>
                <span>👤</span>
                <span>Agents</span>
              </a>
            </li>
            <li className={currentNav === "ports" ? "active" : ""}>
              <a onClick={() => setCurrentNavState("ports")}>
                <span>🔌</span>
                <span>端口</span>
              </a>
            </li>
            <li className={currentNav === "uris" ? "active" : ""}>
              <a onClick={() => setCurrentNavState("uris")}>
                <span>🌐</span>
                <span>URI</span>
              </a>
            </li>
            <li className={currentNav === "tail-parameters" ? "active" : ""}>
              <a onClick={() => setCurrentNavState("tail-parameters")}>
                <span>⚙️</span>
                <span>尾部参数</span>
              </a>
            </li>
            <li className={currentNav === "opty-parameters" ? "active" : ""}>
              <a onClick={() => setCurrentNavState("opty-parameters")}>
                <span>🔧</span>
                <span>OPTY 参数</span>
              </a>
            </li>
            <li className={currentNav === "combinations" ? "active" : ""}>
              <a onClick={() => setCurrentNavState("combinations")}>
                <span>📦</span>
                <span>组合配置</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 ml-64 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">配置管理</h1>
          <div className="flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={handleExport}>
              📤 导出配置
            </button>
            <label className="btn btn-success btn-sm cursor-pointer">
              📥 导入配置
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          </div>
        </div>

        {/* Agents */}
        {currentNav === "agents" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Agents</h2>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAddAgent}
              >
                添加 Agent
              </button>
            </div>
            {agents.length === 0 ? (
              <div role="alert">
                <span>暂无 Agent 数据</span>
              </div>
            ) : (
              <div className="space-y-2">
                {agents.map((agent) => (
                  <div key={agent.id} className="card bg-base-100 shadow-sm">
                    <div className="card-body p-4">
                      <h3 className="font-bold">{agent.username}</h3>
                      <div className="card-actions justify-end">
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => handleEditAgent(agent)}
                        >
                          编辑
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => handleDeleteAgent(agent)}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Ports */}
        {currentNav === "ports" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">端口</h2>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAddPort}
              >
                添加端口
              </button>
            </div>
            {ports.length === 0 ? (
              <div role="alert">
                <span>暂无端口数据</span>
              </div>
            ) : (
              <div className="space-y-2">
                {ports.map((port) => (
                  <div key={port.id} className="card bg-base-100 shadow-sm">
                    <div className="card-body p-4">
                      <h3 className="font-bold">{port.port}</h3>
                      {port.description && (
                        <p className="text-sm opacity-70">{port.description}</p>
                      )}
                      <div className="card-actions justify-end">
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => handleEditPort(port)}
                        >
                          编辑
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => handleDeletePort(port)}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* URIs */}
        {currentNav === "uris" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">URI</h2>
              <button className="btn btn-primary btn-sm" onClick={handleAddUri}>
                添加 URI
              </button>
            </div>
            {uris.length === 0 ? (
              <div role="alert">
                <span>暂无 URI 数据</span>
              </div>
            ) : (
              <div className="space-y-2">
                {uris.map((uri) => (
                  <div key={uri.id} className="card bg-base-100 shadow-sm">
                    <div className="card-body p-4">
                      <h3 className="font-bold truncate" title={uri.uri}>
                        {uri.uri.length > 50
                          ? `${uri.uri.slice(0, 50)}...`
                          : uri.uri}
                      </h3>
                      {uri.description && (
                        <p className="text-sm opacity-70">{uri.description}</p>
                      )}
                      <div className="card-actions justify-end">
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => handleEditUri(uri)}
                        >
                          编辑
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => handleDeleteUri(uri)}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tail Parameters */}
        {currentNav === "tail-parameters" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">尾部参数</h2>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAddTailParam}
              >
                添加参数
              </button>
            </div>
            {tailParams.length === 0 ? (
              <div role="alert">
                <span>暂无尾部参数数据</span>
              </div>
            ) : (
              <div className="space-y-2">
                {tailParams.map((param) => (
                  <div key={param.id} className="card bg-base-100 shadow-sm">
                    <div className="card-body p-4">
                      <h3 className="font-bold">{param.key}</h3>
                      <p>{param.value}</p>
                      <div className="card-actions justify-end">
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => handleEditTailParam(param)}
                        >
                          编辑
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => handleDeleteTailParam(param)}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* OPTY Parameters */}
        {currentNav === "opty-parameters" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">OPTY 参数</h2>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAddOptyParam}
              >
                添加参数
              </button>
            </div>
            {optyParams.length === 0 ? (
              <div role="alert">
                <span>暂无 OPTY 参数数据</span>
              </div>
            ) : (
              <div className="space-y-2">
                {optyParams.map((param) => (
                  <div key={param.id} className="card bg-base-100 shadow-sm">
                    <div className="card-body p-4">
                      <h3 className="font-bold">OPTY_{param.key}</h3>
                      <p>{param.value ? "true" : "false"}</p>
                      <div className="card-actions justify-end">
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => handleEditOptyParam(param)}
                        >
                          编辑
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => handleDeleteOptyParam(param)}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Combinations */}
        {currentNav === "combinations" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">组合配置</h2>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAddCombination}
              >
                创建组合
              </button>
            </div>
            {combinations.length === 0 ? (
              <div role="alert">
                <span>暂无组合配置</span>
              </div>
            ) : (
              <div className="space-y-2">
                {combinations.map((combination) => (
                  <div
                    key={combination.id}
                    className={`card bg-base-100 shadow-sm ${
                      isDraft(combination) ? "border-dash" : "border-2"
                    }`}
                  >
                    <div className="card-body p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold">
                            {combination.title}
                            {isDraft(combination) && (
                              <span className="badge badge-warning ml-2">
                                草稿
                              </span>
                            )}
                          </h3>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => handleEditCombination(combination)}
                          >
                            编辑
                          </button>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleCopyCombination(combination)}
                          >
                            复制
                          </button>
                          <button
                            className="btn btn-sm btn-error"
                            onClick={() => handleDeleteCombination(combination)}
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <FormModal
        isOpen={agentModalOpen}
        onClose={() => setAgentModalOpen(false)}
        title={editingAgent ? "编辑 Agent" : "添加 Agent"}
        onSubmit={handleSaveAgent}
        fields={[
          {
            name: "id",
            label: "Agent ID",
            type: "text",
            required: true,
            placeholder: "请输入 Agent ID",
          },
          {
            name: "username",
            label: "用户名",
            type: "text",
            required: true,
            placeholder: "请输入用户名",
          },
        ]}
        initialValues={editingAgent || undefined}
        isLoading={false}
      />

      <FormModal
        isOpen={portModalOpen}
        onClose={() => setPortModalOpen(false)}
        title={editingPort ? "编辑端口" : "添加端口"}
        onSubmit={handleSavePort}
        fields={[
          {
            name: "port",
            label: "端口号",
            type: "number",
            required: true,
            placeholder: "请输入端口号，如 8080",
          },
          {
            name: "description",
            label: "描述说明",
            type: "text",
            required: false,
            placeholder: "端口用途说明（可选）",
          },
        ]}
        initialValues={editingPort || undefined}
        isLoading={false}
      />

      <FormModal
        isOpen={uriModalOpen}
        onClose={() => setUriModalOpen(false)}
        title={editingUri ? "编辑 URI" : "添加 URI"}
        onSubmit={handleSaveUri}
        fields={[
          {
            name: "uri",
            label: "URI",
            type: "text",
            required: true,
            placeholder: "请输入 URI，如 /api/v1/data",
          },
          {
            name: "description",
            label: "描述说明",
            type: "text",
            required: false,
            placeholder: "URI 用途说明（可选）",
          },
        ]}
        initialValues={editingUri || undefined}
        isLoading={false}
      />

      <FormModal
        isOpen={tailParamModalOpen}
        onClose={() => setTailParamModalOpen(false)}
        title={editingTailParam ? "编辑尾部参数" : "添加尾部参数"}
        onSubmit={handleSaveTailParam}
        fields={[
          {
            name: "key",
            label: "参数名",
            type: "text",
            required: true,
            placeholder: "请输入参数名",
          },
          {
            name: "value",
            label: "参数值",
            type: "text",
            required: true,
            placeholder: "请输入参数值",
          },
        ]}
        initialValues={editingTailParam || undefined}
        isLoading={false}
      />

      <FormModal
        isOpen={optyParamModalOpen}
        onClose={() => setOptyParamModalOpen(false)}
        title={editingOptyParam ? "编辑 OPTY 参数" : "添加 OPTY 参数"}
        onSubmit={handleSaveOptyParam}
        fields={[
          {
            name: "key",
            label: "参数名",
            type: "text",
            required: true,
            placeholder: "参数名，如 TIMEOUT（自动添加OPTY_前缀）",
          },
          {
            name: "value",
            label: "参数值",
            type: "switch",
            required: false,
          },
        ]}
        initialValues={editingOptyParam || undefined}
        isLoading={false}
      />

      <CombinationWizardModal
        isOpen={combinationModalOpen}
        onClose={() => setCombinationModalOpen(false)}
        onSave={handleSaveCombination}
        editingCombination={editingCombination}
        agents={agents}
        ports={ports}
        uris={uris}
        tailParams={tailParams}
        optyParams={optyParams}
        onCreateAgent={handleCreateAgent}
        onCreatePort={handleCreatePort}
        onCreateUri={handleCreateUri}
        onCreateTailParam={handleCreateTailParam}
        onCreateOptyParam={handleCreateOptyParam}
        onRefreshData={loadAllData}
      />

      {/* 确认对话框 */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
        itemName={itemToDelete?.name || ""}
      />

      {/* Toast 提示 */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() =>
          setToast((prev) => ({
            ...prev,
            show: false,
          }))
        }
      />

      {/* 导入确认对话框 */}
      <ImportConfirmDialog
        isOpen={importConfirmOpen}
        onCancel={handleCancelImport}
        onSkipConflicts={handleImportSkipConflicts}
        onOverwriteConflicts={handleImportOverwriteConflicts}
        conflicts={importConflicts}
        isImporting={isImporting}
      />
    </div>
  );
}
