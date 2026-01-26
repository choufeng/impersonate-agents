import type { TempOverride } from "../../lib/types";
import Tooltip from "../Tooltip";

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
      className="flex items-center justify-between p-2 hover:bg-base-200 rounded gap-2 min-w-0"
    >
      {isOpty ? (
        <>
          <div className="flex-1 min-w-0">
            <span className="text-sm block truncate cursor-default">
              {param.key.replace(/^opty_/, "")}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
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
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <Tooltip content={param.key} position="top">
              <span className="text-sm block truncate cursor-default">
                {param.key}
              </span>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-24">
            <input
              type="text"
              className="input input-xs input-bordered w-full"
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
          </div>
        </>
      )}
    </div>
  );
}
