import { useState } from "react";
import CertificatePreview from "./CertificatePreview";

export default function ViewCertificateModal({
  record,
  onClose,
  onDelete,
  onEdit,
}) {
  const [deleting, setDeleting] = useState(false);

  if (!record) return null;

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete the certificate for ${record.participant_name}? This can't be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      await onDelete(record.id);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(record);
    }
  };

  const isDeleted = record.status === "DELETED";

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal">

        {/* =========================
            HEADER
            ========================= */}
        <div className="modal-head">
          <h3>Certificate</h3>

          <button
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

        {/* =========================
            CERTIFICATE PREVIEW
            ========================= */}
        <div
          className="preview-stage"
          style={{ background: "#E7ECF2" }}
        >
          <CertificatePreview
            printable

            /* Certificate reference */
            refId={record.ref_id}

            /* Participant information */
            name={record.participant_name}
            userID={record.user_id}

            /* Course information */
            courseTitle={record.course_title}

            /* Certificate date */
            date={record.certificate_date}

            /* Certificate wording */
            presentedText={record.presented_text}
            completingText={record.completing_text}
            onText={record.on_text}
            byText={record.by_text}
            facilityText={record.facility_text}
            divText={record.div_text}
          />
        </div>

        {/* =========================
            ACTIONS
            ========================= */}
        <div className="modal-actions">

          {/* Print */}
          <button
            className="btn btn-primary btn-sm"
            onClick={() => window.print()}
            disabled={isDeleted}
          >
            Print
          </button>

          {/* Edit */}
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleEdit}
            disabled={isDeleted}
          >
            Edit
          </button>

          {/* Delete */}
          <button
            className="btn btn-danger-ghost btn-sm"
            style={{ marginLeft: "auto" }}
            onClick={handleDelete}
            disabled={deleting || isDeleted}
          >
            {isDeleted
              ? "Deleted"
              : deleting
              ? "Deleting..."
              : "Delete"}
          </button>

        </div>

      </div>
    </div>
  );
}