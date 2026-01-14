import { useI18n } from "../../lib/I18nProvider";

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  itemName: string;
  title?: string;
}

export default function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  itemName,
  title,
}: ConfirmDialogProps) {
  const { t } = useI18n();

  if (!isOpen) return null;

  return (
    <dialog open className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title || t("delete.title")}</h3>
        <p className="py-4">
          {t("delete.message").replace("{name}", itemName)}
        </p>
        <div className="modal-action">
          <button className="btn" onClick={onCancel}>
            {t("common.cancel")}
          </button>
          <button className="btn btn-error" onClick={onConfirm}>
            {t("common.delete")}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
