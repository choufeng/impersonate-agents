interface ToastProps {
  show: boolean;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  onClose: () => void;
}

export default function Toast({
  show,
  message,
  type = "success",
  onClose,
}: ToastProps) {
  if (!show) return null;

  return (
    <div
      role="alert"
      className={`alert alert-${type} fixed top-4 right-4 w-80 z-50`}
      onClick={onClose}
    >
      <span>{message}</span>
    </div>
  );
}
