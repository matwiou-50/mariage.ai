import { NextResponse, type NextRequest } from "next/server";

const RESERVED = new Set(["www", "app", "api", "admin"]);

// Un seul programme sert tous les couples :
// charlotte-matthieu.tondomaine.fr  ->  /site/charlotte-matthieu
export function middleware(req: NextRequest) {
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
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|api/|favicon.ico|.*\\..*).*)"],
};
