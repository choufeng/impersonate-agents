import type { ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export default function Tooltip({
  content,
  children,
  position = "top",
}: TooltipProps) {
  const positionClass = {
    top: "tooltip-top",
    bottom: "tooltip-bottom",
    left: "tooltip-left",
    right: "tooltip-right",
  }[position];

  return (
    <div
      className={`tooltip ${positionClass} before:whitespace-pre-wrap before:max-w-xs before:text-left`}
      data-tip={content}
      data-tn="tooltip"
    >
      {children}
    </div>
  );
}
