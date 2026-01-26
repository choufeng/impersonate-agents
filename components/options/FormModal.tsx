import { useEffect, useState } from "react";
import { useI18n } from "../../lib/I18nProvider";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSubmit: (data: any) => void;
  fields: {
    name: string;
    label: string;
    type: "text" | "number" | "switch";
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
  }[];
  initialValues?: Record<string, any>;
  isLoading?: boolean;
}

export default function FormModal({
  isOpen,
  onClose,
  title,
  onSubmit,
  fields,
  initialValues = {},
  isLoading = false,
}: FormModalProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState<Record<string, any>>(initialValues);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialValues || {});
    }
  }, [isOpen]); // 移除 initialValues 依赖，只在打开/关闭时重置

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <dialog open className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">{title}</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.name} className="form-control">
                <label className="label">
                  <span className="label-text">
                    {field.label}
                    {field.required && <span className="text-error">*</span>}
                  </span>
                </label>
                {field.type === "switch" ? (
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={!!formData[field.name]}
                    onChange={(e) => handleChange(field.name, e.target.checked)}
                    disabled={field.disabled}
                  />
                ) : field.type === "number" ? (
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                    required={field.required}
                  />
                ) : (
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={onClose}
              disabled={isLoading}
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? t("common.loading") : t("common.save")}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </div>
    </dialog>
  );
}
