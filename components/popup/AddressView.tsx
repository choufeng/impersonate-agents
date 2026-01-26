import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { useStorage } from "@plasmohq/storage/hook";
import { api } from "../../convex/_generated/api";
import { useI18n } from "../../lib/I18nProvider";

const getSecureRandomIndex = (length: number): number => {
  if (length <= 0) return 0;
  const randomValues = new Uint32Array(1);
  crypto.getRandomValues(randomValues);
  return randomValues[0] % length;
};

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
  const [lastPartner, setLastPartner] = useStorage<string>(
    "addressView.lastPartner",
    "",
  );
  const [cachedPartnerNames, setCachedPartnerNames] = useStorage<string[]>(
    "addressView.cachedPartnerNames",
    [],
  );
  const [cachedPartnerAddresses, setCachedPartnerAddresses] = useStorage<
    Record<string, string[]>
  >("addressView.cachedPartnerAddresses", {});
  const [refreshKey, setRefreshKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [currentRandomAddress, setCurrentRandomAddress] = useState<
    string | null
  >(null);
  const lastRefreshKeyRef = useRef<number>(-1);
  const lastProcessedPartnerRef = useRef<string>("");

  const partnerNames = useQuery(api.partners.getAllPartnerNames);

  const partnerChanged = selectedPartner !== lastPartner;

  const partnerAddresses = useQuery(
    api.partners.getPartnerAddresses,
    selectedPartner ? { name: selectedPartner } : "skip",
  );

  const removeAddress = useMutation(api.partners.removeAddressFromPartner);

  useEffect(() => {
    if (partnerNames && partnerNames.length > 0) {
      setCachedPartnerNames(partnerNames);
    }
  }, [partnerNames]);

  const pickRandomAddress = useCallback((addresses: string[]) => {
    if (addresses.length === 0) return null;
    const randomIndex = getSecureRandomIndex(addresses.length);
    return addresses[randomIndex];
  }, []);

  useEffect(() => {
    if (partnerAddresses && selectedPartner) {
      setCachedPartnerAddresses((prev) => ({
        ...prev,
        [selectedPartner]: partnerAddresses,
      }));

      if (
        lastProcessedPartnerRef.current !== selectedPartner &&
        partnerAddresses.length > 0
      ) {
        lastProcessedPartnerRef.current = selectedPartner;
        const newAddress = pickRandomAddress(partnerAddresses);
        if (newAddress) {
          setCurrentRandomAddress(newAddress);
          lastRefreshKeyRef.current = 0;
        }
      }
    }
  }, [partnerAddresses, selectedPartner, pickRandomAddress]);

  const availableAddresses = selectedPartner
    ? partnerAddresses ?? cachedPartnerAddresses[selectedPartner] ?? []
    : [];

  useEffect(() => {
    if (
      selectedPartner &&
      availableAddresses.length > 0 &&
      refreshKey !== lastRefreshKeyRef.current &&
      refreshKey > 0
    ) {
      lastRefreshKeyRef.current = refreshKey;
      const newAddress = pickRandomAddress(availableAddresses);
      if (newAddress) {
        setCurrentRandomAddress(newAddress);
      }
    }
  }, [selectedPartner, availableAddresses, refreshKey, pickRandomAddress]);

  const displayPartnerNames = partnerNames ?? cachedPartnerNames;

  const handleRefetch = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const isLoading = Boolean(
    selectedPartner &&
      !cachedPartnerAddresses[selectedPartner] &&
      partnerAddresses === undefined,
  );

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

  const handleCopy = useCallback(
    async (address?: string) => {
      const addressToCopy = address ?? currentRandomAddress ?? lastAddress;
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
    },
    [currentRandomAddress, lastAddress],
  );

  useEffect(() => {
    if (partnerChanged && selectedPartner) {
      setLastPartner(selectedPartner);
      setLastAddress(null);
      setCurrentRandomAddress(null);
      lastRefreshKeyRef.current = -1;
      lastProcessedPartnerRef.current = "";
      setRefreshKey(0);
    }
  }, [selectedPartner, partnerChanged]);

  useEffect(() => {
    if (currentRandomAddress && typeof currentRandomAddress === "string") {
      if (currentRandomAddress !== lastAddress) {
        setLastAddress(currentRandomAddress);
        handleCopy(currentRandomAddress);
      }
    }
  }, [currentRandomAddress, lastAddress, handleCopy]);

  const displayAddress = currentRandomAddress ?? lastAddress;
  const isShowingCachedAddress =
    lastAddress !== null && currentRandomAddress === null;

  const handleReportWrongAddress = async () => {
    if (!selectedPartner || !displayAddress) return;

    try {
      await removeAddress({
        name: selectedPartner,
        address: displayAddress,
      });
      setCachedPartnerAddresses((prev) => {
        const currentCache = prev ?? {};
        const currentAddresses = currentCache[selectedPartner] ?? [];
        return {
          ...currentCache,
          [selectedPartner]: currentAddresses.filter(
            (addr) => addr !== displayAddress,
          ),
        };
      });
      setLastAddress(null);
      setCurrentRandomAddress(null);
      lastRefreshKeyRef.current = -1;
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to remove address:", error);
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
            ) : isLoading ? (
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
            {/* 复制提示 */}
            <div
              className={`text-xs text-center transition-opacity duration-300 ${
                showToast ? "opacity-100" : "opacity-0"
              }`}
              style={{ height: "1rem" }}
            >
              {showToast && (
                <span className="text-success">
                  {t("common.autoCopiedToClipboard")}
                </span>
              )}
            </div>

            <div className="flex gap-2 w-full">
              <button
                data-tn="copy-address-btn"
                className="btn btn-sm btn-outline flex-1"
                onClick={() => handleCopy()}
              >
                {copied ? t("common.copied") : t("common.copy")}
              </button>
              <button
                data-tn="refetch-address-btn"
                className="btn btn-sm btn-primary flex-1"
                onClick={handleRefetch}
                disabled={isLoading}
              >
                {isLoading ? t("popup.fetching") : t("popup.fetchAddress")}
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
  );
}
