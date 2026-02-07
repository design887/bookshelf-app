"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthProvider";

const SCHEMA_VERSION = 1;

// ─── localStorage helpers (fallback / guest mode) ───
function localGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
function localSet(key, val) { try { localStorage.setItem(key, val); } catch {} }

// ─── Supabase helpers ───
async function sbLoadBooks(supabase, userId) {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) { console.error("Load books error:", error); return null; }
  return data.map(row => ({
    id: row.id,
    title: row.title,
    author: row.author || "",
    year: row.year,
    pages: row.pages,
    cover: row.cover,
    status: row.status || "want",
    rating: row.rating || 0,
    notes: row.notes || "",
    shelfYear: row.shelf_year,
    addedAt: row.created_at,
    olKey: row.ol_key,
    coverTried: true, // don't re-fetch covers for cloud books
  }));
}

async function sbUpsertBook(supabase, userId, book) {
  const row = {
    id: book.id,
    user_id: userId,
    title: book.title,
    author: book.author || "",
    year: book.year || null,
    pages: book.pages || null,
    cover: book.cover || null,
    status: book.status || "want",
    rating: book.rating || 0,
    notes: book.notes || "",
    shelf_year: book.shelfYear || new Date().getFullYear(),
    ol_key: book.olKey || null,
    schema_version: SCHEMA_VERSION,
  };
  const { error } = await supabase.from("books").upsert(row, { onConflict: "id" });
  if (error) console.error("Upsert error:", error);
}

async function sbDeleteBook(supabase, userId, bookId) {
  const { error } = await supabase.from("books").delete().eq("id", bookId).eq("user_id", userId);
  if (error) console.error("Delete error:", error);
}

async function sbLoadPrefs(supabase, userId) {
  const { data } = await supabase
    .from("user_prefs")
    .select("*")
    .eq("user_id", userId)
    .single();
  return data;
}

async function sbSavePrefs(supabase, userId, prefs) {
  const { error } = await supabase.from("user_prefs").upsert({
    user_id: userId,
    theme: prefs.theme,
    shelf_name: prefs.shelfName,
    schema_version: SCHEMA_VERSION,
  }, { onConflict: "user_id" });
  if (error) console.error("Save prefs error:", error);
}

// ─── Migration: push localStorage books to Supabase on first login ───
async function migrateLocalToCloud(supabase, userId) {
  const raw = localGet("shelf-v5");
  if (!raw) return [];
  try {
    const localBooks = JSON.parse(raw);
    if (!Array.isArray(localBooks) || localBooks.length === 0) return [];

    // Check if user already has books in cloud
    const { count } = await supabase
      .from("books")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (count > 0) return []; // user already has cloud data, don't overwrite

    // Migrate each book with a stable UUID-like ID
    const migrated = localBooks.map(b => ({
      ...b,
      id: typeof b.id === "string" && b.id.length > 20 ? b.id : `migrated-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    }));

    for (const book of migrated) {
      await sbUpsertBook(supabase, userId, book);
    }

    // Clear local storage after successful migration
    try { localStorage.removeItem("shelf-v5"); } catch {}
    console.log(`Migrated ${migrated.length} books to cloud`);
    return migrated;
  } catch (e) {
    console.error("Migration error:", e);
    return [];
  }
}

// ─── Main hook ───
export function useShelfData() {
  const { user, supabase, loading: authLoading, signIn, signOut } = useAuth();
  const isCloud = !!(user && supabase);

  const [books, setBooks] = useState([]);
  const [themeId, setThemeIdState] = useState("classic");
  const [shelfName, setShelfNameState] = useState("My Shelf");
  const [dataLoading, setDataLoading] = useState(true);
  const [migrated, setMigrated] = useState(false);
  const saveTimer = useRef(null);

  // ─── Load data ───
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (authLoading) return;

      if (isCloud) {
        // Cloud mode: load from Supabase
        setDataLoading(true);

        // Try migration first
        if (!migrated) {
          await migrateLocalToCloud(supabase, user.id);
          setMigrated(true);
        }

        const cloudBooks = await sbLoadBooks(supabase, user.id);
        if (!cancelled && cloudBooks) setBooks(cloudBooks);

        const prefs = await sbLoadPrefs(supabase, user.id);
        if (!cancelled && prefs) {
          if (prefs.theme) setThemeIdState(prefs.theme);
          if (prefs.shelf_name) setShelfNameState(prefs.shelf_name);
        }

        if (!cancelled) setDataLoading(false);
      } else {
        // Local mode: load from localStorage
        try {
          const v = localGet("shelf-theme");
          if (v) setThemeIdState(v);
        } catch {}
        try {
          const v = localGet("shelf-name");
          if (v) setShelfNameState(v);
        } catch {}

        const raw = localGet("shelf-v5");
        if (raw) {
          try {
            const loaded = JSON.parse(raw);
            const curYr = new Date().getFullYear();
            if (Array.isArray(loaded))
              setBooks(loaded.map(b => b.shelfYear ? b : { ...b, shelfYear: curYr }));
          } catch {}
        } else {
          // Try v4 migration
          const old = localGet("shelf-v4");
          if (old) {
            try {
              const curYr = new Date().getFullYear();
              setBooks(JSON.parse(old).map(b => ({ ...b, shelfYear: b.shelfYear || curYr })));
            } catch {}
          }
        }
        setDataLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [authLoading, isCloud, user, supabase, migrated]);

  // ─── Save books (debounced) ───
  useEffect(() => {
    if (dataLoading || authLoading) return;

    if (!isCloud) {
      // Local save — immediate
      localSet("shelf-v5", JSON.stringify(books));
      return;
    }

    // Cloud save — debounced to avoid spamming on rapid edits
    // We don't do full-sync on every change; individual ops handle it
  }, [books, isCloud, dataLoading, authLoading]);

  // ─── Book operations ───
  const addBook = useCallback((item) => {
    const book = {
      ...item,
      id: `book-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      addedAt: new Date().toISOString(),
      status: item.status || "want",
      rating: 0,
      notes: "",
      shelfYear: item.shelfYear || new Date().getFullYear(),
    };
    setBooks(p => [book, ...p]);
    if (isCloud) sbUpsertBook(supabase, user.id, book);
    return book;
  }, [isCloud, supabase, user]);

  const removeBook = useCallback((id) => {
    setBooks(p => p.filter(b => b.id !== id));
    if (isCloud) sbDeleteBook(supabase, user.id, id);
  }, [isCloud, supabase, user]);

  const updateBook = useCallback((id, updates) => {
    setBooks(p => {
      const next = p.map(b => b.id === id ? { ...b, ...updates } : b);
      if (isCloud) {
        const updated = next.find(b => b.id === id);
        if (updated) {
          // Debounce cloud saves for the same book
          clearTimeout(saveTimer.current);
          saveTimer.current = setTimeout(() => sbUpsertBook(supabase, user.id, updated), 500);
        }
      }
      return next;
    });
  }, [isCloud, supabase, user]);

  // ─── Preferences ───
  const setThemeId = useCallback((id) => {
    setThemeIdState(id);
    if (isCloud) sbSavePrefs(supabase, user.id, { theme: id, shelfName });
    else localSet("shelf-theme", id);
  }, [isCloud, supabase, user, shelfName]);

  const setShelfName = useCallback((name) => {
    setShelfNameState(name);
    if (isCloud) sbSavePrefs(supabase, user.id, { theme: themeId, shelfName: name });
    else localSet("shelf-name", name);
  }, [isCloud, supabase, user, themeId]);

  return {
    books, setBooks,
    addBook, removeBook, updateBook,
    themeId, setThemeId,
    shelfName, setShelfName,
    loading: authLoading || dataLoading,
    user, signIn, signOut,
    isCloud,
  };
}
