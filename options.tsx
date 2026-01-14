import { useEffect, useState } from "react";
import "./options.css";
import CombinationWizardModal from "./components/CombinationWizardModal";
import {
  getAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  getPorts,
  createPort,
  updatePort,
  deletePort,
  getUris,
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
import { I18nProvider, useI18n } from "./lib/I18nProvider";
import Sidebar from "./components/options/Sidebar";
import AgentsSection from "./components/options/AgentsSection";
import PortsSection from "./components/options/PortsSection";
import UrisSection from "./components/options/UrisSection";
import TailParametersSection from "./components/options/TailParametersSection";
import OptyParametersSection from "./components/options/OptyParametersSection";
import CombinationsSection from "./components/options/CombinationsSection";
import SettingsSection from "./components/options/SettingsSection";
import FormModal from "./components/options/FormModal";
import ConfirmDialog from "./components/options/ConfirmDialog";
import Toast from "./components/options/Toast";

function OptionsContent() {
  const { t } = useI18n();

  const [currentNav, setCurrentNav] = useState<
    | "agents"
    | "ports"
    | "uris"
    | "tail-parameters"
    | "opty-parameters"
    | "combinations"
    | "settings"
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
      showToast(t("toast.agentUpdated"));
    } else {
      await createAgent(data);
      showToast(t("toast.agentCreated"));
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
      showToast(t("toast.portUpdated"));
    } else {
      await createPort(data);
      showToast(t("toast.portCreated"));
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
      showToast(t("toast.uriUpdated"));
    } else {
      await createUri(data);
      showToast(t("toast.uriCreated"));
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
      showToast(t("toast.tailParamUpdated"));
    } else {
      await createTailParameter(data);
      showToast(t("toast.tailParamCreated"));
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
      showToast(t("toast.optyParamUpdated"));
    } else {
      await createOptyParameter(data);
      showToast(t("toast.optyParamCreated"));
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
        showToast(t("toast.combinationUpdated"));
      } else {
        await createCombination({
          title: data.title,
          agentId: data.agentId,
          portId: data.portId,
          uriId: data.uriId,
          tailParameterIds: data.tailParameterIds,
          optyParameterIds: data.optyParameterIds,
        });
        showToast(t("toast.combinationCreated"));
      }
      await loadCombinations();
      setCombinationModalOpen(false);
    } catch (error) {
      console.error("Failed to save combination:", error);
      showToast(t("toast.error"), "error");
    }
  };

  const handleCopyCombination = async (combination: Combination) => {
    await copyCombination(combination);
    showToast(t("toast.combinationCopied"));
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

      showToast(t("toast.deleted"));
      await loadData();
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Failed to delete:", error);
      showToast(t("toast.deleteFailed"), "error");
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
      showToast(t("toast.exported"));
    } catch (error) {
      console.error("Export failed:", error);
      showToast(t("toast.exportFailed"), "error");
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.version || !data.data) {
        throw new Error("Invalid config format");
      }

      setImportedData(data.data);
      const conflicts = await detectImportConflicts(data.data);
      setImportConflicts(conflicts);
      setImportConfirmOpen(true);
    } catch (error) {
      console.error("File parsing failed:", error);
      showToast(t("toast.fileParseFailed"), "error");
    }

    e.target.value = "";
  };

  const handleCancelImport = () => {
    setImportConfirmOpen(false);
    setImportedData(null);
    setImportConflicts(null);
  };

  const handleImportSkipConflicts = async () => {
    if (!importedData) return;

    try {
      setIsImporting(true);
      await importData(importedData, false);
      showToast(t("settings.importSuccessSkip"));
      await loadData();
      handleCancelImport();
    } catch (error) {
      console.error("Import failed:", error);
      showToast(t("settings.importFailed"), "error");
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportOverwriteConflicts = async () => {
    if (!importedData) return;

    try {
      setIsImporting(true);
      await importData(importedData, true);
      showToast(t("settings.importSuccessOverwrite"));
      await loadData();
      handleCancelImport();
    } catch (error) {
      console.error("Import failed:", error);
      showToast(t("settings.importFailed"), "error");
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
      case "settings":
        return (
          <SettingsSection
            onExport={handleExport}
            onImport={handleFileSelect}
            importConflicts={importConflicts}
            isImporting={isImporting}
            onCancelImport={handleCancelImport}
            onSkipConflicts={handleImportSkipConflicts}
            onOverwriteConflicts={handleImportOverwriteConflicts}
            importConfirmOpen={importConfirmOpen}
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
        {currentNav !== "settings" && (
          <h1 className="text-2xl font-bold mb-6">{t("header.title")}</h1>
        )}
        {renderSection()}
      </main>

      <FormModal
        isOpen={agentModalOpen}
        onClose={() => setAgentModalOpen(false)}
        title={editingAgent ? t("agents.edit") : t("agents.add")}
        onSubmit={handleSaveAgent}
        fields={[
          {
            name: "id",
            label: t("agents.agentId"),
            type: "text",
            required: true,
            placeholder: t("agents.agentId"),
          },
          {
            name: "username",
            label: t("agents.username"),
            type: "text",
            required: true,
            placeholder: t("agents.username"),
          },
        ]}
        initialValues={editingAgent || undefined}
      />

      <FormModal
        isOpen={portModalOpen}
        onClose={() => setPortModalOpen(false)}
        title={editingPort ? t("ports.edit") : t("ports.add")}
        onSubmit={handleSavePort}
        fields={[
          {
            name: "port",
            label: t("ports.port"),
            type: "number",
            required: true,
            placeholder: t("ports.port"),
          },
          {
            name: "description",
            label: t("ports.description"),
            type: "text",
            required: false,
            placeholder: "",
          },
        ]}
        initialValues={editingPort || undefined}
      />

      <FormModal
        isOpen={uriModalOpen}
        onClose={() => setUriModalOpen(false)}
        title={editingUri ? t("uris.edit") : t("uris.add")}
        onSubmit={handleSaveUri}
        fields={[
          {
            name: "uri",
            label: t("uris.uri"),
            type: "text",
            required: true,
            placeholder: t("uris.uri"),
          },
          {
            name: "description",
            label: t("uris.description"),
            type: "text",
            required: false,
            placeholder: "",
          },
        ]}
        initialValues={editingUri || undefined}
      />

      <FormModal
        isOpen={tailParamModalOpen}
        onClose={() => setTailParamModalOpen(false)}
        title={
          editingTailParam ? t("tailParameters.edit") : t("tailParameters.add")
        }
        onSubmit={handleSaveTailParam}
        fields={[
          {
            name: "key",
            label: t("tailParameters.key"),
            type: "text",
            required: true,
            placeholder: t("tailParameters.key"),
          },
          {
            name: "value",
            label: t("tailParameters.value"),
            type: "text",
            required: true,
            placeholder: t("tailParameters.value"),
          },
        ]}
        initialValues={editingTailParam || undefined}
      />

      <FormModal
        isOpen={optyParamModalOpen}
        onClose={() => setOptyParamModalOpen(false)}
        title={
          editingOptyParam ? t("optyParameters.edit") : t("optyParameters.add")
        }
        onSubmit={handleSaveOptyParam}
        fields={[
          {
            name: "key",
            label: t("optyParameters.key"),
            type: "text",
            required: true,
            placeholder: "",
          },
          {
            name: "value",
            label: t("optyParameters.value"),
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
    </div>
  );
}

export default function Options() {
  return (
    <I18nProvider>
      <OptionsContent />
    </I18nProvider>
  );
}
