import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CertificateForm from "../components/CertificateForm";
import CertificatePreview from "../components/CertificatePreview";
import WordingSettingsModal from "../components/WordingSettingsModal";
import { useCertificates } from "../hooks/useCertificates";
import {
  useWordingSettings,
  DEFAULT_COURSE_WORDING,
  DEFAULT_EXAM_WORDING,
} from "../hooks/useWordingSettings";
import { useToast } from "../context/ToastContext";
import { buildRefId } from "../utils/refId";

const DEFAULT_COURSE_WORDING_SCALES = {
  presented_text: 1,
  completing_text: 1,
  on_text: 1,
  by_text: 1,
  facility_text: 1,
  div_text: 1,
};

const DEFAULT_EXAM_WORDING_SCALES = {
  presented_text: 1,
  completing_text: 1,
  on_text: 1,
  by_text: 1,
  facility_text: 1,
  div_text: 1,
  result_label_text: 1,
};

function defaultsFor(type) {
  return type === "EXAM" ? DEFAULT_EXAM_WORDING : DEFAULT_COURSE_WORDING;
}

function scaleDefaultsFor(type) {
  return type === "EXAM"
    ? DEFAULT_EXAM_WORDING_SCALES
    : DEFAULT_COURSE_WORDING_SCALES;
}

export default function GenerateCertificatePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { create, update } = useCertificates();
  const { courseSettings, examSettings, saveCourse, saveExam } =
    useWordingSettings();
  const showToast = useToast();

  const editCertificate = location.state?.editCertificate || null;
  const isEditMode = Boolean(editCertificate);

  const [certificateType, setCertificateType] = useState("COURSE");

  const [name, setName] = useState("");
  const [userID, setUserID] = useState("");
  const [icNumber, setIcNumber] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState("");
  const [result, setResult] = useState("");

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [wordingModalOpen, setWordingModalOpen] = useState(false);

  const [localSettings, setLocalSettings] = useState(DEFAULT_COURSE_WORDING);

  const [nameScale, setNameScale] = useState(1);
  const [userIDScale, setUserIDScale] = useState(1);
  const [courseTitleScale, setCourseTitleScale] = useState(1);
  const [dateScale, setDateScale] = useState(1);
  const [resultScale, setResultScale] = useState(1);

  const [wordingScales, setWordingScales] = useState(
    DEFAULT_COURSE_WORDING_SCALES
  );

  const certRef = useRef(null);

  // Ref ID is now purely derived from IC Number + Class ID + Date — no
  // database round-trip needed to preview it, unlike the old
  // auto-incrementing version. It recalculates on every keystroke.
  const refId = buildRefId(icNumber, classId, date);

  // Load existing certificate when Edit is selected
  useEffect(() => {
    if (!editCertificate) {
      return;
    }

    const loadedType = editCertificate.certificate_type || "COURSE";

    setCertificateType(loadedType);

    setName(editCertificate.participant_name || "");
    setUserID(editCertificate.user_id || "");
    setIcNumber(editCertificate.ic_number || "");
    setCourseTitle(editCertificate.course_title || "");
    setClassId(editCertificate.class_id || "");
    setDate(editCertificate.certificate_date || "");
    setResult(editCertificate.result || "");

    const defaults = defaultsFor(loadedType);

    setLocalSettings({
      presented_text:
        editCertificate.presented_text || defaults.presented_text,

      completing_text:
        editCertificate.completing_text || defaults.completing_text,

      on_text: editCertificate.on_text || defaults.on_text,

      by_text: editCertificate.by_text || defaults.by_text,

      facility_text:
        editCertificate.facility_text || defaults.facility_text,

      div_text: editCertificate.div_text || defaults.div_text,

      ...(loadedType === "EXAM"
        ? {
            result_label_text:
              editCertificate.result_label_text ||
              defaults.result_label_text,
          }
        : {}),
    });

    setFormError("");
  }, [editCertificate]);

  // Load default wording for a new certificate, and whenever the type
  // switch is toggled while creating a new certificate.
  useEffect(() => {
    if (isEditMode) {
      return;
    }

    const saved =
      certificateType === "EXAM" ? examSettings : courseSettings;

    if (saved) {
      setLocalSettings({
        ...defaultsFor(certificateType),
        ...saved,
      });
      setWordingScales(scaleDefaultsFor(certificateType));
    }
  }, [certificateType, courseSettings, examSettings, isEditMode]);

  // TYPE SWITCH
  const handleChangeCertificateType = (newType) => {
    if (newType === certificateType) return;

    setCertificateType(newType);
    setResult("");
    setResultScale(1);
    setFormError("");
    // localSettings + wordingScales reset automatically via the effect above
  };

  // FONT SIZE HANDLERS
  const handleChangeNameScale = (newScale) => {
    setNameScale(Number(newScale));
  };

  const handleChangeUserIDScale = (newScale) => {
    setUserIDScale(Number(newScale));
  };

  const handleChangeCourseTitleScale = (newScale) => {
    setCourseTitleScale(Number(newScale));
  };

  const handleChangeDateScale = (newScale) => {
    setDateScale(Number(newScale));
  };

  const handleChangeResultScale = (newScale) => {
    setResultScale(Number(newScale));
  };

  const handleChangeWordingScale = (key, newScale) => {
    setWordingScales((prev) => ({
      ...prev,
      [key]: Number(newScale),
    }));
  };

  // WORDING SETTINGS
  const handleSaveWording = async (newSettings) => {
    try {
      const updatedSettings = newSettings || localSettings;

      setLocalSettings({
        ...defaultsFor(certificateType),
        ...updatedSettings,
      });

      if (certificateType === "EXAM") {
        await saveExam(updatedSettings);
      } else {
        await saveCourse(updatedSettings);
      }

      showToast("Wording settings saved");
    } catch (err) {
      console.error(err);
      showToast("Could not save wording settings", true);
    }
  };

  // SAVE CERTIFICATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isExam = certificateType === "EXAM";

    if (
      !name.trim() ||
      !userID.trim() ||
      !icNumber.trim() ||
      !courseTitle.trim() ||
      !classId.trim() ||
      !date.trim() ||
      (isExam && !result.trim())
    ) {
      setFormError(
        isExam
          ? "Name, User ID, IC Number, course title, Class ID, date and result are required"
          : "Name, User ID, IC Number, course title, Class ID and date are required"
      );
      return;
    }

    setFormError("");
    setSaving(true);

    try {
      const payload = {
        participant_name: name.trim(),
        user_id: userID.trim(),
        ic_number: icNumber.trim(),
        course_title: courseTitle.trim(),
        class_id: classId.trim(),
        certificate_date: date.trim(),
        certificate_type: certificateType,

        // Recomputed from the current field values every save — not a
        // stored sequence, so it always reflects what's actually on
        // the certificate, including after an edit.
        ref_id: buildRefId(icNumber.trim(), classId.trim(), date.trim()),

        presented_text: localSettings.presented_text,
        completing_text: localSettings.completing_text,
        on_text: localSettings.on_text,
        by_text: localSettings.by_text,
        facility_text: localSettings.facility_text,
        div_text: localSettings.div_text,

        result: isExam ? result.trim() : null,
        result_label_text: isExam
          ? localSettings.result_label_text || "Result"
          : null,
      };

      let saved;

      if (isEditMode) {
        saved = await update(editCertificate.id, payload);

        showToast(
          `Certificate updated for ${saved.participant_name}`
        );

        navigate("/history");
      } else {
        saved = await create(payload);

        showToast(
          `Certificate saved for ${saved.participant_name}`
        );
      }
    } catch (err) {
      console.error(err);

      showToast(
        isEditMode
          ? "Could not update — check your Supabase setup"
          : "Could not save — check your Supabase setup",
        true
      );
    } finally {
      setSaving(false);
    }
  };

  // RESET FORM
  const handleReset = () => {
    if (isEditMode) {
      const loadedType = editCertificate.certificate_type || "COURSE";
      const defaults = defaultsFor(loadedType);

      setCertificateType(loadedType);
      setName(editCertificate.participant_name || "");
      setUserID(editCertificate.user_id || "");
      setIcNumber(editCertificate.ic_number || "");
      setCourseTitle(editCertificate.course_title || "");
      setClassId(editCertificate.class_id || "");
      setDate(editCertificate.certificate_date || "");
      setResult(editCertificate.result || "");

      setLocalSettings({
        presented_text:
          editCertificate.presented_text || defaults.presented_text,

        completing_text:
          editCertificate.completing_text || defaults.completing_text,

        on_text: editCertificate.on_text || defaults.on_text,

        by_text: editCertificate.by_text || defaults.by_text,

        facility_text:
          editCertificate.facility_text || defaults.facility_text,

        div_text: editCertificate.div_text || defaults.div_text,

        ...(loadedType === "EXAM"
          ? {
              result_label_text:
                editCertificate.result_label_text ||
                defaults.result_label_text,
            }
          : {}),
      });
    } else {
      setName("");
      setUserID("");
      setIcNumber("");
      setCourseTitle("");
      setClassId("");
      setDate("");
      setResult("");
      setFormError("");

      const saved =
        certificateType === "EXAM" ? examSettings : courseSettings;

      setLocalSettings({
        ...defaultsFor(certificateType),
        ...(saved || {}),
      });

      setNameScale(1);
      setUserIDScale(1);
      setCourseTitleScale(1);
      setDateScale(1);
      setResultScale(1);

      setWordingScales(scaleDefaultsFor(certificateType));
    }

    setFormError("");
  };

  return (
    <div className="generate-shell">

      {/* =========================
          PAGE HEADER
          ========================= */}
      <div className="page-head">
        <div>
          <h1>
            {isEditMode
              ? "Edit Certificate"
              : "Generate Certificate"}
          </h1>

          <p>
            {isEditMode
              ? "Edit the certificate details and wording"
              : "Fill in the participant's details"}
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
            disabled={isEditMode}
          >
            Course
          </button>
          <button
            type="button"
            className={certificateType === "EXAM" ? "active" : ""}
            onClick={() => handleChangeCertificateType("EXAM")}
            disabled={isEditMode}
          >
            Exam
          </button>
        </div>
      </div>

      {/* =========================
          MAIN CONTENT
          ========================= */}
      <div className="generate-grid">

        {/* =========================
            LEFT: FORM
            ========================= */}
        <div className="generate-left">
          <CertificateForm
            certificateType={certificateType}

            name={name}
            userID={userID}
            icNumber={icNumber}
            courseTitle={courseTitle}
            classId={classId}
            date={date}
            result={result}

            nameScale={nameScale}
            userIDScale={userIDScale}
            courseTitleScale={courseTitleScale}
            dateScale={dateScale}
            resultScale={resultScale}

            onChangeName={setName}
            onChangeUserID={setUserID}
            onChangeIcNumber={setIcNumber}
            onChangeCourseTitle={setCourseTitle}
            onChangeClassId={setClassId}
            onChangeDate={setDate}
            onChangeResult={setResult}

            onChangeNameScale={handleChangeNameScale}
            onChangeUserIDScale={handleChangeUserIDScale}
            onChangeCourseTitleScale={handleChangeCourseTitleScale}
            onChangeDateScale={handleChangeDateScale}
            onChangeResultScale={handleChangeResultScale}

            onSubmit={handleSubmit}
            onReset={handleReset}

            onOpenWordingSettings={() =>
              setWordingModalOpen(true)
            }

            saving={saving}
            error={formError}
          />

          {/* =========================
              WORDING SETTINGS MODAL
              ========================= */}
          {wordingModalOpen && (
            <WordingSettingsModal
              certificateType={certificateType}
              settings={localSettings}
              wordingScales={wordingScales}
              onChangeSettings={setLocalSettings}
              onChangeWordingScale={handleChangeWordingScale}
              onSave={handleSaveWording}
              onClose={() => setWordingModalOpen(false)}
            />
          )}
        </div>

        {/* =========================
            RIGHT: PREVIEW
            ========================= */}
        <div className="card preview-card">
          <div className="preview-head">
            <h3>
              {isEditMode ? "Edit preview" : "Preview"}
            </h3>
          </div>

          <div className="preview-stage generate-fit-stage">
            <CertificatePreview
              ref={certRef}
              printable

              certificateType={certificateType}
              refId={refId}

              name={name}
              userID={userID}
              courseTitle={courseTitle}
              date={date}
              result={result}

              presentedText={localSettings.presented_text}
              completingText={localSettings.completing_text}
              onText={localSettings.on_text}
              byText={localSettings.by_text}
              facilityText={localSettings.facility_text}
              divText={localSettings.div_text}
              resultLabelText={localSettings.result_label_text}

              nameScale={nameScale}
              userIDScale={userIDScale}
              courseTitleScale={courseTitleScale}
              dateScale={dateScale}
              resultScale={resultScale}
              wordingScales={wordingScales}
            />
          </div>
        </div>
      </div>
    </div>
  );
}