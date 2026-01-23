import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useI18n } from "../../lib/I18nProvider";

export default function AddressView() {
  const { t } = useI18n();
  const [selectedPartner, setSelectedPartner] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [copied, setCopied] = useState(false);

  const partnerNames = useQuery(api.partners.getAllPartnerNames);
  const randomAddress = useQuery(
    api.partners.getRandomAddress,
    selectedPartner ? { name: selectedPartner, refreshKey } : "skip",
  );

  const handleRefetch = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const formatAddressForDisplay = (address: string) => {
    const parts = address.split(",");
    return parts.map((part, index) => (
      <span key={index}>
        {part.trim()}
        {index < parts.length - 1 && ","}
        {index < parts.length - 1 && <br />}
      </span>
    ));
  };

  const handleCopy = async () => {
    if (!randomAddress || typeof randomAddress !== "string") return;

    try {
      await navigator.clipboard.writeText(randomAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
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
          {partnerNames === undefined ? (
            <div className="text-center text-base-content/50">
              {t("popup.loading")}
            </div>
          ) : selectedPartner ? (
            randomAddress === undefined ? (
              <div className="text-center text-base-content/50">
                {t("popup.loading")}
              </div>
            ) : randomAddress === null ? (
              <div className="text-center text-base-content/50">
                {t("popup.noAddress")}
              </div>
            ) : (
              <div className="text-center text-base-content text-lg font-medium">
                {formatAddressForDisplay(randomAddress)}
              </div>
            )
          ) : (
            <div className="text-center text-base-content/50">
              {t("popup.addressDisplayPlaceholder")}
            </div>
          )}
        </div>
        {selectedPartner && randomAddress && (
          <div className="card-actions justify-center p-3 pt-0 gap-2">
            <button
              data-tn="copy-address-btn"
              className="btn btn-sm btn-outline"
              onClick={handleCopy}
            >
              {copied ? t("common.copied") : t("common.copy")}
            </button>
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
