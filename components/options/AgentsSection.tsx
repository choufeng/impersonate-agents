import type { Agent } from "../../lib/types";
import { EditIcon } from "../icons";
import { DataList } from "./DataList";

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
  return (
    <DataList
      data={agents}
      columns={[
        { key: "id", label: "Agent ID", className: "font-mono text-sm" },
        { key: "username", label: "用户名" },
      ]}
      actions={[
        {
          label: "",
          icon: <EditIcon size={14} />,
          onClick: onEdit,
        },
        {
          label: "删除",
          className: "text-error",
          onClick: onDelete,
        },
      ]}
      onAdd={onAdd}
      addLabel="添加 Agent"
      emptyMessage="暂无 Agent 数据"
    />
  );
}
