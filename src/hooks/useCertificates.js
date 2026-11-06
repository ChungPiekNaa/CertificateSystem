import { useCallback, useEffect, useState } from "react";
import { supabase, CERTIFICATES_TABLE } from "../supabaseClient";

export function useCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);

    const { data, error: fetchError } = await supabase
      .from(CERTIFICATES_TABLE)
      .select("*")
      .order("ref_no", { ascending: false });

    if (fetchError) {
      setError(fetchError);
    } else {
      setCertificates(data || []);
      setError(null);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(async (payload) => {
    const { data, error: insertError } = await supabase
      .from(CERTIFICATES_TABLE)
      .insert({
        ...payload,
        status: "ACTIVE",
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    setCertificates((prev) =>
      [data, ...prev].sort(
        (a, b) => Number(b.ref_no) - Number(a.ref_no)
      )
    );

    return data;
  }, []);

  const createMany = useCallback(async (rows) => {
    const { data, error: insertError } = await supabase
      .from(CERTIFICATES_TABLE)
      .insert(
        rows.map((row) => ({
          ...row,
          status: "ACTIVE",
        }))
      )
      .select();

    if (insertError) {
      throw insertError;
    }

    const newRecords = data || [];

    setCertificates((prev) =>
      [...newRecords, ...prev].sort(
        (a, b) => Number(b.ref_no) - Number(a.ref_no)
      )
    );

    // Keep bulk printing in Ref ID order: 000006, 000007, 000008
    return [...newRecords].sort(
      (a, b) => Number(a.ref_no) - Number(b.ref_no)
    );
  }, []);

  const update = useCallback(async (id, payload) => {
    const { data, error: updateError } = await supabase
      .from(CERTIFICATES_TABLE)
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    setCertificates((prev) =>
      prev
        .map((certificate) =>
          certificate.id === id ? data : certificate
        )
        .sort((a, b) => Number(b.ref_no) - Number(a.ref_no))
    );

    return data;
  }, []);

  const remove = useCallback(async (id) => {
    const { data, error: deleteError } = await supabase
      .from(CERTIFICATES_TABLE)
      .update({ status: "DELETED" })
      .eq("id", id)
      .select()
      .single();

    if (deleteError) {
      throw deleteError;
    }

    setCertificates((prev) =>
      prev
        .map((certificate) =>
          certificate.id === id
            ? {
                ...certificate,
                status: "DELETED",
                ...data,
              }
            : certificate
        )
        .sort((a, b) => Number(b.ref_no) - Number(a.ref_no))
    );

    return data;
  }, []);

  const nextRefIdGuess = useCallback(async () => {
    const { data, error: refError } = await supabase
      .from(CERTIFICATES_TABLE)
      .select("ref_no")
      .order("ref_no", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (refError) {
      throw refError;
    }

    const nextNumber = (data?.ref_no || 0) + 1;

    return String(nextNumber).padStart(6, "0");
  }, []);

  return {
    certificates,
    loading,
    error,
    load,
    create,
    createMany,
    update,
    remove,
    nextRefIdGuess,
  };
}