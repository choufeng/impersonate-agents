import {
  RocketIcon,
  SettingsIcon,
  MapPinIcon,
  AppWindowIcon,
  ChevronDownIcon,
} from "../icons";
import { useI18n } from "../../lib/I18nProvider";
import Tooltip from "../Tooltip";

type PopupView = "impersonate" | "address";
type RedirectMode =
  | "full"
  | "paramsOnly"
  | "optyOnly"
  | "paramsAndOpty"
  | "optyInject";

interface ActionButtonsProps {
  selectedCombination: boolean;
  isLoading: boolean;
  onRedirect: (mode: RedirectMode) => void;
  onOpenOptions: () => void;
  currentView: PopupView;
  onToggleView: () => void;
}

export default function ActionButtons({
  selectedCombination,
  isLoading,
  onRedirect,
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
        <Tooltip content={t("popup.openSettings")} position="top">
          <button
            data-tn="settings-button"
            onClick={onOpenOptions}
            className="btn btn-ghost"
          >
            <SettingsIcon size={16} />
          </button>
        </Tooltip>
        <Tooltip
          content={
            currentView === "impersonate"
              ? t("popup.switchToAddressView")
              : t("popup.switchToImpersonateView")
          }
          position="top"
        >
          <button
            data-tn="toggle-view-button"
            onClick={onToggleView}
            className="btn btn-ghost"
          >
            {currentView === "impersonate" ? (
              <MapPinIcon size={16} />
            ) : (
              <AppWindowIcon size={16} />
            )}
          </button>
        </Tooltip>
        {!isAddressView && (
          <div className="flex flex-1">
            <button
              data-tn="redirect-full"
              className="btn btn-success flex-1 rounded-r-none border-r-0"
              disabled={!selectedCombination || isLoading}
              onClick={() => onRedirect("full")}
            >
              {isLoading ? (
                t("popup.redirecting")
              ) : (
                <>
                  <RocketIcon size={16} className="mr-2" />
                  {t("popup.redirectFull")}
                </>
              )}
            </button>
            <details className="dropdown dropdown-top dropdown-end">
              <summary
                data-tn="redirect-dropdown"
                className={`btn btn-success rounded-l-none px-2 ${
                  !selectedCombination || isLoading
                    ? "btn-disabled pointer-events-none"
                    : ""
                }`}
              >
                <ChevronDownIcon size={14} />
              </summary>
              <ul className="dropdown-content menu bg-[#fffef7] rounded-box z-[1] w-72 p-2 shadow mb-1">
                <li>
                  <a
                    data-tn="redirect-params-and-opty"
                    onClick={() => onRedirect("paramsAndOpty")}
                  >
                    {t("popup.redirectParamsAndOpty")}
                  </a>
                </li>
                <li>
                  <a
                    data-tn="redirect-params-only"
                    onClick={() => onRedirect("paramsOnly")}
                  >
                    {t("popup.redirectParamsOnly")}
                  </a>
                </li>
                <li>
                  <a
                    data-tn="redirect-opty-only"
                    onClick={() => onRedirect("optyOnly")}
                  >
                    {t("popup.redirectOptyOnly")}
                  </a>
                </li>
                <li>
                  <a
                    data-tn="redirect-opty-inject"
                    onClick={() => onRedirect("optyInject")}
                  >
                    {t("popup.redirectOptyInject")}
                  </a>
                </li>
              </ul>
            </details>
          </div>
        )}
      </div>
    </>
  );
}
