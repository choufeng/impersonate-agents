import { useState, useEffect } from "react";
import type { Agent, Port, UriEntry, Combination } from "../../lib/types";
import { getAgents, getPorts, getUris } from "../../lib/storage";
import { useI18n } from "../../lib/I18nProvider";
import SearchableSelect from "./SearchableSelect";

interface BasicInfoCardProps {
  combination: Combination | null;
  agent?: Agent | null;
  port?: Port | null;
  uri?: UriEntry | null;
  tempAgentId?: string | null;
  tempPortId?: string | null;
  tempUriId?: string | null;
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
  tempAgentId,
  tempPortId,
  tempUriId,
  onUpdate,
  isUpdating = false,
}: BasicInfoCardProps) {
  const { t } = useI18n();
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
    if (tempAgentId !== undefined) {
      setSelectedAgentId(tempAgentId || "");
    } else if (agent) {
      setSelectedAgentId(agent.id);
    }
    if (tempPortId !== undefined) {
      setSelectedPortId(tempPortId || "");
    } else if (port) {
      setSelectedPortId(port.id);
    }
    if (tempUriId !== undefined) {
      setSelectedUriId(tempUriId || "");
    } else if (uri) {
      setSelectedUriId(uri.id);
    }
  }, [agent, port, uri, tempAgentId, tempPortId, tempUriId]);

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
    <div className="card bg-base-100 shadow-sm rounded-lg overflow-hidden">
      <div className="card-body p-3">
        <h2 className="card-title text-base">{t("popup.basicInfo")}</h2>

        <div className="space-y-2">
          {/* Agent Selection */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs">Agent</span>
            </label>
            <SearchableSelect
              options={agents.map((a) => ({ id: a.id, label: a.username }))}
              value={selectedAgentId}
              onChange={handleAgentChange}
              placeholder={t("popup.selectAgent")}
              disabled={isUpdating}
            />
          </div>

          {/* Port Selection */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs">Port</span>
            </label>
            <SearchableSelect
              options={ports.map((p) => ({
                id: p.id,
                label: `${p.port}${p.description ? ` - ${p.description}` : ""}`,
              }))}
              value={selectedPortId}
              onChange={handlePortChange}
              placeholder={t("popup.selectPort")}
              disabled={isUpdating}
            />
          </div>

          {/* URI Selection */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs">URI</span>
            </label>
            <SearchableSelect
              options={uris.map((u) => ({
                id: u.id,
                label: u.uri.length > 35 ? `${u.uri.slice(0, 35)}...` : u.uri,
              }))}
              value={selectedUriId}
              onChange={handleUriChange}
              placeholder={t("popup.selectUri")}
              disabled={isUpdating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
