import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import HistoryTable from "../components/HistoryTable";
import ViewCertificateModal from "../components/ViewCertificateModal";
import { useCertificates } from "../hooks/useCertificates";
import { useToast } from "../context/ToastContext";

export default function ParticipantListPage() {
  const { certificates, loading, remove } = useCertificates();
  const showToast = useToast();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [activeRecord, setActiveRecord] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return certificates;

    return certificates.filter((r) =>
      [
        r.ref_id,
        r.user_id,
        r.participant_name,
        r.course_title,
        r.certificate_date,
        r.created_at,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(q)
      )
    );
  }, [certificates, query]);

  const handleDelete = async (id) => {
    try {
      await remove(id);

      showToast("Certificate deleted");
      setActiveRecord(null);
    } catch (err) {
      console.error(err);
      showToast("Could not delete record", true);
    }
  };

  const handleEdit = (record) => {
    setActiveRecord(null);

    navigate("/", {
      state: {
        editCertificate: record,
      },
    });
  };

  const handleExportExcel = () => {
    const activeCertificates = certificates.filter(
      (record) => record.status === "ACTIVE"
    );

    if (activeCertificates.length === 0) {
      showToast("No active certificates to export", true);
      return;
    }

    const exportData = activeCertificates.map((record) => ({
      "Ref ID": record.ref_id,
      "User ID": record.user_id,
      "Participant Name": record.participant_name,
      "Course Title": record.course_title,
      "Date Attended": record.certificate_date
        ? new Date(record.certificate_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "",
      "Date Issued": record.created_at
        ? new Date(record.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    worksheet["!cols"] = [
      { wch: 12 },
      { wch: 15 },
      { wch: 25 },
      { wch: 35 },
      { wch: 18 },
      { wch: 18 },
      { wch: 35 },
      { wch: 35 },
      { wch: 15 },
      { wch: 25 },
      { wch: 35 },
      { wch: 50 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Certificates"
    );

    const date = new Date().toISOString().slice(0, 10);

    XLSX.writeFile(
      workbook,
      `Certificate_Records_${date}.xlsx`
    );

    showToast(
      `${activeCertificates.length} active certificate(s) exported`
    );
  };

  return (
    <section className="participant-list-page">
      <div className="page-head">
        <div>
          <h1>Participant List</h1>

          <p>
            View all generated certificates with the most recent displayed first
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <button
            className="btn btn-excel btn-sm"
            onClick={handleExportExcel}
            disabled={loading}
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
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M8 13h8M8 17h8" />
            </svg>

            Export Excel
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate("/")}
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
            >
              <path d="M12 5v14M5 12h14" />
            </svg>

            New Certificate
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>

          <input
            type="text"
            placeholder="Search all columns"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <HistoryTable
        records={filtered}
        loading={loading}
        onView={setActiveRecord}
      />

      {activeRecord && (
        <ViewCertificateModal
          record={activeRecord}
          onClose={() => setActiveRecord(null)}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}
    </section>
  );
}