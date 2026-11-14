/** Normalizeaza ce tasteaza utilizatorul ("cafenea.ro") intr-un URL complet, sau null daca nu e valid. */
export function normalizeUrl(raw: string): string | null {
  let v = raw.trim();
  if (!v || v.length > 300) return null;
  if (!/^https?:\/\//i.test(v)) v = "https://" + v;
  try {
    const u = new URL(v);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (!u.hostname.includes(".") && u.hostname !== "localhost") return null;
    u.hash = "";
    return u.href;
  } catch {
    return null;
  }
}
