import { navigationIcons, SettingsIcon } from "../icons";
import { useI18n } from "../../lib/I18nProvider";

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

  const navItems = [
    { key: "agents", label: t("nav.agents") },
    { key: "ports", label: t("nav.ports") },
    { key: "uris", label: t("nav.uris") },
    { key: "tail-parameters", label: t("nav.tailParameters") },
    { key: "opty-parameters", label: t("nav.optyParameters") },
    { key: "combinations", label: t("nav.combinations") },
    { key: "settings", label: t("nav.settings"), icon: SettingsIcon },
  ];

  const renderNavIcon = (navKey: string, size: number = 20) => {
    const navItem = navItems.find((item) => item.key === navKey);
    if (navItem?.icon) {
      return <navItem.icon size={size} />;
    }
    const IconComponent =
      navigationIcons[navKey as keyof typeof navigationIcons];
    return IconComponent ? <IconComponent size={size} /> : null;
  };

  return (
    <aside
      className={`w-64 bg-base-300 transition-all duration-300 fixed left-0 top-0 h-full z-10 ${
        currentNav === "agents" && "translate-x-0"
      }`}
    >
      <nav className="menu p-4">
        <ul>
          {navItems.map((item) => (
            <li
              key={item.key}
              className={currentNav === item.key ? "active" : ""}
            >
              <a
                onClick={() =>
                  onNavigate(
                    item.key as
                      | "agents"
                      | "ports"
                      | "uris"
                      | "tail-parameters"
                      | "opty-parameters"
                      | "combinations"
                      | "settings",
                  )
                }
              >
                {renderNavIcon(item.key)}
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
