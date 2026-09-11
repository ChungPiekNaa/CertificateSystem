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
      .order("created_at", { ascending: false });

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

    setCertificates((prev) => [data, ...prev]);

    return data;
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
      prev.map((certificate) =>
        certificate.id === id ? data : certificate
      )
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
      prev.map((certificate) =>
        certificate.id === id
          ? {
              ...certificate,
              status: "DELETED",
              ...data,
            }
          : certificate
      )
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
    update,
    remove,
    nextRefIdGuess,
  };
}