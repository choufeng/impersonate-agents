import { RocketIcon, SettingsIcon } from "../icons";
import { useI18n } from "../../lib/I18nProvider";

interface ActionButtonsProps {
  selectedCombination: boolean;
  isLoading: boolean;
  onRedirect: () => void;
  onOpenOptions: () => void;
}

export default function ActionButtons({
  selectedCombination,
  isLoading,
  onRedirect,
  onOpenOptions,
}: ActionButtonsProps) {
  const { t } = useI18n();

  return (
    <>
      {/* 固定底部：按钮 */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={onOpenOptions}
          className="btn btn-ghost"
          title={t("popup.openSettings")}
        >
          <SettingsIcon size={16} />
        </button>
        <button
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
      </div>
    </>
  );
}
