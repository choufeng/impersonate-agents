import type { ImportConflictResult } from "../../lib/storage";
import { useI18n } from "../../lib/I18nProvider";

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
  const { t } = useI18n();

  if (!isOpen) return null;

  return (
    <dialog open className="modal">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">
          {t("settings.importConflict")}
        </h3>

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
              <span>
                {t("settings.importConflict")}! {t("settings.skipConflicts")}
              </span>
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
                    {t("nav.tailParameters")} (
                    {conflicts.conflicts.tailParameters.length}):
                  </strong>{" "}
                  {conflicts.conflicts.tailParameters.join(", ")}
                </div>
              )}
              {conflicts.conflicts.optyParameters.length > 0 && (
                <div className="text-sm">
                  <strong>
                    {t("nav.optyParameters")} (
                    {conflicts.conflicts.optyParameters.length}):
                  </strong>{" "}
                  {conflicts.conflicts.optyParameters.join(", ")}
                </div>
              )}
              {conflicts.conflicts.combinations.length > 0 && (
                <div className="text-sm">
                  <strong>
                    {t("nav.combinations")} (
                    {conflicts.conflicts.combinations.length}):
                  </strong>{" "}
                  {conflicts.conflicts.combinations.join(", ")}
                </div>
              )}
            </div>

            <div className="modal-action">
              <button className="btn" onClick={onCancel} disabled={isImporting}>
                {t("common.cancel")}
              </button>
              <button
                className="btn btn-outline"
                onClick={onSkipConflicts}
                disabled={isImporting}
              >
                {t("settings.skipConflicts")}
              </button>
              <button
                className="btn btn-warning"
                onClick={onOverwriteConflicts}
                disabled={isImporting}
              >
                {isImporting
                  ? t("common.loading")
                  : t("settings.overwriteConflicts")}
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
              <span>{t("settings.noConflicts")}</span>
            </div>

            <div className="modal-action">
              <button className="btn" onClick={onCancel} disabled={isImporting}>
                {t("common.cancel")}
              </button>
              <button
                className="btn btn-primary"
                onClick={onSkipConflicts}
                disabled={isImporting}
              >
                {isImporting ? t("common.loading") : t("common.import")}
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
