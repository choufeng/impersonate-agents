import type { TailParameter } from "../../lib/types";
import { EditIcon, DeleteIcon } from "../icons";
import { DataList } from "./DataList";
import { useI18n } from "../../lib/I18nProvider";

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
  const { t } = useI18n();

  return (
    <DataList
      data={params}
      columns={[
        { key: "key", label: t("tailParameters.key"), className: "font-mono" },
        { key: "value", label: t("tailParameters.value") },
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
      addLabel={t("tailParameters.addParam")}
      emptyMessage={t("tailParameters.noData")}
    />
  );
}
