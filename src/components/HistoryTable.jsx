import EmptyState from "./EmptyState";
import { formatDate } from "../utils/format";

function SkeletonRows({ showResult }) {
  return Array.from({ length: 4 }).map((_, i) => (
    <tr className="skeleton-row" key={i}>
      <td>
        <div className="skeleton-bar" style={{ width: 70 }} />
      </td>
      <td>
        <div className="skeleton-bar" style={{ width: 60 }} />
      </td>
      <td>
        <div className="skeleton-bar" style={{ width: 120 }} />
      </td>
      <td>
        <div className="skeleton-bar" style={{ width: 90 }} />
      </td>
      <td>
        <div className="skeleton-bar" style={{ width: 80 }} />
      </td>
      <td>
        <div className="skeleton-bar" style={{ width: 90 }} />
      </td>
      <td>
        <div className="skeleton-bar" style={{ width: 180 }} />
      </td>
      <td>
        <div className="skeleton-bar" style={{ width: 100 }} />
      </td>
      <td>
        <div className="skeleton-bar" style={{ width: 100 }} />
      </td>
      {showResult && (
        <td>
          <div className="skeleton-bar" style={{ width: 60 }} />
        </td>
      )}
      <td />
    </tr>
  ));
}

export default function HistoryTable({ records, loading, onView, typeFilter = "ALL" }) {
  // The Result column only makes sense when Exam certificates could
  // actually be in view — hidden entirely (not just blank) when the
  // list is filtered specifically to Course, since no row in that view
  // will ever have a result.
  const showResultColumn = typeFilter !== "COURSE";
  const columnCount = showResultColumn ? 11 : 10;

  return (
    <div className="card table-card">
      <table className="list">
        <thead>
          <tr>
            <th>Ref ID</th>
            <th>Type</th>
            <th>Participant</th>
            <th>User ID</th>
            <th>IC Number</th>
            <th>Class ID</th>
            <th>Course title</th>
            <th>Date completed</th>
            <th>Date issued</th>
            {showResultColumn && <th>Result</th>}
            <th></th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <SkeletonRows showResult={showResultColumn} />
          ) : records.length === 0 ? (
            <tr>
              <td colSpan={columnCount}>
                <EmptyState
                  title="No certificates yet"
                  description="Generate your first certificate and it will show up here."
                />
              </td>
            </tr>
          ) : (
            records.map((r) => {
              const isDeleted = r.status === "DELETED";
              const isExam = r.certificate_type === "EXAM";
              const resultLower = (r.result || "").toLowerCase();

              return (
                <tr
                  key={r.id}
                  className={isDeleted ? "deleted-certificate-row" : ""}
                >
                  <td>
                    <span
                      className={`ref-pill ${
                        isDeleted ? "deleted-ref-pill" : ""
                      }`}
                    >
                      {r.ref_id}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`type-badge ${
                        isExam ? "exam" : "course"
                      } ${isDeleted ? "deleted-type-badge" : ""}`}
                    >
                      {isExam ? "Exam" : "Course"}
                    </span>
                  </td>

                  <td>{r.participant_name}</td>

                  <td>{r.user_id}</td>

                  <td>{r.ic_number}</td>

                  <td>{r.class_id}</td>

                  <td>{r.course_title}</td>

                  <td>{formatDate(r.certificate_date)}</td>

                  <td>{formatDate(r.created_at)}</td>

                  {showResultColumn && (
                    <td>
                      {isExam && (
                        <span
                          className={`result-pill ${
                            resultLower === "pass"
                              ? "pass"
                              : resultLower === "fail"
                              ? "fail"
                              : ""
                          }`}
                        >
                          {r.result || "—"}
                        </span>
                      )}
                    </td>
                  )}

                  <td>
                    <div className="row-actions">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => onView(r)}
                        disabled={isDeleted}
                        title={
                          isDeleted
                            ? "This certificate has been deleted"
                            : "View certificate"
                        }
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}