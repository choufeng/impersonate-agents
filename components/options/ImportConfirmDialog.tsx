import type { ImportConflictResult } from "../../lib/storage";

interface ImportConfirmDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onSkipConflicts: () => void;
  onOverwriteConflicts: () => void;
  conflicts: ImportConflictResult | null;
  isImporting: boolean;
}

export default function ImportConfirmDialog({
  isOpen,
  onCancel,
  onSkipConflicts,
  onOverwriteConflicts,
  conflicts,
  isImporting,
}: ImportConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <dialog open className="modal">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">导入配置</h3>

        {conflicts && conflicts.hasConflicts ? (
          <>
            <div role="alert" className="alert alert-warning mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>检测到冲突！部分配置已存在。</span>
            </div>

            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              {conflicts.conflicts.agents.length > 0 && (
                <div className="text-sm">
                  <strong>Agents ({conflicts.conflicts.agents.length}):</strong>{" "}
                  {conflicts.conflicts.agents.join(", ")}
                </div>
              )}
              {conflicts.conflicts.ports.length > 0 && (
                <div className="text-sm">
                  <strong>Ports ({conflicts.conflicts.ports.length}):</strong>{" "}
                  {conflicts.conflicts.ports.join(", ")}
                </div>
              )}
              {conflicts.conflicts.uris.length > 0 && (
                <div className="text-sm">
                  <strong>URIs ({conflicts.conflicts.uris.length}):</strong>{" "}
                  {conflicts.conflicts.uris.join(", ")}
                </div>
              )}
              {conflicts.conflicts.tailParameters.length > 0 && (
                <div className="text-sm">
                  <strong>
                    尾部参数 ({conflicts.conflicts.tailParameters.length}):
                  </strong>{" "}
                  {conflicts.conflicts.tailParameters.join(", ")}
                </div>
              )}
              {conflicts.conflicts.optyParameters.length > 0 && (
                <div className="text-sm">
                  <strong>
                    OPTY 参数 ({conflicts.conflicts.optyParameters.length}):
                  </strong>{" "}
                  {conflicts.conflicts.optyParameters.join(", ")}
                </div>
              )}
              {conflicts.conflicts.combinations.length > 0 && (
                <div className="text-sm">
                  <strong>
                    组合配置 ({conflicts.conflicts.combinations.length}):
                  </strong>{" "}
                  {conflicts.conflicts.combinations.join(", ")}
                </div>
              )}
            </div>

            <div className="modal-action">
              <button className="btn" onClick={onCancel} disabled={isImporting}>
                取消
              </button>
              <button
                className="btn btn-outline"
                onClick={onSkipConflicts}
                disabled={isImporting}
              >
                跳过冲突
              </button>
              <button
                className="btn btn-warning"
                onClick={onOverwriteConflicts}
                disabled={isImporting}
              >
                {isImporting ? "导入中..." : "覆盖冲突"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div role="alert" className="alert alert-success mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>没有检测到冲突，将直接导入所有配置。</span>
            </div>

            <div className="modal-action">
              <button className="btn" onClick={onCancel} disabled={isImporting}>
                取消
              </button>
              <button
                className="btn btn-primary"
                onClick={onSkipConflicts}
                disabled={isImporting}
              >
                {isImporting ? "导入中..." : "开始导入"}
              </button>
            </div>
          </>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onCancel}>close</button>
      </form>
    </dialog>
  );
}
