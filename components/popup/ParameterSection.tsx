import ParameterRow from "./ParameterRow";
import type { TempOverride } from "../../lib/types";
import { useI18n } from "../../lib/I18nProvider";

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
  const { t } = useI18n();
  const isOptySection = params.length > 0 && params[0].isOpty;
  const hasOverrides =
    (!isOptySection && tempValueOverrides.size > 0) ||
    (isOptySection && tempOverrides.size > 0);

  return (
    <div className="card bg-base-100 shadow-sm rounded-lg overflow-hidden">
      <div className="card-body p-3">
        <h2 className="card-title text-base">{title}</h2>

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
              {t("popup.resetAll")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
