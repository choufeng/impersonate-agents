import type { Combination } from "../../lib/types";

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
  return (
    <div className="mb-4">
      <select
        className="select select-bordered w-full h-10"
        value={selectedCombinationId ?? ""}
        onChange={(e) => onCombinationChange(e.target.value)}
      >
        <option value="">选择配置...</option>
        {combinations.map((combo) => (
          <option key={combo.id} value={combo.id}>
            {combo.title}
          </option>
        ))}
      </select>
    </div>
  );
}
