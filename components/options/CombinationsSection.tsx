import type { Combination } from "../../lib/types";
import { isDraft } from "../../lib/types";
import { EditIcon, CopyIcon, DeleteIcon } from "../icons";
import { DataList } from "./DataList";
import { useI18n } from "../../lib/I18nProvider";

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
  const { t } = useI18n();

  return (
    <DataList
      data={combinations}
      columns={[
        {
          key: "title",
          label: t("combinations.combinationName"),
          render: (c) => (
            <span className="flex items-center gap-2">
              {c.title}
              {isDraft(c) && (
                <span className="badge badge-warning badge-xs">
                  {t("combinations.draft")}
                </span>
              )}
            </span>
          ),
        },
        {
          key: "agentId",
          label: t("combinations.agentId"),
          className: "text-sm",
        },
      ]}
      actions={[
        {
          label: "",
          icon: <EditIcon size={14} />,
          onClick: onEdit,
        },
        {
          label: t("common.copy"),
          icon: <CopyIcon size={14} />,
          onClick: onCopy,
        },
        {
          label: t("common.delete"),
          className: "text-error",
          onClick: onDelete,
        },
      ]}
      onAdd={onAdd}
      addLabel={t("combinations.createCombination")}
      emptyMessage={t("combinations.noData")}
    />
  );
}
