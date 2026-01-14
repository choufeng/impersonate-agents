import { useState, useEffect } from "react";
import type { Agent, Port, UriEntry, Combination } from "../../lib/types";
import { getAgents, getPorts, getUris } from "../../lib/storage";

interface EditBasicInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { agentId: string; portId: string; uriId: string }) => void;
  combination: Combination | null;
  currentAgent?: Agent | null;
  currentPort?: Port | null;
  currentUri?: UriEntry | null;
}

export default function EditBasicInfoModal({
  isOpen,
  onClose,
  onSave,
  combination,
  currentAgent,
  currentPort,
  currentUri,
}: EditBasicInfoModalProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [uris, setUris] = useState<UriEntry[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [selectedPortId, setSelectedPortId] = useState("");
  const [selectedUriId, setSelectedUriId] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (currentAgent) setSelectedAgentId(currentAgent.id);
    if (currentPort) setSelectedPortId(currentPort.id);
    if (currentUri) setSelectedUriId(currentUri.id);
  }, [currentAgent, currentPort, currentUri]);

  const loadData = async () => {
    const [agentsData, portsData, urisData] = await Promise.all([
      getAgents(),
      getPorts(),
      getUris(),
    ]);
    setAgents(agentsData);
    setPorts(portsData);
    setUris(urisData);
  };

  const handleSubmit = () => {
    if (selectedAgentId && selectedPortId && selectedUriId) {
      onSave({
        agentId: selectedAgentId,
        portId: selectedPortId,
        uriId: selectedUriId,
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);
  const selectedPort = ports.find((p) => p.id === selectedPortId);
  const selectedUri = uris.find((u) => u.id === selectedUriId);

  const isValid = selectedAgentId && selectedPortId && selectedUriId;

  return (
    <dialog open className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">编辑基础信息</h3>

        <div className="space-y-4">
          {/* Agent Selection */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Agent</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
            >
              <option value="">请选择 Agent</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.username} ({agent.id})
                </option>
              ))}
            </select>
          </div>

          {/* Port Selection */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Port</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={selectedPortId}
              onChange={(e) => setSelectedPortId(e.target.value)}
            >
              <option value="">请选择 Port</option>
              {ports.map((port) => (
                <option key={port.id} value={port.id}>
                  {port.port}
                  {port.description && ` - ${port.description}`}
                </option>
              ))}
            </select>
          </div>

          {/* URI Selection */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">URI</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={selectedUriId}
              onChange={(e) => setSelectedUriId(e.target.value)}
            >
              <option value="">请选择 URI</option>
              {uris.map((uri) => (
                <option key={uri.id} value={uri.id}>
                  {uri.uri}
                  {uri.description && ` - ${uri.description}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            取消
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!isValid}
          >
            保存
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
