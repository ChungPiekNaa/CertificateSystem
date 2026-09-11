import { useEffect, useState } from "react";
import { useToast } from "../context/ToastContext";
import FontSizeControl from "./FontSizeControl";

const FIELDS = [
  {
    key: "presented_text",
    label: "Presented line",
    placeholder: "This certificate is presented to",
  },
  {
    key: "completing_text",
    label: "Completion line",
    placeholder: "for completing the course titled",
  },
  {
    key: "on_text",
    label: "On line",
    placeholder: "On:",
  },
  {
    key: "by_text",
    label: '"By" line',
    placeholder: "conducted by",
  },
  {
    key: "facility_text",
    label: "Facility line",
    placeholder: "Sarawak Energy Learning Centre",
  },
  {
    key: "div_text",
    label: "Issuing division",
    placeholder:
      "Learning & Development and Capability Management Division",
  },
];

export default function WordingSettingsModal({
  settings,
  wordingScales,
  onSave,
  onClose,
  onChangeWordingScale,
  onChangeSettings,
}) {
  const showToast = useToast();

  const [draft, setDraft] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const handleChange = (key, value) => {
    const updatedDraft = {
      ...draft,
      [key]: value,
    };

    setDraft(updatedDraft);

    // Update parent immediately so the certificate preview changes while the user is typing
    if (onChangeSettings) {
      onChangeSettings(updatedDraft);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      await onSave(draft);

      showToast("Wording updated");

      onClose();
    } catch (err) {
      console.error(err);

      showToast("Could not save wording", true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="wording-popover">
      <div className="modal-head">
        <h3>Change other wordings</h3>

        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
          title="Close"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="wording-popover-fields">
        {FIELDS.map((f) => {
          const scale = wordingScales?.[f.key] ?? 1;

          return (
            <div className="field" key={f.key}>
              <div className="field-label-row">
                <label htmlFor={f.key}>{f.label}</label>

                <FontSizeControl
                  value={scale}
                  onChange={(newScale) =>
                    onChangeWordingScale(f.key, newScale)
                  }
                />
              </div>

              <input
                id={f.key}
                type="text"
                placeholder={f.placeholder}
                value={draft[f.key] ?? ""}
                onChange={(e) =>
                  handleChange(f.key, e.target.value)
                }
              />
            </div>
          );
        })}
      </div>

      <div className="modal-actions">
        <button
          type="button"
          className="btn btn-accent btn-sm"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save wording"}
        </button>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onClose}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: 4 }}
          >
            <path d="M9 14 4 9l5-5" />
            <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
          </svg>

          Return
        </button>
      </div>
    </div>
  );
}