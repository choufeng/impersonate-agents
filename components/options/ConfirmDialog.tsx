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
  title = "确认删除",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <dialog open className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-4">确定要删除「{itemName}」吗？此操作无法撤销。</p>
        <div className="modal-action">
          <button className="btn" onClick={onCancel}>
            取消
          </button>
          <button className="btn btn-error" onClick={onConfirm}>
            删除
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
