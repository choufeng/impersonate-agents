import type { Combination } from "../../lib/types";
import { useI18n } from "../../lib/I18nProvider";

interface CombinationSelectorProps {
  combinations: Combination[];
  selectedCombinationId: string | null;
  onCombinationChange: (value: string) => void;
}

export default function CombinationSelector({
  combinations,
  selectedCombinationId,
  onCombinationChange,
}: CombinationSelectorProps) {
  const { t } = useI18n();

  return (
    <div className="mb-4">
      <select
        className="select select-bordered w-full h-10"
        value={selectedCombinationId ?? ""}
        onChange={(e) => onCombinationChange(e.target.value)}
      >
        <option value="">{t("popup.selectConfig")}</option>
        {combinations.map((combo) => (
          <option key={combo.id} value={combo.id}>
            {combo.title}
          </option>
        ))}
      </select>
    </div>
  );
}
