import { useRef, useState } from "react";
import {
  parseParticipantsFile,
  downloadTemplate,
} from "../utils/importParse";
import { useCertificates } from "../hooks/useCertificates";
import {
  useWordingSettings,
  DEFAULT_COURSE_WORDING,
  DEFAULT_EXAM_WORDING,
} from "../hooks/useWordingSettings";
import { useToast } from "../context/ToastContext";
import CertificatePreview from "../components/CertificatePreview";

function defaultsFor(type) {
  return type === "EXAM" ? DEFAULT_EXAM_WORDING : DEFAULT_COURSE_WORDING;
}

export default function BulkGeneratePage() {
  const { createMany } = useCertificates();
  const { courseSettings, examSettings } = useWordingSettings();
  const showToast = useToast();

  const fileInputRef = useRef(null);

  const [certificateType, setCertificateType] = useState("COURSE");
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedRecords, setSavedRecords] = useState(null);

  const isExam = certificateType === "EXAM";

  const handleChangeCertificateType = (newType) => {
    if (newType === certificateType) return;

    setCertificateType(newType);
    setRows([]);
    setFileName("");
    setSavedRecords(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFile = async (file) => {
    if (!file) return;

    setFileName(file.name);
    setSavedRecords(null);

    try {
      const { rows: parsed } = await parseParticipantsFile(
        file,
        certificateType
      );

      if (parsed.length === 0) {
        showToast("That file has no rows to import", true);
        return;
      }

      setRows(parsed);
    } catch (err) {
      console.error(err);
      showToast(
        "Couldn't read that file — is it a valid CSV or Excel file?",
        true
      );
    }
  };

  const removeRow = (rowNumber) => {
    setRows((prev) =>
      prev.filter((r) => r._rowNumber !== rowNumber)
    );
  };

  const validRows = rows.filter((r) => r._valid);
  const invalidRows = rows.filter((r) => !r._valid);

  const handleGenerate = async () => {
    if (validRows.length === 0) return;

    setSaving(true);

    try {
      const saved = certificateType === "EXAM" ? examSettings : courseSettings;
      const wording = {
        ...defaultsFor(certificateType),
        ...(saved || {}),
      };

      const payload = validRows.map((r) => ({
        participant_name: r.participant_name,
        user_id: r.user_id,
        ic_number: r.ic_number,
        course_title: r.course_title,
        class_id: r.class_id,
        certificate_date: r.certificate_date,
        certificate_type: certificateType,
        ref_id: r.ref_id,
        presented_text: wording.presented_text,
        completing_text: wording.completing_text,
        on_text: wording.on_text,
        by_text: wording.by_text,
        facility_text: wording.facility_text,
        div_text: wording.div_text,
        result: isExam ? r.result : null,
        result_label_text: isExam
          ? wording.result_label_text || "Result"
          : null,
      }));

      const saved_records = await createMany(payload);

      setSavedRecords(saved_records);

      showToast(
        `${saved_records.length} certificate${
          saved_records.length === 1 ? "" : "s"
        } generated`
      );
    } catch (err) {
      console.error(err);
      showToast(
        "Could not save — check your Supabase setup",
        true
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStartOver = () => {
    setRows([]);
    setFileName("");
    setSavedRecords(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Bulk Generate</h1>
          <p>
            Upload a participant list to generate many certificates at
            once
          </p>
        </div>

        <div
          className="cert-type-switch"
          role="group"
          aria-label="Certificate type"
        >
          <button
            type="button"
            className={certificateType === "COURSE" ? "active" : ""}
            onClick={() => handleChangeCertificateType("COURSE")}
          >
            Course
          </button>
          <button
            type="button"
            className={isExam ? "active" : ""}
            onClick={() => handleChangeCertificateType("EXAM")}
          >
            Exam
          </button>
        </div>
      </div>

      {!savedRecords && (
        <>
          <div className="card bulk-upload-card">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) =>
                handleFile(e.target.files?.[0])
              }
              id="bulkFile"
            />

            <label
              htmlFor="bulkFile"
              className="bulk-upload-dropzone"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="M17 8l-5-5-5 5" />
                <path d="M12 3v12" />
              </svg>

              <span>
                {fileName ||
                  `Click to upload a CSV or Excel file (${
                    isExam ? "Exam" : "Course"
                  })`}
              </span>
            </label>

            <button
              type="button"
              className="text-link"
              onClick={() => downloadTemplate(certificateType)}
            >
              Download {isExam ? "Exam" : "Course"} CSV template
            </button>
          </div>

          {rows.length > 0 && (
            <div className="card bulk-preview-card">
              <div className="bulk-preview-summary">
                <strong>{validRows.length}</strong>{" "}
                ready to generate

                {invalidRows.length > 0 && (
                  <span className="bulk-preview-warning">
                    {" "}
                    · {invalidRows.length} skipped (missing
                    required fields)
                  </span>
                )}
              </div>

              <div
                className="table-card"
                style={{ marginBottom: 18 }}
              >
                <table className="list">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Ref ID</th>
                      <th>Name</th>
                      <th>User ID</th>
                      <th>IC Number</th>
                      <th>Course title</th>
                      <th>Class ID</th>
                      <th>Date</th>
                      {isExam && <th>Result</th>}
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((r, index) => (
                      <tr
                        key={r._rowNumber}
                        style={{
                          opacity: r._valid ? 1 : 0.5,
                        }}
                      >
                        <td>{index + 1}</td>

                        <td>{r.ref_id || <em>—</em>}</td>

                        <td>
                          {r.participant_name || (
                            <em>missing</em>
                          )}
                        </td>

                        <td>
                          {r.user_id || <em>missing</em>}
                        </td>

                        <td>
                          {r.ic_number || <em>missing</em>}
                        </td>

                        <td>
                          {r.course_title || (
                            <em>missing</em>
                          )}
                        </td>

                        <td>
                          {r.class_id || <em>missing</em>}
                        </td>

                        <td>
                          {r.certificate_date || (
                            <em>missing</em>
                          )}
                        </td>

                        {isExam && (
                          <td>
                            {r.result || <em>missing</em>}
                          </td>
                        )}

                        <td>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() =>
                              removeRow(r._rowNumber)
                            }
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="form-actions">
                <button
                  className="btn btn-accent"
                  onClick={handleGenerate}
                  disabled={
                    saving || validRows.length === 0
                  }
                >
                  {saving
                    ? "Generating..."
                    : `Generate ${validRows.length} certificate${
                        validRows.length === 1 ? "" : "s"
                      }`}
                </button>

                <button
                  className="btn btn-ghost"
                  onClick={handleStartOver}
                >
                  Start over
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {savedRecords && (
        <div className="card bulk-preview-card">
          <p>
            {savedRecords.length} certificates saved to the
            participant list.
          </p>

          <div className="form-actions">
            <button
              className="btn btn-primary"
              onClick={() => window.print()}
            >
              Print all {savedRecords.length}
            </button>

            <button
              className="btn btn-ghost"
              onClick={handleStartOver}
            >
              Upload another list
            </button>
          </div>

          <div className="bulk-print-sheet">
            {savedRecords.map((r) => (
              <CertificatePreview
                key={r.id}
                bulkPrintable
                certificateType={r.certificate_type}
                refId={r.ref_id}
                name={r.participant_name}
                userID={r.user_id}
                courseTitle={r.course_title}
                date={r.certificate_date}
                result={r.result}
                resultLabelText={r.result_label_text}
                presentedText={r.presented_text}
                completingText={r.completing_text}
                onText={r.on_text}
                byText={r.by_text}
                facilityText={r.facility_text}
                divText={r.div_text}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}