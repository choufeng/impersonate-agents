import type { OptyParameter } from "../../lib/types";
import { EditIcon } from "../icons";
import { DataList } from "./DataList";

interface OptyParametersSectionProps {
  params: OptyParameter[];
  onAdd: () => void;
  onEdit: (param: OptyParameter) => void;
  onDelete: (param: OptyParameter) => void;
}

export default function OptyParametersSection({
  params,
  onAdd,
  onEdit,
  onDelete,
}: OptyParametersSectionProps) {
  return (
    <DataList
      data={params}
      columns={[
        {
          key: "key",
          label: "参数名",
          render: (p) => `OPTY_${p.key}`,
          className: "font-mono",
        },
        {
          key: "value",
          label: "参数值",
          render: (p) => (p.value ? "true" : "false"),
        },
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
      addLabel="添加参数"
      emptyMessage="暂无 OPTY 参数数据"
    />
  );
}
