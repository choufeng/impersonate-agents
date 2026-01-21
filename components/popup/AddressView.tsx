import { useI18n } from "../../lib/I18nProvider";

export default function AddressView() {
  const { t } = useI18n();

  return (
    <div
      data-tn="address-view"
      className="flex-1 flex items-center justify-center"
    >
      <div className="text-center text-base-content/50">
        {t("popup.addressViewPlaceholder")}
      </div>
    </div>
  );
}
