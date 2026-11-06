import { useCallback, useEffect, useState } from "react";
import { supabase, SETTINGS_TABLE } from "../supabaseClient";

export const DEFAULT_COURSE_WORDING = {
  presented_text: "This certificate is presented to",
  completing_text: "for completing the course titled",
  on_text: "On:",
  by_text: "conducted by",
  facility_text: "Sarawak Energy Learning Centre",
  div_text: "Learning & Development and Capability Management Division",
};

export const DEFAULT_EXAM_WORDING = {
  presented_text: "This result slip is presented to",
  completing_text: "for attending examination on",
  on_text: "On:",
  by_text: "conducted by",
  facility_text: "Sarawak Energy Learning Centre",
  div_text: "Learning & Development and Capability Management Division",
  result_label_text: "Result",
};

// Kept for anything still importing the old unified name.
export const DEFAULT_WORDING = DEFAULT_COURSE_WORDING;

export function useWordingSettings() {
  const [courseSettings, setCourseSettings] = useState(DEFAULT_COURSE_WORDING);
  const [examSettings, setExamSettings] = useState(DEFAULT_EXAM_WORDING);
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
      setCourseSettings({
        presented_text: data.presented_text ?? DEFAULT_COURSE_WORDING.presented_text,
        completing_text: data.completing_text ?? DEFAULT_COURSE_WORDING.completing_text,
        on_text: data.on_text ?? DEFAULT_COURSE_WORDING.on_text,
        by_text: data.by_text ?? DEFAULT_COURSE_WORDING.by_text,
        facility_text: data.facility_text ?? DEFAULT_COURSE_WORDING.facility_text,
        div_text: data.div_text ?? DEFAULT_COURSE_WORDING.div_text,
      });

      setExamSettings({
        presented_text: data.exam_presented_text ?? DEFAULT_EXAM_WORDING.presented_text,
        completing_text: data.exam_completing_text ?? DEFAULT_EXAM_WORDING.completing_text,
        on_text: data.exam_on_text ?? DEFAULT_EXAM_WORDING.on_text,
        by_text: data.exam_by_text ?? DEFAULT_EXAM_WORDING.by_text,
        facility_text: data.exam_facility_text ?? DEFAULT_EXAM_WORDING.facility_text,
        div_text: data.exam_div_text ?? DEFAULT_EXAM_WORDING.div_text,
        result_label_text: data.exam_result_label_text ?? DEFAULT_EXAM_WORDING.result_label_text,
      });
    } else {
      setCourseSettings(DEFAULT_COURSE_WORDING);
      setExamSettings(DEFAULT_EXAM_WORDING);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveCourse = useCallback(async (next) => {
    const wordingToSave = {
      presented_text: next.presented_text ?? DEFAULT_COURSE_WORDING.presented_text,
      completing_text: next.completing_text ?? DEFAULT_COURSE_WORDING.completing_text,
      on_text: next.on_text ?? DEFAULT_COURSE_WORDING.on_text,
      by_text: next.by_text ?? DEFAULT_COURSE_WORDING.by_text,
      facility_text: next.facility_text ?? DEFAULT_COURSE_WORDING.facility_text,
      div_text: next.div_text ?? DEFAULT_COURSE_WORDING.div_text,
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

    if (saveError) throw saveError;

    setCourseSettings({
      presented_text: data.presented_text ?? DEFAULT_COURSE_WORDING.presented_text,
      completing_text: data.completing_text ?? DEFAULT_COURSE_WORDING.completing_text,
      on_text: data.on_text ?? DEFAULT_COURSE_WORDING.on_text,
      by_text: data.by_text ?? DEFAULT_COURSE_WORDING.by_text,
      facility_text: data.facility_text ?? DEFAULT_COURSE_WORDING.facility_text,
      div_text: data.div_text ?? DEFAULT_COURSE_WORDING.div_text,
    });

    return data;
  }, []);

  const saveExam = useCallback(async (next) => {
    const wordingToSave = {
      exam_presented_text: next.presented_text ?? DEFAULT_EXAM_WORDING.presented_text,
      exam_completing_text: next.completing_text ?? DEFAULT_EXAM_WORDING.completing_text,
      exam_on_text: next.on_text ?? DEFAULT_EXAM_WORDING.on_text,
      exam_by_text: next.by_text ?? DEFAULT_EXAM_WORDING.by_text,
      exam_facility_text: next.facility_text ?? DEFAULT_EXAM_WORDING.facility_text,
      exam_div_text: next.div_text ?? DEFAULT_EXAM_WORDING.div_text,
      exam_result_label_text: next.result_label_text ?? DEFAULT_EXAM_WORDING.result_label_text,
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

    if (saveError) throw saveError;

    setExamSettings({
      presented_text: data.exam_presented_text ?? DEFAULT_EXAM_WORDING.presented_text,
      completing_text: data.exam_completing_text ?? DEFAULT_EXAM_WORDING.completing_text,
      on_text: data.exam_on_text ?? DEFAULT_EXAM_WORDING.on_text,
      by_text: data.exam_by_text ?? DEFAULT_EXAM_WORDING.by_text,
      facility_text: data.exam_facility_text ?? DEFAULT_EXAM_WORDING.facility_text,
      div_text: data.exam_div_text ?? DEFAULT_EXAM_WORDING.div_text,
      result_label_text: data.exam_result_label_text ?? DEFAULT_EXAM_WORDING.result_label_text,
    });

    return data;
  }, []);

  return {
    courseSettings,
    examSettings,
    loading,
    error,
    saveCourse,
    saveExam,
    reload: load,
  };
}