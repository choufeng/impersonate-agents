import { useState, useEffect } from "react";
import type { Agent, Port, UriEntry, Combination } from "../../lib/types";
import { getAgents, getPorts, getUris } from "../../lib/storage";
import { EditIcon, CheckIcon, XIcon, RefreshIcon } from "../icons";

interface BasicInfoCardProps {
  combination: Combination | null;
  agent?: Agent | null;
  port?: Port | null;
  uri?: UriEntry | null;
  onUpdate: (data: { agentId: string; portId: string; uriId: string }) => void;
  isUpdating?: boolean;
}

export default function BasicInfoCard({
  combination,
  agent,
  port,
  uri,
  onUpdate,
  isUpdating = false,
}: BasicInfoCardProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [uris, setUris] = useState<UriEntry[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [selectedPortId, setSelectedPortId] = useState("");
  const [selectedUriId, setSelectedUriId] = useState("");

  useEffect(() => {
    if (isEditing && agents.length === 0) {
      loadData();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) {
      setSelectedAgentId(agent?.id || "");
      setSelectedPortId(port?.id || "");
      setSelectedUriId(uri?.id || "");
    }
  }, [isEditing, agent, port, uri]);

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

  const handleSave = () => {
    if (selectedAgentId && selectedPortId && selectedUriId) {
      onUpdate({
        agentId: selectedAgentId,
        portId: selectedPortId,
        uriId: selectedUriId,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setSelectedAgentId(agent?.id || "");
    setSelectedPortId(port?.id || "");
    setSelectedUriId(uri?.id || "");
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <h2 className="card-title text-base">基础信息</h2>
            <button
              className="btn btn-ghost btn-xs"
              onClick={() => {
                setIsEditing(true);
                loadData();
              }}
              disabled={isUpdating}
            >
              <EditIcon size={14} />
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-base-content/70">Agent:</span>
              <span className="font-medium">{agent?.username || "未选择"}</span>
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
    );
  }

  // 编辑模式
  const isValid = selectedAgentId && selectedPortId && selectedUriId;

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="flex justify-between items-center mb-3">
          <h2 className="card-title text-base">编辑基础信息</h2>
          <div className="flex gap-1">
            <button
              className="btn btn-ghost btn-xs"
              onClick={handleCancel}
              disabled={isUpdating}
            >
              <XIcon size={14} />
            </button>
            <button
              className="btn btn-primary btn-xs"
              onClick={handleSave}
              disabled={!isValid || isUpdating}
            >
              <CheckIcon size={14} />
            </button>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          {/* Agent Selection */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs">Agent</span>
            </label>
            <select
              className="select select-bordered select-sm w-full"
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              disabled={isUpdating}
            >
              <option value="">请选择</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.username}
                </option>
              ))}
            </select>
          </div>

          {/* Port Selection */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs">Port</span>
            </label>
            <select
              className="select select-bordered select-sm w-full"
              value={selectedPortId}
              onChange={(e) => setSelectedPortId(e.target.value)}
              disabled={isUpdating}
            >
              <option value="">请选择</option>
              {ports.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.port}
                  {p.description && ` - ${p.description}`}
                </option>
              ))}
            </select>
          </div>

          {/* URI Selection */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs">URI</span>
            </label>
            <select
              className="select select-bordered select-sm w-full"
              value={selectedUriId}
              onChange={(e) => setSelectedUriId(e.target.value)}
              disabled={isUpdating}
            >
              <option value="">请选择</option>
              {uris.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.uri.length > 30 ? `${u.uri.slice(0, 30)}...` : u.uri}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
