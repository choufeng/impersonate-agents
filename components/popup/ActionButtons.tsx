import {
  RocketIcon,
  SettingsIcon,
  MapPinIcon,
  AppWindowIcon,
  PenLineIcon,
} from "../icons";
import { useI18n } from "../../lib/I18nProvider";

type PopupView = "impersonate" | "address";

interface ActionButtonsProps {
  selectedCombination: boolean;
  isLoading: boolean;
  onRedirect: () => void;
  onFetchAddress: () => void;
  onOpenOptions: () => void;
  currentView: PopupView;
  onToggleView: () => void;
}

export default function ActionButtons({
  selectedCombination,
  isLoading,
  onRedirect,
  onFetchAddress,
  onOpenOptions,
  currentView,
  onToggleView,
}: ActionButtonsProps) {
  const { t } = useI18n();

  const isAddressView = currentView === "address";

  return (
    <>
      {/* 固定底部：按钮 */}
      <div className="flex gap-2 mt-4">
        <button
          data-tn="settings-button"
          onClick={onOpenOptions}
          className="btn btn-ghost"
          title={t("popup.openSettings")}
        >
          <SettingsIcon size={16} />
        </button>
        <button
          data-tn="toggle-view-button"
          onClick={onToggleView}
          className="btn btn-ghost"
          title={
            currentView === "impersonate"
              ? t("popup.switchToAddressView")
              : t("popup.switchToImpersonateView")
          }
        >
          {currentView === "impersonate" ? (
            <MapPinIcon size={16} />
          ) : (
            <AppWindowIcon size={16} />
          )}
        </button>
        {isAddressView ? (
          <button
            data-tn="fetch-address-button"
            className="btn flex-1 bg-purple-500 hover:bg-purple-600 text-white border-purple-500 hover:border-purple-600"
            disabled={isLoading}
            onClick={onFetchAddress}
          >
            {isLoading ? (
              t("popup.fetching")
            ) : (
              <>
                <PenLineIcon size={16} className="mr-2" />
                {t("popup.fetchAddress")}
              </>
            )}
          </button>
        ) : (
          <button
            data-tn="redirect-button"
            className="btn btn-success flex-1"
            disabled={!selectedCombination || isLoading}
            onClick={onRedirect}
          >
            {isLoading ? (
              t("popup.redirecting")
            ) : (
              <>
                <RocketIcon size={16} className="mr-2" />
                {t("popup.redirect")}
              </>
            )}
          </button>
        )}
      </div>
    </>
  );
}
