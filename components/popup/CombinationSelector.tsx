import { useState, useEffect, useRef } from "react";
import type { Combination } from "../../lib/types";
import { useI18n } from "../../lib/I18nProvider";

interface CombinationSelectorProps {
  combinations: Combination[];
  selectedCombinationId: string | null;
  onCombinationChange: (value: string) => void;
}

export default function CombinationSelector({
  combinations,
  selectedCombinationId,
  onCombinationChange,
}: CombinationSelectorProps) {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCombo = combinations.find(
    (c) => c.id === selectedCombinationId,
  );

  const filteredCombinations = combinations.filter((combo) =>
    combo.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    onCombinationChange(id);
    setIsOpen(false);
    setSearchTerm("");
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown") {
        setIsOpen(true);
        setFocusedIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < filteredCombinations.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && filteredCombinations[focusedIndex]) {
          handleSelect(filteredCombinations[focusedIndex].id);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        setFocusedIndex(-1);
        break;
    }
  };

  return (
    <div className="mb-4 relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className={`input input-bordered w-full h-10 pr-10 ${
            selectedCombo ? "placeholder:text-base-content" : ""
          }`}
          placeholder={
            selectedCombo ? selectedCombo.title : t("popup.selectConfig")
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          data-tn="combination-search-input"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-base-content/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1 bg-[#fffef7] border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredCombinations.length === 0 ? (
            <div className="px-4 py-2 text-base-content/50 text-sm">
              {t("popup.noMatchingConfig")}
            </div>
          ) : (
            filteredCombinations.map((combo, index) => (
              <div
                key={combo.id}
                className={`px-4 py-2 cursor-pointer text-sm border-b border-base-200 last:border-b-0 ${
                  combo.id === selectedCombinationId
                    ? "bg-primary text-primary-content"
                    : index === focusedIndex
                      ? "bg-base-200"
                      : "hover:bg-base-200"
                }`}
                onClick={() => handleSelect(combo.id)}
                data-tn={`combination-option-${combo.id}`}
              >
                {combo.title}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
