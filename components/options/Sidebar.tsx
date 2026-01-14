import { navigationIcons } from "../icons";

interface SidebarProps {
  currentNav: string;
  onNavigate: (
    nav:
      | "agents"
      | "ports"
      | "uris"
      | "tail-parameters"
      | "opty-parameters"
      | "combinations",
  ) => void;
}

export default function Sidebar({ currentNav, onNavigate }: SidebarProps) {
  const navItems = [
    { key: "agents", label: "Agents" },
    { key: "ports", label: "端口" },
    { key: "uris", label: "URI" },
    { key: "tail-parameters", label: "尾部参数" },
    { key: "opty-parameters", label: "OPTY 参数" },
    { key: "combinations", label: "组合配置" },
  ];

  const renderNavIcon = (navKey: string, size: number = 20) => {
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
                      | "combinations",
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
