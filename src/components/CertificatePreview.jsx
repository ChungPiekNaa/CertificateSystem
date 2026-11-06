import { forwardRef, useEffect, useRef } from "react";

// Reference width the font sizes in certificate.css were designed at
const BASE_WIDTH = 640;

const CertificatePreview = forwardRef(function CertificatePreview(
  {
    certificateType = "COURSE",

    refId,
    name,
    userID,
    courseTitle,
    date,
    result,
    presentedText,
    completingText,
    onText,
    byText,
    facilityText,
    divText,
    resultLabelText,

    // Individual font-size controls
    nameScale = 1,
    userIDScale = 1,
    courseTitleScale = 1,
    dateScale = 1,

    // Wording font-size controls
    wordingScales = {},

    printable = false,
    // Used by the bulk-generate flow: one certificate per printed page,
    // rendered off-screen until print time. See certificate.css.
    bulkPrintable = false,
  },
  forwardedRef
) {
  const localRef = useRef(null);
  const isExam = certificateType === "EXAM";

  // Keep forwarded ref pointed to the certificate DOM node
  useEffect(() => {
    if (!forwardedRef) return;

    if (typeof forwardedRef === "function") {
      forwardedRef(localRef.current);
    } else {
      forwardedRef.current = localRef.current;
    }
  }, [forwardedRef]);

  // Automatically calculate certificate scale when its size changes
  useEffect(() => {
    const node = localRef.current;

    if (!node || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width;

      if (width) {
        node.style.setProperty(
          "--cert-scale",
          String(width / BASE_WIDTH)
        );
      }
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  // Wording scales
  const presentedScale =
    wordingScales?.presented_text ?? 1;

  const completingScale =
    wordingScales?.completing_text ?? 1;

  const onScale =
    wordingScales?.on_text ?? 1;

  const byScale =
    wordingScales?.by_text ?? 1;

  const facilityScale =
    wordingScales?.facility_text ?? 1;

  const divScale =
    wordingScales?.div_text ?? 1;

  const resultLabelScale =
    wordingScales?.result_label_text ?? 1;

  const heading = isExam
    ? "Examination Result Slip"
    : "Certificate of Completion";

  return (
    <div
      ref={localRef}
      className={`certificate ${
        printable ? "print-target" : ""
      } ${bulkPrintable ? "bulk-print-target" : ""}`}
    >
      {/* Background */}
      <img
        className="certificate-background"
        src="/Sarawak Energy.jpg"
        alt=""
      />

      {/* Reference ID */}
      <div className="cert-refno">
        Ref ID: {refId}
      </div>

      <div className="cert-inner">
        {/* Certificate heading */}
        <h2 className="cert-heading">
          {heading}
        </h2>

        {/* Presented line */}
        <p
          className="cert-line"
          style={{
            "--wording-scale": presentedScale,
          }}
        >
          {presentedText ||
            (isExam
              ? "This result slip is presented to"
              : "This certificate is presented to")}
        </p>

        {/* Participant name */}
        <div
          className="cert-name"
          style={{
            "--text-scale": nameScale,
          }}
        >
          {name || "Participant Name"}
        </div>

        {/* User ID */}
        <p
          className="cert-user-id"
          style={{
            "--user-id-scale": userIDScale,
          }}
        >
          {userID || "User ID"}
        </p>

        {/* Completion line */}
        <p
          className="cert-line"
          style={{
            "--wording-scale": completingScale,
          }}
        >
          {completingText ||
            (isExam
              ? "for attending examination on"
              : "for completing the course titled")}
        </p>

        {/* Course title */}
        <div
          className="cert-title"
          style={{
            "--text-scale": courseTitleScale,
          }}
        >
          {courseTitle || "Course Title"}
        </div>

        {/* On + Date - MUST stay on the same line */}
        <p
          className="cert-on"
          style={{
            "--wording-scale": onScale,
          }}
        >
          <span className="cert-on-label">
            {onText || "On:"}
          </span>

          <span className="cert-on-date">
            {date || "Date"}
          </span>
        </p>

        {/* Flexible spacer */}
        <div className="cert-spacer" />

        {/* By line */}
        <p
          className="cert-by"
          style={{
            "--wording-scale": byScale,
          }}
        >
          {byText || "conducted by"}
        </p>

        {/* Facility */}
        <p
          className="cert-facility"
          style={{
            "--wording-scale": facilityScale,
          }}
        >
          {facilityText || "Sarawak Energy Learning Centre"}
        </p>

        {/* Division */}
        <p
          className="cert-div"
          style={{
            "--wording-scale": divScale,
          }}
        >
          {divText ||
            "Learning & Development and Capability Management Division"}
        </p>
        
        {/* Result block (EXAM certificates only) */}
        {isExam && (
          <>
            <p
              className="cert-result-label"
              style={{
                "--result-label-scale": resultLabelScale,
              }}
            >
              {resultLabelText || "Result"}
            </p>

            <p
              className="cert-result-value"
              style={{
                "--result-label-scale": resultLabelScale,
              }}
            >
              {result || "Pass"}
            </p>
          </>
        )}
      </div>
    </div>
  );
});

export default CertificatePreview;