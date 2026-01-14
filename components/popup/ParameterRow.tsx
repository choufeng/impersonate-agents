import { SettingsIcon } from "../icons";
import type { TempOverride } from "../../lib/types";

interface ParameterRowProps {
  param: TempOverride;
  onValueChange: (key: string, value: string) => void;
  onToggleChange: (key: string, enabled: boolean) => void;
  onResetParameter: (key: string) => void;
}

export default function ParameterRow({
  param,
  onValueChange,
  onToggleChange,
  onResetParameter,
}: ParameterRowProps) {
  const isOpty = param.isOpty;

  return (
    <div
      key={param.key}
      className="flex items-center justify-between p-2 hover:bg-base-200 rounded"
    >
      <span className="text-sm w-1/3 truncate" title={param.key}>
        {param.key}
      </span>
      <div className="flex items-center gap-2 flex-1">
        {isOpty ? (
          <>
            {param.isModified && (
              <button
                className="text-xs btn btn-xs btn-ghost"
                onClick={() => onResetParameter(param.key)}
                title="恢复原始值"
              >
                ↩️
              </button>
            )}
            <input
              type="checkbox"
              className="toggle toggle-sm toggle-primary"
              checked={param.enabled}
              onChange={(e) => onToggleChange(param.key, e.target.checked)}
            />
          </>
        ) : (
          <>
            <input
              type="text"
              className="input input-xs input-bordered flex-1"
              defaultValue={param.value || ""}
              placeholder="输入值"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const input = e.target as HTMLInputElement;
                  onValueChange(param.key, input.value);
                  input.blur();
                }
              }}
              onBlur={(e) => {
                onValueChange(param.key, e.target.value);
              }}
            />
            {param.isModified && (
              <button
                className="text-xs btn btn-xs btn-ghost"
                onClick={() => onResetParameter(param.key)}
                title="恢复原始值"
              >
                ↩️
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
