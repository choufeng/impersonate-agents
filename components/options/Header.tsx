import { ExportIcon, ImportIcon } from "../icons";

interface HeaderProps {
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Header({ onExport, onImport }: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">配置管理</h1>
      <div className="flex gap-2">
        <button className="btn btn-primary btn-sm" onClick={onExport}>
          <ExportIcon size={16} className="mr-2" />
          导出配置
        </button>
        <label className="btn btn-success btn-sm cursor-pointer">
          <ImportIcon size={16} className="mr-2" />
          导入配置
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={onImport}
          />
        </label>
      </div>
    </div>
  );
}
