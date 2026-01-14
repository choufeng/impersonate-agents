import { useState } from "react";
import { ExportIcon, ImportIcon } from "../icons";
import { useI18n } from "../../lib/I18nProvider";
import type { ImportConflictResult } from "../../lib/storage";
import ImportConfirmDialog from "./ImportConfirmDialog";

interface SettingsSectionProps {
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  importConflicts: ImportConflictResult | null;
  isImporting: boolean;
  onCancelImport: () => void;
  onSkipConflicts: () => void;
  onOverwriteConflicts: () => void;
  importConfirmOpen: boolean;
}

export default function SettingsSection({
  onExport,
  onImport,
  importConflicts,
  isImporting,
  onCancelImport,
  onSkipConflicts,
  onOverwriteConflicts,
  importConfirmOpen,
}: SettingsSectionProps) {
  const { t, language, setLanguage } = useI18n();

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">{t("settings.title")}</h2>

      {/* Language Settings */}
      <div className="card bg-base-100 shadow-lg border border-base-300 mb-6">
        <div className="card-body">
          <h3 className="card-title text-base">{t("settings.language")}</h3>
          <div className="flex gap-4 mt-4">
            <button
              className={`btn btn-sm ${
                language === "zh" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setLanguage("zh")}
            >
              {t("settings.languageZh")}
            </button>
            <button
              className={`btn btn-sm ${
                language === "en" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setLanguage("en")}
            >
              {t("settings.languageEn")}
            </button>
          </div>
        </div>
      </div>

      {/* Import/Export Settings */}
      <div className="card bg-base-100 shadow-lg border border-base-300">
        <div className="card-body">
          <h3 className="card-title text-base">{t("settings.importExport")}</h3>
          <div className="flex gap-4 mt-4">
            <button className="btn btn-primary btn-sm" onClick={onExport}>
              <ExportIcon size={16} className="mr-2" />
              {t("settings.exportConfig")}
            </button>
            <label className="btn btn-success btn-sm cursor-pointer">
              <ImportIcon size={16} className="mr-2" />
              {t("settings.importConfig")}
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={onImport}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Import Confirmation Dialog */}
      <ImportConfirmDialog
        isOpen={importConfirmOpen}
        onCancel={onCancelImport}
        onSkipConflicts={onSkipConflicts}
        onOverwriteConflicts={onOverwriteConflicts}
        conflicts={importConflicts}
        isImporting={isImporting}
      />
    </div>
  );
}
