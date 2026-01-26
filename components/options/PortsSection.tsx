import type { Port } from "../../lib/types";
import { EditIcon, DeleteIcon } from "../icons";
import { DataList } from "./DataList";
import { useI18n } from "../../lib/I18nProvider";

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
  const { t } = useI18n();

  return (
    <DataList
      data={ports}
      columns={[
        { key: "port", label: t("ports.port"), className: "font-mono" },
        { key: "description", label: t("ports.description") },
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
      addLabel={t("ports.addPort")}
      emptyMessage={t("ports.noData")}
    />
  );
}
