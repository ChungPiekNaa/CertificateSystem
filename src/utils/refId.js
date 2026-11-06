// Builds the certificate's Ref ID from its three identifying pieces.
// Only the last 4 digits of the IC number are used — everything
// non-digit (dashes, spaces) is stripped first, so "990101-13-4567"
// and "990101134567" both produce the same last-4 ("4567").
export function buildRefId(icNumber, classId, certificateDate) {
  const last4 = String(icNumber || "")
    .replace(/\D/g, "")
    .slice(-4);

  const parts = [last4, String(classId || "").trim(), String(certificateDate || "").trim()]
    .filter(Boolean);

  return parts.join(" ");
}