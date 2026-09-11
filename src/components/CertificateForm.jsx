import { useState } from "react";
import FontSizeControl from "./FontSizeControl";

export default function CertificateForm({
  name,
  courseTitle,
  userID,
  date,
  nameScale,
  courseTitleScale,
  userIDScale,
  dateScale,
  onChangeName,
  onChangeCourseTitle,
  onChangeUserID,
  onChangeDate,
  onChangeNameScale,
  onChangeCourseTitleScale,
  onChangeUserIDScale,
  onChangeDateScale,
  onSubmit,
  onReset,
  onOpenWordingSettings,
  saving,
  error,
}) {
  const [dateError, setDateError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Date must be in DD/MM/YYYY format
    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;

    if (!datePattern.test(date)) {
      setDateError("Date must be in DD/MM/YYYY format.");
      return;
    }

    // Check that the date is a valid calendar date
    const [day, month, year] = date.split("/").map(Number);

    const parsedDate = new Date(year, month - 1, day);

    const isValidDate =
      parsedDate.getFullYear() === year &&
      parsedDate.getMonth() === month - 1 &&
      parsedDate.getDate() === day;

    if (!isValidDate) {
      setDateError("Please enter a valid date in DD/MM/YYYY format.");
      return;
    }

    setDateError("");
    onSubmit(e);
  };

  return (
    <form className="card form-card" onSubmit={handleSubmit}>

      {/* =========================
          PARTICIPANT NAME
          ========================= */}
      <div className="field">
        <div className="field-label-row">
          <label htmlFor="participantName">
            Participant Name <span className="required-mark">*</span>
          </label>

          <FontSizeControl
            value={nameScale}
            onChange={onChangeNameScale}
          />
        </div>

        <input
          id="participantName"
          type="text"
          placeholder="e.g. Alex Kueh"
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          required
        />
      </div>

      {/* =========================
          User ID
          ========================= */}
      <div className="field">
        <div className="field-label-row">
          <label htmlFor="UserID">
            User ID <span className="required-mark">*</span>
          </label>

          <FontSizeControl
            value={userIDScale}
            onChange={onChangeUserIDScale}
          />
        </div>

        <input
          id="UserID"
          type="text"
          placeholder="e.g. 1234567"
          value={userID}
          onChange={(e) => onChangeUserID(e.target.value)}
          required
        />
      </div>

      {/* =========================
          COURSE TITLE
          ========================= */}
      <div className="field">
        <div className="field-label-row">
          <label htmlFor="courseTitle">
            Course Title <span className="required-mark">*</span>
          </label>

          <FontSizeControl
            value={courseTitleScale}
            onChange={onChangeCourseTitleScale}
          />
        </div>

        <input
          id="courseTitle"
          type="text"
          placeholder="e.g. Workplace Safety Fundamentals"
          value={courseTitle}
          onChange={(e) => onChangeCourseTitle(e.target.value)}
          required
        />
      </div>

      {/* =========================
          Date
          ========================= */}
      <div className="field">
        <div className="field-label-row">
          <label htmlFor="date">
            Date <span className="required-mark">*</span>
          </label>

          <FontSizeControl
            value={dateScale}
            onChange={onChangeDateScale}
          />
        </div>

        <input
          id="date"
          type="text"
          placeholder="e.g. DD/MM/YYYY"
          value={date}
          onChange={(e) => {
            onChangeDate(e.target.value);
            setDateError("");
          }}
          required
        />

        {dateError && (
          <div className="field-error">
            {dateError}
          </div>
        )}
      </div>

      {/* =========================
          PRINT BUTTON
          ========================= */}
      <button
        type="button"
        className="icon-print-btn"
        onClick={() => window.print()}
        aria-label="Print certificate"
        title="Print certificate"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9V2h12v7" />

          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />

          <rect x="6" y="14" width="12" height="8" />
        </svg>
      </button>

      {/* =========================
          ERROR
          ========================= */}
      {error && (
        <div className="field-error">
          {error}
        </div>
      )}

      {/* =========================
          WORDING SETTINGS
          ========================= */}
      <div className="wording-link-row">
        <button
          type="button"
          className="text-link"
          onClick={onOpenWordingSettings}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />

            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1-1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0 1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33 1.65 1.65 0 0 0 1.82.33l-.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
          </svg>

          Change other wordings
        </button>
      </div>

      {/* =========================
          FORM ACTIONS
          ========================= */}
      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-accent"
          disabled={saving}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />

            <path d="M17 21v-8H7v8" />

            <path d="M7 3v5h8" />
          </svg>

          {saving ? "Saving..." : "Save & add to list"}
        </button>

        <button
          type="button"
          className="btn btn-ghost"
          onClick={onReset}
        >
          Reset
        </button>
      </div>

    </form>
  );
}