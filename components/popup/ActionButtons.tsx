import { RocketIcon, SettingsIcon } from "../icons";

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
  return (
    <>
      {/* 固定底部：按钮 */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={onOpenOptions}
          className="btn btn-ghost"
          title="打开设置"
        >
          <SettingsIcon size={16} />
        </button>
        <button
          className="btn btn-success flex-1"
          disabled={!selectedCombination || isLoading}
          onClick={onRedirect}
        >
          {isLoading ? (
            "跳转中..."
          ) : (
            <>
              <RocketIcon size={16} className="mr-2" />
              跳转
            </>
          )}
        </button>
      </div>
    </>
  );
}
