import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { supabaseAdmin, weddingBySlug } from "@/lib/supabase/admin";
import { fontsUrl, safeTheme, themeStyle } from "@/lib/theme";

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : null;
const fmtTime = (d: string | null) =>
  d ? new Date(d).toLocaleString("fr-FR", { weekday: "long", hour: "2-digit", minute: "2-digit" }) : "";

export default async function Site({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = supabaseAdmin();
  const w = await weddingBySlug(slug);
  if (!w) notFound();
  const { data: events } = await db.from("events").select("*").eq("wedding_id", w.id).order("position").order("starts_at");

  const base = (await headers()).get("x-site-base") ?? `/site/${slug}`;
  const theme = safeTheme(w.theme);
  const sections = (w.sections ?? {}) as Record<string, boolean>;
  const heroStyle = theme.hero_image ? { backgroundImage: `url(${theme.hero_image})` } : undefined;

  return (
    <div style={themeStyle(theme)}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={fontsUrl(theme)} />
      <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh", fontFamily: "var(--font-body)" }}>
        <header className="hero" style={heroStyle}>
          <h1>{w.couple_names}</h1>
          {w.wedding_date && <p>{fmtDate(w.wedding_date)}</p>}
          {w.location && <p>{w.location}</p>}
        </header>
        <main className="wrap">
          {w.welcome_text && <p style={{ whiteSpace: "pre-line", fontSize: "1.1rem" }}>{w.welcome_text}</p>}

          {sections.program !== false && (events?.length ?? 0) > 0 && (
            <>
              <h2>Programme</h2>
              {events!.map((e) => (
                <div className="card" key={e.id}>
                  <strong>{e.name}</strong>
                  {e.starts_at && <div className="muted">{fmtTime(e.starts_at)}</div>}
                  {e.place && <div>{e.place}</div>}
                  {e.description && <p>{e.description}</p>}
                </div>
              ))}
            </>
          )}

          {sections.rsvp !== false && (
            <p style={{ textAlign: "center", marginTop: 32 }}>
              <Link className="btn" href={`${base}/rsvp`}>Répondre à l&apos;invitation</Link>
              {w.rsvp_deadline && <span className="muted"><br />Merci de répondre avant le {fmtDate(w.rsvp_deadline)}.</span>}
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
