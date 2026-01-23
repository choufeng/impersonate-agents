import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useI18n } from "../../lib/I18nProvider";

export default function AddressView() {
  const { t } = useI18n();
  const [selectedPartner, setSelectedPartner] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const partnerNames = useQuery(api.partners.getAllPartnerNames);
  const randomAddress = useQuery(
    api.partners.getRandomAddress,
    selectedPartner ? { name: selectedPartner, refreshKey } : "skip",
  );

  const handleRefetch = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div data-tn="address-view" className="flex-1 flex flex-col p-4 space-y-4">
      {/* Upper section - Partner selector */}
      <div data-tn="partner-selector">
        <select
          data-tn="partner-select"
          className="select select-bordered w-full h-10"
          value={selectedPartner}
          onChange={(e) => setSelectedPartner(e.target.value)}
          disabled={partnerNames === undefined}
        >
          <option value="">{t("popup.selectAddress")}</option>
          {partnerNames?.map((name: string) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Display area - Card */}
      <div className="card bg-base-100 shadow-sm rounded-lg flex-1 flex flex-col">
        <div
          data-tn="address-display-card"
          className="card-body p-3 flex-1 flex items-center justify-center"
        >
          <div className="text-center text-base-content/50">
            {partnerNames === undefined
              ? t("popup.loading")
              : selectedPartner
                ? randomAddress === undefined
                  ? t("popup.loading")
                  : randomAddress === null
                    ? t("popup.noAddress")
                    : randomAddress
                : t("popup.addressDisplayPlaceholder")}
          </div>
        </div>
        {selectedPartner && randomAddress && (
          <div className="card-actions justify-center p-3 pt-0">
            <button
              data-tn="refetch-address-btn"
              className="btn btn-sm btn-primary"
              onClick={handleRefetch}
              disabled={randomAddress === undefined}
            >
              {randomAddress === undefined
                ? t("popup.fetching")
                : t("popup.fetchAddress")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
