import type { Port } from "../../lib/types";
import { EditIcon } from "../icons";
import { DataList } from "./DataList";

interface PortsSectionProps {
  ports: Port[];
  onAdd: () => void;
  onEdit: (port: Port) => void;
  onDelete: (port: Port) => void;
}

export default function PortsSection({
  ports,
  onAdd,
  onEdit,
  onDelete,
}: PortsSectionProps) {
  return (
    <DataList
      data={ports}
      columns={[
        { key: "port", label: "端口号", className: "font-mono" },
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
      addLabel="添加端口"
      emptyMessage="暂无端口数据"
    />
  );
}
