import type { Combination } from "../../lib/types";
import { isDraft } from "../../lib/types";
import { EditIcon, CopyIcon } from "../icons";
import { DataList } from "./DataList";

interface CombinationsSectionProps {
  combinations: Combination[];
  onAdd: () => void;
  onEdit: (combination: Combination) => void;
  onCopy: (combination: Combination) => void;
  onDelete: (combination: Combination) => void;
}

export default function CombinationsSection({
  combinations,
  onAdd,
  onEdit,
  onCopy,
  onDelete,
}: CombinationsSectionProps) {
  return (
    <DataList
      data={combinations}
      columns={[
        {
          key: "title",
          label: "组合名称",
          render: (c) => (
            <span className="flex items-center gap-2">
              {c.title}
              {isDraft(c) && (
                <span className="badge badge-warning badge-xs">草稿</span>
              )}
            </span>
          ),
        },
        { key: "agentId", label: "Agent ID", className: "text-sm" },
      ]}
      actions={[
        {
          label: "",
          icon: <EditIcon size={14} />,
          onClick: onEdit,
        },
        {
          label: "复制",
          icon: <CopyIcon size={14} />,
          onClick: onCopy,
        },
        {
          label: "删除",
          className: "text-error",
          onClick: onDelete,
        },
      ]}
      onAdd={onAdd}
      addLabel="创建组合"
      emptyMessage="暂无组合配置"
    />
  );
}
