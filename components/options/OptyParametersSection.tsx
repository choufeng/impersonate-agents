import type { OptyParameter } from "../../lib/types";
import { EditIcon, DeleteIcon } from "../icons";
import { DataList } from "./DataList";
import { useI18n } from "../../lib/I18nProvider";

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
  const { t } = useI18n();

  return (
    <DataList
      data={params}
      columns={[
        {
          key: "key",
          label: t("optyParameters.key"),
          render: (p) => p.key,
          className: "font-mono",
        },
        {
          key: "value",
          label: t("optyParameters.value"),
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
          label: "",
          icon: <DeleteIcon size={14} />,
          className: "text-error",
          onClick: onDelete,
        },
      ]}
      onAdd={onAdd}
      addLabel={t("optyParameters.addParam")}
      emptyMessage={t("optyParameters.noData")}
    />
  );
}
