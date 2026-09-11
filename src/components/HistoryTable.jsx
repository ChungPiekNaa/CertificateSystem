import EmptyState from "./EmptyState";
import { formatDate } from "../utils/format";

function SkeletonRows() {
  return Array.from({ length: 4 }).map((_, i) => (
    <tr className="skeleton-row" key={i}>
      <td>
        <div className="skeleton-bar" style={{ width: 70 }} />
      </td>
      <td>
        <div className="skeleton-bar" style={{ width: 90 }} />
      </td>
      <td>
        <div className="skeleton-bar" style={{ width: 120 }} />
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
      <td />
    </tr>
  ));
}

export default function HistoryTable({ records, loading, onView }) {
  return (
    <div className="card table-card">
      <table className="list">
        <thead>
          <tr>
            <th>Ref ID</th>
            <th>User ID</th>
            <th>Participant</th>
            <th>Course title</th>
            <th>Date attended</th>
            <th>Date issued</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <SkeletonRows />
          ) : records.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <EmptyState
                  title="No certificates yet"
                  description="Generate your first certificate and it will show up here."
                />
              </td>
            </tr>
          ) : (
            records.map((r) => {
              const isDeleted = r.status === "DELETED";

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

                  <td>{r.user_id}</td>

                  <td>{r.participant_name}</td>

                  <td>{r.course_title}</td>

                  <td>{formatDate(r.certificate_date)}</td>

                  <td>{formatDate(r.created_at)}</td>

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