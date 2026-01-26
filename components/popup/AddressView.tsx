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
  const [cachedPartnerNames, setCachedPartnerNames] = useStorage<string[]>(
    "addressView.cachedPartnerNames",
    [],
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const partnerNames = useQuery(api.partners.getAllPartnerNames);

  const shouldSkipAddressQuery =
    !selectedPartner || (lastAddress !== null && refreshKey === 0);
  const randomAddress = useQuery(
    api.partners.getRandomAddress,
    shouldSkipAddressQuery ? "skip" : { name: selectedPartner, refreshKey },
  );
  const removeAddress = useMutation(api.partners.removeAddressFromPartner);

  useEffect(() => {
    if (partnerNames && partnerNames.length > 0) {
      setCachedPartnerNames(partnerNames);
    }
  }, [partnerNames]);

  const displayPartnerNames = partnerNames ?? cachedPartnerNames;

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
      // 只在地址真正改变时才自动复制
      if (randomAddress !== lastAddress) {
        setLastAddress(randomAddress);
        handleCopy();
      }
    }
  }, [randomAddress]);

  const displayAddress = randomAddress ?? lastAddress;
  const isShowingCachedAddress = lastAddress !== null && refreshKey === 0;

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
            disabled={displayPartnerNames.length === 0}
          >
            <option value="">{t("popup.selectAddress")}</option>
            {displayPartnerNames.map((name: string) => (
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
            {selectedPartner ? (
              displayAddress ? (
                <div className="text-left">
                  <div className="text-base-content text-lg font-medium">
                    {formatAddressForDisplay(displayAddress)}
                  </div>
                  {isShowingCachedAddress && (
                    <div
                      data-tn="cached-address-hint"
                      className="text-xs text-base-content/50 mt-2 text-center"
                    >
                      {t("popup.cachedAddressHint")}
                    </div>
                  )}
                </div>
              ) : randomAddress === undefined ? (
                <div className="text-center text-base-content/50">
                  {t("popup.loading")}
                </div>
              ) : (
                <div className="text-center text-base-content/50">
                  {t("popup.noAddress")}
                </div>
              )
            ) : (
              <div className="text-center text-base-content/50">
                {t("popup.addressDisplayPlaceholder")}
              </div>
            )}
          </div>
          {selectedPartner && displayAddress && (
            <div className="card-actions justify-center p-3 pt-0 gap-2 flex-col">
              <div className="flex gap-2 w-full">
                <button
                  data-tn="copy-address-btn"
                  className="btn btn-sm btn-outline flex-1"
                  onClick={handleCopy}
                >
                  {copied ? t("common.copied") : t("common.copy")}
                </button>
                <button
                  data-tn="refetch-address-btn"
                  className="btn btn-sm btn-primary flex-1"
                  onClick={handleRefetch}
                  disabled={
                    !shouldSkipAddressQuery && randomAddress === undefined
                  }
                >
                  {!shouldSkipAddressQuery && randomAddress === undefined
                    ? t("popup.fetching")
                    : t("popup.fetchAddress")}
                </button>
              </div>
              <button
                data-tn="report-wrong-address-btn"
                className="btn btn-sm btn-error btn-outline w-full"
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
