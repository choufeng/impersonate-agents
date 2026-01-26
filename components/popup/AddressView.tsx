import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useStorage } from "@plasmohq/storage/hook";
import { api } from "../../convex/_generated/api";
import { useI18n } from "../../lib/I18nProvider";
import Toast from "../options/Toast";

export default function AddressView() {
  const { t } = useI18n();
  const [selectedPartner, setSelectedPartner] = useStorage<string>(
    "addressView.selectedPartner",
    "",
  );
  const [lastAddress, setLastAddress] = useStorage<string | null>(
    "addressView.lastAddress",
    null,
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const partnerNames = useQuery(api.partners.getAllPartnerNames);
  const randomAddress = useQuery(
    api.partners.getRandomAddress,
    selectedPartner ? { name: selectedPartner, refreshKey } : "skip",
  );
  const removeAddress = useMutation(api.partners.removeAddressFromPartner);

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
    const addressToCopy = randomAddress ?? lastAddress;
    if (!addressToCopy || typeof addressToCopy !== "string") return;

    try {
      await navigator.clipboard.writeText(addressToCopy);
      setCopied(true);
      setShowToast(true);
      setTimeout(() => {
        setCopied(false);
        setShowToast(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  useEffect(() => {
    if (randomAddress && typeof randomAddress === "string") {
      setLastAddress(randomAddress);
      handleCopy();
    }
  }, [randomAddress]);

  const displayAddress = randomAddress ?? lastAddress;

  const handleReportWrongAddress = async () => {
    if (!selectedPartner || !displayAddress) return;

    try {
      await removeAddress({
        name: selectedPartner,
        address: displayAddress,
      });
      setLastAddress(null);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to remove address:", error);
    }
  };

  return (
    <>
      <Toast
        show={showToast}
        message={t("common.autoCopiedToClipboard")}
        type="success"
        onClose={() => setShowToast(false)}
      />
      <div
        data-tn="address-view"
        className="flex-1 flex flex-col p-4 space-y-4"
      >
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
              randomAddress === undefined && !lastAddress ? (
                <div className="text-center text-base-content/50">
                  {t("popup.loading")}
                </div>
              ) : !displayAddress ? (
                <div className="text-center text-base-content/50">
                  {t("popup.noAddress")}
                </div>
              ) : (
                <div className="text-left text-base-content text-lg font-medium">
                  {formatAddressForDisplay(displayAddress)}
                </div>
              )
            ) : (
              <div className="text-center text-base-content/50">
                {t("popup.addressDisplayPlaceholder")}
              </div>
            )}
          </div>
          {selectedPartner && displayAddress && (
            <div className="card-actions justify-center p-3 pt-0 gap-2">
              <button
                data-tn="copy-address-btn"
                className="btn btn-sm btn-outline"
                style={{ flex: "0.8" }}
                onClick={handleCopy}
              >
                {copied ? t("common.copied") : t("common.copy")}
              </button>
              <button
                data-tn="refetch-address-btn"
                className="btn btn-sm btn-primary"
                style={{ flex: "1.2" }}
                onClick={handleRefetch}
                disabled={randomAddress === undefined}
              >
                {randomAddress === undefined
                  ? t("popup.fetching")
                  : t("popup.fetchAddress")}
              </button>
              <button
                data-tn="report-wrong-address-btn"
                className="btn btn-sm btn-error btn-outline"
                style={{ flex: "1.5" }}
                onClick={handleReportWrongAddress}
              >
                {t("popup.reportWrongAddress")}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
