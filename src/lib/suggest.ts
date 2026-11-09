function lev(a: string, b: string) {
  const m = a.length, n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[n];
}

// Cari kata terdekat di kosakata (toleransi typo ~1 huruf per 3 huruf)
function closest(term: string, vocab: string[]): string | null {
  const max = Math.max(1, Math.floor(term.length / 3));
  let best: string | null = null;
  let bestD = Infinity;
  for (const w of vocab) {
    if (Math.abs(w.length - term.length) > max + 2) continue;
    // bandingkan ke kata utuh dan ke awalan kata (untuk ketikan yang belum selesai)
    const d = Math.min(lev(term, w), lev(term, w.slice(0, term.length)) + 1);
    if (d < bestD) { bestD = d; best = w; }
  }
  return best && bestD <= max ? best : null;
}

/**
 * Mengembalikan saran query, atau null jika tidak ada saran yang masuk akal.
 * Saran hanya diberikan kalau memang menghasilkan minimal 1 layanan.
 */
export function didYouMean<T>(
  terms: string[],
  rows: T[],
  hayOf: (r: T) => string,
): string | null {
  const hays = rows.map(hayOf);
  const vocab = [...new Set(hays.flatMap((h) => h.split(/[^a-z0-9]+/i)).filter((w) => w.length >= 3))];

  let changed = false;
  const fixed = terms.map((t) => {
    if (hays.some((h) => h.includes(t))) return t;   // kata ini sudah benar
    const c = closest(t, vocab);
    if (c) { changed = true; return c; }
    return t;
  });
  if (!changed) return null;

  const hit = hays.some((h) => fixed.every((t) => h.includes(t)));
  return hit ? fixed.join(" ") : null;
}