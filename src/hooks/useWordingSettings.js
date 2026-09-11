import { useCallback, useEffect, useState } from "react";
import { supabase, SETTINGS_TABLE } from "../supabaseClient";

// The wording lines on the certificate are stored as one shared row
// so editing them once on the "Change other wordings" screen updates every future certificate
export const DEFAULT_WORDING = {
  presented_text: "This certificate is presented to",
  completing_text: "for completing the course titled",
  on_text: "On:",
  by_text: "conducted by",
  facility_text: "Sarawak Energy Learning Centre",
  div_text: "Learning & Development and Capability Management Division",
};

export function useWordingSettings() {
  const [settings, setSettings] = useState(DEFAULT_WORDING);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from(SETTINGS_TABLE)
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (fetchError) {
      setError(fetchError);
    } else if (data) {
      setSettings({
        presented_text:
          data.presented_text ?? DEFAULT_WORDING.presented_text,

        completing_text:
          data.completing_text ?? DEFAULT_WORDING.completing_text,

        on_text:
          data.on_text ?? DEFAULT_WORDING.on_text,

        by_text:
          data.by_text ?? DEFAULT_WORDING.by_text,

        facility_text:
          data.facility_text ?? DEFAULT_WORDING.facility_text,

        div_text:
          data.div_text ?? DEFAULT_WORDING.div_text,
      });
    } else {
      // No settings row exists yet
      // Keep the default wording
      setSettings(DEFAULT_WORDING);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(async (next) => {
    const wordingToSave = {
      presented_text:
        next.presented_text ?? DEFAULT_WORDING.presented_text,

      completing_text:
        next.completing_text ?? DEFAULT_WORDING.completing_text,

      on_text:
        next.on_text ?? DEFAULT_WORDING.on_text,

      by_text:
        next.by_text ?? DEFAULT_WORDING.by_text,

      facility_text:
        next.facility_text ?? DEFAULT_WORDING.facility_text,

      div_text:
        next.div_text ?? DEFAULT_WORDING.div_text,
    };

    const { data, error: saveError } = await supabase
      .from(SETTINGS_TABLE)
      .upsert({
        id: 1,
        ...wordingToSave,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (saveError) {
      throw saveError;
    }

    setSettings({
      presented_text:
        data.presented_text ?? DEFAULT_WORDING.presented_text,

      completing_text:
        data.completing_text ?? DEFAULT_WORDING.completing_text,

      on_text:
        data.on_text ?? DEFAULT_WORDING.on_text,

      by_text:
        data.by_text ?? DEFAULT_WORDING.by_text,

      facility_text:
        data.facility_text ?? DEFAULT_WORDING.facility_text,

      div_text:
        data.div_text ?? DEFAULT_WORDING.div_text,
    });

    return data;
  }, []);

  return {
    settings,
    loading,
    error,
    save,
    reload: load,
  };
}