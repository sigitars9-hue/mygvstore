"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin as db } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { r2 } from "@/lib/r2";

type R = { ok?: boolean; error?: string };

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const lines = (v: FormDataEntryValue | null) =>
  String(v ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
const cdn = () => (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");
const urlOk = (u: string) => !u || u.startsWith("/") || (!!cdn() && u.startsWith(cdn() + "/"));
const publish = () => revalidatePath("/", "layout");
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const waNum = (v: string) => {
  const d = v.replace(/\D/g, "");
  return d.startsWith("0") ? "62" + d.slice(1) : d;
};
/* ---------- Auth ---------- */
export async function signIn(fd: FormData): Promise<{ error: string } | undefined> {
  const sb = await createClient();
  const { error } = await sb.auth.signInWithPassword({
    email: String(fd.get("email")), password: String(fd.get("password")),
  });
  if (error) return { error: "Email atau password salah" };
  redirect("/admin");
}

export async function signOut() {
  const sb = await createClient();
  await sb.auth.signOut();
  redirect("/admin/login");
}

/* ---------- Upload ke R2 ---------- */
const EXT: Record<string, string> = { "image/webp": "webp", "image/png": "png", "image/jpeg": "jpg" };

export async function presignUpload(
  folder: string, type: string
): Promise<{ uploadUrl: string; publicUrl: string } | { error: string }> {
  await requireAdmin();
  const ext = EXT[type];
  if (!ext || !/^[a-z0-9-]{1,30}$/.test(folder)) return { error: "Format gambar tidak didukung" };
  if (!process.env.R2_BUCKET || !cdn()) return { error: "R2 belum dikonfigurasi di .env" };
  const key = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const uploadUrl = await getSignedUrl(
    r2,
    new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key, ContentType: type }),
    { expiresIn: 120 }
  );
  return { uploadUrl, publicUrl: `${cdn()}/${key}` };
}

/* ---------- Game ---------- */
export async function addGame(fd: FormData): Promise<R> {
  await requireAdmin();
  const name = str(fd, "name");
  if (!name) return { error: "Nama game wajib diisi" };
  const slug = slugify(str(fd, "slug") || name);
  if (!slug) return { error: "Slug tidak valid" };
  const { data: last } = await db.from("games").select("sort").order("sort", { ascending: false }).limit(1);
  const { error } = await db.from("games").insert({
    name, slug, sort: (last?.[0]?.sort ?? 0) + 1, is_soon: fd.get("is_soon") === "on",
  });
  if (error) return { error: error.code === "23505" ? "Slug sudah dipakai game lain" : error.message };
  publish();
  return { ok: true };
}

export async function saveGame(fd: FormData): Promise<R> {
  await requireAdmin();
  const name = str(fd, "name");
  const icon = str(fd, "icon_url");
  if (!name) return { error: "Nama game wajib diisi" };
  if (!urlOk(icon)) return { error: "URL gambar tidak valid" };
    const cs_wa = waNum(str(fd, "cs_wa"));
  if (cs_wa && !/^\d{9,15}$/.test(cs_wa)) return { error: "Nomor WhatsApp CS tidak valid" };
    // ...badges, promoted, is_soon seperti sebelumnya
  const { error } = await db.from("games").update({
    name,
    icon_url: icon || null,
    badges: str(fd, "badges").split(",").map((s) => s.trim()).filter(Boolean),
    promoted: fd.get("promoted") === "on",
    is_soon: fd.get("is_soon") === "on",
  }).eq("slug", str(fd, "slug"));
  if (error) return { error: error.message };
  publish();
  return { ok: true };
}


export async function deleteGame(fd: FormData): Promise<R> {
  await requireAdmin();
  const id = str(fd, "id");
  const { count } = await db.from("jokis").select("*", { count: "exact", head: true }).eq("game_id", id);
  if (count) return { error: "Game masih punya joki. Hapus jokinya dulu." };
  const { error } = await db.from("games").delete().eq("id", id);
  if (error) return { error: error.message };
  publish();
  redirect("/admin/games");
  
}

export async function saveCategories(fd: FormData): Promise<R> {
  await requireAdmin();
  const names = fd.getAll("cat_name").map(String);
  const imgs = fd.getAll("cat_img").map(String);
  const categories: string[] = [];
  const category_images: Record<string, string> = {};
  for (let i = 0; i < names.length; i++) {
    const n = names[i].trim();
    if (!n || categories.includes(n)) continue; // nama kosong = hapus
    categories.push(n);
    const u = (imgs[i] ?? "").trim();
    if (!urlOk(u)) return { error: "URL gambar tidak valid" };
    if (u) category_images[n] = u;
  }
  const { error } = await db.from("games").update({ categories, category_images }).eq("slug", str(fd, "slug"));
  if (error) return { error: error.message };
  publish();
  return { ok: true };
}

/* ---------- Joki ---------- */
function jokiFields(fd: FormData) {
  const name = str(fd, "name");
  if (!name) return { error: "Nama joki wajib diisi" } as const;
  return {
    values: {
      name,
      badge: str(fd, "badge") || null,
      bio: str(fd, "bio") || null,
      response_minutes: Math.max(1, Math.round(Number(fd.get("response_minutes"))) || 60),
      projects_done: Math.max(0, Math.round(Number(fd.get("projects_done"))) || 0),
      is_active: fd.get("is_active") === "on",
    },
  } as const;
}

export async function addJoki(fd: FormData): Promise<R> {
  await requireAdmin();
  const f = jokiFields(fd);
  if ("error" in f) return { error: f.error };
  const { data: g } = await db.from("games").select("id,slug").eq("slug", str(fd, "game_slug")).single();
  if (!g) return { error: "Game tidak ditemukan" };
  const { error } = await db.from("jokis").insert({
    ...f.values,
    game_id: g.id,
    slug: `${g.slug}-${slugify(f.values.name)}-${crypto.randomUUID().slice(0, 4)}`,
  });
  if (error) return { error: error.message };
  publish();
  return { ok: true };
}

export async function saveJoki(fd: FormData): Promise<R> {
  await requireAdmin();
  const f = jokiFields(fd);
  if ("error" in f) return { error: f.error };
  const { error } = await db.from("jokis").update(f.values).eq("id", str(fd, "id"));
  if (error) return { error: error.message };
  publish();
  return { ok: true };
}

export async function deleteJoki(fd: FormData): Promise<R> {
  await requireAdmin();
  const { error } = await db.from("jokis").delete().eq("id", str(fd, "id"));
  if (error) {
    return {
      error: error.code === "23503"
        ? "Joki ini masih punya layanan. Hapus layanannya dulu, atau nonaktifkan joki."
        : error.message,
    };
  }
  publish();
  return { ok: true };
}

/* ---------- Layanan & harga ---------- */
function serviceFields(fd: FormData) {
  const name = str(fd, "name");
  const price = Math.round(Number(fd.get("price")));
  if (!name) return { error: "Nama layanan wajib diisi" } as const;
  if (!Number.isFinite(price) || price < 0) return { error: "Harga tidak valid" } as const;
  if (!str(fd, "joki_id")) return { error: "Pilih joki" } as const;
  return {
    values: {
      name,
      price,
      description: str(fd, "description") || null,
      unit: str(fd, "unit") || "per paket",
      duration: str(fd, "duration") || null,
      joki_id: str(fd, "joki_id"),
      includes: lines(fd.get("includes")),
      is_active: fd.get("is_active") === "on",
    },
  } as const;
}

export async function saveService(fd: FormData): Promise<R> {
  await requireAdmin();
  const f = serviceFields(fd);
  if ("error" in f) return { error: f.error };
  const { error } = await db.from("services").update(f.values).eq("id", str(fd, "id"));
  if (error) return { error: error.message };
  publish();
  return { ok: true };
}

export async function addService(fd: FormData): Promise<R> {
  await requireAdmin();
  const f = serviceFields(fd);
  if ("error" in f) return { error: f.error };

  const { data: g } = await db.from("games").select("id,slug").eq("slug", str(fd, "game_slug")).single();
  if (!g) return { error: "Game tidak ditemukan" };
  const { data: jk } = await db.from("jokis").select("id").eq("game_id", g.id);
  const { data: sib } = await db.from("services").select("game").in("joki_id", (jk ?? []).map((j) => j.id)).limit(1);

  const { error } = await db.from("services").insert({
    ...f.values,
    game: sib?.[0]?.game ?? g.slug,
    slug: `${g.slug}-${slugify(f.values.name)}-${crypto.randomUUID().slice(0, 4)}`,
  });
  if (error) return { error: error.message };
  publish();
  return { ok: true };
}

export async function deleteService(fd: FormData): Promise<R> {
  await requireAdmin();
  const { error } = await db.from("services").delete().eq("id", str(fd, "id"));
  if (error) {
    return {
      error: error.code === "23503"
        ? "Layanan ini sudah pernah dipesan atau diulas. Nonaktifkan saja."
        : error.message,
    };
  }
  publish();
  return { ok: true };
}

/* ---------- Banner ---------- */
function bannerFields(fd: FormData) {
  const image_url = str(fd, "image_url");
  if (!image_url) return { error: "Unggah gambar banner dulu" } as const;
  if (!urlOk(image_url)) return { error: "URL gambar tidak valid" } as const;
  return {
    values: {
      image_url,
      alt: str(fd, "alt"),
      href: str(fd, "href") || "/",
      sort: Math.round(Number(fd.get("sort"))) || 0,
      is_active: fd.get("is_active") === "on",
    },
  } as const;
}

export async function addBanner(fd: FormData): Promise<R> {
  await requireAdmin();
  const f = bannerFields(fd);
  if ("error" in f) return { error: f.error };
  const { error } = await db.from("banners").insert(f.values);
  if (error) return { error: error.message };
  publish();
  return { ok: true };
}

export async function saveBanner(fd: FormData): Promise<R> {
  await requireAdmin();
  const f = bannerFields(fd);
  if ("error" in f) return { error: f.error };
  const { error } = await db.from("banners").update(f.values).eq("id", str(fd, "id"));
  if (error) return { error: error.message };
  publish();
  return { ok: true };
}

export async function deleteBanner(fd: FormData): Promise<R> {
  await requireAdmin();
  const { error } = await db.from("banners").delete().eq("id", str(fd, "id"));
  if (error) return { error: error.message };
  publish();
  return { ok: true };
}

/* ---------- Testimoni ---------- */
function testiFields(fd: FormData) {
  const username = str(fd, "username").replace(/^@/, "");
  const body = str(fd, "body");
  if (!username || !body) return { error: "Username dan isi komentar wajib diisi" } as const;
  return {
    values: {
      username, body,
      sort: Math.round(Number(fd.get("sort"))) || 0,
      is_active: fd.get("is_active") === "on",
    },
  } as const;
}

export async function addTestimonial(fd: FormData): Promise<R> {
  await requireAdmin();
  const f = testiFields(fd);
  if ("error" in f) return { error: f.error };
  const { error } = await db.from("testimonials").insert(f.values);
  if (error) return { error: error.message };
  publish();
  return { ok: true };
}

export async function saveTestimonial(fd: FormData): Promise<R> {
  await requireAdmin();
  const f = testiFields(fd);
  if ("error" in f) return { error: f.error };
  const { error } = await db.from("testimonials").update(f.values).eq("id", str(fd, "id"));
  if (error) return { error: error.message };
  publish();
  return { ok: true };
}

export async function deleteTestimonial(fd: FormData): Promise<R> {
  await requireAdmin();
  const { error } = await db.from("testimonials").delete().eq("id", str(fd, "id"));
  if (error) return { error: error.message };
  publish();
  return { ok: true };
}

/* ---------- Syarat & Ketentuan ---------- */
export async function saveTerms(fd: FormData): Promise<R> {
  await requireAdmin();
  const titles = fd.getAll("t_title").map(String);
  const bodies = fd.getAll("t_body").map(String);
  const value = titles
    .map((t, i) => ({ title: t.trim(), body: (bodies[i] ?? "").trim() }))
    .filter((x) => x.title); // judul kosong = hapus
  const { error } = await db.from("site_settings").upsert({ key: "terms", value });
  if (error) return { error: error.message };
  publish();
  return { ok: true };
}