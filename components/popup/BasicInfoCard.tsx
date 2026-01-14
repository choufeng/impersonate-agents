import type { Agent, Port, UriEntry } from "../../lib/types";
import { EditIcon } from "../icons";

interface BasicInfoCardProps {
  agent?: Agent | null;
  port?: Port | null;
  uri?: UriEntry | null;
  onEdit?: () => void;
}

export default function BasicInfoCard({
  agent,
  port,
  uri,
  onEdit,
}: BasicInfoCardProps) {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <h2 className="card-title text-base">基础信息</h2>
          {onEdit && (
            <button
              className="btn btn-ghost btn-xs"
              onClick={onEdit}
              title="编辑基础信息"
            >
              <EditIcon size={14} />
            </button>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-base-content/70">Agent:</span>
            <span className="font-medium">{agent?.username || "未选择"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-content/70">Port:</span>
            <span className="font-medium">
              {port?.port ? port.port.toString() : "未选择"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-content/70">URI:</span>
            <span
              className="font-medium truncate"
              style={{ maxWidth: "200px" }}
              title={uri?.uri || ""}
            >
              {uri?.uri || "未选择"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
