import type { UriEntry } from "../../lib/types";
import { EditIcon } from "../icons";
import { DataList } from "./DataList";

interface UrisSectionProps {
  uris: UriEntry[];
  onAdd: () => void;
  onEdit: (uri: UriEntry) => void;
  onDelete: (uri: UriEntry) => void;
}

export default function UrisSection({
  uris,
  onAdd,
  onEdit,
  onDelete,
}: UrisSectionProps) {
  return (
    <DataList
      data={uris}
      columns={[
        { key: "uri", label: "URI", className: "font-mono text-sm" },
        { key: "description", label: "描述" },
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
      addLabel="添加 URI"
      emptyMessage="暂无 URI 数据"
    />
  );
}
