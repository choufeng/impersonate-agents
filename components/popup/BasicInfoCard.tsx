import { useState, useEffect } from "react";
import type { Agent, Port, UriEntry, Combination } from "../../lib/types";
import { getAgents, getPorts, getUris } from "../../lib/storage";

interface BasicInfoCardProps {
  combination: Combination | null;
  agent?: Agent | null;
  port?: Port | null;
  uri?: UriEntry | null;
  onUpdate: (data: {
    agentId: string | null;
    portId: string | null;
    uriId: string | null;
  }) => void;
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
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [selectedPortId, setSelectedPortId] = useState("");
  const [selectedUriId, setSelectedUriId] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (agent) setSelectedAgentId(agent.id);
    if (port) setSelectedPortId(port.id);
    if (uri) setSelectedUriId(uri.id);
  }, [agent, port, uri]);

  const loadData = async () => {
    const [agentsData, portsData, urisData] = await Promise.all([
      getAgents(),
      getPorts(),
      getUris(),
    ]);
    setAgents(agentsData);
    setPorts(portsData);
    setUris(urisData);

    // 如果当前有选中值，保持选择
    if (agent) setSelectedAgentId(agent.id);
    if (port) setSelectedPortId(port.id);
    if (uri) setSelectedUriId(uri.id);
  };

  const handleAgentChange = (value: string) => {
    setSelectedAgentId(value);
    onUpdate({
      agentId: value || null,
      portId: selectedPortId || null,
      uriId: selectedUriId || null,
    });
  };

  const handlePortChange = (value: string) => {
    setSelectedPortId(value);
    onUpdate({
      agentId: selectedAgentId || null,
      portId: value || null,
      uriId: selectedUriId || null,
    });
  };

  const handleUriChange = (value: string) => {
    setSelectedUriId(value);
    onUpdate({
      agentId: selectedAgentId || null,
      portId: selectedPortId || null,
      uriId: value || null,
    });
  };

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h2 className="card-title text-base">基础信息</h2>

        <div className="space-y-3">
          {/* Agent Selection */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs">Agent</span>
            </label>
            <select
              className="select select-bordered select-sm w-full"
              value={selectedAgentId}
              onChange={(e) => handleAgentChange(e.target.value)}
              disabled={isUpdating}
            >
              <option value="">请选择 Agent</option>
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
              onChange={(e) => handlePortChange(e.target.value)}
              disabled={isUpdating}
            >
              <option value="">请选择 Port</option>
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
              onChange={(e) => handleUriChange(e.target.value)}
              disabled={isUpdating}
            >
              <option value="">请选择 URI</option>
              {uris.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.uri.length > 35 ? `${u.uri.slice(0, 35)}...` : u.uri}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
