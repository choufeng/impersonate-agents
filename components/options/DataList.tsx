import { EditIcon, CopyIcon } from "../icons";

interface DataListProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  onAdd?: () => void;
  addLabel?: string;
  emptyMessage?: string;
  keyExtractor?: (item: T) => string;
}

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface Action<T> {
  label: string;
  icon?: React.ReactNode;
  className?: string;
  onClick: (item: T) => void;
  condition?: (item: T) => boolean;
}

export function DataList<T extends { id: string }>({
  data,
  columns,
  actions = [],
  onAdd,
  addLabel = "添加",
  emptyMessage = "暂无数据",
  keyExtractor = (item) => item.id,
}: DataListProps<T>) {
  return (
    <div>
      {(onAdd || data.length > 0) && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{columns[0]?.label || "列表"}</h2>
          {onAdd && (
            <button className="btn btn-primary btn-sm" onClick={onAdd}>
              {addLabel}
            </button>
          )}
        </div>
      )}

      {data.length === 0 ? (
        <div className="text-center py-8 text-base-content/60">
          {emptyMessage}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className={col.className}>
                    {col.label}
                  </th>
                ))}
                {(actions.length > 0 || onAdd) && (
                  <th className="w-32">操作</th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={keyExtractor(item)}>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={col.className}>
                      {col.render
                        ? col.render(item)
                        : String(item[col.key as keyof T] ?? "")}
                    </td>
                  ))}
                  {(actions.length > 0 || onAdd) && (
                    <td>
                      <div className="flex gap-1">
                        {actions
                          .filter((action) =>
                            action.condition ? action.condition(item) : true,
                          )
                          .map((action, idx) => (
                            <button
                              key={idx}
                              className={`btn btn-ghost btn-xs ${
                                action.className || ""
                              }`}
                              onClick={() => action.onClick(item)}
                            >
                              {action.icon || action.label}
                            </button>
                          ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
