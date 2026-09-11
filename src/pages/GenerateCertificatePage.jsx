import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CertificateForm from "../components/CertificateForm";
import CertificatePreview from "../components/CertificatePreview";
import WordingSettingsModal from "../components/WordingSettingsModal";
import { useCertificates } from "../hooks/useCertificates";
import { useWordingSettings } from "../hooks/useWordingSettings";
import { useToast } from "../context/ToastContext";

const DEFAULT_WORDING = {
  presented_text: "This certificate is presented to",
  completing_text: "for completing the course titled",
  on_text: "On:",
  by_text: "conducted by",
  facility_text: "Sarawak Energy Learning Centre",
  div_text:
    "Learning & Development and Capability Management Division",
};

const DEFAULT_WORDING_SCALES = {
  presented_text: 1,
  completing_text: 1,
  on_text: 1,
  by_text: 1,
  facility_text: 1,
  div_text: 1,
};

export default function GenerateCertificatePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { create, update, nextRefIdGuess } = useCertificates();
  const { settings, save } = useWordingSettings();
  const showToast = useToast();

  const editCertificate = location.state?.editCertificate || null;
  const isEditMode = Boolean(editCertificate);

  const [name, setName] = useState("");
  const [userID, setUserID] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [date, setDate] = useState("");
  const [refId, setRefId] = useState("000001");

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [wordingModalOpen, setWordingModalOpen] = useState(false);

  const [localSettings, setLocalSettings] = useState(
    settings || DEFAULT_WORDING
  );

  const [nameScale, setNameScale] = useState(1);
  const [userIDScale, setUserIDScale] = useState(1);
  const [courseTitleScale, setCourseTitleScale] = useState(1);
  const [dateScale, setDateScale] = useState(1);

  const [wordingScales, setWordingScales] = useState(
    DEFAULT_WORDING_SCALES
  );

  const certRef = useRef(null);

  // Load existing certificate when Edit is selected
  useEffect(() => {
    if (!editCertificate) {
      return;
    }

    setName(editCertificate.participant_name || "");
    setUserID(editCertificate.user_id || "");
    setCourseTitle(editCertificate.course_title || "");
    setDate(editCertificate.certificate_date || "");
    setRefId(editCertificate.ref_id || "");

    setLocalSettings({
      presented_text:
        editCertificate.presented_text ||
        DEFAULT_WORDING.presented_text,

      completing_text:
        editCertificate.completing_text ||
        DEFAULT_WORDING.completing_text,

      on_text:
        editCertificate.on_text ||
        DEFAULT_WORDING.on_text,

      by_text:
        editCertificate.by_text ||
        DEFAULT_WORDING.by_text,

      facility_text:
        editCertificate.facility_text ||
        DEFAULT_WORDING.facility_text,

      div_text:
        editCertificate.div_text ||
        DEFAULT_WORDING.div_text,
    });

    setFormError("");
  }, [editCertificate]);

  // Load default wording for a new certificate
  useEffect(() => {
    if (isEditMode) {
      return;
    }

    if (settings) {
      setLocalSettings({
        ...DEFAULT_WORDING,
        ...settings,
      });
    }
  }, [settings, isEditMode]);

  // Get next reference ID only for a new certificate
  useEffect(() => {
    if (isEditMode) {
      return;
    }

    nextRefIdGuess()
      .then(setRefId)
      .catch((err) => {
        console.error(err);
      });
  }, [nextRefIdGuess, isEditMode]);

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
        ...DEFAULT_WORDING,
        ...updatedSettings,
      });

      await save(updatedSettings);

      showToast("Wording settings saved");
    } catch (err) {
      console.error(err);
      showToast("Could not save wording settings", true);
    }
  };

  // SAVE CERTIFICATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !name.trim() ||
      !userID.trim() ||
      !courseTitle.trim() ||
      !date.trim()
    ) {
      setFormError(
        "Name, User ID, course title and date are required"
      );
      return;
    }

    setFormError("");
    setSaving(true);

    try {
      const payload = {
        participant_name: name.trim(),
        user_id: userID.trim(),
        course_title: courseTitle.trim(),
        certificate_date: date.trim(),

        presented_text: localSettings.presented_text,
        completing_text: localSettings.completing_text,
        on_text: localSettings.on_text,
        by_text: localSettings.by_text,
        facility_text: localSettings.facility_text,
        div_text: localSettings.div_text,
      };

      let saved;

      if (isEditMode) {
        saved = await update(editCertificate.id, payload);

        setRefId(saved.ref_id);

        showToast(
          `Certificate updated for ${saved.participant_name}`
        );

        navigate("/history");
      } else {
        saved = await create(payload);

        setRefId(saved.ref_id);

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
      setName(editCertificate.participant_name || "");
      setUserID(editCertificate.user_id || "");
      setCourseTitle(editCertificate.course_title || "");
      setDate(editCertificate.certificate_date || "");
      setRefId(editCertificate.ref_id || "");

      setLocalSettings({
        presented_text:
          editCertificate.presented_text ||
          DEFAULT_WORDING.presented_text,

        completing_text:
          editCertificate.completing_text ||
          DEFAULT_WORDING.completing_text,

        on_text:
          editCertificate.on_text ||
          DEFAULT_WORDING.on_text,

        by_text:
          editCertificate.by_text ||
          DEFAULT_WORDING.by_text,

        facility_text:
          editCertificate.facility_text ||
          DEFAULT_WORDING.facility_text,

        div_text:
          editCertificate.div_text ||
          DEFAULT_WORDING.div_text,
      });
    } else {
      setName("");
      setUserID("");
      setCourseTitle("");
      setDate("");
      setFormError("");

      setLocalSettings({
        ...DEFAULT_WORDING,
        ...(settings || {}),
      });

      setNameScale(1);
      setUserIDScale(1);
      setCourseTitleScale(1);
      setDateScale(1);

      setWordingScales(DEFAULT_WORDING_SCALES);

      nextRefIdGuess()
        .then(setRefId)
        .catch((err) => {
          console.error(err);
        });
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
            name={name}
            userID={userID}
            courseTitle={courseTitle}
            date={date}

            nameScale={nameScale}
            userIDScale={userIDScale}
            courseTitleScale={courseTitleScale}
            dateScale={dateScale}

            onChangeName={setName}
            onChangeUserID={setUserID}
            onChangeCourseTitle={setCourseTitle}
            onChangeDate={setDate}

            onChangeNameScale={handleChangeNameScale}
            onChangeUserIDScale={handleChangeUserIDScale}
            onChangeCourseTitleScale={handleChangeCourseTitleScale}
            onChangeDateScale={handleChangeDateScale}

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

              refId={refId}

              name={name}
              userID={userID}
              courseTitle={courseTitle}
              date={date}

              presentedText={localSettings.presented_text}
              completingText={localSettings.completing_text}
              onText={localSettings.on_text}
              byText={localSettings.by_text}
              facilityText={localSettings.facility_text}
              divText={localSettings.div_text}

              nameScale={nameScale}
              userIDScale={userIDScale}
              courseTitleScale={courseTitleScale}
              dateScale={dateScale}
              wordingScales={wordingScales}
            />
          </div>
        </div>
      </div>
    </div>
  );
}