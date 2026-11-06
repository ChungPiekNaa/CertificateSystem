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
  const [typeFilter, setTypeFilter] = useState("ALL"); // "ALL" | "COURSE" | "EXAM"
  const [activeRecord, setActiveRecord] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return certificates.filter((r) => {
      const matchesType =
        typeFilter === "ALL" ||
        (r.certificate_type || "COURSE") === typeFilter;

      if (!matchesType) return false;

      if (!q) return true;

      return [
        r.ref_id,
        r.user_id,
        r.ic_number,
        r.class_id,
        r.participant_name,
        r.course_title,
        r.certificate_date,
        r.created_at,
        r.certificate_type,
        r.result,
      ].some((value) => String(value ?? "").toLowerCase().includes(q));
    });
  }, [certificates, query, typeFilter]);

  const filteredActive = useMemo(
    () => filtered.filter((record) => record.status === "ACTIVE"),
    [filtered]
  );

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
    if (filteredActive.length === 0) {
      showToast("No active certificates to export", true);
      return;
    }

    const exportData = filteredActive.map((record) => {
      const isExam = record.certificate_type === "EXAM";

      return {
        "Ref ID": record.ref_id,
        Type: isExam ? "Exam" : "Course",
        "User ID": record.user_id,
        "IC Number": record.ic_number,
        "Class ID": record.class_id,
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
        Result: isExam ? record.result || "" : "",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    worksheet["!cols"] = [
      { wch: 12 }, // Ref ID
      { wch: 10 }, // Type
      { wch: 15 }, // User ID
      { wch: 16 }, // IC Number
      { wch: 14 }, // Class ID
      { wch: 25 }, // Participant Name
      { wch: 35 }, // Course Title
      { wch: 18 }, // Date Attended
      { wch: 18 }, // Date Issued
      { wch: 10 }, // Result
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Certificates"
    );

    const date = new Date().toISOString().slice(0, 10);

    const typePrefix =
      typeFilter === "COURSE"
        ? "Course_"
        : typeFilter === "EXAM"
        ? "Exam_"
        : "";

    const searchSuffix = query.trim() ? "_Filtered" : "";

    const filename = `${typePrefix}Certificate_Records${searchSuffix}_${date}.xlsx`;

    XLSX.writeFile(workbook, filename);

    showToast(
      `${filteredActive.length} certificate(s) exported${
        query.trim() || typeFilter !== "ALL" ? " (filtered)" : ""
      }`
    );
  };

  return (
    <section className="participant-list-page">
      <div className="page-head">
        <div>
          <h1>Non-Staff Participant List</h1>

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
            disabled={loading || filteredActive.length === 0}
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

        <div className="type-filter" role="group" aria-label="Filter by certificate type">
          <button
            type="button"
            className={typeFilter === "ALL" ? "active" : ""}
            onClick={() => setTypeFilter("ALL")}
          >
            All
          </button>
          <button
            type="button"
            className={typeFilter === "COURSE" ? "active" : ""}
            onClick={() => setTypeFilter("COURSE")}
          >
            Course
          </button>
          <button
            type="button"
            className={typeFilter === "EXAM" ? "active" : ""}
            onClick={() => setTypeFilter("EXAM")}
          >
            Exam
          </button>
        </div>
      </div>

      <HistoryTable
        records={filtered}
        loading={loading}
        onView={setActiveRecord}
        typeFilter={typeFilter}
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