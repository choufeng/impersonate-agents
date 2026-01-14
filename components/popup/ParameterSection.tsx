import ParameterRow from "./ParameterRow";
import type { TempOverride } from "../../lib/types";

interface ParameterSectionProps {
  title: string;
  params: TempOverride[];
  tempOverrides: Map<string, boolean>;
  tempValueOverrides: Map<string, string>;
  onValueChange: (key: string, value: string) => void;
  onToggleChange: (key: string, enabled: boolean) => void;
  onResetParameter: (key: string) => void;
  onResetAllParameters: () => void;
}

export default function ParameterSection({
  title,
  params,
  tempOverrides,
  tempValueOverrides,
  onValueChange,
  onToggleChange,
  onResetParameter,
  onResetAllParameters,
}: ParameterSectionProps) {
  const hasOverrides =
    (title.includes("尾") && tempValueOverrides.size > 0) ||
    (title.includes("OPTY") && tempOverrides.size > 0);

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>

        <div className="space-y-1">
          {params.map((param) => (
            <ParameterRow
              key={param.key}
              param={param}
              onValueChange={onValueChange}
              onToggleChange={onToggleChange}
              onResetParameter={onResetParameter}
            />
          ))}
        </div>

        {hasOverrides && (
          <div className="card-actions">
            <button
              className="btn btn-ghost text-warning"
              onClick={onResetAllParameters}
            >
              重置全部
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
