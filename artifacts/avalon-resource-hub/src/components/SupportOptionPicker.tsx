import { useState } from "react";
import { SUPPORT_OPTION_GROUPS } from "@/lib/supportOptions";

interface Props {
  selected: string[];
  onChange: (opt: string) => void;
}

export function SupportOptionPicker({ selected, onChange }: Props) {
  // All groups open by default
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => new Set(SUPPORT_OPTION_GROUPS.map((g) => g.label))
  );

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  return (
    <div className="support-option-picker">
      {SUPPORT_OPTION_GROUPS.map((group) => {
        const isOpen = openGroups.has(group.label);
        const selectedCount = group.options.filter((o) => selected.includes(o)).length;

        return (
          <div key={group.label} className={`sop-group${isOpen ? " sop-group--open" : ""}`}>
            <button
              type="button"
              className="sop-group-header"
              onClick={() => toggleGroup(group.label)}
              aria-expanded={isOpen}
            >
              <span className="sop-group-chevron">{isOpen ? "▾" : "▸"}</span>
              <span className="sop-group-label">{group.label}</span>
              {selectedCount > 0 && (
                <span className="sop-group-badge">{selectedCount} selected</span>
              )}
            </button>

            {isOpen && (
              <div className="sop-group-body support-checkboxes">
                {group.options.map((opt) => (
                  <label key={opt} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selected.includes(opt)}
                      onChange={() => onChange(opt)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
