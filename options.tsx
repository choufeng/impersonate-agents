import { useEffect, useState } from "react";
import "./options.css";
import CombinationWizardModal from "./components/CombinationWizardModal";
import {
  getAgents,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
  getPorts,
  getPortById,
  createPort,
  updatePort,
  deletePort,
  getUris,
  getUriById,
  createUri,
  updateUri,
  deleteUri,
  getTailParameters,
  createTailParameter,
  updateTailParameter,
  deleteTailParameter,
  getOptyParameters,
  createOptyParameter,
  updateOptyParameter,
  deleteOptyParameter,
  getCombinations,
  getCombinationById,
  createCombination,
  updateCombination,
  deleteCombination,
  copyCombination,
  exportData,
  detectImportConflicts,
  importData,
  type ImportConflictResult,
} from "./lib/storage";
import { getCurrentTimestamp } from "./lib/types";
import type {
  Agent,
  Port,
  UriEntry,
  TailParameter,
  OptyParameter,
  Combination,
} from "./lib/types";
import Header from "./components/options/Header";
import Sidebar from "./components/options/Sidebar";
import AgentsSection from "./components/options/AgentsSection";
import PortsSection from "./components/options/PortsSection";
import UrisSection from "./components/options/UrisSection";
import TailParametersSection from "./components/options/TailParametersSection";
import OptyParametersSection from "./components/options/OptyParametersSection";
import CombinationsSection from "./components/options/CombinationsSection";
import FormModal from "./components/options/FormModal";
import ConfirmDialog from "./components/options/ConfirmDialog";
import Toast from "./components/options/Toast";
import ImportConfirmDialog from "./components/options/ImportConfirmDialog";

export default function Options() {
  const [currentNav, setCurrentNav] = useState<
    | "agents"
    | "ports"
    | "uris"
    | "tail-parameters"
    | "opty-parameters"
    | "combinations"
  >("agents");

  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const [ports, setPorts] = useState<Port[]>([]);
  const [portModalOpen, setPortModalOpen] = useState(false);
  const [editingPort, setEditingPort] = useState<Port | null>(null);

  const [uris, setUris] = useState<UriEntry[]>([]);
  const [uriModalOpen, setUriModalOpen] = useState(false);
  const [editingUri, setEditingUri] = useState<UriEntry | null>(null);

  const [tailParams, setTailParams] = useState<TailParameter[]>([]);
  const [tailParamModalOpen, setTailParamModalOpen] = useState(false);
  const [editingTailParam, setEditingTailParam] =
    useState<TailParameter | null>(null);

  const [optyParams, setOptyParams] = useState<OptyParameter[]>([]);
  const [optyParamModalOpen, setOptyParamModalOpen] = useState(false);
  const [editingOptyParam, setEditingOptyParam] =
    useState<OptyParameter | null>(null);

  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [combinationModalOpen, setCombinationModalOpen] = useState(false);
  const [editingCombination, setEditingCombination] =
    useState<Combination | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: string;
    id: string;
    name: string;
  } | null>(null);

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const [importConfirmOpen, setImportConfirmOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importConflicts, setImportConflicts] =
    useState<ImportConflictResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importedData, setImportedData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        loadAgents(),
        loadPorts(),
        loadUris(),
        loadTailParameters(),
        loadOptyParameters(),
        loadCombinations(),
      ]);
    } catch (error) {
      console.error("Failed to load data:", error);
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

  const loadAllData = async () => {
    await Promise.all([
      loadAgents(),
      loadPorts(),
      loadUris(),
      loadTailParameters(),
      loadOptyParameters(),
    ]);
  };

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.version || !data.data) {
        throw new Error("无效的配置文件格式");
      }

      setImportedData(data.data);
      setImportFile(file);

      const conflicts = await detectImportConflicts(data.data);
      setImportConflicts(conflicts);

      setImportConfirmOpen(true);
    } catch (error) {
      console.error("File parsing failed:", error);
      showToast("文件解析失败", "error");
    }

    e.target.value = "";
  };

  const handleCancelImport = () => {
    setImportConfirmOpen(false);
    setImportFile(null);
    setImportedData(null);
    setImportConflicts(null);
  };

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

  const renderSection = () => {
    switch (currentNav) {
      case "agents":
        return (
          <AgentsSection
            agents={agents}
            onAdd={handleAddAgent}
            onEdit={handleEditAgent}
            onDelete={handleDeleteAgent}
          />
        );
      case "ports":
        return (
          <PortsSection
            ports={ports}
            onAdd={handleAddPort}
            onEdit={handleEditPort}
            onDelete={handleDeletePort}
          />
        );
      case "uris":
        return (
          <UrisSection
            uris={uris}
            onAdd={handleAddUri}
            onEdit={handleEditUri}
            onDelete={handleDeleteUri}
          />
        );
      case "tail-parameters":
        return (
          <TailParametersSection
            params={tailParams}
            onAdd={handleAddTailParam}
            onEdit={handleEditTailParam}
            onDelete={handleDeleteTailParam}
          />
        );
      case "opty-parameters":
        return (
          <OptyParametersSection
            params={optyParams}
            onAdd={handleAddOptyParam}
            onEdit={handleEditOptyParam}
            onDelete={handleDeleteOptyParam}
          />
        );
      case "combinations":
        return (
          <CombinationsSection
            combinations={combinations}
            onAdd={handleAddCombination}
            onEdit={handleEditCombination}
            onCopy={handleCopyCombination}
            onDelete={handleDeleteCombination}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      data-theme="corporate"
      className="flex h-screen"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <Sidebar currentNav={currentNav} onNavigate={setCurrentNav} />

      <main className="flex-1 ml-64 p-6 overflow-auto">
        <Header onExport={handleExport} onImport={handleFileSelect} />
        {renderSection()}
      </main>

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

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
        itemName={itemToDelete?.name || ""}
      />

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
