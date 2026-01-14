import type { TailParameter } from "../../lib/types";
import { EditIcon } from "../icons";
import { DataList } from "./DataList";

interface TailParametersSectionProps {
  params: TailParameter[];
  onAdd: () => void;
  onEdit: (param: TailParameter) => void;
  onDelete: (param: TailParameter) => void;
}

export default function TailParametersSection({
  params,
  onAdd,
  onEdit,
  onDelete,
}: TailParametersSectionProps) {
  return (
    <DataList
      data={params}
      columns={[
        { key: "key", label: "参数名", className: "font-mono" },
        { key: "value", label: "参数值" },
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
      emptyMessage="暂无尾部参数数据"
    />
  );
}
