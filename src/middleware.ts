import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { supabaseUrl } from "@/lib/config";

const RESERVED = new Set(["www", "app", "api", "admin"]);

// Un seul programme sert tous les couples :
// charlotte-matthieu.tondomaine.fr  ->  /site/charlotte-matthieu
export async function middleware(req: NextRequest) {
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";
  const host = (req.headers.get("host") ?? "").toLowerCase();
  const { pathname } = req.nextUrl;

  if (host.endsWith(`.${root}`)) {
    const sub = host.slice(0, -(root.length + 1));
    if (sub && !sub.includes(".") && !RESERVED.has(sub) && !pathname.startsWith("/site/")) {
      const headers = new Headers(req.headers);
      headers.set("x-site-base", ""); // adresse déjà au bon endroit : liens relatifs à la racine
      const url = req.nextUrl.clone();
      url.pathname = `/site/${sub}${pathname === "/" ? "" : pathname}`;
      return NextResponse.rewrite(url, { request: { headers } });
    }
  }

  if (pathname.startsWith("/dashboard")) return refreshSession(req);
  return NextResponse.next();
}

// Renouvelle la session des mariés (elle expire au bout d'une heure) : les pages serveur
// ne peuvent pas écrire de cookie, c'est donc fait ici avant chaque page du tableau de bord.
async function refreshSession(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(supabaseUrl(), process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  await supabase.auth.getUser();
  return res;
}

export const config = {
  matcher: ["/((?!_next/|api/|favicon.ico|.*\\..*).*)"],
};
