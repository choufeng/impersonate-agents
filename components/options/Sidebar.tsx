import { useState } from "react";
import {
  navigationIcons,
  CombinationIcon,
  SettingsIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "../icons";
import { useI18n } from "../../lib/I18nProvider";

type NavItem = {
  key: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
};

type SubmenuItem = {
  key: string;
  label: string;
};

interface SidebarProps {
  currentNav: string;
  onNavigate: (
    nav:
      | "agents"
      | "ports"
      | "uris"
      | "tail-parameters"
      | "opty-parameters"
      | "combinations"
      | "settings",
  ) => void;
}

export default function Sidebar({ currentNav, onNavigate }: SidebarProps) {
  const { t } = useI18n();
  const [submenuOpen, setSubmenuOpen] = useState(true);

  const resourceItems: SubmenuItem[] = [
    { key: "agents", label: t("nav.agents") },
    { key: "ports", label: t("nav.ports") },
    { key: "uris", label: t("nav.uris") },
    { key: "tail-parameters", label: t("nav.tailParameters") },
    { key: "opty-parameters", label: t("nav.optyParameters") },
  ];

  const renderNavIcon = (navKey: string, size: number = 20) => {
    const IconComponent =
      navigationIcons[navKey as keyof typeof navigationIcons];
    return IconComponent ? <IconComponent size={size} /> : null;
  };

  const isResourceNav = (nav: string) =>
    resourceItems.some((item) => item.key === nav);

  const isActive = (navKey: string) => currentNav === navKey;

  return (
    <aside
      className={`w-64 bg-base-300 transition-all duration-300 fixed left-0 top-0 h-full z-10 ${
        currentNav === "agents" && "translate-x-0"
      }`}
    >
      <nav className="menu p-4">
        <ul>
          {/* Configuration Resources Group */}
          <li className="menu-title">
            <span>{t("nav.combinationsGroup")}</span>
          </li>

          {/* Combinations (top level) */}
          <li className={isActive("combinations") ? "active" : ""}>
            <a onClick={() => onNavigate("combinations")}>
              <CombinationIcon size={20} />
              <span>{t("nav.combinations")}</span>
            </a>
          </li>

          {/* Expandable Resource Items */}
          <li>
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setSubmenuOpen(!submenuOpen)}
            >
              <span className="flex items-center gap-2">
                {submenuOpen ? (
                  <ChevronDownIcon size={16} />
                ) : (
                  <ChevronRightIcon size={16} />
                )}
                <span>{t("nav.combinationsGroup")}</span>
              </span>
            </div>

            {submenuOpen && (
              <ul className="ml-4 mt-1 space-y-1">
                {resourceItems.map((item) => (
                  <li
                    key={item.key}
                    className={
                      isActive(item.key as any) ? "active rounded-md" : ""
                    }
                  >
                    <a
                      onClick={() =>
                        onNavigate(
                          item.key as
                            | "agents"
                            | "ports"
                            | "uris"
                            | "tail-parameters"
                            | "opty-parameters",
                        )
                      }
                      className="flex items-center gap-2"
                    >
                      {renderNavIcon(item.key)}
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li className="menu-divider" />

          {/* Settings */}
          <li className={isActive("settings") ? "active" : ""}>
            <a onClick={() => onNavigate("settings")}>
              <SettingsIcon size={20} />
              <span>{t("nav.settings")}</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
