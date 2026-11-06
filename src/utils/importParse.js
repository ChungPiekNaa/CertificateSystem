import * as XLSX from "xlsx";
import { buildRefId } from "./refId";

const HEADER_ALIASES = {
  participant_name: [
    "participant name",
    "name",
    "participant",
    "full name",
  ],
  user_id: ["user id", "userid", "id", "staff id"],
  ic_number: ["ic number", "ic", "ic no", "identity card", "nric"],
  course_title: ["course title", "course", "title"],
  class_id: ["class id", "classid", "class"],
  certificate_date: [
    "date",
    "certificate date",
    "completion date",
    "on",
  ],
  result: ["result", "pass/fail", "pass fail", "outcome"],
};

function normalizeHeader(h) {
  return h.trim().toLowerCase().replace(/[_\s]+/g, " ");
}

function buildHeaderMap(headers) {
  const map = {};

  headers.forEach((raw) => {
    const norm = normalizeHeader(raw);

    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if (aliases.includes(norm)) {
        map[raw] = field;
      }
    }
  });

  return map;
}

// Convert an Excel date serial number to DD/MM/YYYY
// without using JavaScript Date, so timezone does not change the date.
function formatExcelSerialDate(value) {
  const parsed = XLSX.SSF.parse_date_code(value);

  if (!parsed) {
    return "";
  }

  const day = String(parsed.d).padStart(2, "0");
  const month = String(parsed.m).padStart(2, "0");
  const year = String(parsed.y);

  return `${day}/${month}/${year}`;
}

// Normalize date values into DD/MM/YYYY
function formatCertificateDate(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  // Excel date stored as a serial number
  if (typeof value === "number") {
    return formatExcelSerialDate(value);
  }

  const text = String(value).trim();

  if (!text) {
    return "";
  }

  // Already in D/M/YYYY or DD/MM/YYYY format
  const slashMatch = text.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  );

  if (slashMatch) {
    const day = String(Number(slashMatch[1])).padStart(2, "0");
    const month = String(Number(slashMatch[2])).padStart(2, "0");
    const year = slashMatch[3];

    return `${day}/${month}/${year}`;
  }

  // Handle YYYY-MM-DD
  const isoMatch = text.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/
  );

  if (isoMatch) {
    const year = isoMatch[1];
    const month = String(Number(isoMatch[2])).padStart(2, "0");
    const day = String(Number(isoMatch[3])).padStart(2, "0");

    return `${day}/${month}/${year}`;
  }

  return text;
}

function isValidCertificateDate(date) {
  const match = String(date)
    .trim()
    .match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) {
    return false;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const dateObject = new Date(year, month - 1, day);

  return (
    dateObject.getFullYear() === year &&
    dateObject.getMonth() === month - 1 &&
    dateObject.getDate() === day
  );
}

// Accepts "Pass", "pass", "PASS", "fail", etc. Returns the canonical
// "Pass" / "Fail", or "" if the cell doesn't match either (treated as
// missing, same as a blank cell, rather than silently guessing).
function normalizeResult(value) {
  const text = String(value ?? "").trim().toLowerCase();

  if (text === "pass") return "Pass";
  if (text === "fail") return "Fail";

  return "";
}

// Accepts .csv, .xlsx, or .xls.
// certificateType: "COURSE" | "EXAM" — determines whether the Result
// column is required/validated. Resolves to { rows, headers }.
export function parseParticipantsFile(file, certificateType = "COURSE") {
  const isExam = certificateType === "EXAM";

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);

        const workbook = XLSX.read(data, {
          type: "array",
        });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // raw: true keeps Excel dates as serial numbers
        // instead of converting them into JavaScript Date objects.
        const json = XLSX.utils.sheet_to_json(sheet, {
          defval: "",
          raw: true,
        });

        if (json.length === 0) {
          resolve({
            rows: [],
            headers: [],
          });

          return;
        }

        const headers = Object.keys(json[0]);
        const headerMap = buildHeaderMap(headers);

        const rows = json.map((raw, index) => {
          const row = {
            participant_name: "",
            user_id: "",
            ic_number: "",
            course_title: "",
            class_id: "",
            certificate_date: "",
            result: "",
          };

          Object.entries(raw).forEach(([key, value]) => {
            const field = headerMap[key];

            if (!field) {
              return;
            }

            if (field === "certificate_date") {
              row[field] = formatCertificateDate(value);
            } else if (field === "result") {
              row[field] = normalizeResult(value);
            } else {
              row[field] = String(value ?? "").trim();
            }
          });

          const missing = [];

          if (!row.participant_name) {
            missing.push("name");
          }

          if (!row.user_id) {
            missing.push("user ID");
          }

          if (!row.ic_number) {
            missing.push("IC number");
          }

          if (!row.course_title) {
            missing.push("course title");
          }

          if (!row.class_id) {
            missing.push("class ID");
          }

          if (!row.certificate_date) {
            missing.push("date");
          } else if (!isValidCertificateDate(row.certificate_date)) {
            missing.push("valid date (DD/MM/YYYY)");
          }

          // Result is only required/validated for Exam uploads.
          if (isExam && !row.result) {
            missing.push("result (Pass or Fail)");
          }

          if (!isExam) {
            row.result = "";
          }

          const refId = buildRefId(
            row.ic_number,
            row.class_id,
            row.certificate_date
          );

          return {
            ...row,
            ref_id: refId,

            // Used internally to identify the original Excel row.
            // The visible table uses its own No. starting from 1.
            _rowNumber: index + 2,

            _valid: missing.length === 0,
            _missing: missing,
          };
        });

        resolve({
          rows,
          headers,
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(reader.error);

    reader.readAsArrayBuffer(file);
  });
}

// certificateType: "COURSE" | "EXAM" — produces the matching template,
// with a 5th Result column only on the Exam version.
export function downloadTemplate(certificateType = "COURSE") {
  const isExam = certificateType === "EXAM";

  const csv = isExam
    ? "Participant Name,User ID,IC Number,Course Title,Class ID,Date,Result\n" +
      "Alex Kueh,1234567,990101-13-4567,Workplace Safety Fundamentals,CLS2026A,01/01/2026,Pass\n"
    : "Participant Name,User ID,IC Number,Course Title,Class ID,Date\n" +
      "Alex Kueh,1234567,990101-13-4567,Workplace Safety Fundamentals,CLS2026A,01/01/2026\n";

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = isExam
    ? "certificate-bulk-template-exam.csv"
    : "certificate-bulk-template-course.csv";
  a.click();

  URL.revokeObjectURL(url);
}