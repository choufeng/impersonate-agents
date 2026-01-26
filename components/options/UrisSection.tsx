import type { UriEntry } from "../../lib/types";
import { EditIcon, DeleteIcon } from "../icons";
import { DataList } from "./DataList";
import { useI18n } from "../../lib/I18nProvider";

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
  const { t } = useI18n();

  return (
    <DataList
      data={uris}
      columns={[
        { key: "uri", label: t("uris.uri"), className: "font-mono text-sm" },
        { key: "description", label: t("uris.description") },
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
      addLabel={t("uris.addUri")}
      emptyMessage={t("uris.noData")}
    />
  );
}
