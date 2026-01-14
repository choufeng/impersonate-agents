import type { Agent } from "../../lib/types";
import { EditIcon, DeleteIcon } from "../icons";
import { DataList } from "./DataList";
import { useI18n } from "../../lib/I18nProvider";

interface AgentsSectionProps {
  agents: Agent[];
  onAdd: () => void;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

export default function AgentsSection({
  agents,
  onAdd,
  onEdit,
  onDelete,
}: AgentsSectionProps) {
  const { t } = useI18n();

  return (
    <DataList
      data={agents}
      columns={[
        {
          key: "id",
          label: t("agents.agentId"),
          className: "font-mono text-sm",
        },
        { key: "username", label: t("agents.username") },
      ]}
      actions={[
        {
          label: "",
          icon: <EditIcon size={14} />,
          onClick: onEdit,
        },
        {
          label: t("common.delete"),
          className: "text-error",
          onClick: onDelete,
        },
      ]}
      onAdd={onAdd}
      addLabel={t("agents.addAgent")}
      emptyMessage={t("agents.noData")}
    />
  );
}
