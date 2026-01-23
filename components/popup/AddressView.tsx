import { useState } from "react";
import { useI18n } from "../../lib/I18nProvider";

export default function AddressView() {
  const { t } = useI18n();
  const [selectedAddress, setSelectedAddress] = useState("");

  return (
    <div data-tn="address-view" className="flex-1 flex flex-col p-4 space-y-4">
      {/* Upper section - Address selector */}
      <div data-tn="address-selector">
        <select
          data-tn="address-select"
          className="select select-bordered w-full h-10"
          value={selectedAddress}
          onChange={(e) => setSelectedAddress(e.target.value)}
        >
          <option value="">{t("popup.selectAddress")}</option>
          {/* Address options will be added later */}
        </select>
      </div>

      {/* Display area - Card */}
      <div className="card bg-base-100 shadow-sm rounded-lg flex-1">
        <div
          data-tn="address-display-card"
          className="card-body p-3 flex items-center justify-center"
        >
          <div className="text-center text-base-content/50">
            {t("popup.addressDisplayPlaceholder")}
          </div>
        </div>
      </div>
    </div>
  );
}
