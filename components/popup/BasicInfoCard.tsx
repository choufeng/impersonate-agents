import type { Agent, Port, UriEntry } from "../../lib/types";

interface BasicInfoCardProps {
  agent?: Agent | null;
  port?: Port | null;
  uri?: UriEntry | null;
}

export default function BasicInfoCard({
  agent,
  port,
  uri,
}: BasicInfoCardProps) {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h2 className="card-title">基础信息</h2>

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
