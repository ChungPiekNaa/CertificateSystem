import { NavLink } from "react-router-dom";

export default function Sidebar({ open, onClose }) {
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      {/* =====================================================
          SIDEBAR HEADER
          ===================================================== */}
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <img
            src="/Sarawak Energy Logo.png"
            alt="Sarawak Energy"
            className="sarawak-energy-logo"
          />

          <span>Certificate System</span>
        </div>

        <button
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close menu"
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

      {/* =====================================================
          PARTICIPANT LIST
          ===================================================== */}
      <NavLink
        to="/history"
        onClick={onClose}
        className={({ isActive }) =>
          `nav-item ${isActive ? "active" : ""}`
        }
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>

        <span>Participant List</span>
      </NavLink>

      {/* =====================================================
          GENERATE CERTIFICATE
          ===================================================== */}
      <NavLink
        to="/"
        end
        onClick={onClose}
        className={({ isActive }) =>
          `nav-item ${isActive ? "active" : ""}`
        }
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>

        <span>Generate Certificate</span>
      </NavLink>

      {/* =====================================================
          SIDEBAR FOOTER
          ===================================================== */}
      <div className="sidebar-footer">
        Learning & Development and Capability Management
      </div>
    </aside>
  );
}